import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useExecutionStore } from "@/stores/executionStore";
import {
  Loader2,
  CircleDot,
  MessageCircleQuestion,
  CircleCheck,
  CircleX,
  Square,
  Clock,
  DollarSign,
  StopCircle,
} from "lucide-react";
import type { ExecutionStateType } from "@/types";

const STATE_CONFIG: Record<
  ExecutionStateType,
  { label: string; icon: React.ElementType; color: string; bg: string }
> = {
  starting: {
    label: "Starting",
    icon: Loader2,
    color: "text-sky-400",
    bg: "bg-sky-500/10",
  },
  running: {
    label: "Running",
    icon: CircleDot,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  awaiting_input: {
    label: "Awaiting Input",
    icon: MessageCircleQuestion,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  completed: {
    label: "Completed",
    icon: CircleCheck,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  failed: {
    label: "Failed",
    icon: CircleX,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
  },
  stopped: {
    label: "Stopped",
    icon: Square,
    color: "text-zinc-400",
    bg: "bg-zinc-500/10",
  },
};

export default function ExecutionControls() {
  const { execution, activeExecutionId } = useExecutionStore();
  const [elapsed, setElapsed] = useState(0);
  const [stopping, setStopping] = useState(false);

  const state = execution?.state ?? "starting";
  const isActive = state === "starting" || state === "running" || state === "awaiting_input";

  useEffect(() => {
    if (!isActive || !execution?.started_at) {
      return;
    }
    const start = new Date(execution.started_at).getTime();
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [isActive, execution?.started_at]);

  // Show elapsed from completed execution
  useEffect(() => {
    if (!isActive && execution?.duration_ms) {
      setElapsed(Math.floor(execution.duration_ms / 1000));
    }
  }, [isActive, execution?.duration_ms]);

  if (!execution) return null;

  const config = STATE_CONFIG[state];
  const Icon = config.icon;
  const isSpinning = state === "starting";

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`;

  async function handleStop() {
    if (!activeExecutionId) return;
    setStopping(true);
    try {
      await api.stopExecution(activeExecutionId);
    } catch (err) {
      console.error("Failed to stop execution:", err);
    } finally {
      setStopping(false);
    }
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
      <div className="flex items-center gap-4">
        {/* State badge */}
        <div className={`flex items-center gap-1.5 rounded-lg ${config.bg} px-3 py-1.5`}>
          <Icon className={`h-3.5 w-3.5 ${config.color} ${isSpinning ? "animate-spin" : ""}`} />
          <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
        </div>

        {/* Elapsed time */}
        <div className="flex items-center gap-1.5 text-sm text-zinc-400">
          <Clock className="h-3.5 w-3.5" />
          <span className="tabular-nums">{timeStr}</span>
        </div>

        {/* Cost */}
        {execution.cost_usd > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-zinc-400">
            <DollarSign className="h-3.5 w-3.5" />
            <span className="tabular-nums">{execution.cost_usd.toFixed(4)}</span>
          </div>
        )}

        {/* Error */}
        {execution.error && (
          <span className="text-xs text-rose-400 max-w-xs truncate">{execution.error}</span>
        )}
      </div>

      {/* Stop button */}
      {isActive && (
        <button
          onClick={handleStop}
          disabled={stopping}
          className="flex items-center gap-1.5 rounded-lg bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-500/20 transition-colors disabled:opacity-50"
        >
          <StopCircle className="h-3.5 w-3.5" />
          {stopping ? "Stopping..." : "Stop"}
        </button>
      )}
    </div>
  );
}
