"""FastAPI entry point for the AICompany Dashboard."""
from __future__ import annotations

import asyncio
import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from dashboard.api.routes import agents, execute, history, results, skills, status, workflows
from dashboard.api.websocket import manager, websocket_endpoint
from dashboard.config import AGENTS_DIR, RESULTS_DIR, SHARED_MD, WORKFLOWS_DIR
from dashboard.services.file_watcher import FileWatcher
from dashboard.services.shared_md_parser import parse_shared_md

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

watcher = FileWatcher()


async def on_file_change(event_type: str, file_path: str) -> None:
    """Handle filesystem changes and broadcast via WebSocket."""
    path = Path(file_path)
    logger.debug("File event: %s %s", event_type, path)

    if path.name == "shared.md" or str(RESULTS_DIR) in file_path:
        status_data = parse_shared_md(SHARED_MD)
        await manager.broadcast("status_update", status_data.model_dump())

    if str(WORKFLOWS_DIR) in file_path:
        await manager.broadcast("workflow_change", {"path": file_path, "event": event_type})

    if str(AGENTS_DIR) in file_path:
        await manager.broadcast("agent_change", {"path": file_path, "event": event_type})

    if str(RESULTS_DIR) in file_path and path.name != "shared.md":
        await manager.broadcast("result_file_change", {
            "path": file_path,
            "name": path.name,
            "event": event_type,
        })


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Start/stop the file watcher with the app lifecycle."""
    loop = asyncio.get_event_loop()
    watch_paths = [RESULTS_DIR, WORKFLOWS_DIR, AGENTS_DIR]
    watcher.watch(watch_paths, on_file_change, loop)
    watcher.start()
    yield
    watcher.stop()


app = FastAPI(
    title="AICompany Dashboard",
    description="Web UI for Agent Workflow Orchestrator",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register REST routes
app.include_router(status.router)
app.include_router(workflows.router)
app.include_router(agents.router)
app.include_router(results.router)
app.include_router(history.router)
app.include_router(execute.router)
app.include_router(skills.router)

# Register WebSocket
app.add_api_route("/ws", websocket_endpoint, methods=["GET"])
app.add_websocket_route("/ws", websocket_endpoint)

# Serve frontend static files in production
FRONTEND_DIST = Path(__file__).parent / "frontend" / "dist"
if FRONTEND_DIST.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIST), html=True), name="frontend")
