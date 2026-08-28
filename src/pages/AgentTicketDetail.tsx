import { useState } from "react";
import { useParams, Link } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { AppLayout } from "@/components/AppLayout";
import { ArrowLeft, Send, UserPlus } from "lucide-react";

const STATUSES = [
  { value: "open" as const, label: "Open" },
  { value: "in_progress" as const, label: "Active" },
  { value: "resolved" as const, label: "Resolved" },
  { value: "closed" as const, label: "Closed" },
];

const PRIORITIES = [
  { value: "low" as const, label: "Low" },
  { value: "medium" as const, label: "Med" },
  { value: "high" as const, label: "High" },
  { value: "urgent" as const, label: "Urgent" },
];

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AgentTicketDetail() {
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
  const updateStatus = useMutation(api.tickets.updateStatus);
  const updatePriority = useMutation(api.tickets.updatePriority);
  const assignTicket = useMutation(api.tickets.assignTicket);

  const [reply, setReply] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !ticketId) return;
    setIsSending(true);
    try {
      if (!ticket?.agentId) {
        await assignTicket({ ticketId: ticketId as any });
      }
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
            to="/dashboard/agent"
            className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground"
          >
            <ArrowLeft className="size-3" /> Back
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="px-8 py-8">
        <Link
          to="/dashboard/agent"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="size-3" />
          Back to all tickets
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Main Column */}
          <div className="lg:col-span-8 border border-border">
            {/* Header */}
            <div className="border-b border-border p-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="alpine-label text-primary">
                  #{ticket._id.slice(-6).toUpperCase()}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-current ${
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
              <h1 className="alpine-heading text-xl lg:text-2xl">
                {ticket.title}
              </h1>
              <div className="mt-2 flex items-center gap-3">
                <span className="alpine-label">{ticket.category}</span>
                <span className="text-border">/</span>
                <span className="alpine-label">{ticket.customerName}</span>
              </div>
            </div>

            {/* Description */}
            <div className="border-b border-border p-5 bg-muted/30">
              <div className="alpine-label mb-2">Description</div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>

            {/* Messages */}
            <div className="p-5">
              <div className="alpine-label mb-4">
                Conversation ({messages.length})
              </div>

              <div className="space-y-0">
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`border border-border -mb-px last:mb-0 ${
                      msg.isAgentReply
                        ? "border-l-[3px] border-l-[var(--alpine-blue)] bg-primary/[0.03]"
                        : ""
                    }`}
                  >
                    <div className="px-4 py-3.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {msg.senderName}
                          </span>
                          {msg.isAgentReply && (
                            <span className="bg-primary/20 text-primary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                              Agent
                            </span>
                          )}
                          {msg.senderId === user?._id && (
                            <span className="bg-muted text-foreground px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                              You
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground alpine-mono">
                          {formatTime(msg._creationTime)}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                ))}

                {messages.length === 0 && (
                  <div className="border border-dashed border-border py-8 text-center">
                    <p className="text-xs text-muted-foreground">
                      No replies yet. Start the conversation below.
                    </p>
                  </div>
                )}
              </div>

              {/* Reply */}
              <form onSubmit={handleSend} className="mt-5">
                <label className="alpine-label block mb-2">Agent Reply</label>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type your response..."
                  rows={4}
                  className="w-full border border-border bg-input px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none transition-shadow"
                />
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-[10px] text-muted-foreground">
                    {ticket.agentId === user?._id
                      ? "You are assigned"
                      : "Replying assigns you to this ticket"}
                  </span>
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
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 border border-l-0 border-border">
            {/* Status */}
            <div className="p-5 border-b border-border">
              <div className="alpine-label mb-3">Status</div>
              <div className="grid grid-cols-2 gap-0 border border-border">
                {STATUSES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() =>
                      updateStatus({
                        ticketId: ticketId as any,
                        status: s.value,
                      })
                    }
                    className={`px-3 py-2 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                      ticket.status === s.value
                        ? s.value === "open"
                          ? "bg-primary text-primary-foreground"
                          : s.value === "in_progress"
                            ? "bg-[var(--alpine-cyan)]/20 text-[var(--alpine-cyan)]"
                            : s.value === "resolved"
                              ? "bg-[var(--alpine-green)]/20 text-[var(--alpine-green)]"
                              : "bg-muted text-muted-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    } ${s.value !== "closed" && s.value !== "resolved" ? "border-r border-border" : ""}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div className="p-5 border-b border-border">
              <div className="alpine-label mb-3">Priority</div>
              <div className="grid grid-cols-4 gap-0 border border-border">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    onClick={() =>
                      updatePriority({
                        ticketId: ticketId as any,
                        priority: p.value,
                      })
                    }
                    className={`px-2 py-2 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                      ticket.priority === p.value
                        ? p.value === "urgent" || p.value === "high"
                          ? "bg-[var(--alpine-red)]/20 text-[var(--alpine-red)]"
                          : "bg-primary/20 text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    } ${p.value !== "urgent" ? "border-r border-border" : ""}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Assignment */}
            <div className="p-5 border-b border-border">
              <div className="alpine-label mb-3">Assigned Agent</div>
              <div className="border border-border px-4 py-3">
                <div className="text-sm font-medium">
                  {ticket.agentName || (
                    <span className="text-muted-foreground italic">
                      Unassigned
                    </span>
                  )}
                </div>
                {ticket.agentId !== user?._id && (
                  <button
                    onClick={() =>
                      updateStatus({
                        ticketId: ticketId as any,
                        status: "in_progress",
                      })
                    }
                    className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-primary hover:underline"
                  >
                    <UserPlus className="size-3" />
                    Assign to me
                  </button>
                )}
              </div>
            </div>

            {/* Customer */}
            <div className="p-5 border-b border-border">
              <div className="alpine-label mb-3">Customer</div>
              <div className="border border-border px-4 py-3">
                <div className="text-sm font-medium">{ticket.customerName}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {ticket.customerEmail}
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="p-5">
              <div className="alpine-label mb-3">Metadata</div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Created</span>
                  <span className="alpine-mono text-[10px]">
                    {formatTime(ticket._creationTime)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">ID</span>
                  <span className="alpine-mono text-[10px]">
                    {ticket._id.slice(-8).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
