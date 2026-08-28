import { Link, useLocation } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  Ticket,
  BookOpen,
  Calendar,
  MessageSquare,
  Shield,
  LogOut,
  Mountain,
  ChevronRight,
  Search,
  Command,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/tickets", label: "Tickets", icon: Ticket },
  { to: "/dashboard/knowledge-base", label: "Knowledge Base", icon: BookOpen },
  { to: "/dashboard/schedule", label: "Schedule", icon: Calendar },
  { to: "/dashboard/posts", label: "Posts", icon: MessageSquare },
  { to: "/dashboard/admin", label: "Admin", icon: Shield },
];

interface AppSidebarProps {
  onSearchOpen: () => void;
}

export function AppSidebar({ onSearchOpen }: AppSidebarProps) {
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-border bg-[oklch(0.08_0_0)]">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-border px-5">
        <Mountain className="size-4 text-primary" />
        <span className="alpine-label text-foreground tracking-widest">
          Alpine
        </span>
      </div>

      {/* Search Trigger */}
      <div className="px-3 pt-3">
        <button
          onClick={onSearchOpen}
          className="flex w-full items-center gap-2.5 border border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
        >
          <Search className="size-3.5 shrink-0" />
          <span className="flex-1 text-left">Search...</span>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 border border-border px-1 py-0 text-[8px]">
            <Command className="size-2" />K
          </kbd>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        <div className="space-y-0.5 px-3">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.to === "/dashboard"
                ? location.pathname === "/dashboard"
                : location.pathname.startsWith(item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary border-l-2 border-primary ml-0"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5 ml-0 border-l-2 border-transparent"
                }`}
              >
                <item.icon className="size-4 shrink-0" />
                {item.label}
                {isActive && (
                  <ChevronRight className="ml-auto size-3 opacity-50" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center bg-primary/20 text-primary text-xs font-bold">
            {(user?.name ?? user?.email ?? "?")[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium truncate">
              {user?.name || "User"}
            </div>
            <div className="text-[10px] text-muted-foreground truncate">
              {user?.email || "No email"}
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            title="Sign out"
          >
            <LogOut className="size-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
