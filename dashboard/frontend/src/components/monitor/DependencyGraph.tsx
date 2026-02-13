import { useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  Position,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "dagre";
import type { AgentSection, DependencyEdge } from "@/types";
import AgentNode from "./AgentNode";
import { useNavigate } from "react-router-dom";

const nodeTypes = { agent: AgentNode };

interface DependencyGraphProps {
  agents: AgentSection[];
  edges: DependencyEdge[];
}

function layoutGraph(
  agents: AgentSection[],
  depEdges: DependencyEdge[]
): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "LR", nodesep: 50, ranksep: 100 });

  const agentMap = new Map(agents.map((a) => [a.name, a]));

  agents.forEach((agent) => {
    g.setNode(agent.name, { width: 200, height: 100 });
  });

  depEdges.forEach((e) => {
    if (agentMap.has(e.source) && agentMap.has(e.target)) {
      g.setEdge(e.source, e.target);
    }
  });

  dagre.layout(g);

  const nodes: Node[] = agents.map((agent) => {
    const pos = g.node(agent.name);
    return {
      id: agent.name,
      type: "agent",
      position: { x: (pos?.x ?? 0) - 100, y: (pos?.y ?? 0) - 50 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: { agent },
    };
  });

  const edges: Edge[] = depEdges
    .filter((e) => agentMap.has(e.source) && agentMap.has(e.target))
    .map((e, i) => ({
      id: `e-${i}`,
      source: e.source,
      target: e.target,
      animated:
        agentMap.get(e.source)?.status === "COMPLETED" &&
        agentMap.get(e.target)?.status === "PENDING",
      style: {
        stroke:
          agentMap.get(e.target)?.status === "COMPLETED"
            ? "#10b981"
            : "#3f3f46",
        strokeWidth: 2,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color:
          agentMap.get(e.target)?.status === "COMPLETED"
            ? "#10b981"
            : "#3f3f46",
      },
    }));

  return { nodes, edges };
}

export default function DependencyGraph({ agents, edges: depEdges }: DependencyGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (agents.length > 0) {
      const layout = layoutGraph(agents, depEdges);
      setNodes(layout.nodes);
      setEdges(layout.edges);
    }
  }, [agents, depEdges, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      navigate(`/monitor/agents/${node.id}`);
    },
    [navigate]
  );

  if (agents.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50">
        <p className="text-sm text-zinc-500">No agents to display</p>
      </div>
    );
  }

  return (
    <div className="h-[400px] rounded-xl border border-zinc-800 bg-zinc-900/50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#27272a" gap={20} />
        <Controls className="!bg-zinc-900 !border-zinc-700" />
      </ReactFlow>
    </div>
  );
}
