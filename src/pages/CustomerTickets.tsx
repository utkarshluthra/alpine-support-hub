import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Link } from "react-router";
import { AppLayout } from "@/components/AppLayout";
import { Plus, ArrowRight } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  open: "text-primary",
  in_progress: "text-[var(--alpine-cyan)]",
  resolved: "text-[var(--alpine-green)]",
  closed: "text-muted-foreground",
};

function formatTime(ts?: number) {
  if (!ts) return "";
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

export default function CustomerTickets() {
  const tickets = useQuery(api.tickets.myTickets);

  return (
    <AppLayout>
      <div className="px-8 py-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <span className="alpine-label text-primary">Tickets</span>
            <h1 className="alpine-heading text-2xl mt-2">
              Your Support Requests
            </h1>
          </div>
          <Link
            to="/dashboard/tickets/new"
            className="inline-flex items-center gap-2 bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/80 transition-colors"
          >
            <Plus className="size-3.5" />
            New Ticket
          </Link>
        </div>

        {tickets === undefined ? (
          <div className="border border-border py-16 text-center text-sm text-muted-foreground">
            Loading tickets...
          </div>
        ) : tickets.length === 0 ? (
          <div className="border border-border py-16 text-center">
            <p className="text-sm text-muted-foreground">
              No tickets yet.{" "}
              <Link
                to="/dashboard/tickets/new"
                className="text-primary hover:underline"
              >
                Create your first one
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="border border-border">
            <div className="grid grid-cols-12 gap-4 border-b border-border bg-muted/50 px-5 py-2.5">
              <div className="col-span-5 alpine-label">Subject</div>
              <div className="col-span-2 alpine-label">Status</div>
              <div className="col-span-2 alpine-label">Priority</div>
              <div className="col-span-2 alpine-label">Updated</div>
              <div className="col-span-1"></div>
            </div>
            {tickets.map((ticket, i) => (
              <Link
                key={ticket._id}
                to={`/dashboard/tickets/${ticket._id}`}
                className={`grid grid-cols-12 gap-4 px-5 py-4 hover:bg-primary/5 transition-colors items-center group ${
                  i < tickets.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="col-span-5 min-w-0">
                  <div className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                    {ticket.title}
                  </div>
                  <div className="mt-0.5 text-[10px] text-muted-foreground alpine-label">
                    {ticket.category}
                  </div>
                </div>
                <div className="col-span-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[ticket.status]}`}
                  >
                    {ticket.status.replace("_", " ")}
                  </span>
                </div>
                <div
                  className={`col-span-2 text-[10px] font-bold uppercase tracking-wider ${
                    ticket.priority === "urgent" || ticket.priority === "high"
                      ? "text-[var(--alpine-red)]"
                      : "text-muted-foreground"
                  }`}
                >
                  {ticket.priority}
                </div>
                <div className="col-span-2 text-xs text-muted-foreground">
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
