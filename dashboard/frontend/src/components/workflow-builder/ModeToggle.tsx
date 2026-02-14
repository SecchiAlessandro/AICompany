import { Sparkles, List } from "lucide-react";

interface ModeToggleProps {
  mode: "ai" | "manual";
  onModeChange: (mode: "ai" | "manual") => void;
}

export default function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-zinc-800 bg-zinc-900/50 p-1">
      <button
        onClick={() => onModeChange("ai")}
        className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
          mode === "ai"
            ? "bg-emerald-500/15 text-emerald-400"
            : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        <Sparkles className="h-4 w-4" />
        AI Assistant
      </button>
      <button
        onClick={() => onModeChange("manual")}
        className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
          mode === "manual"
            ? "bg-emerald-500/15 text-emerald-400"
            : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        <List className="h-4 w-4" />
        Manual
      </button>
    </div>
  );
}
