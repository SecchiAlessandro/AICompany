import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useWorkflowStore } from "@/stores/workflowStore";
import { useExecutionStore } from "@/stores/executionStore";
import StatsRow from "@/components/dashboard/StatsRow";
import AgentCard from "@/components/dashboard/AgentCard";
import DependencyGraph from "@/components/monitor/DependencyGraph";
import type { SharedMdStatus } from "@/types";
import { Radio } from "lucide-react";

export default function DashboardPage() {
  const { status, setStatus, setLoading } = useWorkflowStore();
  const execution = useExecutionStore((s) => s.execution);

  const { data } = useQuery<SharedMdStatus>({
    queryKey: ["status"],
    queryFn: api.getStatus,
  });

  useEffect(() => {
    if (data) {
      setStatus(data);
    } else {
      setLoading(false);
    }
  }, [data, setStatus, setLoading]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-100">Dashboard</h1>

      {/* Active execution banner */}
      {execution && (execution.state === "running" || execution.state === "starting" || execution.state === "awaiting_input") && (
        <Link
          to="/monitor"
          className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 transition-colors hover:bg-emerald-500/10"
        >
          <Radio className="h-5 w-5 text-emerald-400 animate-pulse" />
          <div>
            <p className="text-sm font-medium text-emerald-300">
              Active Execution: {execution.workflow_name}
            </p>
            <p className="text-xs text-zinc-500">
              State: {execution.state} · Click to view monitor
            </p>
          </div>
        </Link>
      )}

      {(!status || status.agents.length === 0) && !execution ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-zinc-800">
          <div className="text-center">
            <p className="text-sm text-zinc-500">No active workflow</p>
            <p className="mt-1 text-xs text-zinc-600">
              Create a new workflow or trigger an existing one to get started
            </p>
          </div>
        </div>
      ) : status && status.agents.length > 0 ? (
        <>
          {/* Stats Row */}
          <StatsRow status={status} />

          {/* Dependency Graph */}
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-zinc-400">Dependency Graph</h2>
            <DependencyGraph agents={status.agents} edges={status.edges} />
          </div>

          {/* Agent Grid */}
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-zinc-400">Agents</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {status.agents.map((agent) => (
                <AgentCard key={agent.name} agent={agent} />
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
