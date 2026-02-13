import { useWorkflowStore } from "@/stores/workflowStore";
import { STATUS_COLORS } from "@/lib/constants";

export default function Header() {
  const status = useWorkflowStore((s) => s.status);
  const workflowStatus = status?.workflow_status || "NOT STARTED";
  const colors = STATUS_COLORS[workflowStatus] || STATUS_COLORS["NOT STARTED"];

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-6 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        {status?.workflow_name && (
          <>
            <span className="text-sm text-zinc-400">Workflow:</span>
            <span className="font-medium text-zinc-100">{status.workflow_name}</span>
          </>
        )}
        {!status?.workflow_name && (
          <span className="text-sm text-zinc-500">No active workflow</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${colors.dot} ${workflowStatus === "IN PROGRESS" ? "animate-status-pulse" : ""}`} />
        <span className={`text-xs font-medium ${colors.text}`}>{workflowStatus}</span>
      </div>
    </header>
  );
}
