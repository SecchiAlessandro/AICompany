import { create } from "zustand";

interface WebSocketStore {
  connected: boolean;
  lastEvent: string | null;
  setConnected: (connected: boolean) => void;
  setLastEvent: (event: string) => void;
}

export const useWebSocketStore = create<WebSocketStore>((set) => ({
  connected: false,
  lastEvent: null,
  setConnected: (connected) => set({ connected }),
  setLastEvent: (event) => set({ lastEvent: event }),
}));
