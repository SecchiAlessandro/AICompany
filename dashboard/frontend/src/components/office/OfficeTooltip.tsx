import * as Tooltip from "@radix-ui/react-tooltip";
import type { OfficeAgent } from "@/types";
import { STATUS_COLORS } from "./officeConstants";

interface OfficeTooltipProps {
  agent: OfficeAgent;
  children: React.ReactNode;
}

const statusLabels: Record<string, string> = {
  entering: "Arriving",
  idle: "Waiting",
  working: "Working",
  completed: "Completed",
  failed: "Failed",
};

export default function OfficeTooltip({
  agent,
  children,
}: OfficeTooltipProps) {
  const colors = STATUS_COLORS[agent.officeStatus];
  const achievedCount = agent.key_results.filter(
    (kr) => kr.status === "ACHIEVED"
  ).length;
  const totalKr = agent.key_results.length;
  const progress = totalKr > 0 ? (achievedCount / totalKr) * 100 : 0;

  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="top"
            sideOffset={8}
            className="z-50 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 shadow-xl max-w-[220px]"
          >
            <div className="space-y-1.5">
              {/* Name + status badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-100">
                  {agent.name}
                </span>
                <span
                  className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                  style={{
                    backgroundColor: colors.bg,
                    color: colors.text,
                    border: `1px solid ${colors.ring}`,
                  }}
                >
                  {statusLabels[agent.officeStatus]}
                </span>
              </div>

              {/* KR progress */}
              {totalKr > 0 && (
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[10px] text-zinc-400">
                    <span>Key Results</span>
                    <span>
                      {achievedCount}/{totalKr}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: colors.ring,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Outputs */}
              {agent.outputs.length > 0 && (
                <div className="space-y-0.5">
                  <span className="text-[10px] text-zinc-400">Outputs:</span>
                  <ul className="space-y-0.5">
                    {agent.outputs.slice(0, 3).map((o, i) => (
                      <li
                        key={i}
                        className="text-[10px] text-zinc-300 truncate"
                      >
                        {o}
                      </li>
                    ))}
                    {agent.outputs.length > 3 && (
                      <li className="text-[10px] text-zinc-500">
                        +{agent.outputs.length - 3} more
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
            <Tooltip.Arrow className="fill-zinc-700" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
