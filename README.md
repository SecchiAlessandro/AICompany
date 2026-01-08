# README.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Agent Workflow Orchestrator

An intelligent system that dynamically creates and orchestrates agents based on predefined workflow maps.

## Project Overview

This system enables:
- **Dynamic Agent Creation**: Spawn specialized agents on-the-fly based on workflow requirements
- **Workflow Mapping**: Define inputs, outputs, roles, knowledge, and tools for each workflow step
- **Shared Results**: All agent outputs stored in a shared folder and summarized output in markdown file for traceability

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR AGENT                        │
│  (Reads workflow map, manages OKRs, spawns agents)          │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
┌───────────┐  ┌───────────┐  ┌───────────┐
│  Agent 1  │  │  Agent 2  │  │  Agent N  │
│  (Role A) │  │  (Role B) │  │  (Role X) │
└─────┬─────┘  └─────┬─────┘  └─────┬─────┘
      │              │              │
      └──────────────┼──────────────┘
                     ▼
           ┌─────────────────┐
           │results/         │ 
           │       and       │  
           │results/shared.md│
           └────────┬────────
```

## Directory Structure

- `.claude/agents/` - Agent definitions (orchestrator, workflow-mapper, agent-factory)
- `.claude/skills/` - Reusable skills for agents
- `.claude/rules/` - Modular rules for agent behavior
- `workflows/` - Workflow map definitions (YAML/JSON)
- `templates/` - inputs outputs templates
- `results/` - output files from agent executions

## Workflow Map Schema

Each workflow must define:
- **people_involved**: Roles participating in the workflow
- **preconditions**: Gates or prerequisites that must be met
- **tasks**: Overview of work to be done
- **inputs_outputs**: Per-role input requirements and expected outputs
- **knowledge_sources**: Where to find domain knowledge
- **tools**: Software and systems used
- **okr**: Objectives and key results for success measurement

## Conventions

- Use YAML for workflow definitions
- All agent outputs are stored in `results/`
- All agent summarized outputs append to `results/shared.md` with timestamps
- Agent names follow pattern: `{role}-agent.md`
- Keep agent prompts focused on single responsibilities

## Core Agent System

### Three-Agent Architecture

The system consists of three core meta-agents that work together to execute workflows:

1. **Orchestrator** (`.claude/agents/orchestrator.md`)
   - Main entry point for workflow execution
   - Loads workflow YAML files from `workflows/` directory
   - Builds dependency graphs from role inputs/outputs to determine execution order
   - Spawns role-specific agents via the agent-factory
   - Monitors progress by tracking `results/shared.md`
   - Execution completes when OKRs in workflow YAML are achieved

2. **Workflow Mapper** (`.claude/agents/workflow-mapper.md`)
   - Transforms user goals into structured workflow YAML files
   - Reverse-engineers workflows when only end goals are provided
   - Asks systematic questions to gather complete workflow requirements
   - Validates workflows against `workflows/workflow-template.yaml` schema
   - Outputs properly formatted YAML to `workflows/` directory

3. **Agent Factory** (`.claude/agents/agent-factory.md`)
   - Dynamically generates role-specific agents from workflow definitions
   - Extracts role details: inputs, outputs, tools, knowledge sources
   - Creates focused agent prompts using standardized template
   - Grants appropriate tool capabilities based on workflow requirements
   - Stores generated agent definitions in `.claude/agents/` folder

### Workflow Execution Flow

```
User Request → Orchestrator → Workflow Mapper (if needed)
                   ↓
          Load/Validate Workflow YAML
                   ↓
          Verify Preconditions
                   ↓
          Build Dependency Graph
                   ↓
          Agent Factory → Generate Role Agent 1, 2, ..., N
                   ↓
          Execute Agents (sequential or parallel based on dependencies)
                   ↓
          Monitor results/shared.md
                   ↓
          Verify OKRs → Complete
```

### Dependency Management

- Agents execute **sequentially** when one agent's output is another's input
- Agents execute **in parallel** when they have no shared dependencies
- The orchestrator builds a dependency graph by analyzing the `inputs_outputs` section of workflows
- The Orchestrator shows the Organizational Structure diagram chosen for the agents
- Example: If "Control Lead" outputs a document that "Mechanical Lead" needs as input, Control Lead executes first

### Working with Workflows

To execute a workflow:
1. Ensure workflow YAML exists in `workflows/` directory (or let workflow-mapper create it)
2. Verify preconditions are documented and met (orchestrator checks these)
3. Confirm all input templates exist in `templates/` folder
4. Run the orchestrator agent, which handles everything else automatically

To create a new workflow:
1. Either manually create a YAML file following `workflows/workflow-template.yaml`
2. Or invoke the workflow-mapper agent to reverse-engineer from requirements
3. Ensure all knowledge sources referenced in the YAML actually exist in `domain knowledge/`
4. Place any input templates in `templates/` folder

## Output Format Requirements

All dynamically created role agents MUST follow the output format defined in `.claude/rules/output-format.md`:

- Create detailed work outputs in `results/` folder (any format appropriate to the role)
- Append a summary to `results/shared.md` with this exact structure:

```markdown
---
## [Agent Role] Output
**Timestamp**: YYYY-MM-DD HH:MM:SS
**Status**: completed | blocked | partial

### Deliverables
- Item 1
- Item 2

### Notes
Any relevant observations
---
```

Status definitions:
- `completed`: All required outputs produced successfully
- `blocked`: Cannot proceed due to missing inputs or unmet dependencies
- `partial`: Some outputs produced, others pending


## Getting Started

1. Create or use an existing workflow YAML in `workflows/`
2. Ensure required templates exist in `templates/`
3. Add relevant domain knowledge to `domain knowledge/`
4. Run the orchestrator agent to execute the workflow

## Usage with Claude Code

This project is designed to work with [Claude Code](https://claude.ai/code). The CLAUDE.md file provides context and instructions for Claude when working with this codebase.

## License

MIT
