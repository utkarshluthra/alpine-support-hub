import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { AppLayout } from "@/components/AppLayout";
import { Plus, Send, Trash2 } from "lucide-react";
import { ReferenceInput } from "@/components/ReferenceInput";
import { ReferenceRenderer } from "@/components/ReferenceRenderer";

const POST_CATEGORIES = [
  "General",
  "Update",
  "Announcement",
  "Tip",
  "Discussion",
];

export default function Posts() {
  const posts = useQuery(api.posts.list, {});
  const createPost = useMutation(api.posts.create);
  const deletePost = useMutation(api.posts.remove);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setIsSubmitting(true);
    try {
      await createPost({
        title: title.trim(),
        content: content.trim(),
        category,
        tags,
      });
      setShowForm(false);
      setTitle("");
      setContent("");
      setTags([]);
    } catch (error) {
      console.error("Failed to create post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      await deletePost({ postId: postId as any });
    } catch (error) {
      console.error("Failed to delete:", error);
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
      <div className="px-8 py-8 max-w-4xl">
        <div className="flex items-start justify-between mb-8">
          <div>
            <span className="alpine-label text-primary">Posts</span>
            <h1 className="alpine-heading text-2xl mt-2">
              Internal Updates
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Share updates, tips, and announcements with the team.
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/80 transition-colors"
          >
            <Plus className="size-3.5" />
            {showForm ? "Cancel" : "New Post"}
          </button>
        </div>

        {/* Post Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="border border-border p-6 mb-8"
          >
            <div className="alpine-label text-primary mb-4">
              New Post
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="alpine-label block mb-1.5">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Post title"
                    className="w-full border border-border bg-input px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="alpine-label block mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-border bg-input px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {POST_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="alpine-label block mb-1.5">Content</label>
                <ReferenceInput
                  value={content}
                  onChange={setContent}
                  placeholder="Write your post... Use #ticket:id, #article:slug, or #post:id to reference other items"
                  rows={6}
                />
              </div>
              <div>
                <label className="alpine-label block mb-1.5">
                  Tags (press Enter)
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider bg-muted px-2 py-0.5"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => setTags(tags.filter((t) => t !== tag))}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Add tag..."
                    className="border-none bg-transparent text-sm focus:outline-none text-muted-foreground w-24"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim() || !content.trim()}
                  className="inline-flex items-center gap-2 bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/80 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Posting..." : "Publish"}
                  {!isSubmitting && <Send className="size-3.5" />}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Posts Feed */}
        {posts === undefined ? (
          <div className="border border-border py-16 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : posts.length === 0 ? (
          <div className="border border-border py-16 text-center">
            <p className="text-sm text-muted-foreground">
              No posts yet. Share the first update with the team.
            </p>
          </div>
        ) : (
          <div className="space-y-0 border border-border">
            {posts.map((post, i) => (
              <div
                key={post._id}
                className={`p-5 ${
                  i < posts.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5">
                        {post.category}
                      </span>
                      <span className="text-[10px] text-muted-foreground alpine-mono">
                        {formatTime(post._creationTime)}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold">{post.title}</h3>
                    <p className="mt-1.5 text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap">
                      <ReferenceRenderer text={post.content} />
                    </p>
                    {post.tags.length > 0 && (
                      <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground border border-border px-1.5 py-0.5"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 text-[10px] text-muted-foreground">
                      by {post.authorName}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="shrink-0 ml-4 text-muted-foreground hover:text-[var(--alpine-red)] transition-colors"
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
    </AppLayout>
  );
}
