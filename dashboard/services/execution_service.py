"""Service for triggering workflow execution via subprocess."""
from __future__ import annotations

import asyncio
import logging
import shutil
from pathlib import Path

logger = logging.getLogger(__name__)


async def execute_workflow(workflow_path: Path, base_dir: Path) -> dict:
    """Trigger workflow execution by spawning Claude Code orchestrator.

    Returns a dict with execution status info.
    """
    claude_bin = shutil.which("claude")
    if not claude_bin:
        return {
            "success": False,
            "error": "Claude Code CLI not found in PATH",
        }

    if not workflow_path.exists():
        return {
            "success": False,
            "error": f"Workflow file not found: {workflow_path}",
        }

    cmd = [
        claude_bin,
        "--agent", "orchestrator",
        "--prompt", f"@orchestrator workflows/{workflow_path.name}",
    ]

    try:
        process = await asyncio.create_subprocess_exec(
            *cmd,
            cwd=str(base_dir),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        logger.info(
            "Started workflow execution: PID=%s, workflow=%s",
            process.pid,
            workflow_path.name,
        )
        return {
            "success": True,
            "pid": process.pid,
            "workflow": workflow_path.name,
        }
    except Exception as e:
        logger.exception("Failed to start workflow execution")
        return {
            "success": False,
            "error": str(e),
        }
