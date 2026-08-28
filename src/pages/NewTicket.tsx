import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
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
      navigate(`/dashboard/my-tickets/${ticketId}`);
    } catch (error) {
      console.error("Failed to create ticket:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b-2 border-foreground">
        <div className="mx-auto max-w-3xl px-8 py-10">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="size-4" />
            Back to tickets
          </Link>
          <span className="swiss-label text-[var(--swiss-red)]">
            New Request
          </span>
          <h1 className="swiss-heading text-4xl lg:text-5xl mt-3">
            Submit a
            <br />
            Ticket
          </h1>
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-3xl px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            {/* Category */}
            <div>
              <label className="swiss-label block mb-3">Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-0 border-2 border-foreground">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-foreground ${
                      category === cat
                        ? "bg-[var(--swiss-black)] text-white"
                        : "hover:bg-muted"
                    } ${
                      cat !== CATEGORIES[CATEGORIES.length - 1]
                        ? "border-b-2 sm:border-b-0 sm:border-r-2"
                        : "border-b-2 sm:border-b-0"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="swiss-label block mb-3" htmlFor="title">
                Subject
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief description of your issue"
                className="w-full border-2 border-foreground bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--swiss-blue)] focus:ring-offset-2 transition-shadow"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="swiss-label block mb-3" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide as much detail as possible to help us resolve your issue quickly..."
                rows={8}
                className="w-full border-2 border-foreground bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--swiss-blue)] focus:ring-offset-2 transition-shadow resize-none"
                required
              />
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between border-t-2 border-foreground pt-8">
              <p className="text-xs text-muted-foreground">
                Our team typically responds within 4 hours.
              </p>
              <button
                type="submit"
                disabled={isSubmitting || !title.trim() || !description.trim()}
                className="inline-flex items-center gap-2 bg-[var(--swiss-red)] px-8 py-3 text-sm font-bold uppercase tracking-wider text-white hover:bg-[var(--swiss-red)]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  "Submitting..."
                ) : (
                  <>
                    Submit Ticket
                    <Send className="size-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
