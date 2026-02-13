import YAML from "yaml";
import { SKILL_SUGGESTIONS } from "./constants";

interface BuilderAnswers {
  q1?: string; // goal
  q2?: string; // deliverables
  q3?: string; // inputs
  q4?: string; // role count
  q5?: string; // key results
  q6?: string; // validation checks
  q7?: string; // reference docs
  q8?: string; // preconditions
  q9?: string; // communication
  q10?: string; // dependencies
  q11?: string; // tools
}

export function generateWorkflowYaml(answers: BuilderAnswers): string {
  const name = deriveWorkflowName(answers.q1 || "unnamed-workflow");
  const roleCount = parseRoleCount(answers.q4 || "auto", answers);
  const keyResults = parseLines(answers.q5);
  const validations = parseLines(answers.q6);
  const inputs = parseLines(answers.q3);
  const deliverables = parseLines(answers.q2);
  const knowledgeSources = parseLines(answers.q7);
  const preconditions = parseLines(answers.q8);

  const roles = [];
  for (let i = 0; i < roleCount; i++) {
    const roleName = deriveRoleName(i, roleCount, deliverables, answers);
    const roleDeliverables = distributeItems(deliverables, i, roleCount);
    const roleInputs = i === 0 ? inputs : [`Output from previous role`];
    const roleKRs = distributeItems(keyResults, i, roleCount);
    const roleValidations = distributeItems(validations, i, roleCount);
    const suggestedSkills = inferSkills(roleDeliverables);

    const role: Record<string, unknown> = {
      role: roleName,
      description: `Handles ${roleDeliverables.join(", ") || "processing"}`,
      tools: [
        { name: "Read", purpose: "Read input files and references" },
        { name: "Write", purpose: "Create output files" },
      ],
    };

    if (suggestedSkills.length > 0) {
      role.skills = suggestedSkills.map((s) => ({
        name: s,
        purpose: `Process ${s}-related outputs`,
      }));
    }

    if (knowledgeSources.length > 0 && i === 0) {
      role.knowledge_sources = knowledgeSources.map((ks) => ({
        name: ks.split("/").pop() || ks,
        purpose: "Reference material",
        path: ks,
      }));
    }

    role.inputs_outputs = [
      ...roleInputs.map((inp) => ({ inputs: inp })),
      ...roleDeliverables.map((out) => ({ outputs: out })),
    ];

    if (preconditions.length > 0 && i === 0) {
      role.preconditions = preconditions.map((p) => ({
        name: p.split(" ").slice(0, 3).join("-").toLowerCase(),
        description: p,
        verification: `Verify: ${p}`,
      }));
    }

    role.okr = {
      objectives: [roleKRs.length > 0 ? `Complete ${roleName} deliverables` : `Process assigned tasks`],
      key_results: roleKRs.map((kr, j) => ({
        result: kr,
        validation: roleValidations[j] ? [roleValidations[j]] : [`${kr} is verified`],
      })),
    };

    roles.push(role);
  }

  const workflow = {
    name,
    overview: answers.q1 || "",
    people_involved: roles,
  };

  return YAML.stringify(workflow, { lineWidth: 120 });
}

function deriveWorkflowName(goal: string): string {
  return goal
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 4)
    .join("-");
}

function parseRoleCount(input: string, answers: BuilderAnswers): number {
  const num = parseInt(input, 10);
  if (!isNaN(num) && num > 0 && num <= 10) return num;
  const deliverables = parseLines(answers.q2);
  return Math.max(1, Math.min(deliverables.length, 5));
}

function deriveRoleName(index: number, total: number, deliverables: string[], _answers: BuilderAnswers): string {
  if (total === 1) return "executor";
  const defaultNames = ["analyst", "processor", "writer", "reviewer", "communicator"];
  if (deliverables[index]) {
    const ext = deliverables[index].match(/\.(\w+)/)?.[1];
    if (ext) return `${ext}-creator`;
  }
  return defaultNames[index] || `role-${index + 1}`;
}

function parseLines(text?: string): string[] {
  if (!text) return [];
  return text
    .split(/\n|,|;/)
    .map((l) => l.replace(/^\s*[-*\d.)\]]+\s*/, "").trim())
    .filter(Boolean);
}

function distributeItems<T>(items: T[], index: number, total: number): T[] {
  if (items.length === 0) return [];
  if (total === 1) return items;
  const perRole = Math.ceil(items.length / total);
  return items.slice(index * perRole, (index + 1) * perRole);
}

function inferSkills(deliverables: string[]): string[] {
  const skills = new Set<string>();
  for (const d of deliverables) {
    const lower = d.toLowerCase();
    for (const [trigger, skillList] of Object.entries(SKILL_SUGGESTIONS)) {
      if (lower.includes(trigger)) {
        skillList.forEach((s) => skills.add(s));
      }
    }
  }
  return Array.from(skills);
}
