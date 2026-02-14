# Project Context: Parallel Web Search Test Workflow

## Workflow
**Name**: parallel-web-search-test
**Status**: IN PROGRESS
**Coordination File**: `results/shared.md`

## Overview
Test workflow that spawns 4 agents to perform independent web searches on different topics simultaneously. Each agent searches for a distinct topic using WebSearch, compiles findings into a markdown summary, and saves it to results/.

## Roles and Objectives
| Role | Objective | Output |
|------|-----------|--------|
| tech-researcher | Research and summarize the latest AI trends | results/tech-researcher-findings.md |
| science-researcher | Research and summarize space exploration breakthroughs | results/science-researcher-findings.md |
| health-researcher | Research and summarize global health developments | results/health-researcher-findings.md |
| climate-researcher | Research and summarize climate change news and policies | results/climate-researcher-findings.md |

## Dependency Graph
- All 4 research agents run in parallel with no dependencies

## Key Directories
- `results/` - All agent outputs and shared.md coordination file
- `workflows/parallel-web-search-test.yaml` - Workflow definition

## Instructions for Agents
1. Review your OKRs in `results/shared.md`
2. Use WebSearch to find at least 3 relevant sources on your topic
3. Write a well-structured markdown summary to your output file in `results/`
4. Update your AGENT STATUS section in `results/shared.md` when complete
5. Mark key results as ACHIEVED with validation criteria checked
