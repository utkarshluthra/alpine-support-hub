import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** List published articles, optionally filtered by category or search */
export const list = query({
  args: {
    category: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let articles;
    if (args.category) {
      articles = await ctx.db
        .query("articles")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .order("desc")
        .collect();
    } else {
      articles = await ctx.db
        .query("articles")
        .withIndex("by_published", (q) => q.eq("published", true))
        .order("desc")
        .collect();
    }

    const published = articles.filter((a) => a.published);

    if (args.search) {
      const q = args.search.toLowerCase();
      return published.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    return published;
  },
});

/** Get a single article by slug */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const article = await ctx.db
      .query("articles")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (!article) return null;

    const author = await ctx.db.get(article.authorId);
    return { ...article, authorName: author?.name ?? "Unknown" };
  },
});

/** Create an article */
export const create = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    excerpt: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    published: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("articles", {
      ...args,
      authorId: userId,
      views: 0,
    });
  },
});

/** Get all articles for admin */
export const all = query({
  args: {},
  handler: async (ctx) => {
    const articles = await ctx.db.query("articles").order("desc").collect();
    return Promise.all(
      articles.map(async (a) => {
        const author = await ctx.db.get(a.authorId);
        return { ...a, authorName: author?.name ?? "Unknown" };
      }),
    );
  },
});

/** Toggle publish status */
export const togglePublished = mutation({
  args: { articleId: v.id("articles") },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.articleId);
    if (!article) throw new Error("Article not found");
    await ctx.db.patch(args.articleId, { published: !article.published });
  },
});

/** Delete an article */
export const remove = mutation({
  args: { articleId: v.id("articles") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.articleId);
  },
});
