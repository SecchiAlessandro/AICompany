import { create } from "zustand";

interface WorkflowBuilderStore {
  currentStep: number;
  answers: Record<string, string>;
  setStep: (step: number) => void;
  setAnswer: (questionId: string, value: string) => void;
  reset: () => void;
}

export const useWorkflowBuilderStore = create<WorkflowBuilderStore>((set) => ({
  currentStep: 0,
  answers: {},
  setStep: (step) => set({ currentStep: step }),
  setAnswer: (questionId, value) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: value },
    })),
  reset: () => set({ currentStep: 0, answers: {} }),
}));
