import { useState, useRef, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Link } from "react-router";
import { Hash, Ticket, BookOpen, MessageSquare, CornerDownLeft } from "lucide-react";

const TYPE_ICONS: Record<string, typeof Ticket> = {
  ticket: Ticket,
  article: BookOpen,
  post: MessageSquare,
};

const TYPE_COLORS: Record<string, string> = {
  ticket: "text-primary",
  article: "text-[var(--alpine-cyan)]",
  post: "text-[var(--alpine-green)]",
};

interface ReferenceInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export function ReferenceInput({
  value,
  onChange,
  placeholder,
  rows = 4,
  className = "",
}: ReferenceInputProps) {
  const [showRefPicker, setShowRefPicker] = useState(false);
  const [refType, setRefType] = useState<"ticket" | "article" | "post">(
    "ticket",
  );
  const [refQuery, setRefQuery] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Search for references based on type
  const searchResults = useQuery(
    api.search.globalSearch,
    refQuery.length >= 1
      ? {
          q: refQuery,
          type:
            refType === "ticket"
              ? "tickets"
              : refType === "article"
                ? "articles"
                : "posts",
        }
      : "skip",
  );

  const refItems =
    refType === "ticket"
      ? searchResults?.tickets ?? []
      : refType === "article"
        ? searchResults?.articles ?? []
        : searchResults?.posts ?? [];

  const insertReference = useCallback(
    (item: { _id: string; title: string; slug?: string }) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const refCode =
        refType === "article"
          ? `#article:${item.slug ?? item._id.slice(-8)}`
          : `#ticket:${item._id.slice(-8)}`;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue =
        value.substring(0, start) + refCode + value.substring(end);
      onChange(newValue);
      setShowRefPicker(false);
      setRefQuery("");

      // Focus and position cursor
      setTimeout(() => {
        textarea.focus();
        const pos = start + refCode.length;
        textarea.setSelectionRange(pos, pos);
      }, 0);
    },
    [value, onChange, refType],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Ctrl/Cmd + K to toggle reference picker
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowRefPicker(!showRefPicker);
        if (!showRefPicker) {
          setRefQuery("");
        }
      }
    },
    [showRefPicker],
  );

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        className={`w-full border border-border bg-input px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none transition-shadow ${className}`}
      />

      {/* Reference toggle button */}
      <button
        type="button"
        onClick={() => {
          setShowRefPicker(!showRefPicker);
          if (!showRefPicker) setRefQuery("");
        }}
        className="absolute bottom-2 right-2 flex items-center gap-1 border border-border px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
      >
        <Hash className="size-2.5" />
        Reference
        <kbd className="ml-1 border border-border px-1 py-0 font-mono">
          ^K
        </kbd>
      </button>

      {/* Reference Picker Dropdown */}
      {showRefPicker && (
        <div className="absolute bottom-full left-0 right-0 mb-1 border border-border bg-[oklch(0.11_0_0)] shadow-xl z-10">
          {/* Type tabs */}
          <div className="flex items-center gap-1 border-b border-border px-3 py-2">
            {(
              [
                { key: "ticket" as const, label: "Ticket", icon: Ticket },
                { key: "article" as const, label: "Article", icon: BookOpen },
                { key: "post" as const, label: "Post", icon: MessageSquare },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => {
                  setRefType(t.key);
                  setRefQuery("");
                }}
                className={`flex items-center gap-1 px-2 py-1 text-[9px] font-semibold uppercase tracking-wider transition-colors ${
                  refType === t.key
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <t.icon className="size-2.5" />
                {t.label}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="px-3 py-2 border-b border-border">
            <input
              type="text"
              value={refQuery}
              onChange={(e) => setRefQuery(e.target.value)}
              placeholder={`Search ${refType}s to reference...`}
              className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
              autoFocus
            />
          </div>

          {/* Results */}
          <div className="max-h-48 overflow-y-auto">
            {refItems.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                {refQuery
                  ? `No ${refType}s match "${refQuery}"`
                  : `Type to search ${refType}s`}
              </div>
            ) : (
              refItems.map((item) => {
                const Icon = TYPE_ICONS[refType] ?? Ticket;
                const colorClass = TYPE_COLORS[refType] ?? "text-muted-foreground";
                return (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => insertReference(item)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-primary/5 transition-colors"
                  >
                    <Icon className={`size-3 shrink-0 ${colorClass}`} />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium truncate">
                        {item.title}
                      </div>
                      <div className="text-[9px] text-muted-foreground">
                        {item.subtitle}
                      </div>
                    </div>
                    <CornerDownLeft className="size-2.5 text-muted-foreground opacity-0 group-hover:opacity-100" />
                  </button>
                );
              })
            )}
          </div>

          {/* Footer hint */}
          <div className="border-t border-border px-3 py-1.5 text-[9px] text-muted-foreground">
            Select to insert reference code. Will appear as{" "}
            <span className="font-mono text-primary">#{refType}:...</span>
          </div>
        </div>
      )}
    </div>
  );
}
