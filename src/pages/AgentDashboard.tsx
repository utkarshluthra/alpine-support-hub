import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { Link } from "react-router";
import {
  BarChart3,
  Clock,
  AlertTriangle,
  CheckCircle,
  CircleDot,
  XCircle,
  ArrowRight,
  LogOut,
} from "lucide-react";

type StatusFilter = "all" | "open" | "in_progress" | "resolved" | "closed";
type PriorityFilter = "all" | "low" | "medium" | "high" | "urgent";

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

const STATUS_ICONS: Record<string, typeof CircleDot> = {
  open: CircleDot,
  in_progress: Clock,
  resolved: CheckCircle,
  closed: XCircle,
};

function formatTime(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function AgentDashboard() {
  const { user, signOut } = useAuth();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");

  const tickets = useQuery(api.tickets.allTickets, {
    status: statusFilter === "all" ? undefined : statusFilter,
    priority: priorityFilter === "all" ? undefined : priorityFilter,
  });

  const stats = useQuery(api.tickets.ticketStats);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="border-b-2 border-foreground bg-[var(--swiss-black)] text-white">
        <div className="mx-auto max-w-7xl px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-8 items-center justify-center bg-[var(--swiss-red)]">
              <BarChart3 className="size-4" />
            </div>
            <span className="text-sm font-bold uppercase tracking-wider">
              Agent Console
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-xs text-white/60">
              {user?.name || user?.email || "Agent"}
            </span>
            <Link
              to="/dashboard"
              className="text-xs text-white/60 hover:text-white transition-colors uppercase tracking-wider font-bold"
            >
              Customer View
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors"
            >
              <LogOut className="size-3" />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-8 py-10">
        {/* Title */}
        <div className="mb-10">
          <span className="swiss-label text-[var(--swiss-red)]">
            Triage Dashboard
          </span>
          <h1 className="swiss-heading text-4xl lg:text-5xl mt-3">
            All Tickets
          </h1>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-0 border-2 border-foreground mb-10">
            {[
              { label: "Total", value: stats.total, icon: BarChart3 },
              { label: "Open", value: stats.open, icon: CircleDot },
              { label: "In Progress", value: stats.inProgress, icon: Clock },
              { label: "Resolved", value: stats.resolved, icon: CheckCircle },
              { label: "Urgent", value: stats.urgent, icon: AlertTriangle },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`p-5 ${
                  i < 4 ? "border-r-2 border-foreground" : ""
                } ${i < 3 ? "border-b-2 sm:border-b-0 border-foreground" : ""}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className="size-4 text-muted-foreground" />
                  <span className="swiss-label">{stat.label}</span>
                </div>
                <div className="swiss-heading text-3xl">{stat.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="swiss-label mr-2">Status</span>
            {(["all", "open", "in_progress", "resolved", "closed"] as const).map(
              (s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors border-2 border-foreground ${
                    statusFilter === s
                      ? "bg-[var(--swiss-black)] text-white"
                      : "hover:bg-muted"
                  }`}
                >
                  {s === "all" ? "All" : s === "in_progress" ? "Active" : s}
                </button>
              ),
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="swiss-label mr-2">Priority</span>
            {(
              ["all", "urgent", "high", "medium", "low"] as const
            ).map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors border-2 border-foreground ${
                  priorityFilter === p
                    ? "bg-[var(--swiss-black)] text-white"
                    : "hover:bg-muted"
                }`}
              >
                {p === "all" ? "All" : p}
              </button>
            ))}
          </div>
        </div>

        {/* Ticket List */}
        {tickets === undefined ? (
          <div className="py-20 text-center text-muted-foreground">
            Loading tickets...
          </div>
        ) : tickets.length === 0 ? (
          <div className="border-2 border-dashed border-foreground/30 py-20 text-center">
            <div className="swiss-heading text-3xl text-muted-foreground/50">
              No tickets match
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Adjust your filters or wait for new tickets.
            </p>
          </div>
        ) : (
          <div className="border-2 border-foreground">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 border-b-2 border-foreground bg-muted px-6 py-3">
              <div className="col-span-4 swiss-label">Subject</div>
              <div className="col-span-2 swiss-label">Customer</div>
              <div className="col-span-1 swiss-label">Status</div>
              <div className="col-span-1 swiss-label">Priority</div>
              <div className="col-span-1 swiss-label">Replies</div>
              <div className="col-span-2 swiss-label">Updated</div>
              <div className="col-span-1"></div>
            </div>

            {/* Ticket Rows */}
            {tickets.map((ticket) => {
              const status =
                STATUS_STYLES[ticket.status] ?? STATUS_STYLES.open;
              const StatusIcon =
                STATUS_ICONS[ticket.status] ?? CircleDot;
              return (
                <Link
                  key={ticket._id}
                  to={`/dashboard/agent/ticket/${ticket._id}`}
                  className="grid grid-cols-12 gap-4 border-b border-foreground/10 px-6 py-4 hover:bg-muted/50 transition-colors items-center group last:border-b-0"
                >
                  <div className="col-span-4 min-w-0">
                    <div className="font-bold text-sm truncate group-hover:text-[var(--swiss-blue)] transition-colors">
                      {ticket.title}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5">
                        {ticket.category}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs font-medium truncate">
                      {ticket.customerName}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      {ticket.customerEmail}
                    </div>
                  </div>
                  <div className="col-span-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${status.className}`}
                    >
                      <StatusIcon className="size-3" />
                    </span>
                  </div>
                  <div
                    className={`col-span-1 text-xs font-bold uppercase tracking-wider ${PRIORITY_STYLES[ticket.priority]}`}
                  >
                    {ticket.priority}
                  </div>
                  <div className="col-span-1 text-xs text-muted-foreground">
                    {ticket.messageCount}
                  </div>
                  <div className="col-span-2 text-xs text-muted-foreground">
                    {formatTime(ticket.lastMessageTime ?? ticket._creationTime)}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <ArrowRight className="size-4 text-muted-foreground group-hover:text-[var(--swiss-blue)] transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
