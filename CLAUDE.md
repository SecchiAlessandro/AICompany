# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Agent Workflow Orchestrator - a system that dynamically creates and orchestrates AI agents based on workflow YAML definitions. The system uses three core meta-agents that work together to transform user goals into executed workflows with tracked results.

## Commands

```bash
# Install dependencies (required for document generation)
npm install

# Verify OKR completion (used by stop hooks) - runs automatically
python .claude/scripts/check_okrs.py
```

## Invoking the System

```
@orchestrator workflows/<workflow-name>.yaml   # Execute a workflow (management by objectives)
@workflow-mapper                                # Create workflow from requirements
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

| Agent | Location | Purpose |
|-------|----------|---------|
| **Orchestrator** | `.claude/agents/orchestrator.md` | Entry point; extracts OKRs from workflow YAML, creates shared.md, invokes agent-factory, spawns agents, monitors workflow status |
| **Workflow Mapper** | `.claude/skills/workflow-mapper/SKILL.md` | Transforms user goals into structured YAML workflows |
| **Agent Factory** | `.claude/skills/agent-factory/SKILL.md` | Generates role-specific agent `.md` files with embedded OKRs from workflow definitions |

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
- **For sub-agents**: Blocks until agent section shows `COMPLETED` with all key results `ACHIEVED`
- **For orchestrator**: Blocks until `WORKFLOW STATUS: COMPLETED` appears in shared.md
- Agents cannot stop if any key result is `PENDING` or `NOT ACHIEVED`

Agents have autonomy to create their own execution plans to achieve their assigned objectives.

## Key Directories

| Directory | Purpose |
|-----------|---------|
| `.claude/agents/` | Agent definitions (orchestrator + dynamically generated role agents) |
| `.claude/skills/` | Skill definitions (workflow-mapper, plan, agent-factory) |
| `.claude/scripts/` | Hook scripts (`check_okrs.py` for OKR validation) |
| `workflows/` | Workflow YAML definitions |
| `templates/` | Input/output document templates for workflows |
| `domain knowledge/` | Domain-specific knowledge sources referenced by agents |
| `results/` | All agent outputs + `shared.md` coordination file |

## Workflow YAML Schema

See `workflows/workflow-template.yaml` for complete schema. Required sections:

- `people_involved` - Roles with tools, knowledge_sources, and role-specific OKRs
- `preconditions` - Gates with name, description, verification method
- `overview` - Main tasks, phases, constraints
- `inputs_outputs` - Per-role inputs and outputs (defines dependency graph)

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
- `/docx` - Word documents with tracked changes
- `/pdf` - PDF reading and form filling
- `/xlsx` - Spreadsheets with formulas and data analysis
- `/pptx` - Presentations

## Creating New Workflows

1. Run `@workflow-mapper` and answer questions about goal, key results, and optionally roles
2. Or manually create YAML following `workflows/workflow-template.yaml`
3. Place input templates in `templates/` and domain docs in `domain knowledge/`
4. Execute with `@orchestrator workflows/<name>.yaml`
