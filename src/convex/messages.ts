import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** Get messages for a ticket */
export const byTicket = query({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_ticket", (q) => q.eq("ticketId", args.ticketId))
      .order("asc")
      .collect();

    return Promise.all(
      messages.map(async (msg) => {
        const sender = await ctx.db.get(msg.senderId);
        return {
          ...msg,
          senderName: sender?.name ?? "Unknown",
          senderImage: sender?.image ?? null,
        };
      }),
    );
  },
});

/** Send a message on a ticket */
export const send = mutation({
  args: {
    ticketId: v.id("tickets"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Determine if sender is an agent (has agentId on ticket or is assigned)
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) throw new Error("Ticket not found");

    const isAgentReply =
      ticket.agentId !== undefined &&
      ticket.agentId !== null &&
      ticket.agentId === userId;

    return await ctx.db.insert("messages", {
      ticketId: args.ticketId,
      senderId: userId,
      content: args.content,
      isAgentReply,
    });
  },
});
