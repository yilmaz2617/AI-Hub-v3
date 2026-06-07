import { create } from 'zustand';

export type WebBridgeStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
  timestamp: number;
}

export interface ToolResult {
  id: string;
  name: string;
  data?: unknown;
  error?: string;
  timestamp: number;
}

export interface WebBridgeState {
  status: WebBridgeStatus;
  serverUrl: string;
  lastError: string | null;
  toolHistory: ToolCall[];
  lastResult: ToolResult | null;
  isExtensionInstalled: boolean;

  // Actions
  setStatus: (status: WebBridgeStatus) => void;
  setServerUrl: (url: string) => void;
  setError: (error: string | null) => void;
  addToolCall: (call: ToolCall) => void;
  setLastResult: (result: ToolResult) => void;
  setExtensionInstalled: (installed: boolean) => void;
  clearHistory: () => void;
}

export const useWebBridgeStore = create<WebBridgeState>(set => ({
  status: 'disconnected',
  serverUrl: 'ws://127.0.0.1:10086/ws',
  lastError: null,
  toolHistory: [],
  lastResult: null,
  isExtensionInstalled: false,

  setStatus: status => set({ status }),
  setServerUrl: serverUrl => set({ serverUrl }),
  setError: lastError => set({ lastError }),
  addToolCall: call =>
    set(state => ({
      toolHistory: [call, ...state.toolHistory].slice(0, 100),
    })),
  setLastResult: lastResult => set({ lastResult }),
  setExtensionInstalled: isExtensionInstalled => set({ isExtensionInstalled }),
  clearHistory: () => set({ toolHistory: [], lastResult: null }),
}));
