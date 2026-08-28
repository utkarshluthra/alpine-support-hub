import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Link } from "react-router";
import { AppLayout } from "@/components/AppLayout";
import {
  ArrowRight,
  CircleDot,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

type StatusFilter = "all" | "open" | "in_progress" | "resolved" | "closed";
type PriorityFilter = "all" | "low" | "medium" | "high" | "urgent";

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
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");

  const tickets = useQuery(api.tickets.allTickets, {
    status: statusFilter === "all" ? undefined : statusFilter,
    priority: priorityFilter === "all" ? undefined : priorityFilter,
  });

  const stats = useQuery(api.tickets.ticketStats);

  return (
    <AppLayout>
      <div className="px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <span className="alpine-label text-primary">Triage</span>
          <h1 className="alpine-heading text-2xl lg:text-3xl mt-2">
            All Tickets
          </h1>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-0 border border-border mb-8">
            {[
              { label: "Total", value: stats.total },
              { label: "Open", value: stats.open },
              { label: "Active", value: stats.inProgress },
              { label: "Resolved", value: stats.resolved },
              { label: "Urgent", value: stats.urgent },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`p-4 ${
                  i < 4 ? "border-r border-border" : ""
                } ${i < 3 ? "border-b sm:border-b-0 border-border" : ""} ${
                  i === 3 ? "border-b sm:border-b-0 border-border" : ""
                }`}
              >
                <div className="alpine-label mb-1">{stat.label}</div>
                <div className="alpine-heading text-xl">{stat.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="alpine-label mr-2">Status</span>
            {(["all", "open", "in_progress", "resolved", "closed"] as const).map(
              (s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors border border-border ${
                    statusFilter === s
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s === "all" ? "All" : s === "in_progress" ? "Active" : s}
                </button>
              ),
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="alpine-label mr-2">Priority</span>
            {(["all", "urgent", "high", "medium", "low"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors border border-border ${
                  priorityFilter === p
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p === "all" ? "All" : p}
              </button>
            ))}
          </div>
        </div>

        {/* Ticket Table */}
        {tickets === undefined ? (
          <div className="border border-border py-16 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : tickets.length === 0 ? (
          <div className="border border-border py-16 text-center">
            <p className="text-sm text-muted-foreground">
              No tickets match the current filters.
            </p>
          </div>
        ) : (
          <div className="border border-border">
            <div className="grid grid-cols-12 gap-3 border-b border-border bg-muted/50 px-5 py-2.5">
              <div className="col-span-4 alpine-label">Subject</div>
              <div className="col-span-2 alpine-label">Customer</div>
              <div className="col-span-1 alpine-label">Status</div>
              <div className="col-span-1 alpine-label">Priority</div>
              <div className="col-span-1 alpine-label">Replies</div>
              <div className="col-span-2 alpine-label">Updated</div>
              <div className="col-span-1"></div>
            </div>
            {tickets.map((ticket, i) => (
              <Link
                key={ticket._id}
                to={`/dashboard/agent/ticket/${ticket._id}`}
                className={`grid grid-cols-12 gap-3 px-5 py-3.5 hover:bg-primary/5 transition-colors items-center group ${
                  i < tickets.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="col-span-4 min-w-0">
                  <div className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                    {ticket.title}
                  </div>
                  <div className="mt-0.5 text-[9px] alpine-label bg-muted px-1 py-0.5 inline-block">
                    {ticket.category}
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
                </div>
                <div
                  className={`col-span-1 text-[10px] font-bold uppercase tracking-wider ${
                    ticket.priority === "urgent" || ticket.priority === "high"
                      ? "text-[var(--alpine-red)]"
                      : "text-muted-foreground"
                  }`}
                >
                  {ticket.priority}
                </div>
                <div className="col-span-1 text-xs text-muted-foreground">
                  {ticket.messageCount}
                </div>
                <div className="col-span-2 text-xs text-muted-foreground alpine-mono">
                  {formatTime(ticket.lastMessageTime ?? ticket._creationTime)}
                </div>
                <div className="col-span-1 flex justify-end">
                  <ArrowRight className="size-3 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
