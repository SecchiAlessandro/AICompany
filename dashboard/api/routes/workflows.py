"""Workflow CRUD API."""
from fastapi import APIRouter, HTTPException
from fastapi.responses import PlainTextResponse

from dashboard.config import WORKFLOWS_DIR
from dashboard.models.schemas import Workflow, WorkflowCreateRequest, WorkflowSummary
from dashboard.services.workflow_parser import list_workflows, parse_workflow

router = APIRouter(prefix="/api/workflows", tags=["workflows"])


@router.get("", response_model=list[WorkflowSummary])
async def get_workflows():
    """List all workflow YAMLs."""
    return list_workflows(WORKFLOWS_DIR)


@router.get("/{name}", response_model=Workflow)
async def get_workflow(name: str):
    """Parse a specific workflow YAML into JSON."""
    path = WORKFLOWS_DIR / name
    if not path.exists():
        path = WORKFLOWS_DIR / f"{name}.yaml"
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"Workflow not found: {name}")
    return parse_workflow(path)


@router.get("/{name}/raw")
async def get_workflow_raw(name: str):
    """Return raw YAML content of a workflow."""
    path = WORKFLOWS_DIR / name
    if not path.exists():
        path = WORKFLOWS_DIR / f"{name}.yaml"
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"Workflow not found: {name}")
    return PlainTextResponse(path.read_text(encoding="utf-8"))


@router.post("", response_model=dict)
async def create_workflow(req: WorkflowCreateRequest):
    """Save a new workflow YAML file."""
    filename = req.filename
    if not filename.endswith(".yaml"):
        filename += ".yaml"
    path = WORKFLOWS_DIR / filename
    WORKFLOWS_DIR.mkdir(parents=True, exist_ok=True)
    path.write_text(req.content, encoding="utf-8")
    return {"status": "created", "filename": filename}


@router.delete("/{name}")
async def delete_workflow(name: str):
    """Delete a workflow YAML file."""
    path = WORKFLOWS_DIR / name
    if not path.exists():
        path = WORKFLOWS_DIR / f"{name}.yaml"
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"Workflow not found: {name}")
    path.unlink()
    return {"status": "deleted", "filename": path.name}
