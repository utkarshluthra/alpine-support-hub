import { useParams, Link } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppLayout } from "@/components/AppLayout";
import { ArrowLeft, Eye, Clock } from "lucide-react";

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const article = useQuery(
    api.articles.getBySlug,
    slug ? { slug } : "skip",
  );

  if (article === undefined) {
    return (
      <AppLayout>
        <div className="px-8 py-16 text-center text-sm text-muted-foreground">
          Loading...
        </div>
      </AppLayout>
    );
  }

  if (!article) {
    return (
      <AppLayout>
        <div className="px-8 py-16 text-center">
          <h1 className="alpine-heading text-2xl">Article Not Found</h1>
          <Link
            to="/dashboard/knowledge-base"
            className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3" />
            Back to knowledge base
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="px-8 py-8 max-w-3xl">
        <Link
          to="/dashboard/knowledge-base"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="size-3" />
          Back to knowledge base
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5">
              {article.category}
            </span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Eye className="size-3" />
              {article.views} views
            </span>
          </div>
          <h1 className="alpine-heading text-2xl lg:text-3xl">
            {article.title}
          </h1>
          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <span>By {article.authorName}</span>
            <span className="text-border">/</span>
            <span className="alpine-mono text-[10px]">
              {new Date(article._creationTime).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground border border-border px-2 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="border border-border p-6">
          <div className="prose prose-sm max-w-none text-foreground/90 leading-relaxed whitespace-pre-wrap text-sm">
            {article.content}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
