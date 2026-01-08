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

### Prerequisites

- **Node.js** (v18 or later) - Required for document generation dependencies
- **Python 3** - Required for OKR checking and workflow automation
- **Git** - For version control
- **Claude Code** - [claude.ai/code](https://claude.ai/code)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SecchiAlessandro/AICompany.git
   cd AICompany
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```
   This installs:
   - `docx` - Word document generation library
   - `pptxgenjs` - PowerPoint presentation generation library

3. **Verify installation**
   ```bash
   node -e "console.log('Node modules installed successfully')"
   ```

### Project Setup

1. **Add domain knowledge** (optional)
   - Place relevant domain-specific documents in `domain knowledge/` folder
   - Supported formats: .md, .txt, .pdf, .docx

2. **Create input templates** (optional)
   - Add workflow input templates to `templates/` folder
   - Examples: requirement specs, design templates, forms

3. **Configure workflows**
   - Create YAML workflow files in `workflows/` directory
   - Or let the workflow-mapper agent create them from your requirements

### Running Workflows

1. **Execute a workflow with the orchestrator**
   ```
   @orchestrator workflows/<workflow-name>.yaml
   ```

2. **Create a new workflow from scratch**
   ```
   @workflow-mapper
   ```
   The agent will ask you questions to build the workflow structure.

3. **View results**
   - All outputs are stored in `results/` folder
   - Summary of all agent activities is in `results/shared.md`

### Workflow Examples

**Example 1: Execute an existing workflow**
```
@orchestrator workflows/detail-design-phase.yaml
```

**Example 2: Create and execute a new workflow**
1. Run: `@workflow-mapper`
2. Answer the questions about roles, tools, and objectives
3. The agent creates the YAML file automatically
4. Run: `@orchestrator workflows/your-workflow-name.yaml`

## Project Structure

```
AICompany/
├── .claude/
│   ├── agents/           # Core meta-agents (orchestrator, workflow-mapper, agent-factory)
│   ├── rules/            # Behavior templates and execution rules
│   ├── scripts/          # Python automation scripts (OKR checking)
│   └── settings.json     # Claude Code configuration
├── workflows/            # Workflow definitions (YAML files)
├── templates/            # Input/output document templates
├── domain knowledge/     # Domain-specific reference materials
├── results/              # Generated outputs from workflow executions
│   └── shared.md        # Consolidated summary of all agent outputs
├── package.json          # Node.js dependencies
├── package-lock.json     # Locked dependency versions
├── README.md            # This file
└── CLAUDE.md            # Claude Code instructions
```

## Usage with Claude Code

This project is designed to work with [Claude Code](https://claude.ai/code). The CLAUDE.md file provides context and instructions for Claude when working with this codebase.

## Troubleshooting

**Issue: `npm install` fails**
- Ensure Node.js v18+ is installed: `node --version`
- Try clearing npm cache: `npm cache clean --force`

**Issue: Agents not executing**
- Verify workflow YAML syntax is correct
- Check that all required inputs exist in `templates/` folder
- Ensure preconditions in the workflow are met

**Issue: OKR check script errors**
- Ensure Python 3 is installed: `python --version`
- Install required Python packages: `pip install pyyaml`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m "Add feature"`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

MIT
