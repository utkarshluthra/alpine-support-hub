import { useState } from "react";
import { useParams, Link } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import {
  ArrowLeft,
  Send,
  UserPlus,
  ChevronDown,
} from "lucide-react";

const STATUSES = [
  { value: "open" as const, label: "Open", className: "bg-[var(--swiss-blue)] text-white" },
  { value: "in_progress" as const, label: "In Progress", className: "bg-[var(--swiss-black)] text-white" },
  { value: "resolved" as const, label: "Resolved", className: "bg-green-700 text-white" },
  { value: "closed" as const, label: "Closed", className: "bg-muted text-muted-foreground" },
];

const PRIORITIES = [
  { value: "low" as const, label: "Low" },
  { value: "medium" as const, label: "Medium" },
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
      // First assign the ticket to the current agent if not already assigned
      if (!ticket?.agentId) {
        await assignTicket({ ticketId: ticketId as any });
      }
      await sendMessage({ ticketId: ticketId as any, content: reply.trim() });
      setReply("");
    } catch (error) {
      console.error("Failed to send reply:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleStatusChange = async (status: typeof STATUSES[number]["value"]) => {
    if (!ticketId) return;
    try {
      await updateStatus({ ticketId: ticketId as any, status });
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handlePriorityChange = async (priority: typeof PRIORITIES[number]["value"]) => {
    if (!ticketId) return;
    try {
      await updatePriority({ ticketId: ticketId as any, priority });
    } catch (error) {
      console.error("Failed to update priority:", error);
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
            to="/dashboard/agent"
            className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  const currentStatus = STATUSES.find((s) => s.value === ticket.status);
  const currentPriority = PRIORITIES.find((p) => p.value === ticket.priority);

  return (
    <main className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="border-b-2 border-foreground bg-[var(--swiss-black)] text-white">
        <div className="mx-auto max-w-7xl px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-8 items-center justify-center bg-[var(--swiss-red)]">
              <span className="text-xs font-bold">A</span>
            </div>
            <span className="text-sm font-bold uppercase tracking-wider">
              Agent Console
            </span>
          </div>
          <Link
            to="/dashboard/agent"
            className="text-xs text-white/60 hover:text-white transition-colors uppercase tracking-wider font-bold"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-8 py-8">
        <Link
          to="/dashboard/agent"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="size-4" />
          Back to all tickets
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-0">
          {/* Main Column */}
          <div className="lg:col-span-8 border-2 border-foreground">
            {/* Ticket Header */}
            <div className="border-b-2 border-foreground p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="swiss-label text-[var(--swiss-red)]">
                  #{ticket._id.slice(-6).toUpperCase()}
                </span>
                <span
                  className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${currentStatus?.className}`}
                >
                  {currentStatus?.label}
                </span>
              </div>
              <h1 className="swiss-heading text-2xl lg:text-3xl">
                {ticket.title}
              </h1>
              <div className="mt-2 flex items-center gap-3">
                <span className="swiss-label text-muted-foreground">
                  {ticket.category}
                </span>
                <span className="text-foreground/20">—</span>
                <span className="swiss-label text-muted-foreground">
                  {ticket.customerName}
                </span>
              </div>
            </div>

            {/* Original Description */}
            <div className="border-b-2 border-foreground p-6 bg-muted/30">
              <div className="swiss-label mb-3">Description</div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>

            {/* Conversation Thread */}
            <div className="p-6">
              <div className="swiss-label mb-6">
                Conversation ({messages.length} message
                {messages.length !== 1 ? "s" : ""})
              </div>

              <div className="space-y-0">
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`border-2 border-foreground -mb-[2px] last:mb-0 ${
                      msg.isAgentReply
                        ? "border-l-4 border-l-[var(--swiss-blue)] bg-[var(--swiss-blue)]/5"
                        : ""
                    }`}
                  >
                    <div className="px-5 py-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">
                            {msg.senderName}
                          </span>
                          {msg.isAgentReply && (
                            <span className="bg-[var(--swiss-blue)] text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                              Agent
                            </span>
                          )}
                          {msg.senderId === user?._id && (
                            <span className="bg-[var(--swiss-black)] text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                              You
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
                ))}

                {messages.length === 0 && (
                  <div className="border-2 border-dashed border-foreground/30 py-10 text-center">
                    <p className="text-sm text-muted-foreground">
                      No replies yet. Start the conversation below.
                    </p>
                  </div>
                )}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSend} className="mt-6">
                <label className="swiss-label block mb-3">Agent Reply</label>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type your response to the customer..."
                  rows={4}
                  className="w-full border-2 border-foreground bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--swiss-blue)] focus:ring-offset-2 resize-none transition-shadow"
                />
                <div className="mt-4 flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    {ticket.agentId === user?._id
                      ? "You are assigned to this ticket"
                      : "Replying will assign this ticket to you"}
                  </p>
                  <button
                    type="submit"
                    disabled={isSending || !reply.trim()}
                    className="inline-flex items-center gap-2 bg-[var(--swiss-blue)] px-6 py-3 text-sm font-bold uppercase tracking-wider text-white hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
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
            </div>
          </div>

          {/* Sidebar - Ticket Info */}
          <div className="lg:col-span-4 border-2 border-l-0 border-foreground">
            <div className="p-6 border-b-2 border-foreground">
              <div className="swiss-label mb-4">Ticket Details</div>

              {/* Status */}
              <div className="mb-5">
                <span className="swiss-label block mb-2 text-muted-foreground">
                  Status
                </span>
                <div className="grid grid-cols-2 gap-0 border-2 border-foreground">
                  {STATUSES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => handleStatusChange(s.value)}
                      className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors border-foreground ${
                        ticket.status === s.value
                          ? s.className
                          : "hover:bg-muted"
                      } ${
                        s.value !== "closed" && s.value !== "resolved"
                          ? "border-r-2"
                          : ""
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div className="mb-5">
                <span className="swiss-label block mb-2 text-muted-foreground">
                  Priority
                </span>
                <div className="grid grid-cols-4 gap-0 border-2 border-foreground">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => handlePriorityChange(p.value)}
                      className={`px-2 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors border-foreground ${
                        ticket.priority === p.value
                          ? p.value === "urgent" || p.value === "high"
                            ? "bg-[var(--swiss-red)] text-white"
                            : "bg-[var(--swiss-black)] text-white"
                          : "hover:bg-muted"
                      } ${p.value !== "urgent" ? "border-r-2" : ""}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assignment */}
              <div className="mb-5">
                <span className="swiss-label block mb-2 text-muted-foreground">
                  Assigned Agent
                </span>
                <div className="border-2 border-foreground px-4 py-3">
                  <div className="text-sm font-medium">
                    {ticket.agentName || (
                      <span className="text-muted-foreground italic">
                        Unassigned
                      </span>
                    )}
                  </div>
                  {ticket.agentId !== user?._id && (
                    <button
                      onClick={() => handleStatusChange("in_progress")}
                      className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[var(--swiss-blue)] hover:underline"
                    >
                      <UserPlus className="size-3" />
                      Assign to me
                    </button>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <span className="swiss-label block mb-2 text-muted-foreground">
                  Customer
                </span>
                <div className="border-2 border-foreground px-4 py-3">
                  <div className="text-sm font-medium">
                    {ticket.customerName}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {ticket.customerEmail}
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="p-6">
              <div className="swiss-label mb-4">Metadata</div>
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="swiss-label text-muted-foreground">
                    Created
                  </span>
                  <span>{formatTime(ticket._creationTime)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="swiss-label text-muted-foreground">
                    Ticket ID
                  </span>
                  <span className="font-mono text-[10px]">
                    {ticket._id.slice(-8).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
