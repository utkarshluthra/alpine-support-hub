import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { Link } from "react-router";
import { Plus, ArrowRight, MessageSquare } from "lucide-react";

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-[var(--swiss-blue)] text-white" },
  in_progress: {
    label: "In Progress",
    className: "bg-[var(--swiss-black)] text-white",
  },
  resolved: {
    label: "Resolved",
    className: "bg-green-700 text-white",
  },
  closed: {
    label: "Closed",
    className: "bg-muted text-muted-foreground",
  },
};

const PRIORITY_STYLES: Record<string, string> = {
  urgent: "text-[var(--swiss-red)] font-bold",
  high: "text-[var(--swiss-red)]",
  medium: "text-muted-foreground",
  low: "text-muted-foreground",
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
  const { user } = useAuth();
  const tickets = useQuery(api.tickets.myTickets);

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b-2 border-foreground">
        <div className="mx-auto max-w-5xl px-8 py-10">
          <div className="flex items-start justify-between">
            <div>
              <span className="swiss-label text-[var(--swiss-blue)]">
                My Tickets
              </span>
              <h1 className="swiss-heading text-4xl lg:text-5xl mt-3">
                Your Support
                <br />
                Requests
              </h1>
            </div>
            <Link
              to="/dashboard/new-ticket"
              className="inline-flex items-center gap-2 bg-[var(--swiss-red)] px-6 py-3 text-sm font-bold uppercase tracking-wider text-white hover:bg-[var(--swiss-red)]/80 transition-colors shrink-0"
            >
              <Plus className="size-4" />
              New Ticket
            </Link>
          </div>
          {user && (
            <p className="mt-4 text-sm text-muted-foreground">
              Signed in as{" "}
              <span className="font-medium text-foreground">
                {user.name || user.email || "Anonymous"}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Ticket List */}
      <div className="mx-auto max-w-5xl px-8 py-8">
        {tickets === undefined ? (
          <div className="py-20 text-center text-muted-foreground">
            Loading tickets...
          </div>
        ) : tickets.length === 0 ? (
          <div className="border-2 border-dashed border-foreground/30 py-20 text-center">
            <div className="swiss-heading text-3xl text-muted-foreground/50">
              No tickets yet
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Submit your first support request to get started.
            </p>
            <Link
              to="/dashboard/new-ticket"
              className="mt-8 inline-flex items-center gap-2 bg-[var(--swiss-black)] px-6 py-3 text-sm font-bold uppercase tracking-wider text-white hover:opacity-80 transition-opacity"
            >
              <Plus className="size-4" />
              Create Ticket
            </Link>
          </div>
        ) : (
          <div className="border-2 border-foreground">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 border-b-2 border-foreground bg-muted px-6 py-3">
              <div className="col-span-5 swiss-label">Subject</div>
              <div className="col-span-2 swiss-label">Status</div>
              <div className="col-span-2 swiss-label">Priority</div>
              <div className="col-span-2 swiss-label">Last Update</div>
              <div className="col-span-1"></div>
            </div>

            {/* Ticket Rows */}
            {tickets.map((ticket) => {
              const status = STATUS_STYLES[ticket.status] ?? STATUS_STYLES.open;
              return (
                <Link
                  key={ticket._id}
                  to={`/dashboard/my-tickets/${ticket._id}`}
                  className="grid grid-cols-12 gap-4 border-b border-foreground/10 px-6 py-5 hover:bg-muted/50 transition-colors items-center group last:border-b-0"
                >
                  <div className="col-span-5 min-w-0">
                    <div className="font-bold text-sm truncate group-hover:text-[var(--swiss-blue)] transition-colors">
                      {ticket.title}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground truncate">
                      <span className="font-medium uppercase tracking-wider">
                        {ticket.category}
                      </span>
                      {ticket.lastMessage && (
                        <>
                          <span className="text-foreground/20">—</span>
                          <span className="truncate">
                            {ticket.lastMessage.slice(0, 60)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>
                  <div
                    className={`col-span-2 text-xs font-bold uppercase tracking-wider ${PRIORITY_STYLES[ticket.priority]}`}
                  >
                    {ticket.priority}
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
