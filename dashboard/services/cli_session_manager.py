"""CLI Session Manager — spawns Claude Code as a subprocess with stream-json output."""
from __future__ import annotations

import asyncio
import json
import logging
import os
import shutil
import uuid
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Any, Callable, Coroutine, Optional

logger = logging.getLogger(__name__)


class ExecutionState(str, Enum):
    STARTING = "starting"
    RUNNING = "running"
    AWAITING_INPUT = "awaiting_input"
    COMPLETED = "completed"
    FAILED = "failed"
    STOPPED = "stopped"


@dataclass
class CLIEvent:
    timestamp: str
    event_type: str  # text, tool_use, tool_result, result, system_summary, stderr, raw_text
    role: str  # assistant, system, user, tool, error
    content: dict[str, Any]
    raw: dict[str, Any] | None = None


@dataclass
class PendingQuestion:
    text: str
    context: str = ""


@dataclass
class ExecutionSession:
    id: str
    workflow_name: str
    session_type: str = "execution"
    cli_session_id: str | None = None
    state: ExecutionState = ExecutionState.STARTING
    started_at: str = ""
    completed_at: str | None = None
    events: list[CLIEvent] = field(default_factory=list)
    pending_question: PendingQuestion | None = None
    process: Optional[asyncio.subprocess.Process] = None
    cost_usd: float = 0.0
    duration_ms: int = 0
    error: str | None = None

    def to_summary(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "workflow_name": self.workflow_name,
            "session_type": self.session_type,
            "cli_session_id": self.cli_session_id,
            "state": self.state.value,
            "started_at": self.started_at,
            "completed_at": self.completed_at,
            "event_count": len(self.events),
            "pending_question": (
                {"text": self.pending_question.text, "context": self.pending_question.context}
                if self.pending_question
                else None
            ),
            "cost_usd": self.cost_usd,
            "duration_ms": self.duration_ms,
            "error": self.error,
        }


EventCallback = Callable[[str, str, dict[str, Any]], Coroutine[Any, Any, None]]


