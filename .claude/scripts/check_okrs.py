#!/usr/bin/env python3
"""Stop hook: blocks until OKRs achieved in results/shared.md

Agent Status values: PENDING, COMPLETED, NOT COMPLETED
Key Result values: PENDING, ACHIEVED, NOT ACHIEVED

Rules:
- Orchestrator stop: requires WORKFLOW STATUS: COMPLETED
- Subagent stop: requires agent's section to be COMPLETED with all key results ACHIEVED
"""
import sys
import re
from pathlib import Path


def extract_agent_sections(content):
    """Extract all agent sections with their status and key results."""
    pattern = r'## AGENT STATUS:\s*(.+?)\s*-\s*(COMPLETED|NOT COMPLETED|PENDING)(.*?)(?=\n## |\n---\s*\n## |\Z)'
    sections = re.findall(pattern, content, re.S | re.I)

    agents = []
    for name, status, body in sections:
        # Extract key results with their status
        kr_pattern = r'(\d+)\.\s*(.+?):\s*(ACHIEVED|NOT ACHIEVED|PENDING)'
        key_results = re.findall(kr_pattern, body, re.I)

        agents.append({
            'name': name,
            'status': status.upper(),
            'key_results': [(num, kr.strip(), state.upper()) for num, kr, state in key_results],
            'body': body
        })

    return agents


def validate_agent(agent):
    """Validate an agent's completion state. Returns (is_valid, error_message)."""
    name = agent['name']
    status = agent['status']
    key_results = agent['key_results']

    if status == 'PENDING':
        return False, f"Agent '{name}' status is PENDING (not started or in progress)"

    if status == 'NOT COMPLETED':
        return False, f"Agent '{name}' status is NOT COMPLETED"

    if status == 'COMPLETED':
        # Check all key results
        pending_krs = [kr for num, kr, state in key_results if state == 'PENDING']
        failed_krs = [kr for num, kr, state in key_results if state == 'NOT ACHIEVED']

        if pending_krs:
            return False, f"Agent '{name}' has PENDING key results: {pending_krs}"

        if failed_krs:
            return False, f"Agent '{name}' has NOT ACHIEVED key results: {failed_krs}"

        # All key results must be ACHIEVED
        achieved_krs = [kr for num, kr, state in key_results if state == 'ACHIEVED']
        if not achieved_krs:
            return False, f"Agent '{name}' marked COMPLETED but has no ACHIEVED key results"

        return True, None

    return False, f"Agent '{name}' has unknown status: {status}"


def main():
    shared = Path('results/shared.md')
    if not shared.exists():
        sys.exit(0)  # No workflow active

    content = shared.read_text(encoding='utf-8')

    # Orchestrator: check workflow completion
    if 'WORKFLOW STATUS: COMPLETED' in content:
        sys.exit(0)

    # Parse all agent sections
    agents = extract_agent_sections(content)

    if not agents:
        # If file is empty or has no agent sections AND no workflow markers, allow stop
        # This handles the case where shared.md exists but no workflow is actually running
        if content.strip() == '' or 'WORKFLOW STATUS' not in content:
            sys.exit(0)  # Empty file or no active workflow
        print("No agent sections found in shared.md", file=sys.stderr)
        sys.exit(2)

    # For subagent stop: validate the last agent that attempted completion
    # Find agents marked as COMPLETED (they're trying to finish)
    completed_agents = [a for a in agents if a['status'] == 'COMPLETED']

    if completed_agents:
        # Validate the most recently completed agent (last in file)
        last_completed = completed_agents[-1]
        is_valid, error = validate_agent(last_completed)

        if is_valid:
            sys.exit(0)
        else:
            print(error, file=sys.stderr)
            sys.exit(2)

    # No completed agents yet - check if any are trying to stop prematurely
    # Report the status of all agents
    pending_agents = [a['name'] for a in agents if a['status'] == 'PENDING']

    if pending_agents:
        # If ALL agents are still PENDING, then no workflow agent has started yet.
        # The process trying to stop is not a workflow agent (e.g., agent-factory skill
        # or other utility), so allow it to exit.
        if len(pending_agents) == len(agents):
            sys.exit(0)
        print(f"Workflow in progress. PENDING agents: {', '.join(pending_agents)}", file=sys.stderr)
        sys.exit(2)

    print("Workflow not complete: update agent status or add WORKFLOW STATUS: COMPLETED", file=sys.stderr)
    sys.exit(2)


if __name__ == '__main__':
    main()
