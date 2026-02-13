import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useWorkflowStore } from "@/stores/workflowStore";
import OKRTracker from "@/components/okr/OKRTracker";
import StatusBadge from "@/components/common/StatusBadge";
import ProgressRing from "@/components/common/ProgressRing";
import type { SharedMdStatus } from "@/types";
import { ArrowLeft, FileText } from "lucide-react";

export default function AgentDetailPage() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const { status, setStatus } = useWorkflowStore();

  const { data } = useQuery<SharedMdStatus>({
    queryKey: ["status"],
    queryFn: api.getStatus,
  });

  useEffect(() => {
    if (data) setStatus(data);
  }, [data, setStatus]);

  const agent = status?.agents.find((a) => a.name === name);

  if (!agent) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-zinc-800">
          <p className="text-sm text-zinc-500">Agent "{name}" not found</p>
        </div>
      </div>
    );
  }

  const totalKRs = agent.key_results.length;
  const achievedKRs = agent.key_results.filter((kr) => kr.status === "ACHIEVED").length;
  const progress = totalKRs > 0 ? Math.round((achievedKRs / totalKRs) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Agent header */}
      <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
        <div className="flex items-center gap-4">
          <ProgressRing value={progress} size={56} strokeWidth={5} />
          <div>
            <h1 className="text-xl font-bold text-zinc-100">{agent.name}</h1>
            <div className="mt-1 flex items-center gap-3">
              <StatusBadge status={agent.status} size="md" />
              <span className="text-xs text-zinc-500">
                {achievedKRs}/{totalKRs} key results achieved
              </span>
            </div>
          </div>
        </div>
        {agent.timestamp && (
          <span className="text-xs text-zinc-600">{agent.timestamp}</span>
        )}
      </div>

      {/* OKR Tracker */}
      <OKRTracker agent={agent} />

      {/* Outputs */}
      {agent.outputs.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-zinc-400">Outputs</h3>
          <div className="space-y-2">
            {agent.outputs.map((output, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2"
              >
                <FileText className="h-4 w-4 text-zinc-500" />
                <span className="text-sm text-zinc-300">{output}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
