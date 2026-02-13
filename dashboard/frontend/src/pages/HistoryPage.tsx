import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { HistoryEntry } from "@/types";
import { formatDate } from "@/lib/utils";
import StatusBadge from "@/components/common/StatusBadge";
import { History, Users, Target } from "lucide-react";

export default function HistoryPage() {
  const { data: entries = [] } = useQuery<HistoryEntry[]>({
    queryKey: ["history"],
    queryFn: api.getHistory,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-100">Workflow History</h1>

      {entries.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-zinc-800">
          <div className="text-center">
            <History className="mx-auto h-8 w-8 text-zinc-700" />
            <p className="mt-2 text-sm text-zinc-500">No workflow history yet</p>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">
                  Workflow
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">
                  Agents
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">
                  KR Rate
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">
                  Started
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">
                  Completed
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {entries.map((entry) => {
                const krRate =
                  entry.kr_total > 0
                    ? Math.round((entry.kr_achieved / entry.kr_total) * 100)
                    : 0;
                return (
                  <tr key={entry.id} className="hover:bg-zinc-800/30">
                    <td className="px-4 py-3 font-medium text-zinc-200">
                      {entry.workflow_name}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={entry.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-zinc-400">
                        <Users className="h-3 w-3" />
                        {entry.agent_count}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-zinc-400">
                        <Target className="h-3 w-3" />
                        {krRate}%
                        <span className="text-zinc-600">
                          ({entry.kr_achieved}/{entry.kr_total})
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">
                      {formatDate(entry.started_at)}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">
                      {entry.completed_at ? formatDate(entry.completed_at) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
