import { create } from "zustand";
import type { CLIEvent, ExecutionSummary, PendingQuestion } from "@/types";

const MAX_EVENTS = 5000;

interface ExecutionStore {
  activeExecutionId: string | null;
  execution: ExecutionSummary | null;
  events: CLIEvent[];
  pendingQuestion: PendingQuestion | null;
  isAnswering: boolean;

  setActiveExecution: (execution: ExecutionSummary) => void;
  updateExecutionState: (execution: ExecutionSummary) => void;
  appendEvent: (event: CLIEvent) => void;
  setQuestion: (question: PendingQuestion | null) => void;
  setIsAnswering: (v: boolean) => void;
  clearExecution: () => void;
}

export const useExecutionStore = create<ExecutionStore>((set) => ({
  activeExecutionId: null,
  execution: null,
  events: [],
  pendingQuestion: null,
  isAnswering: false,

  setActiveExecution: (execution) =>
    set({
      activeExecutionId: execution.id,
      execution,
      events: [],
      pendingQuestion: null,
      isAnswering: false,
    }),

  updateExecutionState: (execution) =>
    set((state) => ({
      execution:
        state.activeExecutionId === execution.id ? execution : state.execution,
      pendingQuestion:
        state.activeExecutionId === execution.id
          ? execution.pending_question
          : state.pendingQuestion,
    })),

  appendEvent: (event) =>
    set((state) => {
      const next = [...state.events, event];
      // Ring buffer: drop oldest events if over limit
      if (next.length > MAX_EVENTS) {
        return { events: next.slice(next.length - MAX_EVENTS) };
      }
      return { events: next };
    }),

  setQuestion: (question) => set({ pendingQuestion: question }),

  setIsAnswering: (v) => set({ isAnswering: v }),

  clearExecution: () =>
    set({
      activeExecutionId: null,
      execution: null,
      events: [],
      pendingQuestion: null,
      isAnswering: false,
    }),
}));
