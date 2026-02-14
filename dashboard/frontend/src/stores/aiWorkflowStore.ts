import { create } from "zustand";
import type { CLIEvent, ExecutionSummary, QuestionRoundData } from "@/types";

const MAX_EVENTS = 5000;

export type AIWorkflowPhase =
  | "idle"
  | "submitting_goal"
  | "waiting_for_questions"
  | "answering"
  | "submitting_answers"
  | "generating"
  | "completed"
  | "failed";

interface AIWorkflowStore {
  phase: AIWorkflowPhase;
  sessionId: string | null;
  execution: ExecutionSummary | null;
  events: CLIEvent[];
  currentRound: QuestionRoundData | null;
  roundsCompleted: number;
  answers: Record<string, string>;
  createdWorkflowFile: string | null;
  error: string | null;
  terminalExpanded: boolean;

  setSession: (id: string, execution: ExecutionSummary) => void;
  updateExecution: (execution: ExecutionSummary) => void;
  appendEvent: (event: CLIEvent) => void;
  setCurrentRound: (round: QuestionRoundData) => void;
  setAnswer: (questionId: string, value: string) => void;
  advanceRound: () => void;
  setCreatedWorkflow: (filename: string) => void;
  setPhase: (phase: AIWorkflowPhase) => void;
  setError: (error: string) => void;
  toggleTerminal: () => void;
  reset: () => void;
}

export const useAIWorkflowStore = create<AIWorkflowStore>((set) => ({
  phase: "idle",
  sessionId: null,
  execution: null,
  events: [],
  currentRound: null,
  roundsCompleted: 0,
  answers: {},
  createdWorkflowFile: null,
  error: null,
  terminalExpanded: false,

  setSession: (id, execution) =>
    set({
      sessionId: id,
      execution,
      phase: "waiting_for_questions",
      events: [],
      currentRound: null,
      roundsCompleted: 0,
      answers: {},
      createdWorkflowFile: null,
      error: null,
    }),

  updateExecution: (execution) =>
    set((state) => {
      if (state.sessionId !== execution.id) return state;
      const updates: Partial<AIWorkflowStore> = { execution };
      if (execution.state === "failed") {
        updates.phase = "failed";
        updates.error = execution.error || "Execution failed";
      }
      if (execution.state === "completed" && state.phase !== "completed") {
        updates.phase = "completed";
      }
      return updates;
    }),

  appendEvent: (event) =>
    set((state) => {
      const next = [...state.events, event];
      if (next.length > MAX_EVENTS) {
        return { events: next.slice(next.length - MAX_EVENTS) };
      }
      return { events: next };
    }),

  setCurrentRound: (round) =>
    set({ currentRound: round, phase: "answering", answers: {} }),

  setAnswer: (questionId, value) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: value },
    })),

  advanceRound: () =>
    set((state) => ({
      roundsCompleted: state.roundsCompleted + 1,
      currentRound: null,
      answers: {},
      phase: "waiting_for_questions",
    })),

  setCreatedWorkflow: (filename) =>
    set({ createdWorkflowFile: filename, phase: "completed" }),

  setPhase: (phase) => set({ phase }),

  setError: (error) => set({ error, phase: "failed" }),

  toggleTerminal: () =>
    set((state) => ({ terminalExpanded: !state.terminalExpanded })),

  reset: () =>
    set({
      phase: "idle",
      sessionId: null,
      execution: null,
      events: [],
      currentRound: null,
      roundsCompleted: 0,
      answers: {},
      createdWorkflowFile: null,
      error: null,
      terminalExpanded: false,
    }),
}));
