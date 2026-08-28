import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppLayout } from "@/components/AppLayout";
import { ArrowLeft, Send } from "lucide-react";

const CATEGORIES = [
  "General Inquiry",
  "Technical Issue",
  "Billing",
  "Feature Request",
  "Bug Report",
  "Account Access",
];

export default function NewTicket() {
  const navigate = useNavigate();
  const createTicket = useMutation(api.tickets.createTicket);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General Inquiry");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const ticketId = await createTicket({
        title: title.trim(),
        description: description.trim(),
        category,
      });
      navigate(`/dashboard/tickets/${ticketId}`);
    } catch (error) {
      console.error("Failed to create ticket:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="px-8 py-8 max-w-3xl">
        <Link
          to="/dashboard/tickets"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="size-3" />
          Back to tickets
        </Link>
        <div className="mb-8">
          <span className="alpine-label text-primary">New Request</span>
          <h1 className="alpine-heading text-2xl mt-2">Submit a Ticket</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label className="alpine-label block mb-2">Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-0 border border-border">
                {CATEGORIES.map((cat, i) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                      category === cat
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    } ${
                      i < CATEGORIES.length - 1
                        ? "border-r border-border"
                        : ""
                    } ${i < 3 ? "border-b sm:border-b-0 border-border" : ""} ${
                      i === 3 ? "border-b sm:border-b-0 border-border" : ""
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="alpine-label block mb-2" htmlFor="title">
                Subject
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief description of your issue"
                className="w-full border border-border bg-input px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-shadow"
                required
              />
            </div>

            <div>
              <label className="alpine-label block mb-2" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide as much detail as possible..."
                rows={8}
                className="w-full border border-border bg-input px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none transition-shadow"
                required
              />
            </div>

            <div className="flex items-center justify-between border-t border-border pt-6">
              <p className="text-xs text-muted-foreground">
                Our team typically responds within 4 hours.
              </p>
              <button
                type="submit"
                disabled={isSubmitting || !title.trim() || !description.trim()}
                className="inline-flex items-center gap-2 bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  "Submitting..."
                ) : (
                  <>
                    Submit
                    <Send className="size-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
