import { create } from "zustand";
import type { SharedMdStatus } from "@/types";

interface WorkflowStore {
  status: SharedMdStatus | null;
  loading: boolean;
  error: string | null;
  setStatus: (status: SharedMdStatus) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useWorkflowStore = create<WorkflowStore>((set) => ({
  status: null,
  loading: true,
  error: null,
  setStatus: (status) => set({ status, loading: false, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
}));
