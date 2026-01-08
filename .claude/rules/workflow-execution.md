# Workflow Execution Rules

## Precondition Verification

Before executing any workflow:
1. Load all preconditions from workflow map
2. Verify each gate/condition is met
3. Document verification in results file
4. Do NOT proceed if critical preconditions are unmet

## Dependency Management

1. An agent can only execute when all its inputs are available
2. Track which outputs have been produced
3. Update dependency graph status in results/share.md after each agent completes
4. Loop considered completed only when OKR in workflows/ folder yaml file are achieved

## Error Handling

If an agent encounters a blocker:
1. Mark status as "blocked" in results
2. Document the specific blocker
3. Continue with other non-dependent agents
4. Report all blockers in final evaluation
