import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { AppLayout } from "@/components/AppLayout";
import {
  Shield,
  Plus,
  Eye,
  EyeOff,
  Trash2,
  Users,
  Ticket,
  BookOpen,
  Calendar,
} from "lucide-react";

export default function Admin() {
  const [tab, setTab] = useState<"articles" | "tickets" | "bookings">(
    "articles",
  );
  const [showArticleForm, setShowArticleForm] = useState(false);

  // Articles
  const articles = useQuery(api.articles.all);
  const createArticle = useMutation(api.articles.create);
  const togglePublished = useMutation(api.articles.togglePublished);
  const deleteArticle = useMutation(api.articles.remove);

  // Tickets
  const tickets = useQuery(api.tickets.allTickets, {});
  const ticketStats = useQuery(api.tickets.ticketStats);

  // Bookings
  const bookings = useQuery(api.bookings.all);

  // Article form
  const [aTitle, setATitle] = useState("");
  const [aSlug, setASlug] = useState("");
  const [aContent, setAContent] = useState("");
  const [aExcerpt, setAExcerpt] = useState("");
  const [aCategory, setACategory] = useState("Getting Started");
  const [aTags, setATags] = useState<string[]>([]);
  const [aTagInput, setATagInput] = useState("");
  const [aPublished, setAPublished] = useState(true);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && aTagInput.trim()) {
      e.preventDefault();
      if (!aTags.includes(aTagInput.trim())) setATags([...aTags, aTagInput.trim()]);
      setATagInput("");
    }
  };

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aTitle.trim() || !aSlug.trim() || !aContent.trim()) return;
    try {
      await createArticle({
        title: aTitle.trim(),
        slug: aSlug.trim(),
        content: aContent.trim(),
        excerpt: aExcerpt.trim(),
        category: aCategory,
        tags: aTags,
        published: aPublished,
      });
      setShowArticleForm(false);
      setATitle("");
      setASlug("");
      setAContent("");
      setAExcerpt("");
      setATags([]);
    } catch (error) {
      console.error("Failed:", error);
    }
  };

  function formatTime(ts: number) {
    return new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <AppLayout>
      <div className="px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="size-4 text-primary" />
            <span className="alpine-label text-primary">Admin</span>
          </div>
          <h1 className="alpine-heading text-2xl lg:text-3xl mt-1">
            Administration
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border border-border mb-8">
          {[
            { key: "articles" as const, label: "Articles", icon: BookOpen },
            { key: "tickets" as const, label: "Tickets", icon: Ticket },
            { key: "bookings" as const, label: "Bookings", icon: Calendar },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
                tab === t.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              } ${t.key !== "bookings" ? "border-r border-border" : ""}`}
            >
              <t.icon className="size-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Articles Tab */}
        {tab === "articles" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="alpine-label">
                {articles?.length ?? 0} articles
              </span>
              <button
                onClick={() => setShowArticleForm(!showArticleForm)}
                className="inline-flex items-center gap-2 bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/80 transition-colors"
              >
                <Plus className="size-3" />
                {showArticleForm ? "Cancel" : "New Article"}
              </button>
            </div>

            {showArticleForm && (
              <form
                onSubmit={handleCreateArticle}
                className="border border-border p-5 mb-6"
              >
                <div className="alpine-label text-primary mb-3">
                  Create Article
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={aTitle}
                      onChange={(e) => setATitle(e.target.value)}
                      placeholder="Title"
                      className="border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    />
                    <input
                      type="text"
                      value={aSlug}
                      onChange={(e) => setASlug(e.target.value)}
                      placeholder="url-slug"
                      className="border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                      required
                    />
                  </div>
                  <input
                    type="text"
                    value={aExcerpt}
                    onChange={(e) => setAExcerpt(e.target.value)}
                    placeholder="Short excerpt..."
                    className="w-full border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <textarea
                    value={aContent}
                    onChange={(e) => setAContent(e.target.value)}
                    placeholder="Full article content..."
                    rows={6}
                    className="w-full border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                    required
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select
                      value={aCategory}
                      onChange={(e) => setACategory(e.target.value)}
                      className="border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {["Getting Started", "API Reference", "Troubleshooting", "Best Practices", "Security"].map(
                        (c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ),
                      )}
                    </select>
                    <div className="flex items-center gap-2">
                      {aTags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] font-semibold uppercase bg-muted px-1.5 py-0.5 flex items-center gap-1"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => setATags(aTags.filter((t) => t !== tag))}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            x
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        value={aTagInput}
                        onChange={(e) => setATagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                        placeholder="Tag..."
                        className="border-none bg-transparent text-xs focus:outline-none text-muted-foreground w-20"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={aPublished}
                        onChange={(e) => setAPublished(e.target.checked)}
                        className="accent-primary"
                      />
                      Published
                    </label>
                    <button
                      type="submit"
                      className="bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/80 transition-colors"
                    >
                      Create
                    </button>
                  </div>
                </div>
              </form>
            )}

            {articles === undefined ? (
              <div className="border border-border py-10 text-center text-sm text-muted-foreground">
                Loading...
              </div>
            ) : articles.length === 0 ? (
              <div className="border border-border py-10 text-center text-sm text-muted-foreground">
                No articles yet.
              </div>
            ) : (
              <div className="border border-border">
                {articles.map((article, i) => (
                  <div
                    key={article._id}
                    className={`flex items-center justify-between px-5 py-3.5 ${
                      i < articles.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">
                          {article.title}
                        </span>
                        {article.published ? (
                          <Eye className="size-3 text-[var(--alpine-green)]" />
                        ) : (
                          <EyeOff className="size-3 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] alpine-label">
                          {article.category}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {article.views} views
                        </span>
                        <span className="text-[10px] text-muted-foreground alpine-mono">
                          /{article.slug}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <button
                        onClick={() => togglePublished({ articleId: article._id })}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title={article.published ? "Unpublish" : "Publish"}
                      >
                        {article.published ? (
                          <EyeOff className="size-3.5" />
                        ) : (
                          <Eye className="size-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteArticle({ articleId: article._id })}
                        className="text-muted-foreground hover:text-[var(--alpine-red)] transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tickets Tab */}
        {tab === "tickets" && (
          <div>
            {ticketStats && (
              <div className="grid grid-cols-5 gap-0 border border-border mb-6">
                {[
                  { label: "Total", value: ticketStats.total },
                  { label: "Open", value: ticketStats.open },
                  { label: "Active", value: ticketStats.inProgress },
                  { label: "Resolved", value: ticketStats.resolved },
                  { label: "Urgent", value: ticketStats.urgent },
                ].map((s, i) => (
                  <div
                    key={s.label}
                    className={`p-4 ${i < 4 ? "border-r border-border" : ""}`}
                  >
                    <div className="alpine-label mb-1">{s.label}</div>
                    <div className="alpine-heading text-xl">{s.value}</div>
                  </div>
                ))}
              </div>
            )}

            {tickets === undefined ? (
              <div className="border border-border py-10 text-center text-sm text-muted-foreground">
                Loading...
              </div>
            ) : tickets.length === 0 ? (
              <div className="border border-border py-10 text-center text-sm text-muted-foreground">
                No tickets yet.
              </div>
            ) : (
              <div className="border border-border">
                {tickets.map((ticket, i) => (
                  <div
                    key={ticket._id}
                    className={`flex items-center justify-between px-5 py-3.5 ${
                      i < tickets.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">
                        {ticket.title}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                        <span>{ticket.customerName}</span>
                        <span>/</span>
                        <span>{ticket.category}</span>
                        <span>/</span>
                        <span className="alpine-mono">
                          {formatTime(ticket._creationTime)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          ticket.status === "open"
                            ? "text-primary"
                            : ticket.status === "in_progress"
                              ? "text-[var(--alpine-cyan)]"
                              : ticket.status === "resolved"
                                ? "text-[var(--alpine-green)]"
                                : "text-muted-foreground"
                        }`}
                      >
                        {ticket.status.replace("_", " ")}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          ticket.priority === "urgent" || ticket.priority === "high"
                            ? "text-[var(--alpine-red)]"
                            : "text-muted-foreground"
                        }`}
                      >
                        {ticket.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {tab === "bookings" && (
          <div>
            {bookings === undefined ? (
              <div className="border border-border py-10 text-center text-sm text-muted-foreground">
                Loading...
              </div>
            ) : bookings.length === 0 ? (
              <div className="border border-border py-10 text-center text-sm text-muted-foreground">
                No bookings yet.
              </div>
            ) : (
              <div className="border border-border">
                {bookings.map((booking, i) => (
                  <div
                    key={booking._id}
                    className={`flex items-center justify-between px-5 py-3.5 ${
                      i < bookings.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{booking.title}</div>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                        <span>{booking.userName}</span>
                        <span>/</span>
                        <span>{booking.type}</span>
                        <span>/</span>
                        <span>{booking.duration} min</span>
                        <span>/</span>
                        <span className="alpine-mono">
                          {formatTime(booking.scheduledAt)}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider shrink-0 ml-4 ${
                        booking.status === "confirmed"
                          ? "text-[var(--alpine-green)]"
                          : booking.status === "cancelled"
                            ? "text-[var(--alpine-red)]"
                            : "text-[var(--alpine-cyan)]"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
