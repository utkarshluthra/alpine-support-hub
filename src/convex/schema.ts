import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
    }).index("email", ["email"]),

    tickets: defineTable({
      title: v.string(),
      description: v.string(),
      customerId: v.id("users"),
      status: v.union(
        v.literal("open"),
        v.literal("in_progress"),
        v.literal("resolved"),
        v.literal("closed"),
      ),
      priority: v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
        v.literal("urgent"),
      ),
      category: v.string(),
      agentId: v.optional(v.id("users")),
    })
      .index("by_customer", ["customerId"])
      .index("by_status", ["status"])
      .index("by_agent", ["agentId"]),

    messages: defineTable({
      ticketId: v.id("tickets"),
      senderId: v.id("users"),
      content: v.string(),
      isAgentReply: v.boolean(),
    }).index("by_ticket", ["ticketId"]),

    articles: defineTable({
      title: v.string(),
      slug: v.string(),
      content: v.string(),
      excerpt: v.string(),
      category: v.string(),
      tags: v.array(v.string()),
      authorId: v.id("users"),
      published: v.boolean(),
      views: v.number(),
    })
      .index("by_slug", ["slug"])
      .index("by_category", ["category"])
      .index("by_published", ["published"]),

    bookings: defineTable({
      title: v.string(),
      description: v.string(),
      userId: v.id("users"),
      scheduledAt: v.number(),
      duration: v.number(),
      status: v.union(
        v.literal("pending"),
        v.literal("confirmed"),
        v.literal("cancelled"),
      ),
      type: v.string(),
    })
      .index("by_user", ["userId"])
      .index("by_status", ["status"])
      .index("by_scheduledAt", ["scheduledAt"]),

    posts: defineTable({
      title: v.string(),
      content: v.string(),
      authorId: v.id("users"),
      category: v.string(),
      tags: v.array(v.string()),
    })
      .index("by_author", ["authorId"])
      .index("by_category", ["category"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
