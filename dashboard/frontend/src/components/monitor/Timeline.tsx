import type { AgentSection } from "@/types";
import { cn } from "@/lib/utils";

interface TimelineProps {
  agents: AgentSection[];
}

export default function Timeline({ agents }: TimelineProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-zinc-400">Agent Timeline</h3>
      <div className="space-y-2">
        {agents.map((agent) => {
          const progress =
            agent.status === "COMPLETED"
              ? 100
              : agent.status === "PENDING"
                ? agent.key_results.some((kr) => kr.status === "ACHIEVED")
                  ? 50
                  : 10
                : 0;

          return (
            <div key={agent.name} className="flex items-center gap-3">
              <span className="w-28 truncate text-xs font-medium text-zinc-300">
                {agent.name}
              </span>
              <div className="flex-1">
                <div className="h-6 rounded-md bg-zinc-800">
                  <div
                    className={cn(
                      "flex h-full items-center rounded-md px-2 text-[10px] font-medium text-white transition-all duration-700",
                      agent.status === "COMPLETED"
                        ? "bg-emerald-600"
                        : agent.status === "NOT COMPLETED"
                          ? "bg-rose-600"
                          : "bg-amber-600"
                    )}
                    style={{ width: `${Math.max(progress, 5)}%` }}
                  >
                    {agent.status}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
