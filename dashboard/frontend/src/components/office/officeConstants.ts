import type { OfficeAgentStatus } from "@/types";

export const OFFICE = {
  viewBox: "0 0 520 480",
  width: 520,
  height: 480,
  padding: 30,
  boardX: 185,
  boardY: 420,
  boardW: 150,
  boardH: 50,
  deskStartY: 60,
};

// Warm palette
export const FLOOR_COLORS = {
  brick1: "#9e8c78",
  brick2: "#8b7a66",
  brick3: "#a89680",
  grout: "#7a6b5a",
};

export const DESK_COLORS = {
  surface: "#a07828",
  border: "#6b5210",
  highlight: "#c09840",
  leg: "#8B6914",
};

export const SKIN_TONE = "#f5deb3";

export const SHIRT_COLORS = [
  "#d35f5f", // red
  "#5b8abf", // blue
  "#5ea878", // green
  "#9b7abf", // purple
  "#d4884a", // orange
  "#bf5b8a", // pink
  "#5bbfb3", // teal
  "#bfaa5b", // gold
];

export const HAIR_COLORS = [
  "#3b2714", // dark brown
  "#1a1a1a", // black
  "#6b4226", // medium brown
  "#8b5e3c", // light brown
  "#c4883c", // blonde
  "#2d1b0e", // very dark
  "#4a3520", // brown
  "#1f1f2e", // dark blue-black
];

export function getDeskLayout(agentCount: number) {
  const cols = agentCount <= 4 ? 2 : 3;
  return { cols, deskW: 140, deskH: 90, gap: 30 };
}

export function getDeskPosition(index: number, agentCount: number) {
  const { cols, deskW, deskH, gap } = getDeskLayout(agentCount);
  const totalRowW = cols * deskW + (cols - 1) * gap;
  const startX = (OFFICE.width - totalRowW) / 2;
  const row = Math.floor(index / cols);
  const col = index % cols;
  return {
    x: startX + col * (deskW + gap),
    y: OFFICE.deskStartY + row * (deskH + gap + 40),
  };
}

export const STATUS_COLORS: Record<
  OfficeAgentStatus,
  { ring: string; glow: string; bg: string; text: string }
> = {
  entering: {
    ring: "#38bdf8",
    glow: "rgba(56,189,248,0.3)",
    bg: "#dbeafe",
    text: "#1e40af",
  },
  idle: {
    ring: "#a1a1aa",
    glow: "rgba(113,113,122,0.15)",
    bg: "#e4e4e7",
    text: "#52525b",
  },
  working: {
    ring: "#4ade80",
    glow: "rgba(74,222,128,0.35)",
    bg: "#dcfce7",
    text: "#166534",
  },
  completed: {
    ring: "#34d399",
    glow: "rgba(52,211,153,0.35)",
    bg: "#d1fae5",
    text: "#065f46",
  },
  failed: {
    ring: "#fb7185",
    glow: "rgba(251,113,133,0.35)",
    bg: "#ffe4e6",
    text: "#9f1239",
  },
};

export function getInitials(name: string): string {
  return name
    .split(/[\s_-]+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}
