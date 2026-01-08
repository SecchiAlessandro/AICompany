# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Agent Workflow Orchestrator

An intelligent system that dynamically creates (with @agent-factory) and orchestrates (@orchestrator) agents based on predefined workflow maps. If not workflow is available it create a new one with @workflow-mapper

## Invoking the System

**Execute a workflow:**
```
@orchestrator workflows/<workflow-name>.yaml
```

**Create a new workflow from requirements:**
```
@workflow-mapper
```

**Generate a role agent from workflow:**
```
@agent-factory
```

## Architecture and flow

```
Orchestrator → Workflow Mapper (if needed) → Agent Factory → Role Agents
                                                                  ↓
                                                          results/shared.md
```

**Three Core Meta-Agents:**
1. **Orchestrator** (`.claude/agents/orchestrator.md`) - Entry point; loads workflow YAML, builds dependency graph, spawns agents, monitors until OKRs achieved
2. **Workflow Mapper** (`.claude/agents/workflow-mapper.md`) - Reverse-engineers user goals into structured YAML workflows
3. **Agent Factory** (`.claude/agents/agent-factory.md`) - Generates role-specific agents from workflow definitions

## Key Directories

| Directory | Purpose |
|-----------|---------|
| `.claude/agents/` | Agent definitions (core + dynamically generated) |
| `.claude/rules/` | Agent behavior rules (templates, output format, execution) |
| `workflows/` | Workflow YAML definitions |
| `templates/` | Input/output document templates |
| `domain knowledge/` | Domain-specific knowledge sources |
| `results/` | Agent outputs + `shared.md` coordination file |

## Workflow YAML Schema

See `workflows/workflow-template.yaml` for complete schema. Required fields:
- `people_involved` - Roles with their tools and knowledge sources
- `preconditions` - Gates that must be verified before execution
- `inputs_outputs` - Per-role inputs and outputs (defines dependency graph)
- `okr` - Objectives and key results (execution completes when achieved)

## Execution Rules

Defined in `.claude/rules/workflow-execution.md`:
- Verify all preconditions before starting
- Build dependency graph from `inputs_outputs` section
- Execute agents sequentially when outputs feed into inputs; parallel otherwise
- Track progress in `results/shared.md`
- Loop until OKRs are achieved

## Output Convention

All agents follow `.claude/rules/output-format.md`:
- Create work outputs in `results/` folder
- Append summary to `results/shared.md` with timestamp and status (`completed`|`blocked`|`partial`)

## Agent Template

New role agents are created using `.claude/rules/agent-template.md` structure
