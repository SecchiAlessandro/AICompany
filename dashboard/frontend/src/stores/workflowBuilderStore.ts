import { create } from "zustand";

export interface RoleAnswers {
  name: string;
  description: string;
  objectives: string;
  keyResults: string;
  inputsOutputs: string;
}

const emptyRole = (): RoleAnswers => ({
  name: "",
  description: "",
  objectives: "",
  keyResults: "",
  inputsOutputs: "",
});

interface WorkflowBuilderStore {
  currentStep: number;
  answers: Record<string, string>;
  roles: RoleAnswers[];
  setStep: (step: number) => void;
  setAnswer: (questionId: string, value: string) => void;
  addRole: () => void;
  removeRole: (index: number) => void;
  setRoleField: (index: number, field: keyof RoleAnswers, value: string) => void;
  syncRoleCount: (count: number) => void;
  reset: () => void;
}

export const useWorkflowBuilderStore = create<WorkflowBuilderStore>((set) => ({
  currentStep: 0,
  answers: {},
  roles: [emptyRole()],
  setStep: (step) => set({ currentStep: step }),
  setAnswer: (questionId, value) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: value },
    })),
  addRole: () =>
    set((state) => ({
      roles: [...state.roles, emptyRole()],
    })),
  removeRole: (index) =>
    set((state) => ({
      roles: state.roles.length <= 1 ? state.roles : state.roles.filter((_, i) => i !== index),
    })),
  setRoleField: (index, field, value) =>
    set((state) => {
      const roles = [...state.roles];
      if (roles[index]) {
        roles[index] = { ...roles[index], [field]: value };
      }
      return { roles };
    }),
  syncRoleCount: (count) =>
    set((state) => {
      const target = Math.max(1, Math.min(count, 10));
      const current = state.roles.length;
      if (target === current) return state;
      if (target > current) {
        return { roles: [...state.roles, ...Array.from({ length: target - current }, () => emptyRole())] };
      }
      return { roles: state.roles.slice(0, target) };
    }),
  reset: () => set({ currentStep: 0, answers: {}, roles: [emptyRole()] }),
}));
