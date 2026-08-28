import { Link } from "react-router";
import { Ticket, BookOpen, MessageSquare } from "lucide-react";

/**
 * Renders text with inline references converted to clickable links.
 * Supports: #ticket:<id>, #article:<slug>, #post:<id>
 */
export function ReferenceRenderer({ text }: { text: string }) {
  const parts = text.split(
    /(#[a-z]+:[a-z0-9-]+)/gi,
  );

  return (
    <>
      {parts.map((part, i) => {
        // Match reference patterns
        const ticketMatch = part.match(/^#ticket:([a-z0-9]+)$/i);
        const articleMatch = part.match(/^#article:([a-z0-9-]+)$/i);
        const postMatch = part.match(/^#post:([a-z0-9]+)$/i);

        if (ticketMatch) {
          return (
            <Link
              key={i}
              to={`/dashboard/tickets/${ticketMatch[1]}`}
              className="inline-flex items-center gap-1 text-primary hover:underline font-mono text-xs bg-primary/10 px-1.5 py-0.5"
            >
              <Ticket className="size-3" />
              ticket:{ticketMatch[1]}
            </Link>
          );
        }

        if (articleMatch) {
          return (
            <Link
              key={i}
              to={`/dashboard/knowledge-base/${articleMatch[1]}`}
              className="inline-flex items-center gap-1 text-[var(--alpine-cyan)] hover:underline font-mono text-xs bg-[var(--alpine-cyan)]/10 px-1.5 py-0.5"
            >
              <BookOpen className="size-3" />
              article:{articleMatch[1]}
            </Link>
          );
        }

        if (postMatch) {
          return (
            <Link
              key={i}
              to="/dashboard/posts"
              className="inline-flex items-center gap-1 text-[var(--alpine-green)] hover:underline font-mono text-xs bg-[var(--alpine-green)]/10 px-1.5 py-0.5"
            >
              <MessageSquare className="size-3" />
              post:{postMatch[1]}
            </Link>
          );
        }

        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
