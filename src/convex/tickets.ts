import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** Create a new support ticket (customer) */
export const createTicket = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("tickets", {
      title: args.title,
      description: args.description,
      customerId: userId,
      status: "open",
      priority: "medium",
      category: args.category,
    });
  },
});

/** Get tickets for the current customer */
export const myTickets = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_customer", (q) => q.eq("customerId", userId))
      .order("desc")
      .collect();

    return Promise.all(
      tickets.map(async (ticket) => {
        const lastMessage = await ctx.db
          .query("messages")
          .withIndex("by_ticket", (q) => q.eq("ticketId", ticket._id))
          .order("desc")
          .first();

        const agent = ticket.agentId
          ? await ctx.db.get(ticket.agentId)
          : null;

        return {
          ...ticket,
          lastMessage: lastMessage?.content,
          lastMessageTime: lastMessage?._creationTime,
          agentName: agent?.name ?? null,
        };
      }),
    );
  },
});

/** Get all tickets for agent dashboard */
export const allTickets = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("open"),
        v.literal("in_progress"),
        v.literal("resolved"),
        v.literal("closed"),
      ),
    ),
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
        v.literal("urgent"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let tickets;

    if (args.status) {
      tickets = await ctx.db
        .query("tickets")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    } else {
      tickets = await ctx.db
        .query("tickets")
        .order("desc")
        .collect();
    }

    const filtered = args.priority
      ? tickets.filter((t) => t.priority === args.priority)
      : tickets;

    return Promise.all(
      filtered.map(async (ticket) => {
        const customer = await ctx.db.get(ticket.customerId);
        const agent = ticket.agentId
          ? await ctx.db.get(ticket.agentId)
          : null;
        const lastMessage = await ctx.db
          .query("messages")
          .withIndex("by_ticket", (q) => q.eq("ticketId", ticket._id))
          .order("desc")
          .first();
        const messageCount = await ctx.db
          .query("messages")
          .withIndex("by_ticket", (q) => q.eq("ticketId", ticket._id))
          .collect();

        return {
          ...ticket,
          customerName: customer?.name ?? "Anonymous",
          customerEmail: customer?.email ?? "",
          agentName: agent?.name ?? null,
          lastMessage: lastMessage?.content ?? ticket.description,
          lastMessageTime: lastMessage?._creationTime ?? ticket._creationTime,
          messageCount: messageCount.length,
        };
      }),
    );
  },
});

/** Get a single ticket by ID */
export const getTicket = query({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, args) => {
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) return null;

    const customer = await ctx.db.get(ticket.customerId);
    const agent = ticket.agentId
      ? await ctx.db.get(ticket.agentId)
      : null;

    return {
      ...ticket,
      customerName: customer?.name ?? "Anonymous",
      customerEmail: customer?.email ?? "",
      agentName: agent?.name ?? null,
    };
  },
});

/** Update ticket status (agent) */
export const updateStatus = mutation({
  args: {
    ticketId: v.id("tickets"),
    status: v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("resolved"),
      v.literal("closed"),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(args.ticketId, { status: args.status });
  },
});

/** Update ticket priority (agent) */
export const updatePriority = mutation({
  args: {
    ticketId: v.id("tickets"),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent"),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(args.ticketId, { priority: args.priority });
  },
});

/** Assign ticket to agent */
export const assignTicket = mutation({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(args.ticketId, {
      agentId: userId,
      status: "in_progress",
    });
  },
});

/** Ticket stats for dashboard */
export const ticketStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("tickets").collect();

    return {
      total: all.length,
      open: all.filter((t) => t.status === "open").length,
      inProgress: all.filter((t) => t.status === "in_progress").length,
      resolved: all.filter((t) => t.status === "resolved").length,
      closed: all.filter((t) => t.status === "closed").length,
      urgent: all.filter((t) => t.priority === "urgent").length,
      high: all.filter((t) => t.priority === "high").length,
    };
  },
});
