import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Link } from "react-router";
import { AppLayout } from "@/components/AppLayout";
import { Search, ArrowRight, Eye } from "lucide-react";

const CATEGORIES = [
  "All",
  "Getting Started",
  "API Reference",
  "Troubleshooting",
  "Best Practices",
  "Security",
];

export default function KnowledgeBase() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const articles = useQuery(api.articles.list, {
    category: category === "All" ? undefined : category,
    search: search || undefined,
  });

  return (
    <AppLayout>
      <div className="px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <span className="alpine-label text-primary">Knowledge Base</span>
          <h1 className="alpine-heading text-2xl lg:text-3xl mt-2">
            Documentation & Guides
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Search the internal knowledge base for answers and reference
            material.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles, guides, and documentation..."
            className="w-full border border-border bg-input pl-10 pr-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-shadow"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-colors border border-border shrink-0 ${
                category === cat
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        {articles === undefined ? (
          <div className="border border-border py-16 text-center text-sm text-muted-foreground">
            Loading articles...
          </div>
        ) : articles.length === 0 ? (
          <div className="border border-border py-16 text-center">
            <p className="text-sm text-muted-foreground">
              {search
                ? `No results for "${search}". Try a different search term.`
                : "No articles published yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border border-border">
            {articles.map((article, i) => (
              <Link
                key={article._id}
                to={`/dashboard/knowledge-base/${article.slug}`}
                className={`p-6 hover:bg-primary/5 transition-colors group ${
                  i < articles.length - 1 ? "border-b border-border" : ""
                } ${i % 3 !== 2 ? "lg:border-r lg:border-b-0 border-border" : ""} ${
                  i % 2 !== 1 ? "md:border-r border-border" : ""
                } ${i % 2 !== 1 && i >= articles.length - 2 ? "md:border-r-0 border-border" : ""}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5">
                    {article.category}
                  </span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Eye className="size-3" />
                    {article.views}
                  </span>
                </div>
                <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {article.excerpt}
                </p>
                <div className="mt-3 flex items-center gap-1 text-[10px] text-muted-foreground group-hover:text-primary transition-colors">
                  Read more
                  <ArrowRight className="size-3" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
