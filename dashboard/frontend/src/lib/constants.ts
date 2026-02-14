// Workflow builder questions (from workflow-mapper SKILL.md)
export const BUILDER_ROUNDS = [
  {
    title: "Goal & Scope",
    questions: [
      {
        id: "q1",
        label: "What is the main goal or purpose of this workflow?",
        type: "textarea" as const,
        placeholder: "e.g., Generate quarterly financial reports from raw data",
      },
      {
        id: "q2",
        label: "What are the expected final deliverables/outputs?",
        type: "textarea" as const,
        placeholder: "e.g., .docx report, .pptx deck, email, web page, images",
      },
      {
        id: "q3",
        label: "What input data/files/templates are available?",
        type: "textarea" as const,
        placeholder: "e.g., templates/report-template.docx, data/sales.csv",
      },
      {
        id: "q4",
        label: "How many roles/agents should handle this?",
        type: "text" as const,
        placeholder: "auto (recommended) or a specific number",
      },
    ],
  },
  {
    title: "Success Criteria",
    questions: [
      {
        id: "q5",
        label: "What measurable key results define success?",
        type: "textarea" as const,
        placeholder: "e.g., Report contains all 4 quarters, Charts render correctly",
      },
      {
        id: "q6",
        label: "For each key result, what specific checks confirm it's achieved?",
        type: "textarea" as const,
        placeholder: "e.g., File exists and is > 10KB, All charts have titles",
      },
      {
        id: "q7",
        label: "Are there reference documents or domain knowledge files?",
        type: "textarea" as const,
        placeholder: "e.g., domain knowledge/brand-guidelines.pdf",
      },
      {
        id: "q8",
        label: "Are there any preconditions that must be true before starting?",
        type: "textarea" as const,
        placeholder: "e.g., Input CSV file must exist, API keys configured",
      },
    ],
  },
  {
    title: "Delivery & Dependencies",
    questions: [
      {
        id: "q9",
        label: "Do any outputs need to be communicated/shared?",
        type: "textarea" as const,
        placeholder: "e.g., Email report via Gmail, upload to Google Drive",
      },
      {
        id: "q10",
        label: "Are there dependencies between roles?",
        type: "textarea" as const,
        placeholder: "e.g., Data Analyst must finish before Report Writer starts",
      },
      {
        id: "q11",
        label: "Should the workflow use any specific tools or technologies?",
        type: "textarea" as const,
        placeholder: "e.g., Python for analysis, specific frameworks",
      },
    ],
  },
];

export const ROLE_QUESTIONS = [
  { id: "name", label: "Role name", type: "text" as const, placeholder: "e.g., Data Analyst" },
  { id: "description", label: "Role description", type: "textarea" as const, placeholder: "What does this role do?" },
  { id: "objectives", label: "Objectives", type: "textarea" as const, placeholder: "Main objectives for this role (one per line)" },
  { id: "keyResults", label: "Key Results", type: "textarea" as const, placeholder: "Measurable key results (one per line)" },
  { id: "inputsOutputs", label: "Inputs & Outputs", type: "textarea" as const, placeholder: "What this role receives and produces (one per line, format: input -> output)" },
];

// Status color mapping
export const STATUS_COLORS = {
  PENDING: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-400",
    dot: "bg-amber-400",
    glow: "shadow-amber-500/20",
  },
  COMPLETED: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
    glow: "shadow-emerald-500/20",
  },
  "NOT COMPLETED": {
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    text: "text-rose-400",
    dot: "bg-rose-400",
    glow: "shadow-rose-500/20",
  },
  ACHIEVED: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
    glow: "shadow-emerald-500/20",
  },
  "NOT ACHIEVED": {
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    text: "text-rose-400",
    dot: "bg-rose-400",
    glow: "shadow-rose-500/20",
  },
  "IN PROGRESS": {
    bg: "bg-sky-500/10",
    border: "border-sky-500/30",
    text: "text-sky-400",
    dot: "bg-sky-400",
    glow: "shadow-sky-500/20",
  },
  "NOT STARTED": {
    bg: "bg-zinc-500/10",
    border: "border-zinc-500/30",
    text: "text-zinc-400",
    dot: "bg-zinc-400",
    glow: "shadow-zinc-500/20",
  },
} as const;

// File extension icons
export const FILE_ICONS: Record<string, string> = {
  ".md": "FileText",
  ".json": "FileJson",
  ".yaml": "FileCode",
  ".yml": "FileCode",
  ".py": "FileCode",
  ".docx": "FileText",
  ".pdf": "FileText",
  ".xlsx": "Sheet",
  ".pptx": "Presentation",
  ".png": "Image",
  ".jpg": "Image",
  ".csv": "Sheet",
  ".txt": "FileText",
  ".html": "Globe",
};

// Skill auto-suggestion map
export const SKILL_SUGGESTIONS: Record<string, string[]> = {
  ".docx": ["docx"],
  ".pdf": ["pdf"],
  ".xlsx": ["xlsx"],
  ".csv": ["xlsx"],
  ".pptx": ["pptx"],
  email: ["gog"],
  calendar: ["gog"],
  drive: ["gog"],
  image: ["nano-banana-pro"],
  ".png": ["nano-banana-pro", "canvas-design"],
  web: ["frontend-design"],
  ".html": ["frontend-design"],
  cv: ["Jinja2-cv"],
  resume: ["Jinja2-cv"],
};
