import { Users, CheckCircle2, Target, TrendingUp } from "lucide-react";
import type { SharedMdStatus } from "@/types";

interface StatsRowProps {
  status: SharedMdStatus;
}

export default function StatsRow({ status }: StatsRowProps) {
  const totalAgents = status.agents.length;
  const completedAgents = status.agents.filter((a) => a.status === "COMPLETED").length;
  const totalKRs = status.agents.reduce((sum, a) => sum + a.key_results.length, 0);
  const achievedKRs = status.agents.reduce(
    (sum, a) => sum + a.key_results.filter((kr) => kr.status === "ACHIEVED").length,
    0
  );
  const krRate = totalKRs > 0 ? Math.round((achievedKRs / totalKRs) * 100) : 0;
  const overallProgress =
    totalAgents > 0 ? Math.round((completedAgents / totalAgents) * 100) : 0;

  const stats = [
    {
      label: "Total Agents",
      value: totalAgents,
      icon: Users,
      color: "text-sky-400",
      bg: "bg-sky-500/10",
    },
    {
      label: "Completed",
      value: `${completedAgents}/${totalAgents}`,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "KR Achievement",
      value: `${krRate}%`,
      icon: Target,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: "Overall Progress",
      value: `${overallProgress}%`,
      icon: TrendingUp,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
        >
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-100">{stat.value}</p>
            <p className="text-xs text-zinc-500">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
