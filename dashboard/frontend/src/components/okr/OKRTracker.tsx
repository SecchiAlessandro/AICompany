import type { AgentSection } from "@/types";
import KeyResultItem from "./KeyResultItem";
import StatusBadge from "@/components/common/StatusBadge";
import { Target, CheckCircle2 } from "lucide-react";

interface OKRTrackerProps {
  agent: AgentSection;
}

export default function OKRTracker({ agent }: OKRTrackerProps) {
  const allAchieved = agent.key_results.every((kr) => kr.status === "ACHIEVED");
  const wouldPassHook = agent.status === "COMPLETED" && allAchieved;

  return (
    <div className="space-y-6">
      {/* Stop hook indicator */}
      <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
        <CheckCircle2
          className={`h-5 w-5 ${wouldPassHook ? "text-emerald-400" : "text-rose-400"}`}
        />
        <div>
          <p className="text-sm font-medium text-zinc-200">
            Stop Hook: {wouldPassHook ? "Would Pass" : "Would Block"}
          </p>
          <p className="text-xs text-zinc-500">
            {wouldPassHook
              ? "All key results achieved — agent can stop"
              : "Agent must achieve all key results before stopping"}
          </p>
        </div>
      </div>

      {/* Objectives */}
      {agent.objectives.length > 0 && (
        <div className="space-y-2">
          <h3 className="flex items-center gap-2 text-sm font-medium text-zinc-300">
            <Target className="h-4 w-4 text-sky-400" />
            Objectives
          </h3>
          <ul className="space-y-1 pl-6">
            {agent.objectives.map((obj, i) => (
              <li key={i} className="text-sm text-zinc-400 list-disc">
                {obj}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Key Results */}
      <div className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-medium text-zinc-300">
          <Target className="h-4 w-4 text-amber-400" />
          Key Results
          <StatusBadge status={agent.status} size="sm" />
        </h3>
        <div className="space-y-3">
          {agent.key_results.map((kr) => (
            <KeyResultItem key={kr.number} keyResult={kr} />
          ))}
          {agent.key_results.length === 0 && (
            <p className="text-sm text-zinc-500">No key results defined</p>
          )}
        </div>
      </div>
    </div>
  );
}
