import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** List all posts */
export const list = query({
  args: {
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let posts;
    if (args.category) {
      posts = await ctx.db
        .query("posts")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .order("desc")
        .collect();
    } else {
      posts = await ctx.db.query("posts").order("desc").collect();
    }

    return Promise.all(
      posts.map(async (p) => {
        const author = await ctx.db.get(p.authorId);
        return { ...p, authorName: author?.name ?? "Unknown" };
      }),
    );
  },
});

/** Create a post */
export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("posts", {
      ...args,
      authorId: userId,
    });
  },
});

/** Delete a post */
export const remove = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.delete(args.postId);
  },
});
