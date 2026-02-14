import { useState } from "react";
import { useAIWorkflowStore } from "@/stores/aiWorkflowStore";
import { api } from "@/lib/api";
import { Send, Loader2 } from "lucide-react";

export default function AIQuestionPanel() {
  const { currentRound, sessionId, answers, setAnswer, setPhase, advanceRound, setError } =
    useAIWorkflowStore();
  const [submitting, setSubmitting] = useState(false);

  if (!currentRound || !sessionId) return null;

  const { roundNumber, questions } = currentRound;

  async function handleSubmit() {
    if (!sessionId) return;
    setSubmitting(true);
    setPhase("submitting_answers");

    const formatted = questions
      .map((q, i) => {
        const key = `q${i}`;
        const answer = answers[key] || "";
        return `${i + 1}. ${answer}`;
      })
      .join("\n");

    try {
      await api.answerWorkflowQuestion(sessionId, formatted);
      advanceRound();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit answers");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
          Round {roundNumber}
        </span>
        <span className="text-xs text-zinc-500">
          {questions.length} question{questions.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-5">
        {questions.map((q, i) => {
          const key = `q${i}`;
          return (
            <div key={key} className="space-y-2">
              {q.header && (
                <h3 className="text-sm font-semibold text-zinc-300">{q.header}</h3>
              )}
              <p className="text-sm text-zinc-400">{q.question}</p>

              {q.options && q.options.length > 0 ? (
                <div className="space-y-2 pl-1">
                  {q.options.map((opt, j) => {
                    const optKey = `${key}_opt${j}`;
                    const isSelected = q.multiSelect
                      ? (answers[key] || "").split(",").includes(opt.label)
                      : answers[key] === opt.label;

                    function handleOptionChange() {
                      if (q.multiSelect) {
                        const current = (answers[key] || "")
                          .split(",")
                          .filter(Boolean);
                        const next = isSelected
                          ? current.filter((v) => v !== opt.label)
                          : [...current, opt.label];
                        setAnswer(key, next.join(","));
                      } else {
                        setAnswer(key, opt.label);
                      }
                    }

                    return (
                      <label
                        key={optKey}
                        className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 cursor-pointer hover:border-zinc-700 transition-colors"
                      >
                        <input
                          type={q.multiSelect ? "checkbox" : "radio"}
                          name={key}
                          checked={isSelected}
                          onChange={handleOptionChange}
                          className="mt-0.5 accent-emerald-500"
                        />
                        <div>
                          <span className="text-sm font-medium text-zinc-200">
                            {opt.label}
                          </span>
                          {opt.description && (
                            <p className="text-xs text-zinc-500 mt-0.5">
                              {opt.description}
                            </p>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <textarea
                  value={answers[key] || ""}
                  onChange={(e) => setAnswer(key, e.target.value)}
                  placeholder="Type your answer..."
                  rows={3}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 resize-none"
                />
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Submit Answers
          </>
        )}
      </button>
    </div>
  );
}
