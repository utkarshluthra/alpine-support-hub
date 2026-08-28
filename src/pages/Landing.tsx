import { motion } from "framer-motion";
import {
  ArrowRight,
  Headphones,
  Zap,
  Shield,
  Clock,
  MessageSquare,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b-2 border-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center bg-[var(--swiss-red)] text-white">
              <Headphones className="size-5" />
            </div>
            <span className="text-lg font-bold tracking-tight uppercase">
              Support
            </span>
          </div>
          <div className="flex items-center gap-8">
            <Link
              to="/dashboard"
              className="swiss-label hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/auth"
              className="swiss-label hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/auth"
              className="bg-[var(--swiss-black)] px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-white hover:bg-[var(--swiss-black)]/80 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="border-b-2 border-foreground">
        <div className="mx-auto max-w-7xl px-8 py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-8">
              <span className="swiss-label text-[var(--swiss-red)]">
                Swiss Precision Support
              </span>
            </div>
            <h1 className="swiss-heading text-5xl sm:text-7xl lg:text-8xl xl:text-9xl max-w-5xl">
              Every Ticket.
              <br />
              <span className="text-[var(--swiss-blue)]">
                Resolved.
              </span>
            </h1>
            <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                to="/auth"
                className="inline-flex items-center gap-3 bg-[var(--swiss-red)] px-8 py-4 text-sm font-bold uppercase tracking-wider text-white hover:bg-[var(--swiss-red)]/80 transition-colors"
              >
                Start Supporting
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/auth?returnTo=/dashboard/agent"
                className="inline-flex items-center gap-3 border-2 border-foreground px-8 py-4 text-sm font-bold uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors"
              >
                Agent Login
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-b-2 border-foreground bg-[var(--swiss-black)] text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x-2 divide-white/20">
          {[
            { value: "< 4h", label: "Average Response Time" },
            { value: "98%", label: "Customer Satisfaction" },
            { value: "24/7", label: "Support Coverage" },
          ].map((stat) => (
            <div key={stat.label} className="px-8 py-8 sm:py-12">
              <div className="swiss-heading text-4xl lg:text-5xl text-[var(--swiss-red)]">
                {stat.value}
              </div>
              <div className="mt-2 swiss-label text-white/70">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-b-2 border-foreground">
        <div className="mx-auto max-w-7xl px-8 py-24">
          <div className="mb-16">
            <span className="swiss-label text-[var(--swiss-blue)]">
              Capabilities
            </span>
            <h2 className="swiss-heading text-4xl lg:text-6xl mt-4">
              Built for
              <br />
              Clarity.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-2 border-foreground">
            {[
              {
                icon: Zap,
                title: "Instant Triage",
                desc: "Automatic priority classification ensures the most critical issues are handled first.",
              },
              {
                icon: MessageSquare,
                title: "Threaded Conversations",
                desc: "Keep all context in one place with full conversation history per ticket.",
              },
              {
                icon: Shield,
                title: "Role-Based Access",
                desc: "Separate customer and agent views with clear permission boundaries.",
              },
              {
                icon: Clock,
                title: "Status Tracking",
                desc: "Track tickets from open through in-progress to resolved with clear status indicators.",
              },
              {
                icon: BarChart3,
                title: "Dashboard Analytics",
                desc: "Real-time stats on ticket volume, response times, and resolution rates.",
              },
              {
                icon: Headphones,
                title: "Agent Assignment",
                desc: "Assign tickets to specific agents and track ownership across the pipeline.",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className={`p-8 border-foreground ${
                  i < 3 ? "border-b-2" : ""
                } ${i % 3 !== 2 ? "lg:border-r-2" : ""} ${
                  i % 2 !== 1 ? "md:border-r-2 lg:border-r-2" : ""
                } ${i % 2 !== 1 && i >= 4 ? "md:border-r-0 lg:border-r-0" : ""}`}
              >
                <div className="mb-4 flex size-10 items-center justify-center border-2 border-foreground">
                  <feature.icon className="size-5" />
                </div>
                <h3 className="text-lg font-bold uppercase tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-b-2 border-foreground bg-[var(--swiss-red)] text-white">
        <div className="mx-auto max-w-7xl px-8 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="swiss-heading text-4xl lg:text-6xl">
              Ready to Support
              <br />
              with Precision?
            </h2>
            <p className="mt-6 text-lg text-white/80 max-w-xl mx-auto">
              Start resolving tickets with the clarity and efficiency of Swiss
              engineering.
            </p>
            <Link
              to="/auth"
              className="mt-10 inline-flex items-center gap-3 bg-white px-8 py-4 text-sm font-bold uppercase tracking-wider text-[var(--swiss-black)] hover:bg-white/90 transition-colors"
            >
              Create Account
              <ArrowRight className="size-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--swiss-black)] text-white">
        <div className="mx-auto max-w-7xl px-8 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center bg-[var(--swiss-red)]">
                <Headphones className="size-4" />
              </div>
              <span className="text-sm font-bold uppercase tracking-wider">
                Support
              </span>
            </div>
            <div className="swiss-label text-white/50">
              Swiss Precision Support System
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
