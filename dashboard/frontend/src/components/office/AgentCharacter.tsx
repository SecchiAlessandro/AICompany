import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { OfficeAgent } from "@/types";
import {
  SKIN_TONE,
  SHIRT_COLORS,
  HAIR_COLORS,
  getDeskPosition,
  getDeskLayout,
  OFFICE,
} from "./officeConstants";
import { characterVariants } from "./officeAnimations";
import OfficeTooltip from "./OfficeTooltip";
import SpeechBalloon from "./SpeechBalloon";

interface AgentCharacterProps {
  agent: OfficeAgent;
  totalAgents: number;
}

// Different hair styles per agent index
function Hair({ cx, cy, index }: { cx: number; cy: number; index: number }) {
  const color = HAIR_COLORS[index % HAIR_COLORS.length];
  const style = index % 5;

  switch (style) {
    case 0:
      // Short hair - arcs on top
      return (
        <g>
          <path
            d={`M ${cx - 10} ${cy - 2} Q ${cx - 10} ${cy - 15} ${cx} ${cy - 16} Q ${cx + 10} ${cy - 15} ${cx + 10} ${cy - 2}`}
            fill={color}
          />
        </g>
      );
    case 1:
      // Spiky hair
      return (
        <g>
          <path
            d={`M ${cx - 9} ${cy - 4} L ${cx - 7} ${cy - 18} L ${cx - 3} ${cy - 10} L ${cx} ${cy - 20} L ${cx + 3} ${cy - 10} L ${cx + 7} ${cy - 18} L ${cx + 9} ${cy - 4}`}
            fill={color}
          />
        </g>
      );
    case 2:
      // Side part
      return (
        <g>
          <path
            d={`M ${cx - 11} ${cy} Q ${cx - 12} ${cy - 16} ${cx - 2} ${cy - 16} Q ${cx + 10} ${cy - 16} ${cx + 11} ${cy - 4}`}
            fill={color}
          />
          <ellipse cx={cx + 8} cy={cy - 6} rx={4} ry={6} fill={color} />
        </g>
      );
    case 3:
      // Curly/round
      return (
        <g>
          <circle cx={cx - 6} cy={cy - 10} r={5} fill={color} />
          <circle cx={cx} cy={cy - 13} r={5} fill={color} />
          <circle cx={cx + 6} cy={cy - 10} r={5} fill={color} />
          <circle cx={cx - 8} cy={cy - 5} r={4} fill={color} />
          <circle cx={cx + 8} cy={cy - 5} r={4} fill={color} />
        </g>
      );
    case 4:
      // Flat top
      return (
        <g>
          <rect x={cx - 10} y={cy - 16} width={20} height={14} rx={3} fill={color} />
        </g>
      );
    default:
      return null;
  }
}

export default function AgentCharacter({
  agent,
  totalAgents,
}: AgentCharacterProps) {
  const [hovered, setHovered] = useState(false);
  const { x, y } = getDeskPosition(agent.deskIndex, totalAgents);
  const { deskW } = getDeskLayout(totalAgents);

  const shirtColor = SHIRT_COLORS[agent.deskIndex % SHIRT_COLORS.length];

  // Character center: above the desk area
  const cx = x + deskW / 2;
  const cy = y + 18;
  const headR = 11;

  return (
    <OfficeTooltip agent={agent}>
      <motion.g
        variants={characterVariants}
        animate={agent.officeStatus}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ cursor: "pointer" }}
      >
        {/* Legs (below body, visible on sides of chair) */}
        <rect x={cx - 6} y={cy + 18} width={4} height={10} rx={2} fill="#3b3b3b" />
        <rect x={cx + 2} y={cy + 18} width={4} height={10} rx={2} fill="#3b3b3b" />

        {/* Body/shirt - rounded rectangle */}
        <rect
          x={cx - 12}
          y={cy + 4}
          width={24}
          height={18}
          rx={6}
          fill={shirtColor}
          stroke={shirtColor}
          strokeWidth={0.5}
        />
        {/* Shirt collar detail */}
        <path
          d={`M ${cx - 4} ${cy + 4} L ${cx} ${cy + 8} L ${cx + 4} ${cy + 4}`}
          fill="none"
          stroke="#ffffff40"
          strokeWidth={0.8}
        />

        {/* Head */}
        <circle cx={cx} cy={cy} r={headR} fill={SKIN_TONE} />

        {/* Hair */}
        <Hair cx={cx} cy={cy} index={agent.deskIndex} />

        {/* Eyes - simple dots */}
        <circle cx={cx - 4} cy={cy + 1} r={1.5} fill="#2d2d2d" />
        <circle cx={cx + 4} cy={cy + 1} r={1.5} fill="#2d2d2d" />

        {/* Small smile */}
        {agent.officeStatus === "completed" ? (
          // Happy smile
          <path
            d={`M ${cx - 3} ${cy + 5} Q ${cx} ${cy + 8} ${cx + 3} ${cy + 5}`}
            fill="none"
            stroke="#7a5a3a"
            strokeWidth={0.8}
            strokeLinecap="round"
          />
        ) : agent.officeStatus === "failed" ? (
          // Sad frown
          <path
            d={`M ${cx - 3} ${cy + 7} Q ${cx} ${cy + 4} ${cx + 3} ${cy + 7}`}
            fill="none"
            stroke="#7a5a3a"
            strokeWidth={0.8}
            strokeLinecap="round"
          />
        ) : (
          // Neutral/slight smile
          <path
            d={`M ${cx - 2} ${cy + 5} Q ${cx} ${cy + 6.5} ${cx + 2} ${cy + 5}`}
            fill="none"
            stroke="#7a5a3a"
            strokeWidth={0.8}
            strokeLinecap="round"
          />
        )}

        {/* Speech balloon */}
        <AnimatePresence mode="wait">
          <SpeechBalloon
            key={agent.balloonText}
            x={cx}
            y={cy - headR - 4}
            status={agent.officeStatus}
            text={agent.balloonText}
          />
        </AnimatePresence>

        {/* Document fly animation on completion */}
        <AnimatePresence>
          {agent.officeStatus === "completed" && (
            <motion.g
              key={`doc-${agent.name}`}
              initial={{ opacity: 1 }}
              animate={{
                x: [0, OFFICE.boardX + OFFICE.boardW / 2 - cx],
                y: [0, OFFICE.boardY + 20 - cy],
                opacity: [1, 1, 0],
                scale: [1, 0.7, 0.4],
              }}
              transition={{ duration: 1.2, ease: "easeInOut", delay: 0.5 }}
            >
              {/* Small document icon */}
              <rect
                x={cx - 4}
                y={cy + 10}
                width={8}
                height={10}
                rx={1}
                fill="#6ee7b7"
                stroke="#34d399"
                strokeWidth={0.5}
              />
              <line x1={cx - 2} y1={cy + 13} x2={cx + 2} y2={cy + 13} stroke="#065f46" strokeWidth={0.5} />
              <line x1={cx - 2} y1={cy + 16} x2={cx + 1} y2={cy + 16} stroke="#065f46" strokeWidth={0.5} />
            </motion.g>
          )}
        </AnimatePresence>
      </motion.g>
    </OfficeTooltip>
  );
}
