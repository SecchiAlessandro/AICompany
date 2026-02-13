import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useWorkflowStore } from "@/stores/workflowStore";
import DependencyGraph from "@/components/monitor/DependencyGraph";
import Timeline from "@/components/monitor/Timeline";
import StatusBadge from "@/components/common/StatusBadge";
import type { SharedMdStatus } from "@/types";
import { Clock } from "lucide-react";

export default function ExecutionMonitorPage() {
  const { status, setStatus } = useWorkflowStore();
  const [elapsed, setElapsed] = useState(0);

  const { data } = useQuery<SharedMdStatus>({
    queryKey: ["status"],
    queryFn: api.getStatus,
  });

  useEffect(() => {
    if (data) setStatus(data);
  }, [data, setStatus]);

  // Elapsed timer
  useEffect(() => {
    if (status?.workflow_status !== "IN PROGRESS") return;
    const start = Date.now();
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(id);
  }, [status?.workflow_status]);

  if (!status || status.agents.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-zinc-100">Execution Monitor</h1>
        <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-zinc-800">
          <p className="text-sm text-zinc-500">No active execution to monitor</p>
        </div>
      </div>
    );
  }

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Execution Monitor</h1>
          {status.workflow_name && (
            <p className="mt-1 text-sm text-zinc-500">{status.workflow_name}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          {status.workflow_status === "IN PROGRESS" && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Clock className="h-4 w-4 animate-status-pulse text-sky-400" />
              {formatElapsed(elapsed)}
            </div>
          )}
          <StatusBadge status={status.workflow_status} size="md" />
        </div>
      </div>

      {/* Dependency Graph */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-400">Agent Dependencies</h2>
        <DependencyGraph agents={status.agents} edges={status.edges} />
      </div>

      {/* Timeline */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <Timeline agents={status.agents} />
      </div>
    </div>
  );
}
