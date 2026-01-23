# Agent Workflow Orchestrator

An intelligent system that dynamically creates and orchestrates AI agents based on predefined workflow maps.

## Features

- **Dynamic Agent Creation**: Spawn specialized agents on-the-fly based on workflow requirements
- **Workflow Mapping**: Define inputs, outputs, roles, knowledge, and tools for each workflow step
- **OKR-Driven Execution**: Workflows complete when objectives and key results are achieved (enforced by stop hooks)
- **Shared Results**: All agent outputs stored in `results/` folder with summaries in `results/shared.md`
- **CV Generation**: Automated CV rendering from structured data using Jinja2/docxtpl templates
- **Dependency Management**: Automatic dependency graph construction and sequential/parallel agent execution
- **Stop Hook Validation**: Agents cannot terminate until all key results show ACHIEVED status

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

### Core Agents and Skills

1. **Orchestrator** - Entry point; loads workflow YAML, builds dependency graph, spawns role agents, monitors until OKRs achieved
2. **Workflow Mapper** - Transforms user goals into structured workflow YAML files
3. **Agent Factory** - Generates role-specific agents from workflow definitions
4. **Jinja2-cv** - Renders CVs from docxtpl templates using candidate data JSON

## Getting Started

### Prerequisites

- **Node.js** (v18+) - For document generation
- **Python 3** - For OKR checking automation
- **Claude Code** - [claude.ai/code](https://claude.ai/code)

### Installation

```bash
git clone https://github.com/SecchiAlessandro/AICompany.git
cd AICompany

# Install Node.js dependencies (for document generation)
npm install

# Install Python dependencies (for workflows and CV rendering)
pip install -r requirements.txt
```

**Minimal installation (core workflow features only):**
```bash
pip install pyyaml pydantic
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

**Render a CV from template:**
```
@Jinja2-cv
```
Converts candidate data to formatted CV using docxtpl templates.

**View results:**
- Outputs in `results/` folder
- Summary of all agent activities in `results/shared.md`

## Project Structure

```
AICompany/
├── .claude/
│   ├── agents/           # Core meta-agents + generated role agents
│   ├── skills/           # Skill definitions (workflow-mapper, agent-factory, Jinja2-cv)
│   ├── scripts/          # Automation scripts (OKR checking, CV rendering)
│   └── settings.json     # Claude Code configuration
├── workflows/            # Workflow YAML definitions
├── templates/            # Input/output document templates (e.g., CV templates)
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

## Available Workflows

- `workflow-template.yaml` - Template for creating new workflows with all required sections
- `test-validation-criteria.yaml` - Example validation workflow demonstrating OKR tracking

## Additional Features

### CV Rendering (Jinja2-cv)

The Jinja2-cv skill allows automated CV generation from structured data:

1. Extract candidate data from source CV (PDF/DOCX)
2. Generate `candidate_data.json` with standardized structure
3. Render formatted CV using docxtpl template (`templates/EZ_Template_docxtpl.docx`)

**Usage:**
```
@Jinja2-cv
```
Then provide the source CV file path when prompted.

### Stop Hook System

The system uses Python-based stop hooks to enforce OKR completion:
- Located in `.claude/scripts/check_okrs.py`
- Automatically runs when agents attempt to stop
- **Only blocks during active workflows** - allows normal stops when no workflow is running
- Blocks termination until all key results show `ACHIEVED`
- Ensures workflow quality and completeness

**How it works:**
- If `shared.md` is empty/doesn't exist → Allows stop (no workflow)
- If workflow is active → Validates OKRs before allowing stop
- If `WORKFLOW STATUS: COMPLETED` → Allows stop (workflow done)

## Troubleshooting

**npm install fails**: Ensure Node.js v18+ is installed (`node --version`)

**Agents not executing**: Verify workflow YAML syntax and that preconditions are met

**OKR check errors**: Ensure Python 3 is installed (`python --version`)

**CV rendering fails**: Ensure docxtpl dependencies are installed (`pip install docxtpl python-docx jinja2`)

## License

MIT