class CLISessionManager:
    """Manages Claude CLI subprocess executions with stream-json output."""

    def __init__(self, base_dir: Path) -> None:
        self.base_dir = base_dir
        self.sessions: dict[str, ExecutionSession] = {}
        self._callback: EventCallback | None = None
        self._tasks: dict[str, list[asyncio.Task]] = {}

    def set_event_callback(self, callback: EventCallback) -> None:
        self._callback = callback

    async def _emit(self, execution_id: str, event_type: str, data: dict[str, Any]) -> None:
        if self._callback:
            try:
                await self._callback(execution_id, event_type, data)
            except Exception:
                logger.exception("Event callback error for %s", execution_id)

    async def start_execution(self, workflow_name: str, workflow_path: Path) -> ExecutionSession:
        claude_bin = shutil.which("claude")
        if not claude_bin:
            raise RuntimeError("Claude Code CLI not found in PATH")
        if not workflow_path.exists():
            raise FileNotFoundError(f"Workflow not found: {workflow_path}")

        session_id = str(uuid.uuid4())[:8]
        session = ExecutionSession(
            id=session_id,
            workflow_name=workflow_name,
            started_at=datetime.now().isoformat(),
        )
        self.sessions[session_id] = session

        prompt = f"@orchestrator workflows/{workflow_name}"
        cmd = [
            claude_bin,
            "-p", prompt,
            "--output-format", "stream-json",
            "--verbose",
            "--dangerously-skip-permissions",
        ]

        # Strip CLAUDECODE env var to avoid nested session error
        env = {k: v for k, v in os.environ.items() if k != "CLAUDECODE"}

        try:
            process = await asyncio.create_subprocess_exec(
                *cmd,
                cwd=str(self.base_dir),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                env=env,
            )
            session.process = process
            session.state = ExecutionState.RUNNING

            await self._emit(session_id, "execution_state_change", {
                "execution_id": session_id,
                "state": session.state.value,
                "execution": session.to_summary(),
            })

            # Start background readers
            tasks = [
                asyncio.create_task(self._read_stream(session)),
                asyncio.create_task(self._read_stderr(session)),
            ]
            self._tasks[session_id] = tasks

            logger.info("Started execution %s (PID %s) for %s", session_id, process.pid, workflow_name)
            return session

        except Exception as e:
            session.state = ExecutionState.FAILED
            session.error = str(e)
            session.completed_at = datetime.now().isoformat()
            await self._emit(session_id, "execution_state_change", {
                "execution_id": session_id,
                "state": session.state.value,
                "execution": session.to_summary(),
            })
            raise

    async def start_workflow_session(self, goal: str) -> ExecutionSession:
        """Start a workflow-creation session via @workflow-mapper."""
        claude_bin = shutil.which("claude")
        if not claude_bin:
            raise RuntimeError("Claude Code CLI not found in PATH")

        session_id = str(uuid.uuid4())[:8]
        session = ExecutionSession(
            id=session_id,
            workflow_name="workflow-creation",
            session_type="workflow_creation",
            started_at=datetime.now().isoformat(),
        )
        self.sessions[session_id] = session

        prompt = f"@workflow-mapper\n{goal}"
        cmd = [
            claude_bin,
            "-p", prompt,
            "--output-format", "stream-json",
            "--verbose",
            "--dangerously-skip-permissions",
        ]

        env = {k: v for k, v in os.environ.items() if k != "CLAUDECODE"}

        try:
            process = await asyncio.create_subprocess_exec(
                *cmd,
                cwd=str(self.base_dir),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                env=env,
            )
            session.process = process
            session.state = ExecutionState.RUNNING

            await self._emit(session_id, "execution_state_change", {
                "execution_id": session_id,
                "state": session.state.value,
                "execution": session.to_summary(),
            })

            tasks = [
                asyncio.create_task(self._read_stream(session)),
                asyncio.create_task(self._read_stderr(session)),
            ]
            self._tasks[session_id] = tasks

            logger.info("Started workflow session %s (PID %s) for goal: %s", session_id, process.pid, goal[:80])
            return session

        except Exception as e:
            session.state = ExecutionState.FAILED
            session.error = str(e)
            session.completed_at = datetime.now().isoformat()
            await self._emit(session_id, "execution_state_change", {
                "execution_id": session_id,
                "state": session.state.value,
                "execution": session.to_summary(),
            })
            raise

    async def answer_question(self, execution_id: str, answer: str) -> ExecutionSession:
        session = self.sessions.get(execution_id)
        if not session:
            raise KeyError(f"Execution not found: {execution_id}")
        if session.state != ExecutionState.AWAITING_INPUT:
            raise ValueError(f"Execution {execution_id} is not awaiting input (state: {session.state.value})")
        if not session.cli_session_id:
            raise ValueError(f"No CLI session ID for execution {execution_id}")

        claude_bin = shutil.which("claude")
        if not claude_bin:
            raise RuntimeError("Claude Code CLI not found in PATH")

        session.pending_question = None
        session.state = ExecutionState.RUNNING

        await self._emit(execution_id, "execution_state_change", {
            "execution_id": execution_id,
            "state": session.state.value,
            "execution": session.to_summary(),
        })

        cmd = [
            claude_bin,
            "-p", answer,
            "--resume", session.cli_session_id,
            "--output-format", "stream-json",
            "--verbose",
            "--dangerously-skip-permissions",
        ]

        env = {k: v for k, v in os.environ.items() if k != "CLAUDECODE"}

        try:
            process = await asyncio.create_subprocess_exec(
                *cmd,
                cwd=str(self.base_dir),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                env=env,
            )
            session.process = process

            # Cancel old tasks if any
            for task in self._tasks.get(execution_id, []):
                task.cancel()

            tasks = [
                asyncio.create_task(self._read_stream(session)),
                asyncio.create_task(self._read_stderr(session)),
            ]
            self._tasks[execution_id] = tasks

            logger.info("Resumed execution %s with answer", execution_id)
            return session

        except Exception as e:
            session.state = ExecutionState.FAILED
            session.error = str(e)
            session.completed_at = datetime.now().isoformat()
            await self._emit(execution_id, "execution_state_change", {
                "execution_id": execution_id,
                "state": session.state.value,
                "execution": session.to_summary(),
            })
            raise

    async def stop_execution(self, execution_id: str) -> ExecutionSession:
        session = self.sessions.get(execution_id)
        if not session:
            raise KeyError(f"Execution not found: {execution_id}")
        if session.state in (ExecutionState.COMPLETED, ExecutionState.FAILED, ExecutionState.STOPPED):
            return session

        if session.process and session.process.returncode is None:
            try:
                session.process.terminate()
                try:
                    await asyncio.wait_for(session.process.wait(), timeout=5.0)
                except asyncio.TimeoutError:
                    session.process.kill()
                    await session.process.wait()
            except ProcessLookupError:
                pass

        session.state = ExecutionState.STOPPED
        session.completed_at = datetime.now().isoformat()

        # Cancel background tasks
        for task in self._tasks.get(execution_id, []):
            task.cancel()
        self._tasks.pop(execution_id, None)

        await self._emit(execution_id, "execution_state_change", {
            "execution_id": execution_id,
            "state": session.state.value,
            "execution": session.to_summary(),
        })

        logger.info("Stopped execution %s", execution_id)
        return session

    async def _read_stream(self, session: ExecutionSession) -> None:
        """Read NDJSON lines from stdout and classify events."""
        assert session.process and session.process.stdout

        last_assistant_text = ""

        try:
            async for line_bytes in session.process.stdout:
                line = line_bytes.decode("utf-8", errors="replace").strip()
                if not line:
                    continue

                try:
                    data = json.loads(line)
                except json.JSONDecodeError:
                    # Raw text output
                    event = CLIEvent(
                        timestamp=datetime.now().isoformat(),
                        event_type="raw_text",
                        role="system",
                        content={"text": line},
                    )
                    session.events.append(event)
                    await self._emit_cli_event(session.id, event)
                    continue

                event = self._classify_event(data)
                session.events.append(event)
                await self._emit_cli_event(session.id, event)

                # Track session ID from result events
                if event.event_type == "result" and data.get("session_id"):
                    session.cli_session_id = data["session_id"]

                # Track cost/duration from result events
                if event.event_type == "result":
                    if "cost_usd" in data:
                        session.cost_usd += data["cost_usd"]
                    if "duration_ms" in data:
                        session.duration_ms += data["duration_ms"]
                    if data.get("session_id"):
                        session.cli_session_id = data["session_id"]

                # Detect AskUserQuestion tool_use blocks
                if event.role == "assistant" and event.event_type in ("tool_use", "text"):
                    tools_list = event.content.get("tools") or []
                    for tool_info in tools_list:
                        if tool_info.get("name") == "AskUserQuestion" and isinstance(tool_info.get("_raw_input"), dict):
                            parsed = self._parse_ask_user_questions(tool_info["_raw_input"])
                            session.state = ExecutionState.AWAITING_INPUT
                            questions = parsed.get("questions", [])
                            question_text = questions[0].get("question", "") if questions else "Structured question"
                            session.pending_question = PendingQuestion(
                                text=question_text,
                                context="The assistant is asking structured questions.",
                            )
                            await self._emit(session.id, "structured_question_detected", {
                                "execution_id": session.id,
                                "questions": questions,
                            })
                            await self._emit(session.id, "execution_state_change", {
                                "execution_id": session.id,
                                "state": session.state.value,
                                "execution": session.to_summary(),
                            })

                # Track last assistant text for question detection
                if event.role == "assistant" and event.event_type == "text":
                    text = event.content.get("text", "")
                    if text:
                        last_assistant_text = text

                # Detect question from result event
                if event.event_type == "result":
                    stop_reason = data.get("stop_reason", "")
                    if stop_reason == "end_turn" and last_assistant_text.rstrip().endswith("?"):
                        session.state = ExecutionState.AWAITING_INPUT
                        session.pending_question = PendingQuestion(
                            text=last_assistant_text.strip(),
                            context="The assistant is waiting for your response.",
                        )
                        await self._emit(session.id, "question_detected", {
                            "execution_id": session.id,
                            "question": {
                                "text": session.pending_question.text,
                                "context": session.pending_question.context,
                            },
                        })
                        await self._emit(session.id, "execution_state_change", {
                            "execution_id": session.id,
                            "state": session.state.value,
                            "execution": session.to_summary(),
                        })

        except asyncio.CancelledError:
            return
        except Exception:
            logger.exception("Error reading stream for %s", session.id)

        # Wait for process to finish
        if session.process.returncode is None:
            await session.process.wait()

        if session.state not in (ExecutionState.AWAITING_INPUT, ExecutionState.STOPPED):
            if session.process.returncode == 0:
                session.state = ExecutionState.COMPLETED
            else:
                session.state = ExecutionState.FAILED
                session.error = f"Process exited with code {session.process.returncode}"
            session.completed_at = datetime.now().isoformat()

            await self._emit(session.id, "execution_state_change", {
                "execution_id": session.id,
                "state": session.state.value,
                "execution": session.to_summary(),
            })

    async def _read_stderr(self, session: ExecutionSession) -> None:
        """Read stderr and emit as events."""
        assert session.process and session.process.stderr

        try:
            async for line_bytes in session.process.stderr:
                line = line_bytes.decode("utf-8", errors="replace").strip()
                if not line:
                    continue

                event = CLIEvent(
                    timestamp=datetime.now().isoformat(),
                    event_type="stderr",
                    role="error",
                    content={"text": line},
                )
                session.events.append(event)
                await self._emit_cli_event(session.id, event)
        except asyncio.CancelledError:
            return
        except Exception:
            logger.exception("Error reading stderr for %s", session.id)

    def _classify_event(self, data: dict[str, Any]) -> CLIEvent:
        """Classify a parsed JSON event from stream-json output."""
        event_type = data.get("type", "unknown")
        timestamp = datetime.now().isoformat()

        # assistant message events
        if event_type == "assistant":
            msg = data.get("message", {})
            content_blocks = msg.get("content", [])
            texts = []
            tools = []
            for block in content_blocks:
                if block.get("type") == "text":
                    texts.append(block.get("text", ""))
                elif block.get("type") == "tool_use":
                    tool_name = block.get("name", "")
                    raw_input = block.get("input", {})
                    tools.append({
                        "name": tool_name,
                        "input": _truncate(json.dumps(raw_input), 200),
                    })
                    # Preserve raw input dict for AskUserQuestion detection in _read_stream
                    if tool_name == "AskUserQuestion":
                        tools[-1]["_raw_input"] = raw_input

            if tools and not texts:
                return CLIEvent(
                    timestamp=timestamp,
                    event_type="tool_use",
                    role="assistant",
                    content={"tools": tools},
                    raw=data,
                )
            return CLIEvent(
                timestamp=timestamp,
                event_type="text",
                role="assistant",
                content={"text": "\n".join(texts), "tools": tools if tools else None},
                raw=data,
            )

        # content_block_delta (streaming text chunks)
        if event_type == "content_block_delta":
            delta = data.get("delta", {})
            if delta.get("type") == "text_delta":
                return CLIEvent(
                    timestamp=timestamp,
                    event_type="text",
                    role="assistant",
                    content={"text": delta.get("text", "")},
                    raw=data,
                )
            return CLIEvent(
                timestamp=timestamp,
                event_type="text",
                role="assistant",
                content={"text": ""},
                raw=data,
            )

        # tool result
        if event_type == "tool_result":
            content = data.get("content", "")
            if isinstance(content, list):
                content = " ".join(
                    block.get("text", "") for block in content if isinstance(block, dict)
                )
            return CLIEvent(
                timestamp=timestamp,
                event_type="tool_result",
                role="tool",
                content={"text": _truncate(str(content), 500)},
                raw=data,
            )

        # result (final)
        if event_type == "result":
            result_text = ""
            result_data = data.get("result", "")
            if isinstance(result_data, str):
                result_text = result_data
            elif isinstance(result_data, dict):
                result_text = result_data.get("text", str(result_data))
            return CLIEvent(
                timestamp=timestamp,
                event_type="result",
                role="system",
                content={
                    "text": _truncate(result_text, 500),
                    "cost_usd": data.get("cost_usd"),
                    "duration_ms": data.get("duration_ms"),
                    "session_id": data.get("session_id"),
                },
                raw=data,
            )

        # system message
        if event_type == "system":
            return CLIEvent(
                timestamp=timestamp,
                event_type="system_summary",
                role="system",
                content={"text": str(data.get("message", data.get("text", "")))},
                raw=data,
            )

        # fallback
        return CLIEvent(
            timestamp=timestamp,
            event_type=event_type,
            role="system",
            content={"text": _truncate(json.dumps(data), 300)},
            raw=data,
        )

    @staticmethod
    def _parse_ask_user_questions(tool_input: dict) -> dict:
        """Extract structured question data from an AskUserQuestion tool input.

        The AskUserQuestion tool input contains a ``questions`` array where each
        entry has ``question``, ``header``, ``options`` (optional), and ``multiSelect``.
        """
        questions = tool_input.get("questions", [])
        return {
            "questions": questions,
        }

    async def _emit_cli_event(self, execution_id: str, event: CLIEvent) -> None:
        await self._emit(execution_id, "cli_event", {
            "execution_id": execution_id,
            "timestamp": event.timestamp,
            "event_type": event.event_type,
            "role": event.role,
            "content": event.content,
        })


def _truncate(text: str, max_len: int) -> str:
    if len(text) <= max_len:
        return text
    return text[: max_len - 3] + "..."
