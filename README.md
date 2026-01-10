# Agent Workflow Orchestrator

An intelligent system that dynamically creates and orchestrates AI agents based on predefined workflow maps.

## Features

- **Dynamic Agent Creation**: Spawn specialized agents on-the-fly based on workflow requirements
- **Workflow Mapping**: Define inputs, outputs, roles, knowledge, and tools for each workflow step
- **OKR-Driven Execution**: Workflows complete when objectives and key results are achieved
- **Shared Results**: All agent outputs stored in `results/` folder with summaries in `results/shared.md`

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
           │ results/        │
           │ results/shared.md│
           └─────────────────┘
```

### Core Agents

1. **Orchestrator** - Entry point; loads workflow YAML, builds dependency graph, spawns role agents, monitors until OKRs achieved
2. **Workflow Mapper** - Transforms user goals into structured workflow YAML files
3. **Agent Factory** - Generates role-specific agents from workflow definitions

## Getting Started

### Prerequisites

- **Node.js** (v18+) - For document generation
- **Python 3** - For OKR checking automation
- **Claude Code** - [claude.ai/code](https://claude.ai/code)

### Installation

```bash
git clone https://github.com/SecchiAlessandro/AICompany.git
cd AICompany
npm install
```

### Running Workflows

**Execute an existing workflow:**
```
@orchestrator workflows/<workflow-name>.yaml
```

**Create a new workflow from scratch:**
```
@workflow-mapper
```
The agent will ask questions to build the workflow structure.

**View results:**
- Outputs in `results/` folder
- Summary of all agent activities in `results/shared.md`

## Project Structure

```
AICompany/
├── .claude/
│   ├── agents/           # Core meta-agents + generated role agents
│   ├── skills/           # Skill definitions (workflow-mapper, agent-factory)
│   ├── scripts/          # Automation scripts (OKR checking)
│   └── settings.json     # Claude Code configuration
├── workflows/            # Workflow YAML definitions
├── templates/            # Input/output document templates
├── domain knowledge/     # Domain-specific reference materials
├── results/              # Generated outputs + shared.md
├── CLAUDE.md             # Claude Code instructions (detailed)
└── README.md             # This file
```

## Workflow YAML Schema

Each workflow defines:
- **people_involved**: Roles with tools and knowledge sources
- **preconditions**: Gates that must be verified before execution
- **overview**: Main tasks and phases
- **inputs_outputs**: Per-role data flows (defines dependency graph)
- **okr**: Objectives and key results for success measurement

See `workflows/workflow-template.yaml` for the complete schema.

## Output Format

All agents report status to `results/shared.md`:

```markdown
## AGENT STATUS: <role-name> - COMPLETED
**Timestamp**: YYYY-MM-DD HH:MM:SS
**Status**: completed | blocked | partial

### Key Results:
1. [Key Result]: ACHIEVED
```

Status definitions:
- `completed` - All required outputs produced
- `blocked` - Cannot proceed due to missing dependencies
- `partial` - Some outputs produced, others pending

## Troubleshooting

**npm install fails**: Ensure Node.js v18+ is installed (`node --version`)

**Agents not executing**: Verify workflow YAML syntax and that preconditions are met

**OKR check errors**: Ensure Python 3 is installed (`python --version`)

## License

MIT
