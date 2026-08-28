import { useState, useEffect, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Link } from "react-router";
import {
  Search,
  X,
  Ticket,
  BookOpen,
  MessageSquare,
  ArrowRight,
  Hash,
  Command,
} from "lucide-react";

type FilterType = "all" | "tickets" | "articles" | "posts";

const TYPE_ICONS: Record<string, typeof Ticket> = {
  ticket: Ticket,
  article: BookOpen,
  post: MessageSquare,
};

const TYPE_COLORS: Record<string, string> = {
  ticket: "text-primary",
  article: "text-[var(--alpine-cyan)]",
  post: "text-[var(--alpine-green)]",
};

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");

  const results = useQuery(
    api.search.globalSearch,
    query.length >= 2 ? { q: query, type: filterType === "all" ? undefined : filterType } : "skip",
  );

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setFilterType("all");
    }
  }, [open]);

  const totalResults =
    (results?.tickets.length ?? 0) +
    (results?.articles.length ?? 0) +
    (results?.posts.length ?? 0);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Search Panel */}
      <div
        className="relative w-full max-w-2xl border border-border bg-[oklch(0.11_0_0)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <Search className="size-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tickets, articles, posts..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            autoFocus
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <kbd className="hidden sm:inline-flex items-center gap-0.5 border border-border px-1.5 py-0.5 text-[9px] text-muted-foreground">
              ESC
            </kbd>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Type Filters */}
        <div className="flex items-center gap-1 border-b border-border px-5 py-2">
          {(
            [
              { key: "all", label: "All" },
              { key: "tickets", label: "Tickets", icon: Ticket },
              { key: "articles", label: "Articles", icon: BookOpen },
              { key: "posts", label: "Posts", icon: MessageSquare },
            ] as const
          ).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterType(f.key)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                filterType === f.key
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.icon && <f.icon className="size-3" />}
              {f.label}
            </button>
          ))}
          {query.length >= 2 && (
            <span className="ml-auto text-[10px] text-muted-foreground">
              {totalResults} result{totalResults !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto">
          {query.length < 2 ? (
            <div className="px-5 py-8 text-center">
              <div className="alpine-label text-muted-foreground/50 mb-3">
                Quick Reference
              </div>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <p>
                  Type at least 2 characters to search across all content.
                </p>
                <p className="text-[10px]">
                  Use{" "}
                  <kbd className="border border-border px-1 py-0.5 font-mono">
                    #ticket:id
                  </kbd>{" "}
                  ,{" "}
                  <kbd className="border border-border px-1 py-0.5 font-mono">
                    #article:slug
                  </kbd>{" "}
                  , or{" "}
                  <kbd className="border border-border px-1 py-0.5 font-mono">
                    #post:id
                  </kbd>{" "}
                  to reference items inline.
                </p>
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No results for "{query}"
              </p>
            </div>
          ) : (
            <div className="py-2">
              {/* Tickets */}
              {results?.tickets && results.tickets.length > 0 && (
                <div>
                  <div className="px-5 py-1.5 flex items-center gap-2">
                    <Ticket className="size-3 text-primary" />
                    <span className="alpine-label text-primary">Tickets</span>
                    <span className="text-[10px] text-muted-foreground">
                      {results.tickets.length}
                    </span>
                  </div>
                  {results.tickets.map((item) => (
                    <SearchResult
                      key={item._id}
                      title={item.title}
                      subtitle={item.subtitle}
                      type="ticket"
                      link={item.link}
                      onClick={onClose}
                    />
                  ))}
                </div>
              )}

              {/* Articles */}
              {results?.articles && results.articles.length > 0 && (
                <div>
                  <div className="px-5 py-1.5 flex items-center gap-2">
                    <BookOpen className="size-3 text-[var(--alpine-cyan)]" />
                    <span className="alpine-label text-[var(--alpine-cyan)]">
                      Articles
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {results.articles.length}
                    </span>
                  </div>
                  {results.articles.map((item) => (
                    <SearchResult
                      key={item._id}
                      title={item.title}
                      subtitle={item.subtitle}
                      type="article"
                      link={item.link}
                      onClick={onClose}
                    />
                  ))}
                </div>
              )}

              {/* Posts */}
              {results?.posts && results.posts.length > 0 && (
                <div>
                  <div className="px-5 py-1.5 flex items-center gap-2">
                    <MessageSquare className="size-3 text-[var(--alpine-green)]" />
                    <span className="alpine-label text-[var(--alpine-green)]">
                      Posts
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {results.posts.length}
                    </span>
                  </div>
                  {results.posts.map((item) => (
                    <SearchResult
                      key={item._id}
                      title={item.title}
                      subtitle={item.subtitle}
                      type="post"
                      link={item.link}
                      onClick={onClose}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Hash className="size-2.5" /> Reference:
            </span>
            <span className="font-mono">#ticket:id</span>
            <span className="font-mono">#article:slug</span>
            <span className="font-mono">#post:id</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Command className="size-2.5" />
            <span>K to toggle</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchResult({
  title,
  subtitle,
  type,
  link,
  onClick,
}: {
  title: string;
  subtitle: string;
  type: string;
  link: string;
  onClick: () => void;
}) {
  const Icon = TYPE_ICONS[type] ?? Ticket;
  const colorClass = TYPE_COLORS[type] ?? "text-muted-foreground";

  return (
    <Link
      to={link}
      onClick={onClick}
      className="flex items-center gap-3 px-5 py-2.5 hover:bg-primary/5 transition-colors group"
    >
      <Icon className={`size-4 shrink-0 ${colorClass}`} />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium truncate group-hover:text-primary transition-colors">
          {title}
        </div>
        <div className="text-[10px] text-muted-foreground alpine-label">
          {subtitle}
        </div>
      </div>
      <ArrowRight className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}
