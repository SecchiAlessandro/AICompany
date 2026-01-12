#!/usr/bin/env python3
"""
OKR Validation Script for Stop Hook

Validates that agents write completion status to results/shared.md before stopping.
- For sub-agents: Blocks until agent marks status as COMPLETED
- For orchestrator: Blocks until WORKFLOW STATUS: COMPLETED
"""
import os
import sys
import re
import yaml
import json
from pathlib import Path


def get_project_root():
    """Get project root from environment or current path."""
    return os.environ.get('CLAUDE_PROJECT_DIR', Path.cwd())


def read_shared_md(project_root):
    """Read the shared.md coordination file."""
    shared_path = Path(project_root) / 'results' / 'shared.md'
    return shared_path.read_text(encoding='utf-8') if shared_path.exists() else None


def extract_agent_statuses(content):
    """
    Parse all agent status markers from shared.md.
    Returns dict: {agent_name: status}

    Looks for: ## AGENT STATUS: <role-name> - COMPLETED|IN PROGRESS
    """
    pattern = r'## AGENT STATUS:\s*(\S+)\s*-\s*(COMPLETED|IN PROGRESS)'
    matches = re.findall(pattern, content, re.IGNORECASE)
    # Return last status for each agent (in case of updates)
    statuses = {}
    for agent, status in matches:
        statuses[agent.lower()] = status.upper()
    return statuses


def get_current_agent(content):
    """
    Find the currently running agent from shared.md.
    Returns the most recent agent marked as IN PROGRESS.
    """
    pattern = r'## AGENT STATUS:\s*(\S+)\s*-\s*IN PROGRESS'
    matches = re.findall(pattern, content, re.IGNORECASE)
    return matches[-1].lower() if matches else None


def check_workflow_completed(content):
    """Check if the entire workflow is marked as completed."""
    completed_markers = [
        'WORKFLOW STATUS: COMPLETED',
        'All OKRs ACHIEVED',
        'Final Status: All objectives achieved'
    ]
    for marker in completed_markers:
        if marker.lower() in content.lower():
            return True
    return False


def extract_workflow_name(content):
    """Extract workflow name from shared.md."""
    match = re.search(r'\*\*Workflow\*\*:\s*([^\n]+)', content)
    return match.group(1).strip() if match else None


def load_workflow_okrs(project_root, workflow_name):
    """Load OKRs from workflow YAML file."""
    if not workflow_name:
        return None
    yaml_path = Path(project_root) / 'workflows' / f'{workflow_name}.yaml'
    if not yaml_path.exists():
        return None
    try:
        with open(yaml_path, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f).get('okr', {})
    except Exception:
        return None


def build_block_response(reason):
    """Build the JSON response to block Claude from stopping."""
    return {
        "ok": False,
        "reason": reason
    }


def build_approve_response():
    """Build the JSON response to allow Claude to stop."""
    return {
        "ok": True
    }


def main():
    # Set UTF-8 encoding for stdout on Windows
    if sys.platform == 'win32':
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

    project_root = get_project_root()
    content = read_shared_md(project_root)

    # No shared.md means no active workflow - allow stop
    if not content or not content.strip():
        result = build_approve_response()
        print(json.dumps(result))
        return 0

    # Extract context
    all_statuses = extract_agent_statuses(content)
    current_agent = get_current_agent(content)
    workflow_name = extract_workflow_name(content)

    # Case 1: Sub-agent context (there's an agent IN PROGRESS)
    if current_agent:
        agent_status = all_statuses.get(current_agent)

        if agent_status == 'COMPLETED':
            # Agent has completed - allow stop
            result = build_approve_response()
            print(json.dumps(result))
            return 0
        else:
            # Agent hasn't completed - block and retry
            reason = (
                f"CRITICAL: Agent '{current_agent}' has not marked status as COMPLETED.\n\n"
                f"Before stopping, you MUST:\n"
                f"1. Complete your assigned tasks\n"
                f"2. Write your outputs to results/ folder\n"
                f"3. Append to results/shared.md:\n"
                f"   ## AGENT STATUS: {current_agent} - COMPLETED\n"
                f"   **Key Results**: ACHIEVED\n\n"
                f"Continue working and update your status when done."
            )
            response = build_block_response(reason)
            print(json.dumps(response))
            return 0

    # Case 2: Orchestrator context (no agent IN PROGRESS, check workflow completion)
    if check_workflow_completed(content):
        result = build_approve_response()
        print(json.dumps(result))
        return 0

    # Workflow not complete - block orchestrator
    okrs = load_workflow_okrs(project_root, workflow_name)

    reason = (
        f"CRITICAL: Workflow '{workflow_name or 'unknown'}' is NOT complete.\n\n"
        f"The workflow must reach COMPLETED status before stopping.\n\n"
    )

    if okrs:
        reason += "Outstanding objectives:\n"
        for obj in okrs.get('objectives', []):
            reason += f"- {obj}\n"
        reason += "\nKey results to achieve:\n"
        for kr in okrs.get('key_results', []):
            reason += f"- {kr}\n"

    reason += (
        f"\nContinue orchestrating agents until all OKRs are achieved.\n"
        f"Then write: ## WORKFLOW STATUS: COMPLETED"
    )

    response = build_block_response(reason)
    print(json.dumps(response))
    return 0


if __name__ == '__main__':
    sys.exit(main())
