"""Parse workflow YAML files into Pydantic models."""
from __future__ import annotations

from pathlib import Path

import yaml

from dashboard.models.schemas import (
    InputOutput,
    KnowledgeSource,
    OKR,
    Precondition,
    Role,
    Skill,
    Tool,
    Workflow,
    WorkflowKeyResult,
    WorkflowSummary,
)


def parse_workflow(path: Path) -> Workflow:
    """Parse a workflow YAML file into a Workflow model."""
    content = path.read_text(encoding="utf-8")
    data = yaml.safe_load(content) or {}
    return _build_workflow(data)


def parse_workflow_from_string(content: str) -> Workflow:
    """Parse a workflow YAML string into a Workflow model."""
    data = yaml.safe_load(content) or {}
    return _build_workflow(data)


def _build_workflow(data: dict) -> Workflow:
    """Build a Workflow model from parsed YAML data."""
    roles = []
    for person in data.get("people_involved", []):
        tools = [
            Tool(name=t.get("name", ""), purpose=t.get("purpose", ""))
            for t in (person.get("tools") or [])
            if isinstance(t, dict)
        ]
        skills = [
            Skill(name=s.get("name", ""), purpose=s.get("purpose", ""))
            for s in (person.get("skills") or [])
            if isinstance(s, dict)
        ]
        knowledge_sources = [
            KnowledgeSource(
                name=ks.get("name", ""),
                purpose=ks.get("purpose", ""),
                path=ks.get("path", ""),
            )
            for ks in (person.get("knowledge_sources") or [])
            if isinstance(ks, dict)
        ]
        inputs_outputs = []
        for io in person.get("inputs_outputs") or []:
            if isinstance(io, dict):
                inputs_outputs.append(InputOutput(
                    inputs=io.get("inputs", ""),
                    outputs=io.get("outputs", ""),
                ))
        preconditions = [
            Precondition(
                name=p.get("name", ""),
                description=p.get("description", ""),
                verification=p.get("verification", ""),
            )
            for p in (person.get("preconditions") or [])
            if isinstance(p, dict)
        ]
        okr = None
        okr_data = person.get("okr")
        if okr_data and isinstance(okr_data, dict):
            key_results = []
            for kr in okr_data.get("key_results") or []:
                if isinstance(kr, dict):
                    key_results.append(WorkflowKeyResult(
                        result=kr.get("result", ""),
                        validation=kr.get("validation") or [],
                    ))
                elif isinstance(kr, str):
                    key_results.append(WorkflowKeyResult(result=kr))
            okr = OKR(
                objectives=okr_data.get("objectives") or [],
                key_results=key_results,
            )
        roles.append(Role(
            role=person.get("role", ""),
            description=person.get("description", ""),
            tools=tools,
            skills=skills,
            knowledge_sources=knowledge_sources,
            inputs_outputs=inputs_outputs,
            preconditions=preconditions,
            okr=okr,
        ))

    return Workflow(
        name=data.get("name", ""),
        overview=data.get("overview", ""),
        people_involved=roles,
    )


def list_workflows(workflows_dir: Path) -> list[WorkflowSummary]:
    """List all workflow YAML files with summaries."""
    summaries = []
    if not workflows_dir.exists():
        return summaries
    for path in sorted(workflows_dir.glob("*.yaml")):
        if path.name == "workflow-template.yaml":
            continue
        try:
            wf = parse_workflow(path)
            summaries.append(WorkflowSummary(
                name=wf.name,
                filename=path.name,
                overview=wf.overview,
                role_count=len(wf.people_involved),
            ))
        except Exception:
            summaries.append(WorkflowSummary(
                name=path.stem,
                filename=path.name,
                overview="(parse error)",
            ))
    return summaries
