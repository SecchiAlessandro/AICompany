import { BUILDER_ROUNDS } from "@/lib/constants";
import { useWorkflowBuilderStore } from "@/stores/workflowBuilderStore";

interface QuestionRoundProps {
  roundIndex: number;
}

export default function QuestionRound({ roundIndex }: QuestionRoundProps) {
  const round = BUILDER_ROUNDS[roundIndex];
  const { answers, setAnswer } = useWorkflowBuilderStore();

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
    </div>
  );
}
