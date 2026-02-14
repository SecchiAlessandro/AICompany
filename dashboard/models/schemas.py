"""Pydantic models for the dashboard API."""
from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


# --- Status enums ---

class AgentStatus(str, Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    NOT_COMPLETED = "NOT COMPLETED"


class KeyResultStatus(str, Enum):
    PENDING = "PENDING"
    ACHIEVED = "ACHIEVED"
    NOT_ACHIEVED = "NOT ACHIEVED"


class WorkflowStatus(str, Enum):
    IN_PROGRESS = "IN PROGRESS"
    COMPLETED = "COMPLETED"
    NOT_STARTED = "NOT STARTED"


# --- Shared.md parsed models ---

class ValidationCriterion(BaseModel):
    text: str
    checked: bool = False


class KeyResult(BaseModel):
    number: int
    description: str
    status: KeyResultStatus = KeyResultStatus.PENDING
    validation: list[ValidationCriterion] = Field(default_factory=list)


class AgentSection(BaseModel):
    name: str
    status: AgentStatus = AgentStatus.PENDING
    objectives: list[str] = Field(default_factory=list)
    key_results: list[KeyResult] = Field(default_factory=list)
    outputs: list[str] = Field(default_factory=list)
    timestamp: Optional[str] = None


class DependencyEdge(BaseModel):
    source: str
    target: str


class DependencyInfo(BaseModel):
    role: str
    depends_on: list[str] = Field(default_factory=list)
    outputs_used_by: list[str] = Field(default_factory=list)


class SharedMdStatus(BaseModel):
    workflow_name: Optional[str] = None
    workflow_status: WorkflowStatus = WorkflowStatus.NOT_STARTED
    timestamp: Optional[str] = None
    agents: list[AgentSection] = Field(default_factory=list)
    dependencies: list[DependencyInfo] = Field(default_factory=list)
    edges: list[DependencyEdge] = Field(default_factory=list)
    raw_content: str = ""


# --- Workflow YAML models ---

class Tool(BaseModel):
    name: str
    purpose: str = ""


class Skill(BaseModel):
    name: str
    purpose: str = ""


class KnowledgeSource(BaseModel):
    name: str
    purpose: str = ""
    path: str = ""


class InputOutput(BaseModel):
    inputs: str = ""
    outputs: str = ""


class Precondition(BaseModel):
    name: str
    description: str = ""
    verification: str = ""


class WorkflowKeyResult(BaseModel):
    result: str
    validation: list[str] = Field(default_factory=list)


class OKR(BaseModel):
    objectives: list[str] = Field(default_factory=list)
    key_results: list[WorkflowKeyResult] = Field(default_factory=list)


class Role(BaseModel):
    role: str
    description: str = ""
    tools: list[Tool] = Field(default_factory=list)
    skills: list[Skill] = Field(default_factory=list)
    knowledge_sources: list[KnowledgeSource] = Field(default_factory=list)
    inputs_outputs: list[InputOutput] = Field(default_factory=list)
    preconditions: list[Precondition] = Field(default_factory=list)
    okr: Optional[OKR] = None


class Workflow(BaseModel):
    name: str
    overview: str = ""
    people_involved: list[Role] = Field(default_factory=list)


class WorkflowSummary(BaseModel):
    name: str
    filename: str
    overview: str = ""
    role_count: int = 0


class WorkflowCreateRequest(BaseModel):
    filename: str
    content: str


# --- Result file models ---

class ResultFile(BaseModel):
    name: str
    path: str
    size: int
    modified: str
    extension: str


# --- Agent definition models ---

class AgentDefinition(BaseModel):
    name: str
    filename: str
    description: str = ""
    tools: str = ""
    skills: str = ""
    content: str = ""


# --- History models ---

class HistoryEntry(BaseModel):
    id: str
    workflow_name: str
    started_at: str
    completed_at: Optional[str] = None
    status: str = "in_progress"
    agent_count: int = 0
    kr_total: int = 0
    kr_achieved: int = 0


# --- WebSocket event models ---

class WSEvent(BaseModel):
    type: str
    data: dict = Field(default_factory=dict)
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())


# --- Skill models ---

class SkillInfo(BaseModel):
    name: str
    description: str = ""
    triggers: list[str] = Field(default_factory=list)


# --- Execution models ---

class ExecutionStateEnum(str, Enum):
    STARTING = "starting"
    RUNNING = "running"
    AWAITING_INPUT = "awaiting_input"
    COMPLETED = "completed"
    FAILED = "failed"
    STOPPED = "stopped"


class CLIEventResponse(BaseModel):
    timestamp: str
    event_type: str
    role: str
    content: dict = Field(default_factory=dict)
    raw: Optional[dict] = None


class PendingQuestion(BaseModel):
    text: str
    context: str = ""


class ExecutionSummary(BaseModel):
    id: str
    workflow_name: str
    session_type: str = "execution"
    cli_session_id: Optional[str] = None
    state: ExecutionStateEnum = ExecutionStateEnum.STARTING
    started_at: str = ""
    completed_at: Optional[str] = None
    event_count: int = 0
    pending_question: Optional[PendingQuestion] = None
    cost_usd: float = 0.0
    duration_ms: int = 0
    error: Optional[str] = None


class ExecutionDetail(ExecutionSummary):
    events: list[CLIEventResponse] = Field(default_factory=list)
    total_events: int = 0


class AnswerQuestionRequest(BaseModel):
    answer: str


class WorkflowSessionRequest(BaseModel):
    goal: str
