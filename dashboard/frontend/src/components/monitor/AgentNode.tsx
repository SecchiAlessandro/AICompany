import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { AgentSection } from "@/types";
import StatusBadge from "@/components/common/StatusBadge";
import { cn } from "@/lib/utils";

type AgentNodeData = { agent: AgentSection };

export default function AgentNode({ data }: NodeProps) {
  const { agent } = data as unknown as AgentNodeData;
  const achievedCount = agent.key_results.filter(
    (kr) => kr.status === "ACHIEVED"
  ).length;
  const totalKRs = agent.key_results.length;

  const borderColor =
    agent.status === "COMPLETED"
      ? "border-emerald-500/50"
      : agent.status === "PENDING"
        ? "border-amber-500/50"
        : "border-rose-500/50";

  const glowClass =
    agent.status === "COMPLETED"
      ? "glow-emerald"
      : agent.status === "PENDING"
        ? "glow-amber"
        : "";

  return (
    <>
      <Handle type="target" position={Position.Left} className="!bg-zinc-600" />
      <div
        className={cn(
          "cursor-pointer rounded-lg border bg-zinc-900 px-4 py-3 transition-all hover:bg-zinc-800",
          borderColor,
          glowClass
        )}
        style={{ minWidth: 180 }}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-zinc-100">{agent.name}</span>
          <StatusBadge status={agent.status} size="sm" />
        </div>
        {totalKRs > 0 && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-[10px] text-zinc-500">
              <span>Key Results</span>
              <span>
                {achievedCount}/{totalKRs}
              </span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-zinc-800">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  achievedCount === totalKRs ? "bg-emerald-500" : "bg-amber-500"
                )}
                style={{ width: `${totalKRs > 0 ? (achievedCount / totalKRs) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-zinc-600" />
    </>
  );
}
