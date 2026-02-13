"""Agent definitions API."""
from __future__ import annotations

import re

from fastapi import APIRouter, HTTPException

from dashboard.config import AGENTS_DIR
from dashboard.models.schemas import AgentDefinition

router = APIRouter(prefix="/api/agents", tags=["agents"])

FRONTMATTER_PATTERN = re.compile(r'^---\s*\n(.*?)\n---', re.S)


def _parse_agent_md(path) -> AgentDefinition:
    """Parse an agent .md file extracting frontmatter metadata."""
    content = path.read_text(encoding="utf-8")
    name = path.stem
    description = ""
    tools = ""
    skills = ""

    fm_match = FRONTMATTER_PATTERN.match(content)
    if fm_match:
        fm = fm_match.group(1)
        for line in fm.split("\n"):
            if line.startswith("description:"):
                description = line.split(":", 1)[1].strip()
            elif line.startswith("tools:"):
                tools = line.split(":", 1)[1].strip()
            elif line.startswith("skills:"):
                skills = line.split(":", 1)[1].strip()
            elif line.startswith("name:"):
                name = line.split(":", 1)[1].strip()

    return AgentDefinition(
        name=name,
        filename=path.name,
        description=description,
        tools=tools,
        skills=skills,
        content=content,
    )


@router.get("", response_model=list[AgentDefinition])
async def get_agents():
    """List all agent .md files."""
    if not AGENTS_DIR.exists():
        return []
    agents = []
    for path in sorted(AGENTS_DIR.glob("*.md")):
        if path.name == "CLAUDE.md":
            continue
        agents.append(_parse_agent_md(path))
    return agents


@router.get("/{name}", response_model=AgentDefinition)
async def get_agent(name: str):
    """Read a specific agent definition."""
    path = AGENTS_DIR / f"{name}.md"
    if not path.exists():
        path = AGENTS_DIR / name
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"Agent not found: {name}")
    return _parse_agent_md(path)
