import { useEffect } from "react";
import { BUILDER_ROUNDS, ROLE_QUESTIONS } from "@/lib/constants";
import { useWorkflowBuilderStore } from "@/stores/workflowBuilderStore";
import type { RoleAnswers } from "@/stores/workflowBuilderStore";
import { Plus, Trash2 } from "lucide-react";

interface QuestionRoundProps {
  roundIndex: number;
}

export default function QuestionRound({ roundIndex }: QuestionRoundProps) {
  const round = BUILDER_ROUNDS[roundIndex];
  const { answers, setAnswer, roles, addRole, removeRole, setRoleField, syncRoleCount } =
    useWorkflowBuilderStore();

  const roleCount = parseInt(answers.q4 || "", 10);
  const showRoles = roundIndex === 0 && !isNaN(roleCount) && roleCount > 0;

  useEffect(() => {
    if (showRoles) {
      syncRoleCount(roleCount);
    }
  }, [roleCount, showRoles, syncRoleCount]);

  if (!round) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100">{round.title}</h2>
        <p className="text-sm text-zinc-500">
          Round {roundIndex + 1} of {BUILDER_ROUNDS.length}
        </p>
      </div>

      <div className="space-y-5">
        {round.questions.map((q) => (
          <div key={q.id} className="space-y-2">
            <label className="block text-sm font-medium text-zinc-300">
              {q.label}
            </label>
            {q.type === "textarea" ? (
              <textarea
                value={answers[q.id] || ""}
                onChange={(e) => setAnswer(q.id, e.target.value)}
                placeholder={q.placeholder}
                rows={3}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
              />
            ) : (
              <input
                type="text"
                value={answers[q.id] || ""}
                onChange={(e) => setAnswer(q.id, e.target.value)}
                placeholder={q.placeholder}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
              />
            )}
          </div>
        ))}
      </div>

      {showRoles && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-200">Configure Roles</h3>
            <span className="text-xs text-zinc-500">
              {roles.length} role{roles.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="space-y-4">
            {roles.map((role, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-300">Role {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeRole(idx)}
                    disabled={roles.length <= 1}
                    className="flex items-center gap-1 rounded px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-800 hover:text-rose-400 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-3 w-3" />
                    Remove
                  </button>
                </div>

                {ROLE_QUESTIONS.map((rq) => (
                  <div key={rq.id} className="space-y-1">
                    <label className="block text-xs font-medium text-zinc-400">{rq.label}</label>
                    {rq.type === "textarea" ? (
                      <textarea
                        value={role[rq.id as keyof RoleAnswers] || ""}
                        onChange={(e) => setRoleField(idx, rq.id as keyof RoleAnswers, e.target.value)}
                        placeholder={rq.placeholder}
                        rows={2}
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                      />
                    ) : (
                      <input
                        type="text"
                        value={role[rq.id as keyof RoleAnswers] || ""}
                        onChange={(e) => setRoleField(idx, rq.id as keyof RoleAnswers, e.target.value)}
                        placeholder={rq.placeholder}
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addRole}
            className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-zinc-700 bg-zinc-900/30 px-3 py-2 text-sm text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
          >
            <Plus className="h-4 w-4" />
            Add Role
          </button>
        </div>
      )}
    </div>
  );
}
