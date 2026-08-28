import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  Headphones,
  ArrowRight,
  Plus,
  List,
  LogOut,
  Settings,
} from "lucide-react";
import { Link, useNavigate } from "react-router";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="border-b-2 border-foreground">
        <div className="mx-auto max-w-5xl px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center bg-[var(--swiss-red)] text-white">
              <Headphones className="size-4" />
            </div>
            <span className="text-sm font-bold uppercase tracking-wider">
              Support
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-xs text-muted-foreground">
              {user?.name || user?.email || "User"}
            </span>
            <Link
              to="/dashboard/agent"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider font-bold"
            >
              Agent View
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="size-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-5xl px-8 py-16">
        <div className="mb-12">
          <span className="swiss-label text-[var(--swiss-blue)]">
            Welcome
          </span>
          <h1 className="swiss-heading text-4xl lg:text-6xl mt-3">
            Support
            <br />
            Dashboard
          </h1>
          <p className="mt-4 text-sm text-muted-foreground max-w-lg leading-relaxed">
            Manage your support requests, track ticket status, and communicate
            with our support team.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-2 border-foreground">
          {/* New Ticket Card */}
          <Link
            to="/dashboard/new-ticket"
            className="group p-8 border-b-2 md:border-b-0 md:border-r-2 border-foreground hover:bg-[var(--swiss-red)] hover:text-white transition-all"
          >
            <div className="mb-6 flex size-12 items-center justify-center border-2 border-current">
              <Plus className="size-5" />
            </div>
            <h2 className="swiss-heading text-2xl">New Ticket</h2>
            <p className="mt-2 text-sm opacity-70 leading-relaxed">
              Submit a new support request with detailed information about your
              issue.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider group-hover:text-white">
              Create Request
              <ArrowRight className="size-4" />
            </div>
          </Link>

          {/* My Tickets Card */}
          <Link
            to="/dashboard/my-tickets"
            className="group p-8 hover:bg-[var(--swiss-blue)] hover:text-white transition-all"
          >
            <div className="mb-6 flex size-12 items-center justify-center border-2 border-current">
              <List className="size-5" />
            </div>
            <h2 className="swiss-heading text-2xl">My Tickets</h2>
            <p className="mt-2 text-sm opacity-70 leading-relaxed">
              View all your existing tickets, check responses, and track
              progress.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider group-hover:text-white">
              View Tickets
              <ArrowRight className="size-4" />
            </div>
          </Link>
        </div>

        {/* Quick Info */}
        <div className="mt-0 border-2 border-t-0 border-foreground bg-muted p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <span className="swiss-label block mb-1 text-muted-foreground">
                Response Time
              </span>
              <span className="text-sm font-bold">Under 4 hours</span>
            </div>
            <div>
              <span className="swiss-label block mb-1 text-muted-foreground">
                Support Hours
              </span>
              <span className="text-sm font-bold">24/7 Availability</span>
            </div>
            <div>
              <span className="swiss-label block mb-1 text-muted-foreground">
                Status
              </span>
              <span className="text-sm font-bold text-green-700">
                All Systems Operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
