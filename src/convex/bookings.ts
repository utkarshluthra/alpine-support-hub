import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** Get the current user's bookings */
export const myBookings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("bookings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

/** Get upcoming bookings */
export const upcoming = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const all = await ctx.db.query("bookings").collect();
    return all
      .filter((b) => b.scheduledAt >= now && b.status !== "cancelled")
      .sort((a, b) => a.scheduledAt - b.scheduledAt);
  },
});

/** Create a booking */
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    scheduledAt: v.number(),
    duration: v.number(),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("bookings", {
      ...args,
      userId,
      status: "pending",
    });
  },
});

/** Update booking status */
export const updateStatus = mutation({
  args: {
    bookingId: v.id("bookings"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("cancelled"),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.patch(args.bookingId, { status: args.status });
  },
});

/** All bookings for admin */
export const all = query({
  args: {},
  handler: async (ctx) => {
    const bookings = await ctx.db.query("bookings").order("desc").collect();
    return Promise.all(
      bookings.map(async (b) => {
        const user = await ctx.db.get(b.userId);
        return { ...b, userName: user?.name ?? "Unknown" };
      }),
    );
  },
});
