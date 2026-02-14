import { motion, AnimatePresence } from "framer-motion";
import { OFFICE } from "./officeConstants";
import type { OfficeAgent, OfficeAgentStatus } from "@/types";

interface SharedBoardProps {
  agents: OfficeAgent[];
}

const NOTE_COLORS = ["#fef08a", "#bfdbfe", "#bbf7d0", "#fecaca", "#e9d5ff", "#fed7aa"];

const PIN_COLORS: Record<OfficeAgentStatus, string> = {
  entering: "#a1a1aa",
  idle: "#a1a1aa",
  working: "#4ade80",
  completed: "#34d399",
  failed: "#fb7185",
};

const PIN_STROKE: Record<OfficeAgentStatus, string> = {
  entering: "#71717a",
  idle: "#71717a",
  working: "#16a34a",
  completed: "#065f46",
  failed: "#be123c",
};

export default function SharedBoard({ agents }: SharedBoardProps) {
  const { boardX, boardY, boardW, boardH } = OFFICE;
  const completedCount = agents.filter((a) => a.officeStatus === "completed").length;
  const allDone = agents.length > 0 && completedCount === agents.length;
  const progressText = agents.length === 0
    ? "waiting for agents..."
    : allDone
      ? "All done!"
      : `${completedCount}/${agents.length} done`;

  return (
    <g>
      {/* Wooden frame (outer) */}
      <rect
        x={boardX - 4}
        y={boardY - 4}
        width={boardW + 8}
        height={boardH + 8}
        rx={4}
        fill="#6b5210"
      />
      {/* Wooden frame (inner border) */}
      <rect
        x={boardX - 2}
        y={boardY - 2}
        width={boardW + 4}
        height={boardH + 4}
        rx={3}
        fill="#8B6914"
      />
      {/* Board surface (cream/beige) */}
      <rect
        x={boardX}
        y={boardY}
        width={boardW}
        height={boardH}
        rx={2}
        fill="#fdf6e3"
        stroke="#d4b896"
        strokeWidth={0.5}
      />

      {/* Cork texture dots */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <circle
          key={`cork-${i}`}
          cx={boardX + 15 + i * 24}
          cy={boardY + 6}
          r={1}
          fill="#d4b896"
          opacity={0.4}
        />
      ))}

      {/* "shared.md" label badge */}
      <rect
        x={boardX + boardW / 2 - 32}
        y={boardY + 3}
        width={64}
        height={14}
        rx={7}
        fill="#3b2714"
      />
      <text
        x={boardX + boardW / 2}
        y={boardY + 12}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#f5deb3"
        fontSize={7}
        fontWeight="bold"
        fontFamily="monospace"
      >
        shared.md
      </text>

      {/* Pinned colored notes for ALL agents with status-colored pins */}
      <AnimatePresence>
        {agents.map((agent, i) => {
          const noteX = boardX + 8 + (i % 6) * 23;
          const noteY = boardY + 22 + Math.floor(i / 6) * 16;
          const noteColor = NOTE_COLORS[i % NOTE_COLORS.length];
          const pinColor = PIN_COLORS[agent.officeStatus];
          const pinStroke = PIN_STROKE[agent.officeStatus];
          const isWorking = agent.officeStatus === "working";
          return (
            <motion.g
              key={agent.name}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              {/* Note */}
              <rect
                x={noteX}
                y={noteY}
                width={18}
                height={14}
                rx={1}
                fill={noteColor}
                stroke="#00000015"
                strokeWidth={0.5}
              />
              {/* Pin with status color */}
              <circle
                cx={noteX + 9}
                cy={noteY + 1}
                r={2}
                fill={pinColor}
                stroke={pinStroke}
                strokeWidth={0.5}
              />
              {/* Pulse ring for working agents */}
              {isWorking && (
                <circle
                  cx={noteX + 9}
                  cy={noteY + 1}
                  r={2}
                  fill="none"
                  stroke={pinColor}
                  strokeWidth={0.5}
                  opacity={0.6}
                >
                  <animate
                    attributeName="r"
                    values="2;5;2"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.6;0;0.6"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              {/* Lines on note */}
              <line x1={noteX + 3} y1={noteY + 5} x2={noteX + 15} y2={noteY + 5} stroke="#00000020" strokeWidth={0.4} />
              <line x1={noteX + 3} y1={noteY + 8} x2={noteX + 12} y2={noteY + 8} stroke="#00000020" strokeWidth={0.4} />
            </motion.g>
          );
        })}
      </AnimatePresence>

      {/* Progress summary */}
      <text
        x={boardX + boardW / 2}
        y={boardY + boardH - 6}
        textAnchor="middle"
        fill={allDone ? "#065f46" : "#a89680"}
        fontSize={7}
        fontWeight={allDone ? "bold" : "normal"}
        fontFamily="sans-serif"
      >
        {progressText}
      </text>
    </g>
  );
}
