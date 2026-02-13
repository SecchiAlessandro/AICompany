"""Skills listing API."""
from __future__ import annotations

import re

from fastapi import APIRouter

from dashboard.config import SKILLS_DIR
from dashboard.models.schemas import SkillInfo

router = APIRouter(prefix="/api/skills", tags=["skills"])

META_SKILLS = {"workflow-mapper", "agent-factory", "skill-creator"}


@router.get("", response_model=list[SkillInfo])
async def get_skills():
    """List available skills from .claude/skills/."""
    if not SKILLS_DIR.exists():
        return []
    skills = []
    for skill_dir in sorted(SKILLS_DIR.iterdir()):
        if not skill_dir.is_dir():
            continue
        if skill_dir.name in META_SKILLS:
            continue
        skill_md = skill_dir / "SKILL.md"
        if not skill_md.exists():
            continue

        content = skill_md.read_text(encoding="utf-8")
        name = skill_dir.name
        description = ""

        fm_match = re.match(r'^---\s*\n(.*?)\n---', content, re.S)
        if fm_match:
            fm = fm_match.group(1)
            for line in fm.split("\n"):
                if line.startswith("name:"):
                    name = line.split(":", 1)[1].strip()
                elif line.startswith("description:"):
                    description = line.split(":", 1)[1].strip()

        triggers = _infer_triggers(name)
        skills.append(SkillInfo(name=name, description=description, triggers=triggers))

    return skills


def _infer_triggers(skill_name: str) -> list[str]:
    """Infer file-type triggers for a skill."""
    mapping = {
        "docx": [".docx"],
        "pdf": [".pdf"],
        "xlsx": [".xlsx", ".csv"],
        "pptx": [".pptx"],
        "Jinja2-cv": [".docx"],
        "gog": ["email", "calendar", "drive"],
        "nano-banana-pro": [".png", ".jpg", "image"],
        "frontend-design": [".html", ".tsx", "web"],
        "canvas-design": [".png", "poster", "art"],
        "webapp-testing": ["test", "web"],
    }
    return mapping.get(skill_name, [])
