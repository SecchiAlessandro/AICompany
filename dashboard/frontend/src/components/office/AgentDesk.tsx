import { motion } from "framer-motion";
import type { OfficeAgentStatus } from "@/types";
import { DESK_COLORS } from "./officeConstants";

interface AgentDeskProps {
  x: number;
  y: number;
  width: number;
  height: number;
  status: OfficeAgentStatus;
  agentIndex: number;
  agentName: string;
}

// Desk items vary per agent index
function DeskItems({ x, y, index }: { x: number; y: number; index: number }) {
  const items = index % 4;

  return (
    <g>
      {/* Coffee mug (agents 0, 2) */}
      {(items === 0 || items === 2) && (
        <g transform={`translate(${x + 14}, ${y + 18})`}>
          <rect x={0} y={0} width={8} height={10} rx={2} fill="#e8d5b7" stroke="#c9a96e" strokeWidth={0.8} />
          {/* Handle */}
          <path d="M 8 2 Q 12 2 12 6 Q 12 10 8 10" fill="none" stroke="#c9a96e" strokeWidth={0.8} />
          {/* Steam */}
          <path d="M 2 -2 Q 3 -5 2 -7" fill="none" stroke="#d4c5a9" strokeWidth={0.5} opacity={0.6} />
          <path d="M 5 -2 Q 6 -6 5 -8" fill="none" stroke="#d4c5a9" strokeWidth={0.5} opacity={0.6} />
        </g>
      )}

      {/* Notepad (agents 0, 3) */}
      {(items === 0 || items === 3) && (
        <g transform={`translate(${x + 100}, ${y + 16})`}>
          <rect x={0} y={0} width={16} height={20} rx={1} fill="#fef9c3" stroke="#d4c060" strokeWidth={0.6} />
          {/* Lines */}
          <line x1={3} y1={5} x2={13} y2={5} stroke="#bbb070" strokeWidth={0.4} />
          <line x1={3} y1={9} x2={13} y2={9} stroke="#bbb070" strokeWidth={0.4} />
          <line x1={3} y1={13} x2={10} y2={13} stroke="#bbb070" strokeWidth={0.4} />
        </g>
      )}

      {/* Pencil (agents 1, 3) */}
      {(items === 1 || items === 3) && (
        <g transform={`translate(${x + 110}, ${y + 42})`}>
          <rect x={0} y={0} width={18} height={4} rx={0.5} fill="#f0c040" stroke="#c9a020" strokeWidth={0.5} transform="rotate(-15)" />
          <polygon points="18,-1 22,1 18,4" fill="#f5deb3" stroke="#c9a020" strokeWidth={0.4} transform="rotate(-15)" />
        </g>
      )}

      {/* Headphones (agents 1, 2) */}
      {(items === 1 || items === 2) && (
        <g transform={`translate(${x + 14}, ${y + 42})`}>
          <path d="M 0 8 Q 0 0 6 0 Q 12 0 12 8" fill="none" stroke="#555" strokeWidth={1.5} />
          <rect x={-2} y={6} width={5} height={6} rx={2} fill="#444" />
          <rect x={9} y={6} width={5} height={6} rx={2} fill="#444" />
        </g>
      )}
    </g>
  );
}

export default function AgentDesk({
  x,
  y,
  width,
  height,
  status,
  agentIndex,
  agentName,
}: AgentDeskProps) {
  const isWorking = status === "working";

  // Desk is drawn in the lower portion of the station area
  const deskY = y + 40;
  const deskH = height - 40;

  return (
    <g>
      {/* Chair/stool (behind character, drawn first) */}
      <circle
        cx={x + width / 2}
        cy={y + 34}
        r={14}
        fill="#8B6914"
        stroke="#6b5210"
        strokeWidth={1}
      />
      <circle
        cx={x + width / 2}
        cy={y + 34}
        r={10}
        fill="#a07828"
        stroke="#8B6914"
        strokeWidth={0.5}
      />

      {/* Desk surface */}
      <rect
        x={x + 4}
        y={deskY}
        width={width - 8}
        height={deskH}
        rx={6}
        fill={DESK_COLORS.surface}
        stroke={DESK_COLORS.border}
        strokeWidth={1.5}
      />
      {/* Subtle inner highlight */}
      <rect
        x={x + 8}
        y={deskY + 3}
        width={width - 16}
        height={deskH - 6}
        rx={4}
        fill="none"
        stroke={DESK_COLORS.highlight}
        strokeWidth={0.5}
        opacity={0.4}
      />
      {/* Wood grain lines */}
      <line x1={x + 20} y1={deskY + 8} x2={x + width - 20} y2={deskY + 10} stroke={DESK_COLORS.highlight} strokeWidth={0.3} opacity={0.3} />
      <line x1={x + 15} y1={deskY + 22} x2={x + width - 25} y2={deskY + 24} stroke={DESK_COLORS.highlight} strokeWidth={0.3} opacity={0.3} />

      {/* Monitor */}
      <rect
        x={x + width / 2 - 22}
        y={deskY + 5}
        width={44}
        height={28}
        rx={3}
        fill="#1a1a2e"
        stroke="#333"
        strokeWidth={1}
      />
      {/* Monitor screen content */}
      {isWorking ? (
        <g>
          {/* Green code lines for working state */}
          <rect x={x + width / 2 - 17} y={deskY + 10} width={20} height={2} rx={1} fill="#4ade80" opacity={0.7} />
          <rect x={x + width / 2 - 17} y={deskY + 14} width={14} height={2} rx={1} fill="#4ade80" opacity={0.5} />
          <rect x={x + width / 2 - 17} y={deskY + 18} width={24} height={2} rx={1} fill="#38bdf8" opacity={0.5} />
          <rect x={x + width / 2 - 17} y={deskY + 22} width={10} height={2} rx={1} fill="#4ade80" opacity={0.4} />
          {/* Screen glow */}
          <motion.rect
            x={x + width / 2 - 22}
            y={deskY + 5}
            width={44}
            height={28}
            rx={3}
            fill="none"
            stroke="#4ade80"
            strokeWidth={1.5}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </g>
      ) : (
        <g>
          {/* Idle/static screen content */}
          <rect x={x + width / 2 - 17} y={deskY + 10} width={16} height={2} rx={1} fill="#555" opacity={0.5} />
          <rect x={x + width / 2 - 17} y={deskY + 14} width={22} height={2} rx={1} fill="#555" opacity={0.4} />
          <rect x={x + width / 2 - 17} y={deskY + 18} width={12} height={2} rx={1} fill="#555" opacity={0.3} />
        </g>
      )}
      {/* Monitor stand */}
      <rect
        x={x + width / 2 - 5}
        y={deskY + 33}
        width={10}
        height={6}
        fill="#333"
      />
      <rect
        x={x + width / 2 - 12}
        y={deskY + 38}
        width={24}
        height={3}
        rx={1}
        fill="#333"
      />

      {/* Desk items */}
      <DeskItems x={x} y={deskY} index={agentIndex} />

      {/* Name badge below desk */}
      <rect
        x={x + width / 2 - 40}
        y={y + height + 6}
        width={80}
        height={18}
        rx={9}
        fill="#3b2714"
      />
      <text
        x={x + width / 2}
        y={y + height + 17}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#f5deb3"
        fontSize={8}
        fontWeight="bold"
        fontFamily="sans-serif"
      >
        {agentName.length > 14 ? agentName.slice(0, 13) + "…" : agentName}
      </text>
    </g>
  );
}
