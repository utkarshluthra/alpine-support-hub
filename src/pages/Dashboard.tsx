import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppLayout } from "@/components/AppLayout";
import { Link } from "react-router";
import {
  Ticket,
  BookOpen,
  Calendar,
  MessageSquare,
  ArrowRight,
  Clock,
  AlertTriangle,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const tickets = useQuery(api.tickets.myTickets);
  const stats = useQuery(api.tickets.ticketStats);

  return (
    <AppLayout>
      <div className="px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <span className="alpine-label text-primary">Dashboard</span>
          <h1 className="alpine-heading text-2xl lg:text-3xl mt-2">
            Welcome back{user?.name ? `, ${user.name}` : ""}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your internal support command center.
          </p>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border border-border mb-8">
            {[
              { label: "Open", value: stats.open, icon: Ticket },
              { label: "In Progress", value: stats.inProgress, icon: Clock },
              { label: "Resolved", value: stats.resolved, icon: AlertTriangle },
              { label: "Urgent", value: stats.urgent, icon: AlertTriangle },
            ].map((s, i) => (
              <div
                key={s.label}
                className={`p-5 ${i < 3 ? "border-r border-border" : ""} ${
                  i < 2 ? "border-b sm:border-b-0 border-border" : ""
                } ${i === 2 ? "border-b sm:border-b-0 border-border" : ""}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <s.icon className="size-3 text-muted-foreground" />
                  <span className="alpine-label">{s.label}</span>
                </div>
                <div className="alpine-heading text-2xl">{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <span className="alpine-label text-primary mb-4 block">
            Quick Actions
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-border">
            {[
              {
                to: "/dashboard/tickets/new",
                icon: Ticket,
                title: "New Ticket",
                desc: "Submit a support request",
              },
              {
                to: "/dashboard/knowledge-base",
                icon: BookOpen,
                title: "Knowledge Base",
                desc: "Browse documentation",
              },
              {
                to: "/dashboard/schedule",
                icon: Calendar,
                title: "Schedule Time",
                desc: "Book a support session",
              },
              {
                to: "/dashboard/posts",
                icon: MessageSquare,
                title: "Team Posts",
                desc: "View internal updates",
              },
            ].map((action, i) => (
              <Link
                key={action.to}
                to={action.to}
                className={`group p-5 hover:bg-primary/5 transition-colors ${
                  i < 3 ? "border-r border-border" : ""
                } ${i < 2 ? "border-b sm:border-b-0 border-border" : ""} ${
                  i === 2 ? "border-b sm:border-b-0 border-border" : ""
                }`}
              >
                <action.icon className="size-4 text-muted-foreground group-hover:text-primary transition-colors mb-3" />
                <div className="text-sm font-semibold group-hover:text-primary transition-colors">
                  {action.title}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {action.desc}
                </div>
                <ArrowRight className="size-3 mt-3 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Tickets */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="alpine-label text-primary">Recent Tickets</span>
            <Link
              to="/dashboard/tickets"
              className="alpine-label text-muted-foreground hover:text-foreground transition-colors"
            >
              View All
            </Link>
          </div>
          {tickets === undefined ? (
            <div className="border border-border py-10 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : tickets.length === 0 ? (
            <div className="border border-border py-10 text-center">
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
              {tickets.slice(0, 5).map((ticket, i) => (
                <Link
                  key={ticket._id}
                  to={`/dashboard/tickets/${ticket._id}`}
                  className={`flex items-center justify-between px-5 py-3.5 hover:bg-primary/5 transition-colors ${
                    i < tickets.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">
                      {ticket.title}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {ticket.category}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 ml-4">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${
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
                    <ArrowRight className="size-3 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
