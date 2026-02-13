"""Parse results/shared.md into structured data.

Reuses regex patterns from .claude/scripts/check_okrs.py (lines 18, 24)
to ensure the UI and stop hook always agree on agent/OKR status.
"""
from __future__ import annotations

import re
from pathlib import Path

from dashboard.models.schemas import (
    AgentSection,
    AgentStatus,
    DependencyEdge,
    DependencyInfo,
    KeyResult,
    KeyResultStatus,
    SharedMdStatus,
    ValidationCriterion,
    WorkflowStatus,
)

# Regex from check_okrs.py line 18
AGENT_SECTION_PATTERN = re.compile(
    r'## AGENT STATUS:\s*(\S+)\s*-\s*(COMPLETED|NOT COMPLETED|PENDING)'
    r'(.*?)(?=\n## |\n---\s*\n## |\Z)',
    re.S | re.I,
)

# Regex from check_okrs.py line 24
KEY_RESULT_PATTERN = re.compile(
    r'(\d+)\.\s*(.+?):\s*(ACHIEVED|NOT ACHIEVED|PENDING)',
    re.I,
)

WORKFLOW_NAME_PATTERN = re.compile(
    r'## WORKFLOW:\s*(.+)', re.I,
)

WORKFLOW_STATUS_PATTERN = re.compile(
    r'## WORKFLOW STATUS:\s*(COMPLETED|IN PROGRESS)', re.I,
)

TIMESTAMP_PATTERN = re.compile(
    r'\*\*Timestamp\*\*:\s*(.+)',
)

OBJECTIVES_PATTERN = re.compile(
    r'### Objectives:\s*\n((?:\s*-\s*.+\n?)+)', re.I,
)

VALIDATION_PATTERN = re.compile(
    r'\s*-\s*\[([ xX])\]\s*(.+)',
)

OUTPUTS_PATTERN = re.compile(
    r'\*\*Outputs\*\*:\s*(.+)', re.I,
)

DEPENDENCY_TABLE_PATTERN = re.compile(
    r'\|\s*(\S+)\s*\|\s*([^|]*)\s*\|\s*([^|]*)\s*\|',
)


def parse_shared_md(path: Path) -> SharedMdStatus:
    """Parse shared.md into a structured SharedMdStatus object."""
    if not path.exists():
        return SharedMdStatus()

    content = path.read_text(encoding="utf-8")
    if not content.strip():
        return SharedMdStatus(raw_content=content)

    result = SharedMdStatus(raw_content=content)

    # Extract workflow name
    wf_match = WORKFLOW_NAME_PATTERN.search(content)
    if wf_match:
        result.workflow_name = wf_match.group(1).strip()

    # Extract workflow status
    ws_match = WORKFLOW_STATUS_PATTERN.search(content)
    if ws_match:
        status_text = ws_match.group(1).strip().upper()
        if status_text == "COMPLETED":
            result.workflow_status = WorkflowStatus.COMPLETED
        elif status_text == "IN PROGRESS":
            result.workflow_status = WorkflowStatus.IN_PROGRESS
    elif wf_match:
        result.workflow_status = WorkflowStatus.IN_PROGRESS

    # Extract timestamp
    ts_match = TIMESTAMP_PATTERN.search(content)
    if ts_match:
        result.timestamp = ts_match.group(1).strip()

    # Extract dependency graph from table
    result.dependencies, result.edges = _parse_dependency_table(content)

    # Extract agent sections
    sections = AGENT_SECTION_PATTERN.findall(content)
    for name, status, body in sections:
        agent = _parse_agent_section(name, status, body)
        result.agents.append(agent)

    return result


def _parse_agent_section(name: str, status: str, body: str) -> AgentSection:
    """Parse a single agent section from shared.md."""
    agent = AgentSection(
        name=name.strip(),
        status=AgentStatus(status.strip().upper()),
    )

    # Extract timestamp
    ts_match = TIMESTAMP_PATTERN.search(body)
    if ts_match:
        agent.timestamp = ts_match.group(1).strip()

    # Extract objectives
    obj_match = OBJECTIVES_PATTERN.search(body)
    if obj_match:
        obj_text = obj_match.group(1)
        agent.objectives = [
            line.strip().lstrip("- ").strip()
            for line in obj_text.strip().split("\n")
            if line.strip().startswith("-")
        ]

    # Extract key results with validation criteria
    agent.key_results = _parse_key_results(body)

    # Extract outputs
    out_match = OUTPUTS_PATTERN.search(body)
    if out_match:
        outputs_text = out_match.group(1).strip()
        if outputs_text.lower() != "tbd":
            agent.outputs = [o.strip() for o in outputs_text.split(",") if o.strip()]

    return agent


def _parse_key_results(body: str) -> list[KeyResult]:
    """Parse key results and their validation criteria from an agent body."""
    key_results: list[KeyResult] = []
    lines = body.split("\n")

    current_kr: KeyResult | None = None
    for line in lines:
        kr_match = KEY_RESULT_PATTERN.match(line.strip())
        if kr_match:
            if current_kr is not None:
                key_results.append(current_kr)
            num, desc, state = kr_match.groups()
            current_kr = KeyResult(
                number=int(num),
                description=desc.strip(),
                status=KeyResultStatus(state.strip().upper()),
            )
            continue

        if current_kr is not None:
            val_match = VALIDATION_PATTERN.match(line)
            if val_match:
                checked = val_match.group(1).lower() == "x"
                text = val_match.group(2).strip()
                current_kr.validation.append(
                    ValidationCriterion(text=text, checked=checked)
                )

    if current_kr is not None:
        key_results.append(current_kr)

    return key_results


def _parse_dependency_table(content: str) -> tuple[list[DependencyInfo], list[DependencyEdge]]:
    """Parse the dependency graph table from shared.md."""
    dependencies: list[DependencyInfo] = []
    edges: list[DependencyEdge] = []

    matches = DEPENDENCY_TABLE_PATTERN.findall(content)
    for role, depends_on, outputs_used_by in matches:
        role = role.strip()
        if role.lower() in ("role", "---", ""):
            continue

        dep_list = [
            d.strip() for d in depends_on.split(",")
            if d.strip() and d.strip().lower() not in ("(none)", "none", "-")
        ]
        out_list = [
            o.strip() for o in outputs_used_by.split(",")
            if o.strip() and o.strip().lower() not in ("(final)", "final", "-")
        ]

        dependencies.append(DependencyInfo(
            role=role,
            depends_on=dep_list,
            outputs_used_by=out_list,
        ))

        for dep in dep_list:
            edges.append(DependencyEdge(source=dep, target=role))

    return dependencies, edges
