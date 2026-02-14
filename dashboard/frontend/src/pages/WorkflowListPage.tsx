import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useExecutionStore } from "@/stores/executionStore";
import type { WorkflowSummary } from "@/types";
import { GitBranch, Play, Trash2, Plus, Users } from "lucide-react";

export default function WorkflowListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setActiveExecution } = useExecutionStore();

  const { data: workflows = [] } = useQuery<WorkflowSummary[]>({
    queryKey: ["workflows"],
    queryFn: api.getWorkflows,
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteWorkflow,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workflows"] }),
  });

  const executeMutation = useMutation({
    mutationFn: api.startExecution,
    onSuccess: (data) => {
      setActiveExecution(data);
      navigate("/monitor");
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Workflows</h1>
        <button
          onClick={() => navigate("/workflows/new")}
          className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Workflow
        </button>
      </div>

      {workflows.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-zinc-800">
          <div className="text-center">
            <GitBranch className="mx-auto h-8 w-8 text-zinc-700" />
            <p className="mt-2 text-sm text-zinc-500">No workflows found</p>
            <p className="text-xs text-zinc-600">
              Create one with the workflow builder
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {workflows.map((wf) => (
            <div
              key={wf.filename}
              className="group flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:bg-zinc-800/50"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                  <GitBranch className="h-5 w-5 text-sky-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-100">{wf.name}</h3>
                  <p className="mt-0.5 text-xs text-zinc-500 max-w-lg truncate">
                    {wf.overview || wf.filename}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-zinc-600">
                    <Users className="h-3 w-3" />
                    {wf.role_count} role{wf.role_count !== 1 ? "s" : ""}
                    <span>·</span>
                    <span>{wf.filename}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => executeMutation.mutate(wf.filename)}
                  disabled={executeMutation.isPending}
                  className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50"
                >
                  <Play className="h-3 w-3" />
                  {executeMutation.isPending ? "Starting..." : "Execute"}
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete ${wf.filename}?`)) {
                      deleteMutation.mutate(wf.filename);
                    }
                  }}
                  className="flex items-center gap-1 rounded-lg bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-500/20"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {executeMutation.isError && (
        <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-400">
          Failed to start execution: {executeMutation.error?.message}
        </div>
      )}
    </div>
  );
}
