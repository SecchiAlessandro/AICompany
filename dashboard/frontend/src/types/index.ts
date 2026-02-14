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

// --- Execution (CLI wrapper) ---
export type ExecutionStateType =
  | "starting"
  | "running"
  | "awaiting_input"
  | "completed"
  | "failed"
  | "stopped";

export interface PendingQuestion {
  text: string;
  context: string;
}

export interface CLIEvent {
  timestamp: string;
  event_type: string; // text, tool_use, tool_result, result, system_summary, stderr, raw_text
  role: string; // assistant, system, user, tool, error
  content: CLIEventContent;
}

export interface CLIEventContent {
  text?: string;
  tools?: { name: string; input: string }[];
  cost_usd?: number;
  duration_ms?: number;
  session_id?: string;
}

export interface ExecutionSummary {
  id: string;
  workflow_name: string;
  cli_session_id: string | null;
  state: ExecutionStateType;
  started_at: string;
  completed_at: string | null;
  event_count: number;
  pending_question: PendingQuestion | null;
  cost_usd: number;
  duration_ms: number;
  error: string | null;
  session_type?: string;
}

export interface ExecutionDetail extends ExecutionSummary {
  events: CLIEvent[];
  total_events: number;
}

// --- AI Workflow Session ---
export interface StructuredQuestionOption {
  label: string;
  description: string;
}

export interface StructuredQuestion {
  question: string;
  header: string;
  options?: StructuredQuestionOption[];
  multiSelect: boolean;
}

export interface QuestionRoundData {
  roundNumber: number;
  questions: StructuredQuestion[];
}

// --- Office Visualization ---
export type OfficeAgentStatus =
  | "entering"
  | "idle"
  | "working"
  | "completed"
  | "failed";

export interface OfficeAgent {
  name: string;
  officeStatus: OfficeAgentStatus;
  agentStatus: AgentStatusType;
  key_results: KeyResult[];
  outputs: string[];
  deskIndex: number;
  balloonText: string;
}
