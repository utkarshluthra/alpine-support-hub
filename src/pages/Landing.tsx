import { motion } from "framer-motion";
import {
  ArrowRight,
  Mountain,
  BookOpen,
  Ticket,
  Calendar,
  MessageSquare,
  Shield,
  Terminal,
  Zap,
  Users,
} from "lucide-react";
import { Link } from "react-router";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
          <div className="flex items-center gap-2.5">
            <Mountain className="size-5 text-primary" />
            <span className="alpine-label text-foreground text-xs tracking-widest">
              Alpine Support Hub
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              to="/dashboard"
              className="alpine-label text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/auth"
              className="alpine-label text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/auth"
              className="bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/80 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-8 py-20 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6 flex items-center gap-2">
              <Terminal className="size-4 text-primary" />
              <span className="alpine-label text-primary">v1.0</span>
            </div>
            <h1 className="alpine-heading text-4xl sm:text-6xl lg:text-7xl max-w-3xl">
              Internal Support
              <br />
              <span className="text-primary">Infrastructure</span>
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
              A unified support platform for your team. Ticket management,
              knowledge base, scheduling, and internal communication — all in one
              place.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 bg-primary px-6 py-3 text-xs font-semibold text-primary-foreground hover:bg-primary/80 transition-colors"
              >
                Sign In
                <ArrowRight className="size-3.5" />
              </Link>
              <Link
                to="/dashboard/knowledge-base"
                className="inline-flex items-center gap-2 border border-border px-6 py-3 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
              >
                Browse Knowledge Base
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modules */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-8 py-16">
          <div className="mb-10">
            <span className="alpine-label text-primary">Modules</span>
            <h2 className="alpine-heading text-2xl lg:text-3xl mt-3">
              What's Inside
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border border-border">
            {[
              {
                icon: Ticket,
                title: "Ticket System",
                desc: "Submit, triage, and resolve support requests with full conversation threads and priority management.",
              },
              {
                icon: BookOpen,
                title: "Knowledge Base",
                desc: "Browse searchable documentation, guides, and internal articles to find answers fast.",
              },
              {
                icon: Calendar,
                title: "Scheduling",
                desc: "Book time slots for support sessions, consultations, or team sync-ups.",
              },
              {
                icon: MessageSquare,
                title: "Internal Posts",
                desc: "Share updates, tips, and announcements with the team in a threaded feed.",
              },
              {
                icon: Shield,
                title: "Admin Console",
                desc: "Manage users, articles, bookings, and system settings from a centralized admin area.",
              },
              {
                icon: Users,
                title: "Team Roles",
                desc: "Role-based access control separates customer, agent, and admin capabilities.",
              },
            ].map((mod, i) => (
              <motion.div
                key={mod.title}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="border-border p-6 border-b md:border-r last:border-r-0 last:border-b-0 lg:[&:nth-last-child(-n+3)]:border-b-0 md:[&:nth-last-child(-n+2)]:border-b-0 lg:[&:nth-child(3n)]:border-r-0 md:[&:nth-child(2n)]:border-r-0"
              >
                <div className="mb-4 flex size-9 items-center justify-center border border-border text-muted-foreground">
                  <mod.icon className="size-4" />
                </div>
                <h3 className="text-sm font-semibold">{mod.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {mod.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-8 py-16">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div>
              <span className="alpine-label text-primary">Built With</span>
              <h2 className="alpine-heading text-2xl lg:text-3xl mt-3">
                Technical Foundation
              </h2>
              <p className="mt-3 text-sm text-muted-foreground max-w-md">
                Real-time backend, type-safe queries, reactive UI. Built on
                Convex with React, TypeScript, and Tailwind.
              </p>
            </div>
            <div className="flex items-center gap-6">
              {["Convex", "React", "TypeScript", "Tailwind", "Vite"].map(
                (tech) => (
                  <div
                    key={tech}
                    className="border border-border px-4 py-2 text-xs font-semibold text-muted-foreground"
                  >
                    {tech}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary">
        <div className="mx-auto max-w-6xl px-8 py-16 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="alpine-heading text-2xl lg:text-4xl text-primary-foreground">
              Start Supporting
            </h2>
            <p className="mt-3 text-sm text-primary-foreground/70">
              Sign in to access the full platform.
            </p>
            <Link
              to="/auth"
              className="mt-6 inline-flex items-center gap-2 bg-background px-6 py-3 text-xs font-semibold text-foreground hover:bg-background/90 transition-colors"
            >
              Sign In
              <ArrowRight className="size-3.5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-6">
          <div className="flex items-center gap-2">
            <Mountain className="size-3.5 text-muted-foreground" />
            <span className="alpine-label text-muted-foreground">
              Alpine Support Hub
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground">
            Internal Use Only
          </span>
        </div>
      </footer>
    </div>
  );
}
