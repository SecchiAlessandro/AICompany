#!/usr/bin/env python3
"""
OKR Validation Script for Stop Hook

Validates that agents write completion status with key results to results/shared.md before stopping.
- For sub-agents: Blocks until agent reports COMPLETED status with all key results ACHIEVED
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


def extract_agent_status_block(content, agent_name):
    """
    Extract the full status block for a specific agent.
    Returns the status block content or None if not found.
    """
    # Find the agent status section
    pattern = rf'## AGENT STATUS:\s*{re.escape(agent_name)}\s*-\s*(COMPLETED|NOT COMPLETED)\s*\n(.*?)(?=\n##|\Z)'
    match = re.search(pattern, content, re.IGNORECASE | re.DOTALL)
    return match.group(0) if match else None


def validate_agent_completion(status_block):
    """
    Validate that the agent status block has:
    1. Status line with COMPLETED (not NOT COMPLETED)
    2. Key Results section with all results marked as ACHIEVED
    
    Returns: (is_valid, message, failed_key_results)
    """
    if not status_block:
        return False, "Agent status block not found", []
    
    # Check for COMPLETED status (not NOT COMPLETED)
    if '- NOT COMPLETED' in status_block:
        return False, "Agent status is NOT COMPLETED - agent must fix issues and report COMPLETED", []
    
    if '- COMPLETED' not in status_block:
        return False, "Missing COMPLETED status header", []
    
    # Check for Key Results section
    if '### Key Results:' not in status_block:
        return False, "Missing 'Key Results:' section", []
    
    # Extract all key results and check if any are NOT ACHIEVED
    key_results_pattern = r'\d+\.\s*\[([^\]]+)\]:\s*(ACHIEVED|NOT ACHIEVED)'
    key_results = re.findall(key_results_pattern, status_block)
    
    if not key_results:
        return False, "No key results listed in 'Key Results:' section", []
    
    # Check for any NOT ACHIEVED results
    failed_results = [kr for kr, status in key_results if status == 'NOT ACHIEVED']
    
    if failed_results:
        return False, f"{len(failed_results)} key result(s) NOT ACHIEVED", failed_results
    
    return True, "All key results ACHIEVED", []


def get_current_agent(content):
    """
    Find the currently running agent from the most recent AGENT STATUS entry.
    Returns the agent name from the last status block.
    """
    pattern = r'## AGENT STATUS:\s*(\S+)\s*-\s*(COMPLETED|NOT COMPLETED)'
    matches = re.findall(pattern, content, re.IGNORECASE)
    return matches[-1][0].lower() if matches else None


def check_workflow_completed(content):
    """
    Check if the entire workflow is marked as COMPLETED.
    Looks for: WORKFLOW STATUS: COMPLETED
    """
    return 'WORKFLOW STATUS: COMPLETED' in content


def check_workflow_not_completed(content):
    """
    Check if the workflow is marked as NOT COMPLETED.
    Looks for: WORKFLOW STATUS: NOT COMPLETED
    """
    return 'WORKFLOW STATUS: NOT COMPLETED' in content


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
    current_agent = get_current_agent(content)
    workflow_name = extract_workflow_name(content)

    # Case 1: Sub-agent context (there's an agent with status)
    if current_agent:
        agent_status_block = extract_agent_status_block(content, current_agent)
        is_valid, validation_message, failed_results = validate_agent_completion(agent_status_block)

        if is_valid:
            # Agent has COMPLETED with all key results ACHIEVED - allow stop
            result = build_approve_response()
            print(json.dumps(result))
            return 0
        else:
            # Agent hasn't properly completed - block and provide guidance
            reason = (
                f"CRITICAL: Agent '{current_agent}' cannot stop yet.\n\n"
                f"Validation Error: {validation_message}\n\n"
            )
            
            if failed_results:
                reason += "Failed Key Results:\n"
                for kr in failed_results:
                    reason += f"  - {kr}\n"
                reason += "\nYou must fix the above issues before stopping.\n\n"
            
            reason += (
                f"Before stopping, you MUST append/update in results/shared.md:\n\n"
                f"## AGENT STATUS: {current_agent} - COMPLETED\n\n"
                f"### Key Results:\n"
                f"1. [Key Result 1]: ACHIEVED\n"
                f"2. [Key Result 2]: ACHIEVED\n"
                f"...\n\n"
                f"ALL key results must show ACHIEVED status.\n"
                f"Continue working to fix any NOT ACHIEVED results."
            )
            response = build_block_response(reason)
            print(json.dumps(response))
            return 0

    # Case 2: Orchestrator context (no agent status, check workflow completion)
    if check_workflow_completed(content):
        result = build_approve_response()
        print(json.dumps(result))
        return 0

    # Check if workflow is explicitly marked as NOT COMPLETED
    if check_workflow_not_completed(content):
        reason = (
            f"CRITICAL: Workflow is marked as NOT COMPLETED.\n\n"
            f"Some OKRs are not achieved. Review agent statuses and continue orchestration.\n"
            f"Once all agents complete successfully, update to:\n\n"
            f"WORKFLOW STATUS: COMPLETED\n"
        )
        response = build_block_response(reason)
        print(json.dumps(response))
        return 0

    # Workflow status not found - block orchestrator
    okrs = load_workflow_okrs(project_root, workflow_name)

    reason = (
        f"CRITICAL: Workflow '{workflow_name or 'unknown'}' status not found.\n\n"
        f"You must complete the workflow and write the status.\n\n"
    )

    if okrs:
        reason += "Outstanding objectives:\n"
        for obj in okrs.get('objectives', []):
            reason += f"- {obj}\n"
        reason += "\nKey results to achieve:\n"
        for kr in okrs.get('key_results', []):
            reason += f"- {kr}\n"

    reason += (
        f"\nContinue orchestrating agents until all OKRs are achieved.\n\n"
        f"Then write:\n"
        f"WORKFLOW STATUS: COMPLETED\n\n"
        f"Or if any OKR not achieved:\n"
        f"WORKFLOW STATUS: NOT COMPLETED\n"
    )

    response = build_block_response(reason)
    print(json.dumps(response))
    return 0


if __name__ == '__main__':
    sys.exit(main())
