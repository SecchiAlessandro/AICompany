"""FastAPI entry point for the AICompany Dashboard."""
from __future__ import annotations

import asyncio
import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from dashboard.api.routes import agents, execute, executions, history, results, skills, status, workflows, workflow_sessions
from dashboard.api.websocket import manager, websocket_endpoint
from dashboard.config import AGENTS_DIR, BASE_DIR, RESULTS_DIR, SHARED_MD, WORKFLOWS_DIR
from dashboard.services.cli_session_manager import CLISessionManager
from dashboard.services.file_watcher import FileWatcher
from dashboard.services.shared_md_parser import parse_shared_md

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

watcher = FileWatcher()
cli_manager = CLISessionManager(BASE_DIR)


async def cli_event_callback(execution_id: str, event_type: str, data: dict) -> None:
    """Bridge CLI session events to WebSocket broadcast."""
    await manager.broadcast(event_type, data)


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
    cli_manager.set_event_callback(cli_event_callback)
    executions.set_session_manager(cli_manager)
    workflow_sessions.set_session_manager(cli_manager)
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
app.include_router(executions.router)
app.include_router(skills.router)
app.include_router(workflow_sessions.router)

# Register WebSocket
app.add_api_route("/ws", websocket_endpoint, methods=["GET"])
app.add_websocket_route("/ws", websocket_endpoint)

# Serve frontend static files in production
FRONTEND_DIST = Path(__file__).parent / "frontend" / "dist"
if FRONTEND_DIST.exists():
    # Serve static assets (JS, CSS, images) from dist/assets
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="static-assets")

    # SPA catch-all: serve index.html for any non-API route
    @app.get("/{full_path:path}")
    async def spa_fallback(request: Request, full_path: str):
        """Serve index.html for all client-side routes (SPA fallback)."""
        # Check if requested file exists in dist (e.g. favicon.ico, robots.txt)
        file_path = FRONTEND_DIST / full_path
        if full_path and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIST / "index.html")
