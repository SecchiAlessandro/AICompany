import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useWorkflowStore } from "@/stores/workflowStore";
import { useExecutionStore } from "@/stores/executionStore";
import DependencyGraph from "@/components/monitor/DependencyGraph";
import Timeline from "@/components/monitor/Timeline";
import CLITerminal from "@/components/execution/CLITerminal";
import QuestionPanel from "@/components/execution/QuestionPanel";
import ExecutionControls from "@/components/execution/ExecutionControls";
import AgentOffice from "@/components/office/AgentOffice";
import type { SharedMdStatus } from "@/types";
import { Terminal, Building2, GitBranch } from "lucide-react";

export default function ExecutionMonitorPage() {
  const { status, setStatus } = useWorkflowStore();
  const { execution, events } = useExecutionStore();

  const { data } = useQuery<SharedMdStatus>({
    queryKey: ["status"],
    queryFn: api.getStatus,
    refetchInterval: execution?.state === "running" ? 3000 : false,
  });

  useEffect(() => {
    if (data) setStatus(data);
  }, [data, setStatus]);

  const [view, setView] = useState<"office" | "graph">("office");

  const hasExecution = !!execution;
  const hasStatus = status && status.agents.length > 0;

  if (!hasExecution && !hasStatus) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-zinc-100">Execution Monitor</h1>
        <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-zinc-800">
          <div className="text-center text-zinc-600">
            <Terminal className="mx-auto h-8 w-8 mb-2" />
            <p className="text-sm text-zinc-500">No active execution to monitor</p>
            <p className="mt-1 text-xs text-zinc-600">
              Go to Workflows and click Execute to start one
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Execution Monitor</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            {execution?.workflow_name || status?.workflow_name || ""}
          </p>
        </div>
      </div>

      {/* Controls bar */}
      {hasExecution && <ExecutionControls />}

      {/* Question panel (conditional) */}
      <QuestionPanel />

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left: CLI Terminal (2/3) */}
        <div className="lg:col-span-2 h-[500px]">
          <CLITerminal events={events} />
        </div>

        {/* Right: Office / Graph views (1/3) */}
        <div className="space-y-3">
          {/* View toggle */}
          <div className="flex gap-1 rounded-lg bg-zinc-900 p-1 border border-zinc-800">
            <button
              onClick={() => setView("office")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                view === "office"
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Building2 className="h-3 w-3" />
              Office
            </button>
            <button
              onClick={() => setView("graph")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                view === "graph"
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <GitBranch className="h-3 w-3" />
              Graph
            </button>
          </div>

          {hasStatus && view === "office" && (
            <AgentOffice
              agents={status!.agents}
              edges={status!.edges}
              workflowStatus={status!.workflow_status}
            />
          )}

          {hasStatus && view === "graph" && (
            <>
              <div className="space-y-2">
                <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Agent Dependencies
                </h2>
                <DependencyGraph agents={status!.agents} edges={status!.edges} />
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
                <h2 className="mb-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Timeline
                </h2>
                <Timeline agents={status!.agents} />
              </div>
            </>
          )}

          {!hasStatus && hasExecution && (
            <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-zinc-800">
              <p className="text-xs text-zinc-600">Agent status will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
