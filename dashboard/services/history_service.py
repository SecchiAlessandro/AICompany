"""Service for managing workflow run history."""
from __future__ import annotations

import json
import uuid
from datetime import datetime
from pathlib import Path

from dashboard.models.schemas import HistoryEntry, SharedMdStatus


def load_history(history_file: Path) -> list[HistoryEntry]:
    """Load history from JSON file."""
    if not history_file.exists():
        return []
    try:
        data = json.loads(history_file.read_text(encoding="utf-8"))
        return [HistoryEntry(**entry) for entry in data]
    except (json.JSONDecodeError, Exception):
        return []


def save_history(history_file: Path, entries: list[HistoryEntry]) -> None:
    """Save history to JSON file."""
    history_file.write_text(
        json.dumps([e.model_dump() for e in entries], indent=2),
        encoding="utf-8",
    )


def snapshot_workflow(
    history_file: Path,
    status: SharedMdStatus,
) -> HistoryEntry:
    """Create a history snapshot from current workflow status."""
    kr_total = sum(len(a.key_results) for a in status.agents)
    kr_achieved = sum(
        1
        for a in status.agents
        for kr in a.key_results
        if kr.status.value == "ACHIEVED"
    )

    entry = HistoryEntry(
        id=str(uuid.uuid4()),
        workflow_name=status.workflow_name or "unknown",
        started_at=status.timestamp or datetime.now().isoformat(),
        completed_at=datetime.now().isoformat(),
        status=status.workflow_status.value,
        agent_count=len(status.agents),
        kr_total=kr_total,
        kr_achieved=kr_achieved,
    )

    entries = load_history(history_file)
    entries.append(entry)
    save_history(history_file, entries)
    return entry
