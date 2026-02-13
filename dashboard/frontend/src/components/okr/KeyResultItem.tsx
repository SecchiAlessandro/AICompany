import type { KeyResult } from "@/types";
import StatusBadge from "@/components/common/StatusBadge";
import ValidationCriterion from "./ValidationCriterion";
import { cn } from "@/lib/utils";

interface KeyResultItemProps {
  keyResult: KeyResult;
}

export default function KeyResultItem({ keyResult }: KeyResultItemProps) {
  const borderColor =
    keyResult.status === "ACHIEVED"
      ? "border-l-emerald-500"
      : keyResult.status === "NOT ACHIEVED"
        ? "border-l-rose-500"
        : "border-l-zinc-600";

  return (
    <div
      className={cn(
        "rounded-lg border border-zinc-800 border-l-4 bg-zinc-900/80 p-3",
        borderColor
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-400">
            {keyResult.number}
          </span>
          <p className="text-sm text-zinc-200">{keyResult.description}</p>
        </div>
        <StatusBadge status={keyResult.status} size="sm" />
      </div>

      {keyResult.validation.length > 0 && (
        <div className="mt-2 space-y-1 pl-7">
          {keyResult.validation.map((v, i) => (
            <ValidationCriterion key={i} criterion={v} />
          ))}
        </div>
      )}
    </div>
  );
}
