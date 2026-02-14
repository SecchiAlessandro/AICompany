import { useEffect, useRef } from "react";
import { useWebSocketStore } from "@/stores/websocketStore";
import { useWorkflowStore } from "@/stores/workflowStore";
import { useExecutionStore } from "@/stores/executionStore";
import { useAIWorkflowStore } from "@/stores/aiWorkflowStore";
import type { SharedMdStatus, CLIEvent, ExecutionSummary, PendingQuestion, StructuredQuestion } from "@/types";

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout>>();
  const { setConnected, setLastEvent } = useWebSocketStore();
  const { setStatus } = useWorkflowStore();

  const executionStoreRef = useRef(useExecutionStore.getState());
  useEffect(() => {
    return useExecutionStore.subscribe((state) => {
      executionStoreRef.current = state;
    });
  }, []);

  const aiWorkflowStoreRef = useRef(useAIWorkflowStore.getState());
  useEffect(() => {
    return useAIWorkflowStore.subscribe((state) => {
      aiWorkflowStoreRef.current = state;
    });
  }, []);

  useEffect(() => {
    function connect() {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          setLastEvent(msg.type);

          if (msg.type === "status_update" && msg.data) {
            setStatus(msg.data as SharedMdStatus);
          }

          const store = executionStoreRef.current;
          const activeId = store.activeExecutionId;

          if (msg.type === "cli_event" && msg.data) {
            if (activeId && msg.data.execution_id === activeId) {
              store.appendEvent(msg.data as CLIEvent);
            }
          }

          if (msg.type === "execution_state_change" && msg.data?.execution) {
            store.updateExecutionState(msg.data.execution as ExecutionSummary);
          }

          if (msg.type === "question_detected" && msg.data) {
            if (activeId && msg.data.execution_id === activeId) {
              store.setQuestion(msg.data.question as PendingQuestion);
            }
          }

          // --- AI Workflow Session handlers ---
          const aiStore = aiWorkflowStoreRef.current;
          const aiSessionId = aiStore.sessionId;

          if (msg.type === "structured_question_detected" && msg.data) {
            if (aiSessionId && msg.data.execution_id === aiSessionId) {
              const questions = (msg.data.questions || []) as StructuredQuestion[];
              const roundNumber = (msg.data.round_number as number) || aiStore.roundsCompleted + 1;
              aiStore.setCurrentRound({ roundNumber, questions });
            }
          }

          if (msg.type === "workflow_change" && msg.data) {
            const phase = aiStore.phase;
            if (phase !== "idle" && phase !== "failed" && phase !== "completed") {
              const filePath = (msg.data.path || msg.data.filename || "") as string;
              if (filePath && filePath.endsWith(".yaml")) {
                const filename = filePath.split("/").pop() || filePath;
                aiStore.setCreatedWorkflow(filename);
              }
            }
          }

          if (msg.type === "cli_event" && msg.data) {
            if (aiSessionId && msg.data.execution_id === aiSessionId) {
              aiStore.appendEvent(msg.data as CLIEvent);
            }
          }

          if (msg.type === "execution_state_change" && msg.data?.execution) {
            const exec = msg.data.execution as ExecutionSummary;
            if (aiSessionId && exec.id === aiSessionId) {
              aiStore.updateExecution(exec);
            }
          }
        } catch {
          // ignore parse errors
        }
      };

      ws.onclose = () => {
        setConnected(false);
        reconnectRef.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [setConnected, setLastEvent, setStatus]);
}
