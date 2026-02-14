import { AnimatePresence } from "framer-motion";
import type { AgentSection, DependencyEdge, WorkflowStatusType } from "@/types";
import { OFFICE, FLOOR_COLORS } from "./officeConstants";
import { useAgentOfficeState } from "./useAgentOfficeState";
import AgentDesk from "./AgentDesk";
import AgentCharacter from "./AgentCharacter";
import SharedBoard from "./SharedBoard";
import { getDeskPosition, getDeskLayout } from "./officeConstants";

interface AgentOfficeProps {
  agents: AgentSection[];
  edges: DependencyEdge[];
  workflowStatus: WorkflowStatusType;
}

export default function AgentOffice({
  agents,
  edges,
  workflowStatus,
}: AgentOfficeProps) {
  const { officeAgents } = useAgentOfficeState(
    agents,
    edges,
    workflowStatus
  );

  return (
    <div className="rounded-xl border border-amber-900/30 bg-amber-950/20 overflow-hidden">
      <svg
        viewBox={OFFICE.viewBox}
        className="w-full h-auto"
        style={{ minHeight: 320 }}
      >
        {/* Brick tile floor pattern */}
        <defs>
          <pattern
            id="brick-floor"
            width="40"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            {/* Row 1 - full bricks */}
            <rect x={0} y={0} width={18} height={9} rx={1} fill={FLOOR_COLORS.brick1} />
            <rect x={20} y={0} width={18} height={9} rx={1} fill={FLOOR_COLORS.brick2} />
            {/* Row 2 - offset bricks */}
            <rect x={-10} y={10} width={18} height={9} rx={1} fill={FLOOR_COLORS.brick3} />
            <rect x={10} y={10} width={18} height={9} rx={1} fill={FLOOR_COLORS.brick1} />
            <rect x={30} y={10} width={18} height={9} rx={1} fill={FLOOR_COLORS.brick2} />
            {/* Grout lines */}
            <rect x={0} y={0} width={40} height={20} fill="none" stroke={FLOOR_COLORS.grout} strokeWidth={1} />
            <line x1={19} y1={0} x2={19} y2={9} stroke={FLOOR_COLORS.grout} strokeWidth={1} />
            <line x1={0} y1={9.5} x2={40} y2={9.5} stroke={FLOOR_COLORS.grout} strokeWidth={1} />
            <line x1={9} y1={10} x2={9} y2={19} stroke={FLOOR_COLORS.grout} strokeWidth={1} />
            <line x1={29} y1={10} x2={29} y2={19} stroke={FLOOR_COLORS.grout} strokeWidth={1} />
          </pattern>

          {/* Subtle shadow for depth */}
          <radialGradient id="floor-shadow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="100%" stopColor="#00000030" />
          </radialGradient>
        </defs>

        {/* Base warm background */}
        <rect width="100%" height="100%" fill={FLOOR_COLORS.grout} />
        {/* Brick pattern overlay */}
        <rect width="100%" height="100%" fill="url(#brick-floor)" />
        {/* Subtle vignette */}
        <rect width="100%" height="100%" fill="url(#floor-shadow)" />

        {/* Desks */}
        {officeAgents.map((agent) => {
          const pos = getDeskPosition(agent.deskIndex, officeAgents.length);
          const { deskW, deskH } = getDeskLayout(officeAgents.length);
          return (
            <AgentDesk
              key={`desk-${agent.name}`}
              x={pos.x}
              y={pos.y}
              width={deskW}
              height={deskH}
              status={agent.officeStatus}
              agentIndex={agent.deskIndex}
              agentName={agent.name}
            />
          );
        })}

        {/* Agent characters */}
        <AnimatePresence>
          {officeAgents.map((agent) => (
            <AgentCharacter
              key={agent.name}
              agent={agent}
              totalAgents={officeAgents.length}
            />
          ))}
        </AnimatePresence>

        {/* Shared board */}
        <SharedBoard agents={officeAgents} />
      </svg>
    </div>
  );
}
