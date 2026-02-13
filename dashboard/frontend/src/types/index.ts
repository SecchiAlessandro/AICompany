// --- Status enums ---
export type AgentStatusType = "PENDING" | "COMPLETED" | "NOT COMPLETED";
export type KeyResultStatusType = "PENDING" | "ACHIEVED" | "NOT ACHIEVED";
export type WorkflowStatusType = "IN PROGRESS" | "COMPLETED" | "NOT STARTED";

// --- Shared.md parsed models ---
export interface ValidationCriterion {
  text: string;
  checked: boolean;
}

export interface KeyResult {
  number: number;
  description: string;
  status: KeyResultStatusType;
  validation: ValidationCriterion[];
}

export interface AgentSection {
  name: string;
  status: AgentStatusType;
  objectives: string[];
  key_results: KeyResult[];
  outputs: string[];
  timestamp: string | null;
}

export interface DependencyEdge {
  source: string;
  target: string;
}

export interface DependencyInfo {
  role: string;
  depends_on: string[];
  outputs_used_by: string[];
}

export interface SharedMdStatus {
  workflow_name: string | null;
  workflow_status: WorkflowStatusType;
  timestamp: string | null;
  agents: AgentSection[];
  dependencies: DependencyInfo[];
  edges: DependencyEdge[];
  raw_content: string;
}

// --- Workflow YAML models ---
export interface Tool {
  name: string;
  purpose: string;
}

export interface Skill {
  name: string;
  purpose: string;
}

export interface KnowledgeSource {
  name: string;
  purpose: string;
  path: string;
}

export interface InputOutput {
  inputs: string;
  outputs: string;
}

export interface Precondition {
  name: string;
  description: string;
  verification: string;
}

export interface WorkflowKeyResult {
  result: string;
  validation: string[];
}

export interface OKR {
  objectives: string[];
  key_results: WorkflowKeyResult[];
}

export interface Role {
  role: string;
  description: string;
  tools: Tool[];
  skills: Skill[];
  knowledge_sources: KnowledgeSource[];
  inputs_outputs: InputOutput[];
  preconditions: Precondition[];
  okr: OKR | null;
}

export interface Workflow {
  name: string;
  overview: string;
  people_involved: Role[];
}

export interface WorkflowSummary {
  name: string;
  filename: string;
  overview: string;
  role_count: number;
}

// --- Result file ---
export interface ResultFile {
  name: string;
  path: string;
  size: number;
  modified: string;
  extension: string;
}

// --- Agent definition ---
export interface AgentDefinition {
  name: string;
  filename: string;
  description: string;
  tools: string;
  skills: string;
  content: string;
}

// --- History ---
export interface HistoryEntry {
  id: string;
  workflow_name: string;
  started_at: string;
  completed_at: string | null;
  status: string;
  agent_count: number;
  kr_total: number;
  kr_achieved: number;
}

// --- WebSocket ---
export interface WSEvent {
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
}

// --- Skill ---
export interface SkillInfo {
  name: string;
  description: string;
  triggers: string[];
}
