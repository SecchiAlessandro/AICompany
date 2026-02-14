import { useRef, useState, useEffect, useCallback } from "react";
import type {
  AgentSection,
  DependencyEdge,
  WorkflowStatusType,
  OfficeAgent,
  OfficeAgentStatus,
} from "@/types";

function deriveStatus(
  agent: AgentSection,
  edges: DependencyEdge[],
  agents: AgentSection[],
  workflowStatus: WorkflowStatusType
): OfficeAgentStatus {
  if (agent.status === "COMPLETED") return "completed";
  if (agent.status === "NOT COMPLETED") return "failed";

  // PENDING — check if all upstream dependencies are COMPLETED
  const upstream = edges
    .filter((e) => e.target === agent.name)
    .map((e) => e.source);
  const allDepsCompleted =
    upstream.length === 0 ||
    upstream.every((dep) =>
      agents.find((a) => a.name === dep)?.status === "COMPLETED"
    );

  if (allDepsCompleted && workflowStatus === "IN PROGRESS") return "working";
  return "idle";
}

function deriveBalloonText(
  agent: AgentSection,
  officeStatus: OfficeAgentStatus,
  edges: DependencyEdge[],
  agents: AgentSection[]
): string {
  switch (officeStatus) {
    case "entering":
      return "Joining the team...";
    case "completed":
      return "Completed!";
    case "failed":
      return "Something went wrong";
    case "idle": {
      const upstream = edges
        .filter((e) => e.target === agent.name)
        .map((e) => e.source);
      const pendingDep = upstream.find(
        (dep) => agents.find((a) => a.name === dep)?.status !== "COMPLETED"
      );
      if (pendingDep) return `Waiting for ${pendingDep}...`;
      return "Standing by";
    }
    case "working": {
      const workingPeer = agents.find(
        (a) =>
          a.name !== agent.name &&
          a.status === "PENDING" &&
          edges
            .filter((e) => e.target === a.name)
            .map((e) => e.source)
            .every(
              (dep) =>
                agents.find((d) => d.name === dep)?.status === "COMPLETED"
            )
      );
      if (workingPeer) return `Working with ${workingPeer.name}`;
      return "Working on objectives...";
    }
    default:
      return "";
  }
}

export function useAgentOfficeState(
  agents: AgentSection[],
  edges: DependencyEdge[],
  workflowStatus: WorkflowStatusType
): { officeAgents: OfficeAgent[]; doorOpen: boolean } {
  const prevNamesRef = useRef<Set<string>>(new Set());
  const enteringRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );
  const [enteringNames, setEnteringNames] = useState<Set<string>>(new Set());
  const [doorOpen, setDoorOpen] = useState(false);

  const clearEnteringTimeout = useCallback((name: string) => {
    const timeout = enteringRef.current.get(name);
    if (timeout) {
      clearTimeout(timeout);
      enteringRef.current.delete(name);
    }
  }, []);

  useEffect(() => {
    const currentNames = new Set(agents.map((a) => a.name));
    const newNames: string[] = [];

    for (const name of currentNames) {
      if (!prevNamesRef.current.has(name)) {
        newNames.push(name);
      }
    }

    if (newNames.length > 0) {
      setDoorOpen(true);
      setTimeout(() => setDoorOpen(false), 1200);

      setEnteringNames((prev) => {
        const next = new Set(prev);
        newNames.forEach((n) => next.add(n));
        return next;
      });

      for (const name of newNames) {
        clearEnteringTimeout(name);
        const timeout = setTimeout(() => {
          setEnteringNames((prev) => {
            const next = new Set(prev);
            next.delete(name);
            return next;
          });
          enteringRef.current.delete(name);
        }, 1500);
        enteringRef.current.set(name, timeout);
      }
    }

    prevNamesRef.current = currentNames;
  }, [agents, clearEnteringTimeout]);

  // Cleanup timeouts on unmount only
  useEffect(() => {
    const ref = enteringRef;
    return () => {
      ref.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  const officeAgents: OfficeAgent[] = agents.map((agent, index) => {
    const isEntering = enteringNames.has(agent.name);
    const officeStatus: OfficeAgentStatus = isEntering
      ? "entering"
      : deriveStatus(agent, edges, agents, workflowStatus);
    const balloonText = deriveBalloonText(agent, officeStatus, edges, agents);

    return {
      name: agent.name,
      officeStatus,
      agentStatus: agent.status,
      key_results: agent.key_results,
      outputs: agent.outputs,
      deskIndex: index,
      balloonText,
    };
  });

  return { officeAgents, doorOpen };
}
