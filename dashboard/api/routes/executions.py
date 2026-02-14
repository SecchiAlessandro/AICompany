"""Execution management API — start, monitor, answer, stop CLI sessions."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from dashboard.config import WORKFLOWS_DIR
from dashboard.models.schemas import (
    AnswerQuestionRequest,
    CLIEventResponse,
    ExecutionDetail,
    ExecutionSummary,
)
from dashboard.services.cli_session_manager import CLISessionManager

router = APIRouter(prefix="/api/executions", tags=["executions"])

_manager: CLISessionManager | None = None


def set_session_manager(mgr: CLISessionManager) -> None:
    global _manager
    _manager = mgr


def _get_manager() -> CLISessionManager:
    if _manager is None:
        raise HTTPException(status_code=503, detail="CLI session manager not initialized")
    return _manager


@router.post("", response_model=ExecutionSummary)
async def start_execution(workflow_name: str = Query(..., description="Workflow filename")):
    """Start a new workflow execution via Claude CLI."""
    mgr = _get_manager()

    path = WORKFLOWS_DIR / workflow_name
    if not path.exists():
        path = WORKFLOWS_DIR / f"{workflow_name}.yaml"
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"Workflow not found: {workflow_name}")

    try:
        session = await mgr.start_execution(workflow_name, path)
        return ExecutionSummary(**session.to_summary())
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("", response_model=list[ExecutionSummary])
async def list_executions():
    """List all execution sessions."""
    mgr = _get_manager()
    return [ExecutionSummary(**s.to_summary()) for s in mgr.sessions.values()]


@router.get("/{execution_id}", response_model=ExecutionDetail)
async def get_execution(
    execution_id: str,
    offset: int = Query(0, ge=0),
    limit: int = Query(200, ge=1, le=1000),
):
    """Get execution details with paginated events."""
    mgr = _get_manager()
    session = mgr.sessions.get(execution_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Execution not found: {execution_id}")

    total = len(session.events)
    sliced = session.events[offset : offset + limit]
    events = [
        CLIEventResponse(
            timestamp=e.timestamp,
            event_type=e.event_type,
            role=e.role,
            content=e.content,
        )
        for e in sliced
    ]

    summary = session.to_summary()
    return ExecutionDetail(
        **summary,
        events=events,
        total_events=total,
    )


@router.post("/{execution_id}/answer", response_model=ExecutionSummary)
async def answer_question(execution_id: str, body: AnswerQuestionRequest):
    """Answer a pending question for an execution."""
    mgr = _get_manager()
    try:
        session = await mgr.answer_question(execution_id, body.answer)
        return ExecutionSummary(**session.to_summary())
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{execution_id}/stop", response_model=ExecutionSummary)
async def stop_execution(execution_id: str):
    """Stop a running execution."""
    mgr = _get_manager()
    try:
        session = await mgr.stop_execution(execution_id)
        return ExecutionSummary(**session.to_summary())
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
