import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Unified search across tickets, articles, and posts.
 * Returns results grouped by type with a flat relevance-sorted list.
 */
export const globalSearch = query({
  args: {
    q: v.string(),
    type: v.optional(
      v.union(
        v.literal("all"),
        v.literal("tickets"),
        v.literal("articles"),
        v.literal("posts"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { tickets: [], articles: [], posts: [] };

    const query = args.q.toLowerCase().trim();
    if (!query) return { tickets: [], articles: [], posts: [] };

    const filterType = args.type ?? "all";

    const results: {
      tickets: Array<{
        _id: string;
        title: string;
        subtitle: string;
        type: "ticket";
        status: string;
        link: string;
        updatedAt: number;
      }>;
      articles: Array<{
        _id: string;
        title: string;
        subtitle: string;
        type: "article";
        category: string;
        link: string;
        updatedAt: number;
      }>;
      posts: Array<{
        _id: string;
        title: string;
        subtitle: string;
        type: "post";
        category: string;
        link: string;
        updatedAt: number;
      }>;
    } = { tickets: [], articles: [], posts: [] };

    // Search tickets
    if (filterType === "all" || filterType === "tickets") {
      const allTickets = await ctx.db.query("tickets").collect();
      for (const ticket of allTickets) {
        const customer = await ctx.db.get(ticket.customerId);
        const searchable = `${ticket.title} ${ticket.description} ${ticket.category} ${customer?.name ?? ""}`.toLowerCase();
        if (searchable.includes(query)) {
          results.tickets.push({
            _id: ticket._id,
            title: ticket.title,
            subtitle: `${ticket.category} / ${ticket.status.replace("_", " ")}`,
            type: "ticket",
            status: ticket.status,
            link: `/dashboard/agent/ticket/${ticket._id}`,
            updatedAt: ticket._creationTime,
          });
        }
      }
    }

    // Search articles
    if (filterType === "all" || filterType === "articles") {
      const allArticles = await ctx.db.query("articles").collect();
      for (const article of allArticles) {
        const searchable = `${article.title} ${article.excerpt} ${article.content} ${article.category} ${article.tags.join(" ")}`.toLowerCase();
        if (searchable.includes(query)) {
          results.articles.push({
            _id: article._id,
            title: article.title,
            subtitle: article.category,
            type: "article",
            category: article.category,
            link: `/dashboard/knowledge-base/${article.slug}`,
            updatedAt: article._creationTime,
          });
        }
      }
    }

    // Search posts
    if (filterType === "all" || filterType === "posts") {
      const allPosts = await ctx.db.query("posts").collect();
      for (const post of allPosts) {
        const searchable = `${post.title} ${post.content} ${post.category} ${post.tags.join(" ")}`.toLowerCase();
        if (searchable.includes(query)) {
          results.posts.push({
            _id: post._id,
            title: post.title,
            subtitle: post.category,
            type: "post",
            category: post.category,
            link: `/dashboard/posts`,
            updatedAt: post._creationTime,
          });
        }
      }
    }

    return results;
  },
});

/**
 * Resolve references like #ticket:abc123 or #article:my-slug into linkable items.
 */
export const resolveReferences = query({
  args: {
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const refs: Array<{
      raw: string;
      title: string;
      link: string;
      type: string;
    }> = [];

    // Match #ticket:<id> patterns
    const ticketMatches = args.text.matchAll(/#ticket:([a-z0-9]+)/gi);
    for (const match of ticketMatches) {
      const id = match[1];
      // Try to find ticket by ID suffix
      const allTickets = await ctx.db.query("tickets").collect();
      const ticket = allTickets.find((t) => t._id.endsWith(id));
      if (ticket) {
        refs.push({
          raw: match[0],
          title: ticket.title,
          link: `/dashboard/tickets/${ticket._id}`,
          type: "ticket",
        });
      }
    }

    // Match #article:<slug> patterns
    const articleMatches = args.text.matchAll(/#article:([a-z0-9-]+)/gi);
    for (const match of articleMatches) {
      const slug = match[1];
      const article = await ctx.db
        .query("articles")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();
      if (article) {
        refs.push({
          raw: match[0],
          title: article.title,
          link: `/dashboard/knowledge-base/${article.slug}`,
          type: "article",
        });
      }
    }

    // Match #post:<id> patterns
    const postMatches = args.text.matchAll(/#post:([a-z0-9]+)/gi);
    for (const match of postMatches) {
      const id = match[1];
      const allPosts = await ctx.db.query("posts").collect();
      const post = allPosts.find((p) => p._id.endsWith(id));
      if (post) {
        refs.push({
          raw: match[0],
          title: post.title,
          link: `/dashboard/posts`,
          type: "post",
        });
      }
    }

    return refs;
  },
});
