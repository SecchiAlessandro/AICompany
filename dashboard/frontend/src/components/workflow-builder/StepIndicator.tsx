import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { BUILDER_ROUNDS } from "@/lib/constants";

interface StepIndicatorProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

const steps = [...BUILDER_ROUNDS.map((r) => r.title), "Review"];

export default function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center">
          <button
            onClick={() => onStepClick(i)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              i === currentStep
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                : i < currentStep
                  ? "bg-zinc-800 text-zinc-300"
                  : "bg-zinc-900 text-zinc-600"
            )}
          >
            {i < currentStep ? (
              <Check className="h-3 w-3 text-emerald-400" />
            ) : (
              <span
                className={cn(
                  "flex h-4 w-4 items-center justify-center rounded-full text-[10px]",
                  i === currentStep
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-zinc-800 text-zinc-500"
                )}
              >
                {i + 1}
              </span>
            )}
            {step}
          </button>
          {i < steps.length - 1 && (
            <div className={cn("mx-1 h-px w-6", i < currentStep ? "bg-emerald-500/30" : "bg-zinc-800")} />
          )}
        </div>
      ))}
    </div>
  );
}
