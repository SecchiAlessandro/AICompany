import { useEffect, useMemo, useRef } from "react";
import type { CLIEvent } from "@/types";
import { Terminal, Loader2 } from "lucide-react";

/** Event types that produce visible output */
const VISIBLE_TYPES = new Set(["text", "tool_use", "tool_result", "result", "stderr", "raw_text"]);

function hasVisibleContent(event: CLIEvent): boolean {
  if (!VISIBLE_TYPES.has(event.event_type)) return false;
  if (event.event_type === "text") {
    const text = event.content.text || "";
    const tools = event.content.tools;
    return !!(text || (tools && tools.length > 0));
  }
  if (event.event_type === "tool_use") return !!(event.content.tools && event.content.tools.length > 0);
  return !!(event.content.text);
}

interface CLITerminalProps {
  events: CLIEvent[];
}

export default function CLITerminal({ events }: CLITerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef(true);

  const hasVisible = useMemo(() => events.some(hasVisibleContent), [events]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !autoScrollRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [events.length]);

  function handleScroll() {
    const el = containerRef.current;
    if (!el) return;
    const threshold = 80;
    autoScrollRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  }

  // No events yet or events exist but none are visible → show processing state
  if (events.length === 0 || !hasVisible) {
    return (
      <div className="flex h-full items-center justify-center bg-zinc-950">
        <div className="text-center text-zinc-500">
          {events.length === 0 ? (
            <>
              <Terminal className="mx-auto h-6 w-6 mb-2" />
              <p className="text-sm">Waiting for CLI output...</p>
            </>
          ) : (
            <>
              <Loader2 className="mx-auto h-6 w-6 mb-2 animate-spin" />
              <p className="text-sm">Processing... ({events.length} events)</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="h-full overflow-y-auto bg-zinc-950 p-3 font-mono text-xs leading-relaxed"
    >
      {events.map((event, i) => (
        <EventLine key={i} event={event} />
      ))}
    </div>
  );
}

function EventLine({ event }: { event: CLIEvent }) {
  const { event_type, content } = event;

  // Filter out noise and empty events
  if (event_type === "stream_event" || event_type === "unknown") return null;

  if (event_type === "text") {
    const text = content.text || "";
    const tools = content.tools;
    if (!text && (!tools || tools.length === 0)) return null;
    return (
      <div className="mb-1">
        {text && <span className="text-zinc-200 whitespace-pre-wrap">{text}</span>}
        {tools?.map((t, j) => (
          <span
            key={j}
            className="ml-1 inline-flex items-center gap-1 rounded bg-sky-500/10 px-1.5 py-0.5 text-sky-400"
          >
            <span className="font-semibold">{t.name}</span>
            <span className="text-sky-400/60 max-w-[200px] truncate">{typeof t.input === "string" ? t.input : JSON.stringify(t.input)}</span>
          </span>
        ))}
      </div>
    );
  }

  if (event_type === "tool_use") {
    if (!content.tools || content.tools.length === 0) return null;
    return (
      <div className="mb-1 flex flex-wrap gap-1">
        {content.tools.map((t, j) => (
          <span
            key={j}
            className="inline-flex items-center gap-1 rounded bg-sky-500/10 px-1.5 py-0.5 text-sky-400"
          >
            <span className="font-semibold">{t.name}</span>
            <span className="text-sky-400/60 max-w-[200px] truncate">{typeof t.input === "string" ? t.input : JSON.stringify(t.input)}</span>
          </span>
        ))}
      </div>
    );
  }

  if (event_type === "tool_result") {
    const text = content.text || "";
    if (!text) return null;
    return (
      <div className="mb-1 text-zinc-400 max-h-20 overflow-hidden">
        <span className="text-zinc-500 mr-1">{">"}</span>
        {text}
      </div>
    );
  }

  if (event_type === "result") {
    return (
      <div className="mb-1 mt-2 rounded bg-emerald-500/10 px-2 py-1 text-emerald-400">
        {content.text && <span className="whitespace-pre-wrap">{content.text}</span>}
        <span className="ml-2 text-emerald-400/60">
          {content.cost_usd != null && `$${content.cost_usd.toFixed(4)}`}
          {content.duration_ms != null && ` · ${(content.duration_ms / 1000).toFixed(1)}s`}
        </span>
      </div>
    );
  }

  if (event_type === "stderr") {
    const text = content.text || "";
    if (!text) return null;
    return (
      <div className="mb-1 text-rose-400/80">
        <span className="text-rose-500 mr-1">!</span>
        {text}
      </div>
    );
  }

  if (event_type === "system_summary") {
    const text = content.text || "";
    if (!text) return null;
    return (
      <div className="mb-1 text-zinc-400 italic">
        {text}
      </div>
    );
  }

  if (event_type === "raw_text") {
    const text = content.text || "";
    if (!text) return null;
    return (
      <div className="mb-1 text-zinc-400">
        {text}
      </div>
    );
  }

  // User events (tool context, skill loading) — show abbreviated
  if (event_type === "user") {
    return null; // Internal context events, not useful for display
  }

  // Fallback for unrecognized types
  const text = content.text || "";
  if (!text) return null;
  return (
    <div className="mb-1 text-zinc-400">
      <span className="text-zinc-500">[{event_type}]</span> {text}
    </div>
  );
}
