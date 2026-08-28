import { useState } from "react";
import { useParams, Link } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, Send } from "lucide-react";

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-[var(--swiss-blue)] text-white" },
  in_progress: {
    label: "In Progress",
    className: "bg-[var(--swiss-black)] text-white",
  },
  resolved: { label: "Resolved", className: "bg-green-700 text-white" },
  closed: { label: "Closed", className: "bg-muted text-muted-foreground" },
};

const PRIORITY_STYLES: Record<string, string> = {
  urgent: "text-[var(--swiss-red)] font-bold",
  high: "text-[var(--swiss-red)]",
  medium: "text-muted-foreground",
  low: "text-muted-foreground",
};

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CustomerTicketDetail() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const { user } = useAuth();
  const ticket = useQuery(
    api.tickets.getTicket,
    ticketId ? { ticketId: ticketId as any } : "skip",
  );
  const messages = useQuery(
    api.messages.byTicket,
    ticketId ? { ticketId: ticketId as any } : "skip",
  );
  const sendMessage = useMutation(api.messages.send);

  const [reply, setReply] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !ticketId) return;

    setIsSending(true);
    try {
      await sendMessage({ ticketId: ticketId as any, content: reply.trim() });
      setReply("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  if (ticket === undefined || messages === undefined) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading ticket...</p>
      </main>
    );
  }

  if (!ticket) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="swiss-heading text-4xl">Ticket Not Found</h1>
          <Link
            to="/dashboard"
            className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to tickets
          </Link>
        </div>
      </main>
    );
  }

  const status = STATUS_STYLES[ticket.status] ?? STATUS_STYLES.open;

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b-2 border-foreground">
        <div className="mx-auto max-w-4xl px-8 py-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="size-4" />
            Back to tickets
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="min-w-0">
              <span className="swiss-label text-[var(--swiss-blue)]">
                Ticket #{ticket._id.slice(-6).toUpperCase()}
              </span>
              <h1 className="swiss-heading text-3xl lg:text-4xl mt-2">
                {ticket.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <span className="swiss-label text-muted-foreground">
                  {ticket.category}
                </span>
                <span className="text-foreground/20">—</span>
                <span
                  className={`swiss-label ${PRIORITY_STYLES[ticket.priority]}`}
                >
                  {ticket.priority}
                </span>
                {ticket.agentName && (
                  <>
                    <span className="text-foreground/20">—</span>
                    <span className="swiss-label text-muted-foreground">
                      Assigned to {ticket.agentName}
                    </span>
                  </>
                )}
              </div>
            </div>
            <span
              className={`inline-block shrink-0 px-4 py-2 text-xs font-bold uppercase tracking-wider ${status.className}`}
            >
              {status.label}
            </span>
          </div>
        </div>
      </div>

      {/* Conversation */}
      <div className="mx-auto max-w-4xl px-8 py-8">
        <div className="swiss-label mb-6">
          Conversation ({messages.length} message
          {messages.length !== 1 ? "s" : ""})
        </div>

        <div className="space-y-0">
          {messages.map((msg) => {
            const isOwn = msg.senderId === user?._id;
            return (
              <div
                key={msg._id}
                className={`border-2 border-foreground -mb-[2px] last:mb-0 ${
                  msg.isAgentReply
                    ? "border-l-4 border-l-[var(--swiss-blue)]"
                    : ""
                }`}
              >
                <div className="px-6 py-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm">
                        {msg.senderName}
                      </span>
                      {msg.isAgentReply && (
                        <span className="bg-[var(--swiss-blue)] text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                          Agent
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(msg._creationTime)}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>
              </div>
            );
          })}

          {messages.length === 0 && (
            <div className="border-2 border-dashed border-foreground/30 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No messages yet. An agent will respond shortly.
              </p>
            </div>
          )}
        </div>

        {/* Reply Form */}
        {ticket.status !== "closed" && (
          <form onSubmit={handleSend} className="mt-8">
            <label className="swiss-label block mb-3">Your Reply</label>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Type your reply..."
              rows={4}
              className="w-full border-2 border-foreground bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--swiss-blue)] focus:ring-offset-2 resize-none transition-shadow"
            />
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSending || !reply.trim()}
                className="inline-flex items-center gap-2 bg-[var(--swiss-black)] px-6 py-3 text-sm font-bold uppercase tracking-wider text-white hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  "Sending..."
                ) : (
                  <>
                    Send Reply
                    <Send className="size-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
