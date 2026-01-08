#!/usr/bin/env python3
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
    shared_path = Path(project_root) / 'results' / 'shared.md'
    return shared_path.read_text(encoding='utf-8') if shared_path.exists() else None

def extract_workflow_name(content):
    match = re.search(r'\*\*Workflow\*\*:\s*([^\n]+)', content)
    return match.group(1).strip() if match else None

def check_okr_status(content):
    completed_markers = ['WORKFLOW STATUS: COMPLETED', 'All OKRs ACHIEVED', 'Final Status: All objectives achieved']
    for marker in completed_markers:
        if marker.lower() in content.lower():
            return True, "All OKRs achieved"
    
    if any(m in content for m in ['Status**: In Progress', 'Status**: in_progress']):
        return False, "Workflow still in progress"
    if 'Status**: blocked' in content:
        return False, "Workflow is blocked"
    if 'Status**: partial' in content:
        return False, "Workflow partially complete"
    
    return False, "OKR status unclear - manual review recommended"

def load_workflow_okrs(project_root, workflow_name):
    yaml_path = Path(project_root) / 'workflows' / f'{workflow_name}.yaml'
    if not yaml_path.exists():
        return None
    try:
        with open(yaml_path, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f).get('okr', {})
    except:
        return None

def main():
    # Set UTF-8 encoding for stdout on Windows
    if sys.platform == 'win32':
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    
    project_root = get_project_root()
    content = read_shared_md(project_root)

    if not content:
        # If there's no shared.md, we assume no active workflow and let Claude stop
        return 0

    workflow_name = extract_workflow_name(content)
    achieved, status_msg = check_okr_status(content)

    if achieved:
        # Success: Exit 0 with no JSON allows Claude to stop normally
        print(f"✅ OKR Check Passed: {status_msg}")
        return 0
    
    # INCOMPLETE: Build the JSON to block Claude and force a new iteration
    okrs = load_workflow_okrs(project_root, workflow_name)
    
    # Prepare the instruction for the NEXT iteration
    next_instruction = (
        f"CRITICAL: Workflow '{workflow_name}' is NOT complete.\n"
        f"Reason: {status_msg}\n\n"
        f"Please continue the orchestrator workflow. You must finish these objectives:\n"
    )
    
    if okrs:
        for obj in okrs.get('objectives', []):
            next_instruction += f"- Objective: {obj}\n"
        for kr in okrs.get('key_results', []):
            next_instruction += f"- Key Result: {kr}\n"
    
    next_instruction += f"\nRun: @orchestrator workflows/{workflow_name}.yaml to proceed."

    # Return the structured JSON to Claude Code
    response = {
        "decision": "block",
        "reason": next_instruction,
        "systemMessage": f"🔄 Iteration required for {workflow_name}"
    }
    
    # Print JSON to stdout and exit 0 (this is the key to advanced hooks)
    print(json.dumps(response))
    return 0

if __name__ == '__main__':
    sys.exit(main())