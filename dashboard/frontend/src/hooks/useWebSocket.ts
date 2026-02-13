import { useEffect, useRef } from "react";
import { useWebSocketStore } from "@/stores/websocketStore";
import { useWorkflowStore } from "@/stores/workflowStore";
import type { SharedMdStatus } from "@/types";

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout>>();
  const { setConnected, setLastEvent } = useWebSocketStore();
  const { setStatus } = useWorkflowStore();

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
