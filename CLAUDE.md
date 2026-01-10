# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Agent Workflow Orchestrator - a system that dynamically creates and orchestrates AI agents based on workflow YAML definitions. The system uses three core meta-agents that work together to transform user goals into executed workflows with tracked results.

## Commands

```bash
# Install dependencies (required for document generation)
npm install

# Verify OKR completion (used by stop hooks)
python .claude/scripts/check_okrs.py
```

## Invoking the System

```
@orchestrator workflows/<workflow-name>.yaml   # Execute a workflow
@workflow-mapper                                # Create workflow from requirements
@agent-factory                                  # Generate role agents from workflow
```

## Architecture

```
User Request → @orchestrator → @workflow-mapper (if needed) → @agent-factory → Role Agents
                                                                                    ↓
                                                                            results/shared.md
```

### Three Core Meta-Agents

| Agent | Location | Purpose |
|-------|----------|---------|
| **Orchestrator** | `.claude/agents/orchestrator.md` | Entry point; loads workflow YAML, builds dependency graph, spawns agents via agent-factory, monitors `results/shared.md` until OKRs achieved |
| **Workflow Mapper** | `.claude/skills/workflow-mapper/SKILL.md` | Transforms user goals into structured YAML workflows; asks clarifying questions using `QUESTION_FRAMEWORK.md` |
| **Agent Factory** | `.claude/skills/agent-factory/SKILL.md` | Generates role-specific agent `.md` files from workflow definitions using placeholder mapping |

### Execution Flow

1. Orchestrator loads workflow YAML and verifies preconditions
2. Builds dependency graph from `inputs_outputs` section
3. Invokes agent-factory to create role agents in `.claude/agents/`
4. Executes agents (sequential for dependencies/safety-critical, parallel otherwise)
5. Each agent writes outputs to `results/` and appends summary to `results/shared.md`
6. Orchestrator validates OKRs and marks workflow complete

### Dependency Rules

- **Sequential**: When Agent B needs Agent A's output, or for safety-critical tasks
- **Parallel**: When agents have no shared dependencies
- Validation: Each agent reports status markers (`AGENT STATUS: <role> - COMPLETED|IN PROGRESS`)

## Key Directories

| Directory | Purpose |
|-----------|---------|
| `.claude/agents/` | Agent definitions (core + dynamically generated role agents) |
| `.claude/skills/` | Skill definitions with supporting docs (question frameworks, placeholder mappings) |
| `workflows/` | Workflow YAML definitions |
| `templates/` | Input/output document templates for workflows |
| `domain knowledge/` | Domain-specific knowledge sources referenced by agents |
| `results/` | All agent outputs + `shared.md` coordination file |

## Workflow YAML Schema

See `workflows/workflow-template.yaml` for complete schema. Required sections:

- `people_involved` - Roles with tools and knowledge_sources per role
- `preconditions` - Gates with name, description, verification method
- `overview` - Main tasks, phases, constraints
- `inputs_outputs` - Per-role inputs and outputs (defines dependency graph)
- `okr` - Objectives and key_results (workflow completes when achieved)

## Output Conventions

All agents append to `results/shared.md` with:
```markdown
## AGENT STATUS: <role-name> - COMPLETED|IN PROGRESS
**Timestamp**: YYYY-MM-DD HH:MM:SS
**Status**: completed | blocked | partial
### Key Results:
1. [Key Result]: ACHIEVED | NOT ACHIEVED
```

Orchestrator writes final status:
```markdown
## WORKFLOW STATUS: COMPLETED|IN PROGRESS
```

## Document Skills

Available for document processing:
- `/docx` - Word documents with tracked changes
- `/pdf` - PDF reading and form filling
- `/xlsx` - Spreadsheets with formulas and data analysis
- `/pptx` - Presentations

## Creating New Workflows

1. Run `@workflow-mapper` and answer questions about roles, tools, knowledge sources, preconditions, and OKRs
2. Or manually create YAML following `workflows/workflow-template.yaml`
3. Place input templates in `templates/` and domain docs in `domain knowledge/`
4. Execute with `@orchestrator workflows/<name>.yaml`

## Creating New Role Agents

Agent Factory generates agents using the template structure in `.claude/skills/agent-factory/SKILL.md`:
- Extracts role details from workflow YAML
- Maps placeholders per `PLACEHOLDER_MAPPING.md`
- Validates against `VALIDATION_CHECKLIST.md`
- Saves to `.claude/agents/<role-name>.md`
