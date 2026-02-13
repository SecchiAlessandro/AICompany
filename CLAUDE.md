# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Agent Workflow Orchestrator - a system that dynamically creates and orchestrates AI agents based on workflow YAML definitions. The system uses three core meta-agents that work together to transform user goals into executed workflows with tracked results.

## Prerequisites

- **Node.js** (v18+) — for document generation
- **Python 3** — for workflows, CV rendering, and OKR validation

## Commands

```bash
# Install Node.js dependencies (required for document generation)
npm install

# Install Python dependencies (required for workflows and CV rendering)
pip install -r requirements.txt

# Minimal installation (core workflow features only)
pip install pyyaml pydantic

# Verify OKR completion (used by stop hooks) - runs automatically
python .claude/scripts/check_okrs.py

# Render a CV directly from CLI
python .claude/skills/Jinja2-cv/scripts/render_cv.py --template <template.docx> --data-json <candidate_data.json> --out <output.docx> [--photo <photo.jpg>]
```

## Invoking the System

```
@orchestrator workflows/<workflow-name>.yaml   # Execute a workflow (management by objectives)
@workflow-mapper                                # Create workflow from requirements
@agent-factory                                  # Generate role agents from workflow YAML
@Jinja2-cv                                      # Render CVs from docxtpl templates
```

## Architecture

```
User Request → @orchestrator → @workflow-mapper (if needed) → @agent-factory → Role Agents
                         │                                               │
                         │ (extracts OKRs from YAML)                     │
                         │                                               │
                         └──────> results/shared.md <──────────────────┘
                                         │
                                Stop Hook validates OKRs
```

### Core Meta-Agents and Skills

| Agent/Skill | Location | Purpose |
|-------------|----------|---------|
| **Orchestrator** | `.claude/agents/orchestrator.md` | Entry point; extracts OKRs from workflow YAML, creates shared.md, invokes agent-factory, spawns agents, monitors workflow status |
| **Workflow Mapper** | `.claude/skills/workflow-mapper/SKILL.md` | Transforms user goals into structured YAML workflows |
| **Agent Factory** | `.claude/skills/agent-factory/SKILL.md` | Generates role-specific agent `.md` files with embedded OKRs from workflow definitions |
| **Jinja2-cv** | `.claude/skills/Jinja2-cv/SKILL.md` | Renders CVs from EZ_Template_docxtpl.docx using Jinja2/docxtpl for candidate data conversion |

### Execution Flow

1. Orchestrator loads workflow YAML and verifies preconditions
2. Orchestrator initializes `results/shared.md`:
   - Parses workflow YAML for inputs_outputs and dependencies
   - Builds dependency graph and agent flow diagram
   - Extracts EXACT OKRs for each role from workflow YAML
   - Creates AGENT STATUS sections with OKRs in PENDING state
3. Invokes `/agent-factory` to create role agents in `.claude/agents/`
4. Spawns agents in dependency order (sequential or parallel based on dependencies)
5. Each agent:
   - Reviews their objectives and key results
   - Creates their own execution plan to achieve objectives
   - Executes their plan and produces outputs in `results/`
   - Updates OKR status in their section in `results/shared.md`
6. Stop hook (`check_okrs.py`) blocks agent termination until all key results show ACHIEVED
7. Orchestrator marks `WORKFLOW STATUS: COMPLETED` when all agents finish

## Stop Hook System

The stop hook in `.claude/settings.json` enforces OKR completion:
- Runs `check_okrs.py` on every agent stop attempt
- **No active workflow**: Allows stop if `shared.md` is empty or doesn't exist
- **For sub-agents**: Blocks until agent section shows `COMPLETED` with all key results `ACHIEVED`
- **For orchestrator**: Blocks until `WORKFLOW STATUS: COMPLETED` appears in shared.md
- Agents cannot stop if any key result is `PENDING` or `NOT ACHIEVED`

The hook intelligently detects whether a workflow is actually running to avoid blocking normal operations.

Exit codes: `0` = allow stop, `2` = block stop. When debugging hook issues, check stderr output from `check_okrs.py`.

Agents have autonomy to create their own execution plans to achieve their assigned objectives.

## Key Directories

| Directory | Purpose |
|-----------|---------|
| `.claude/agents/` | Agent definitions (orchestrator + dynamically generated role agents) |
| `.claude/skills/` | Skill definitions (workflow-mapper, agent-factory, Jinja2-cv) |
| `.claude/scripts/` | Hook scripts (`check_okrs.py` for OKR validation) |
| `workflows/` | Workflow YAML definitions |
| `templates/` | Input/output document templates for workflows |
| `domain knowledge/` | Domain-specific knowledge sources referenced by agents |
| `results/` | All agent outputs + `shared.md` coordination file |

## Workflow YAML Schema

See `workflows/workflow-template.yaml` for complete schema. Top-level fields:

- `name` - Workflow identifier
- `overview` - Main tasks, phases, constraints
- `people_involved` - List of roles, each containing:
  - `tools` - Software and skills the role uses
  - `knowledge_sources` - Reference materials with paths
  - `inputs_outputs` - What the role receives and produces (defines the dependency graph)
  - `preconditions` - Gates that must be verified before starting
  - `okr` - Objectives and key results with validation criteria

## Output Conventions

The orchestrator creates `results/shared.md` with:
- Workflow overview and dependency graph
- Agent flow diagram
- Agent status sections for all roles with exact OKRs from workflow YAML

Agents update `results/shared.md` by updating their status section:
```markdown
## AGENT STATUS: <role-name> - COMPLETED
**Timestamp**: YYYY-MM-DD HH:MM:SS

### Key Results:
1. [Key Result]: ACHIEVED
2. [Key Result]: ACHIEVED

**Outputs**: <list of output files>
```

Status values: `PENDING` → `COMPLETED` (or `NOT COMPLETED`)
Key result values: `PENDING` → `ACHIEVED` (or `NOT ACHIEVED`)

Orchestrator marks final workflow status:
```markdown
## WORKFLOW STATUS: COMPLETED
```

## Document Skills

Available for document processing:
- `@Jinja2-cv` - Renders CVs from docxtpl templates using candidate data JSON
- `/docx` - Word documents with tracked changes
- `/pdf` - PDF reading and form filling
- `/xlsx` - Spreadsheets with formulas and data analysis
- `/pptx` - Presentations

## Creating New Workflows

1. Run `@workflow-mapper` and answer questions about goal, key results, and optionally roles
2. Or manually create YAML following `workflows/workflow-template.yaml`
3. Place input templates in `templates/` and domain docs in `domain knowledge/`
4. Execute with `@orchestrator workflows/<name>.yaml`
