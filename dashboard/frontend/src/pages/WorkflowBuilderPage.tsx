import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useWorkflowBuilderStore } from "@/stores/workflowBuilderStore";
import { generateWorkflowYaml } from "@/lib/yaml-generator";
import { BUILDER_ROUNDS } from "@/lib/constants";
import StepIndicator from "@/components/workflow-builder/StepIndicator";
import QuestionRound from "@/components/workflow-builder/QuestionRound";
import YamlPreview from "@/components/workflow-builder/YamlPreview";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";

const TOTAL_STEPS = BUILDER_ROUNDS.length + 1; // +1 for Review

export default function WorkflowBuilderPage() {
  const navigate = useNavigate();
  const { currentStep, setStep, answers, reset } = useWorkflowBuilderStore();
  const [finalYaml, setFinalYaml] = useState<string | null>(null);

  const saveMutation = useMutation({
    mutationFn: ({ filename, content }: { filename: string; content: string }) =>
      api.createWorkflow(filename, content),
    onSuccess: () => {
      reset();
      navigate("/workflows");
    },
  });

  const handleSave = () => {
    const yaml = finalYaml || generateWorkflowYaml(answers);
    const name =
      answers.q1
        ?.toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .trim()
        .split(/\s+/)
        .slice(0, 4)
        .join("-") || "new-workflow";

    saveMutation.mutate({ filename: `${name}.yaml`, content: yaml });
  };

  const isReviewStep = currentStep === TOTAL_STEPS - 1;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-100">New Workflow</h1>

      {/* Step indicator */}
      <StepIndicator currentStep={currentStep} onStepClick={setStep} />

      {/* Content area */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Form or Review editor */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          {isReviewStep ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-zinc-100">Review & Edit</h2>
              <p className="text-sm text-zinc-500">
                Review the generated YAML. You can edit it directly before saving.
              </p>
              <YamlPreview editable onYamlChange={setFinalYaml} />
            </div>
          ) : (
            <QuestionRound roundIndex={currentStep} />
          )}
        </div>

        {/* Right: Live YAML Preview */}
        {!isReviewStep && (
          <div>
            <YamlPreview />
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="flex items-center gap-1 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        {isReviewStep ? (
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saveMutation.isPending ? "Saving..." : "Save Workflow"}
          </button>
        ) : (
          <button
            onClick={() => setStep(Math.min(TOTAL_STEPS - 1, currentStep + 1))}
            className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-500/20"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
