import type { ValidationCriterion as VC } from "@/types";
import { cn } from "@/lib/utils";
import { Check, Minus } from "lucide-react";

interface ValidationCriterionProps {
  criterion: VC;
}

export default function ValidationCriterion({ criterion }: ValidationCriterionProps) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <div
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
          criterion.checked
            ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
            : "border-zinc-700 bg-zinc-800 text-zinc-600"
        )}
      >
        {criterion.checked ? <Check className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
      </div>
      <span className={cn(criterion.checked ? "text-zinc-300" : "text-zinc-500")}>
        {criterion.text}
      </span>
    </div>
  );
}
