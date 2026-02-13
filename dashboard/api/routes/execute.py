"""Workflow execution API."""
from fastapi import APIRouter, HTTPException

from dashboard.config import BASE_DIR, WORKFLOWS_DIR
from dashboard.services.execution_service import execute_workflow

router = APIRouter(prefix="/api/workflows", tags=["execute"])


@router.post("/{name}/execute")
async def trigger_execution(name: str):
    """Trigger workflow execution via Claude Code subprocess."""
    path = WORKFLOWS_DIR / name
    if not path.exists():
        path = WORKFLOWS_DIR / f"{name}.yaml"
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"Workflow not found: {name}")

    result = await execute_workflow(path, BASE_DIR)
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result.get("error", "Execution failed"))
    return result
