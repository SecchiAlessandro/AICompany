import { motion } from "framer-motion";
import type { OfficeAgentStatus } from "@/types";
import { STATUS_COLORS } from "./officeConstants";

interface SpeechBalloonProps {
  x: number;
  y: number;
  status: OfficeAgentStatus;
  text: string;
}

export default function SpeechBalloon({ x, y, status, text }: SpeechBalloonProps) {
  const colors = STATUS_COLORS[status];
  const balloonW = Math.max(72, text.length * 5.2 + 16);
  const balloonH = 26;
  const bx = x - balloonW / 2;
  const by = y - balloonH - 8;

  return (
    <motion.g
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.3 }}
    >
      {/* Shadow */}
      <rect
        x={bx + 2}
        y={by + 2}
        width={balloonW}
        height={balloonH}
        rx={10}
        fill="#00000020"
      />
      {/* Balloon body */}
      <rect
        x={bx}
        y={by}
        width={balloonW}
        height={balloonH}
        rx={10}
        fill="#ffffff"
        stroke="#d4d4d8"
        strokeWidth={1}
      />
      {/* Triangle pointer */}
      <polygon
        points={`${x - 5},${by + balloonH - 1} ${x + 5},${by + balloonH - 1} ${x},${by + balloonH + 6}`}
        fill="#ffffff"
        stroke="#d4d4d8"
        strokeWidth={1}
      />
      {/* White cover for triangle top border overlap */}
      <rect
        x={x - 6}
        y={by + balloonH - 2}
        width={12}
        height={3}
        fill="#ffffff"
      />

      {/* Status badge */}
      <rect
        x={x - text.length * 2.8}
        y={by + 5}
        width={text.length * 5.6}
        height={16}
        rx={8}
        fill={colors.bg}
      />
      <text
        x={x}
        y={by + 15}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={colors.text}
        fontSize={8}
        fontWeight="bold"
        fontFamily="sans-serif"
      >
        {text}
      </text>
    </motion.g>
  );
}
