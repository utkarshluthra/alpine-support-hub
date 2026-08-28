import { useState } from "react";
import { useParams, Link } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { AppLayout } from "@/components/AppLayout";
import { ArrowLeft, Send } from "lucide-react";
import { ReferenceInput } from "@/components/ReferenceInput";
import { ReferenceRenderer } from "@/components/ReferenceRenderer";

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
      console.error("Failed to send:", error);
    } finally {
      setIsSending(false);
    }
  };

  if (ticket === undefined || messages === undefined) {
    return (
      <AppLayout>
        <div className="px-8 py-16 text-center text-sm text-muted-foreground">
          Loading...
        </div>
      </AppLayout>
    );
  }

  if (!ticket) {
    return (
      <AppLayout>
        <div className="px-8 py-16 text-center">
          <h1 className="alpine-heading text-2xl">Not Found</h1>
          <Link
            to="/dashboard/tickets"
            className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3" />
            Back to tickets
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="px-8 py-8 max-w-4xl">
        <Link
          to="/dashboard/tickets"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="size-3" />
          Back to tickets
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <span className="alpine-label text-primary">
              #{ticket._id.slice(-6).toUpperCase()}
            </span>
            <h1 className="alpine-heading text-2xl mt-1">{ticket.title}</h1>
            <div className="mt-2 flex items-center gap-3">
              <span className="alpine-label">{ticket.category}</span>
              <span className="text-border">/</span>
              <span className="alpine-label">{ticket.priority}</span>
              {ticket.agentName && (
                <>
                  <span className="text-border">/</span>
                  <span className="alpine-label">
                    Assigned to {ticket.agentName}
                  </span>
                </>
              )}
            </div>
          </div>
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 border border-current shrink-0 ${
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
        </div>

        {/* Description */}
        <div className="border border-border p-5 mb-6 bg-muted/30">
          <div className="alpine-label mb-2">Description</div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {ticket.description}
          </p>
        </div>

        {/* Conversation */}
        <div className="alpine-label mb-4">
          Conversation ({messages.length})
        </div>

        <div className="space-y-0">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`border border-border -mb-px last:mb-0 ${
                msg.isAgentReply
                  ? "border-l-[3px] border-l-[var(--alpine-blue)]"
                  : ""
              }`}
            >
              <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {msg.senderName}
                    </span>
                    {msg.isAgentReply && (
                      <span className="bg-primary/20 text-primary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                        Agent
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground alpine-mono">
                    {formatTime(msg._creationTime)}
                  </span>
                </div>                <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                    <ReferenceRenderer text={msg.content} />
                  </p>
              </div>
            </div>
          ))}

          {messages.length === 0 && (
            <div className="border border-dashed border-border py-10 text-center">
              <p className="text-xs text-muted-foreground">
                No messages yet. An agent will respond shortly.
              </p>
            </div>
          )}
        </div>

        {/* Reply Form */}
        {ticket.status !== "closed" && (
          <form onSubmit={handleSend} className="mt-6">
            <label className="alpine-label block mb-2">Reply</label>
            <ReferenceInput
              value={reply}
              onChange={setReply}
              placeholder="Type your reply... Use #ticket:id or #article:slug to reference"
              rows={4}
            />
            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={isSending || !reply.trim()}
                className="inline-flex items-center gap-2 bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/80 transition-colors disabled:opacity-50"
              >
                {isSending ? "Sending..." : "Send Reply"}
                {!isSending && <Send className="size-3.5" />}
              </button>
            </div>
          </form>
        )}
      </div>
    </AppLayout>
  );
}
