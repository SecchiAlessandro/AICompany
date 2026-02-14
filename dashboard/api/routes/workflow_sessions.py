"""Workflow session API — start workflow-creation sessions via @workflow-mapper."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

from dashboard.models.schemas import (
    AnswerQuestionRequest,
    ExecutionSummary,
    WorkflowSessionRequest,
)
from dashboard.services.cli_session_manager import CLISessionManager

router = APIRouter(prefix="/api/workflow-sessions", tags=["workflow-sessions"])

_manager: CLISessionManager | None = None


def set_session_manager(mgr: CLISessionManager) -> None:
    global _manager
    _manager = mgr


def _get_manager() -> CLISessionManager:
    if _manager is None:
        raise HTTPException(status_code=503, detail="CLI session manager not initialized")
    return _manager


@router.post("", response_model=ExecutionSummary)
async def start_workflow_session(body: WorkflowSessionRequest):
    """Start a new workflow-creation session via @workflow-mapper."""
    mgr = _get_manager()
    try:
        session = await mgr.start_workflow_session(body.goal)
        return ExecutionSummary(**session.to_summary())
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{session_id}/answer", response_model=ExecutionSummary)
async def answer_question(session_id: str, body: AnswerQuestionRequest):
    """Answer a pending question for a workflow session."""
    mgr = _get_manager()
    try:
        session = await mgr.answer_question(session_id, body.answer)
        return ExecutionSummary(**session.to_summary())
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{session_id}/stop", response_model=ExecutionSummary)
async def stop_workflow_session(session_id: str):
    """Stop a running workflow session."""
    mgr = _get_manager()
    try:
        session = await mgr.stop_execution(session_id)
        return ExecutionSummary(**session.to_summary())
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
