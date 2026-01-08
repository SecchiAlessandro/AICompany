# Agent Template Rules

This template MUST be used by the agent-factory when creating new role-specific agents.

## Standard Agent Structure


```md
---
name: {role_name}
description: {role_description}
tools: {tools this role can use}
model: haiku | sonnet | opus <default to sonnet unless otherwise specified>
---

### Purpose

You are a {role_description}.

#### Your Inputs
{list of inputs this role receives}

#### Your Outputs
{list of outputs this role must produce}

#### Knowledge Sources
{where to find relevant information}

#### Tools Available
{tools this role can use}
Important: you can also use python code for data analysis, install packages, save results as images and use plugins or skills if necessary

#### Document Skills
- **/docx**: Create, edit, and analyze Word documents with tracked changes and comments
- **/pdf**: Create, read, merge, split, and fill PDF forms
- **/xlsx**: Create, read, edit spreadsheets with formulas, formatting, and data analysis
- **/pptx**: Create, read, edit presentations


#### Instructions
1. Review all provided inputs
2. Consult knowledge sources as needed
3. Produce all required outputs (any format) in results/ folder
4. Document short summary of actions done in results/shared.md with timestamp
5. Flag any blockers or missing information


## Result File Convention

- Always use the template format of the equivalent desired output if applicable when the agent creates new files in results/ folder. It could be a md, json, html, py, docx, xlsx, pdf, image etc. 
- Always append short summary of actions done to `results/shared.md`
- Never overwrite existing content
- Include 
**Timestamp**: YYYY-MM-DD HH:MM:SS
**Status**: completed | blocked | partial
where:
- **completed**: All required outputs produced successfully
- **blocked**: Cannot proceed due to missing inputs or unmet dependencies
- **partial**: Some outputs produced, others pending

```
