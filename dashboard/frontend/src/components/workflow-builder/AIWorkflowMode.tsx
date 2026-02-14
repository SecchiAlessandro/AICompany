import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAIWorkflowStore } from "@/stores/aiWorkflowStore";
import { api } from "@/lib/api";
import AIQuestionPanel from "@/components/workflow-builder/AIQuestionPanel";
import CLITerminal from "@/components/execution/CLITerminal";
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Square,
  RotateCcw,
  ExternalLink,
} from "lucide-react";

export default function AIWorkflowMode() {
  const navigate = useNavigate();
  const store = useAIWorkflowStore();
  const {
    phase,
    sessionId,
    events,
    createdWorkflowFile,
    error,
    terminalExpanded,
    setPhase,
    setSession,
    setError,
    toggleTerminal,
    reset,
  } = store;

  const [goal, setGoal] = useState("");

  const isSessionActive =
    phase !== "idle" && phase !== "completed" && phase !== "failed";

  async function handleStart() {
    if (!goal.trim()) return;
    setPhase("submitting_goal");
    try {
      const execution = await api.startWorkflowSession(goal.trim());
      setSession(execution.id, execution);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start session");
    }
  }

  async function handleStop() {
    if (!sessionId) return;
    try {
      await api.stopWorkflowSession(sessionId);
      setPhase("failed");
      setError("Session stopped by user");
    } catch {
      // ignore stop errors
    }
  }

  return (
    <div className="space-y-6">
      {/* Phase: idle */}
      {phase === "idle" && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-zinc-100">
              AI Workflow Assistant
            </h2>
          </div>
          <p className="text-sm text-zinc-500">
            Describe your goal and the AI assistant will guide you through
            creating a structured workflow with questions and refinements.
          </p>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Describe your workflow goal... (e.g., 'Create a recruitment pipeline for hiring senior engineers')"
            rows={4}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 resize-none"
          />
          <button
            onClick={handleStart}
            disabled={!goal.trim()}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Start AI Assistant
          </button>
        </div>
      )}

      {/* Phase: submitting_goal / waiting_for_questions */}
      {(phase === "submitting_goal" || phase === "waiting_for_questions") && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-emerald-400 animate-spin" />
            <div>
              <p className="text-sm font-medium text-zinc-200">
                {phase === "submitting_goal"
                  ? "Starting AI assistant..."
                  : "Waiting for questions..."}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                The AI is analyzing your goal and preparing questions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Phase: answering */}
      {phase === "answering" && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <AIQuestionPanel />
        </div>
      )}

      {/* Phase: submitting_answers */}
      {phase === "submitting_answers" && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-emerald-400 animate-spin" />
            <p className="text-sm font-medium text-zinc-200">
              Submitting answers...
            </p>
          </div>
        </div>
      )}

      {/* Phase: generating */}
      {phase === "generating" && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-emerald-400 animate-spin" />
            <div>
              <p className="text-sm font-medium text-zinc-200">
                AI is generating your workflow...
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                This may take a moment while the workflow YAML is being created.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Phase: completed */}
      {phase === "completed" && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-sm font-medium text-emerald-300">
                Workflow created successfully!
              </p>
              {createdWorkflowFile && (
                <p className="text-xs text-zinc-500 mt-0.5">
                  Saved as: {createdWorkflowFile}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/workflows")}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              View Workflows
            </button>
            <button
              onClick={() => {
                reset();
                setGoal("");
              }}
              className="flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Create Another
            </button>
          </div>
        </div>
      )}

      {/* Phase: failed */}
      {phase === "failed" && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 text-rose-400" />
            <div>
              <p className="text-sm font-medium text-rose-300">
                Session failed
              </p>
              {error && (
                <p className="text-xs text-rose-400/70 mt-0.5">{error}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              reset();
              setGoal("");
            }}
            className="flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Retry
          </button>
        </div>
      )}

      {/* Stop button while session is active */}
      {isSessionActive && (
        <div className="flex justify-end">
          <button
            onClick={handleStop}
            className="flex items-center gap-2 rounded-lg bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-400 hover:bg-rose-500/20 transition-colors"
          >
            <Square className="h-3 w-3" />
            Stop Session
          </button>
        </div>
      )}

      {/* Collapsible CLI Terminal when session is active or recently finished */}
      {phase !== "idle" && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          <button
            onClick={toggleTerminal}
            className="flex w-full items-center justify-between px-4 py-3 text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            <span className="font-medium">
              CLI Output ({events.length} events)
            </span>
            {terminalExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {terminalExpanded && (
            <div className="h-64 border-t border-zinc-800">
              <CLITerminal events={events} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
