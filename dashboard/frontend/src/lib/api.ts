const BASE = "/api";

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json();
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(`${BASE}${url}`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.text();
}

// --- Status ---
import type {
  SharedMdStatus,
  WorkflowSummary,
  Workflow,
  AgentDefinition,
  ResultFile,
  HistoryEntry,
  SkillInfo,
} from "@/types";

export const api = {
  getStatus: () => fetchJSON<SharedMdStatus>("/status"),

  // Workflows
  getWorkflows: () => fetchJSON<WorkflowSummary[]>("/workflows"),
  getWorkflow: (name: string) => fetchJSON<Workflow>(`/workflows/${name}`),
  getWorkflowRaw: (name: string) => fetchText(`/workflows/${name}/raw`),
  createWorkflow: (filename: string, content: string) =>
    fetchJSON<{ status: string; filename: string }>("/workflows", {
      method: "POST",
      body: JSON.stringify({ filename, content }),
    }),
  deleteWorkflow: (name: string) =>
    fetchJSON<{ status: string }>(`/workflows/${name}`, { method: "DELETE" }),
  executeWorkflow: (name: string) =>
    fetchJSON<{ success: boolean; pid?: number }>(`/workflows/${name}/execute`, {
      method: "POST",
    }),

  // Agents
  getAgents: () => fetchJSON<AgentDefinition[]>("/agents"),
  getAgent: (name: string) => fetchJSON<AgentDefinition>(`/agents/${name}`),

  // Results
  getResults: () => fetchJSON<ResultFile[]>("/results"),
  getResultContent: (filename: string) => fetchText(`/results/${filename}`),

  // History
  getHistory: () => fetchJSON<HistoryEntry[]>("/history"),

  // Skills
  getSkills: () => fetchJSON<SkillInfo[]>("/skills"),
};
