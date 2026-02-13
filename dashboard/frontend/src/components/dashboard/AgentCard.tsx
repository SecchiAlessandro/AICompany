import { useNavigate } from "react-router-dom";
import type { AgentSection } from "@/types";
import StatusBadge from "@/components/common/StatusBadge";
import ProgressRing from "@/components/common/ProgressRing";
import { cn } from "@/lib/utils";

interface AgentCardProps {
  agent: AgentSection;
}

export default function AgentCard({ agent }: AgentCardProps) {
  const navigate = useNavigate();
  const totalKRs = agent.key_results.length;
  const achievedKRs = agent.key_results.filter((kr) => kr.status === "ACHIEVED").length;
  const progress = totalKRs > 0 ? Math.round((achievedKRs / totalKRs) * 100) : 0;

  const borderColor =
    agent.status === "COMPLETED"
      ? "border-l-emerald-500"
      : agent.status === "PENDING"
        ? "border-l-amber-500"
        : "border-l-rose-500";

  const glowClass =
    agent.status === "COMPLETED"
      ? "glow-emerald"
      : agent.status === "PENDING"
        ? "glow-amber"
        : "";

  return (
    <button
      onClick={() => navigate(`/monitor/agents/${agent.name}`)}
      className={cn(
        "group w-full rounded-xl border border-zinc-800 border-l-4 bg-zinc-900/50 p-4 text-left transition-all hover:bg-zinc-800/50",
        borderColor,
        agent.status !== "NOT COMPLETED" && glowClass
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="font-semibold text-zinc-100 group-hover:text-white">
            {agent.name}
          </h3>
          <StatusBadge status={agent.status} />
        </div>
        <ProgressRing value={progress} size={44} />
      </div>

      {/* Key results summary */}
      <div className="mt-3 space-y-1">
        {agent.key_results.slice(0, 3).map((kr) => (
          <div key={kr.number} className="flex items-center gap-2 text-xs">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                kr.status === "ACHIEVED"
                  ? "bg-emerald-400"
                  : kr.status === "NOT ACHIEVED"
                    ? "bg-rose-400"
                    : "bg-zinc-500"
              )}
            />
            <span className="truncate text-zinc-400">{kr.description}</span>
          </div>
        ))}
        {agent.key_results.length > 3 && (
          <p className="text-[10px] text-zinc-600">
            +{agent.key_results.length - 3} more
          </p>
        )}
      </div>
    </button>
  );
}
