import { useState } from "react";
import { api } from "@/lib/api";
import { useExecutionStore } from "@/stores/executionStore";
import { MessageCircleQuestion, Send } from "lucide-react";

export default function QuestionPanel() {
  const { activeExecutionId, pendingQuestion, isAnswering, setIsAnswering, setQuestion } =
    useExecutionStore();
  const [answer, setAnswer] = useState("");

  if (!pendingQuestion || !activeExecutionId) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!answer.trim() || !activeExecutionId) return;

    setIsAnswering(true);
    try {
      await api.answerQuestion(activeExecutionId, answer.trim());
      setAnswer("");
      setQuestion(null);
    } catch (err) {
      console.error("Failed to answer question:", err);
    } finally {
      setIsAnswering(false);
    }
  }

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
          <MessageCircleQuestion className="h-4 w-4 text-amber-400" />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-sm font-medium text-amber-200">
              Agent is waiting for your input
            </p>
            <p className="mt-1 text-sm text-zinc-300 whitespace-pre-wrap">
              {pendingQuestion.text}
            </p>
            {pendingQuestion.context && (
              <p className="mt-1 text-xs text-zinc-500">{pendingQuestion.context}</p>
            )}
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer..."
              disabled={isAnswering}
              className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!answer.trim() || isAnswering}
              className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400 hover:bg-amber-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-3.5 w-3.5" />
              {isAnswering ? "Sending..." : "Answer"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
