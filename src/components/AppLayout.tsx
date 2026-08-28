import { useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { GlobalSearch } from "./GlobalSearch";

export function AppLayout({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);

  const toggleSearch = useCallback(() => {
    setSearchOpen((prev) => !prev);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
  }, []);

  // Global Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggleSearch();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [toggleSearch]);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar onSearchOpen={toggleSearch} />
      <main className="ml-60 min-h-screen">{children}</main>
      <GlobalSearch open={searchOpen} onClose={closeSearch} />
    </div>
  );
}
