// Kimi WebBridge Extension - TypeScript Tip Tanımları

// Runtime Message Types
export interface RuntimeMessage {
  type: 'GET_STATUS' | 'CONNECT' | 'DISCONNECT' | 'TEST_CONNECTION' | 'GENERATE_CONNECTION' | 'TOOL_CALL';
  url?: string;
  serverBase?: string;
  payload?: {
    name: string;
    args: Record<string, unknown>;
  };
}

export interface RuntimeResponse {
  connected?: boolean;
  serverUrl?: string;
  success?: boolean;
  error?: string;
  ok?: boolean;
  reason?: string;
  data?: unknown;
}

// WebSocket Message Types
export interface WSMessage {
  type: 'hello' | 'hello_ack' | 'ping' | 'pong' | 'tool_call' | 'tool_result';
  requestId?: string;
  responseToRequestId?: string;
  payload?: unknown;
}

export interface HelloPayload {
  extensionVersion: string;
}

export interface ToolCallPayload {
  name: string;
  args: Record<string, unknown>;
}

export interface ToolResultPayload {
  data?: unknown;
  error?: string;
}

// Tool Types
export type ToolName = 
  | 'navigate'
  | 'find_tab'
  | 'evaluate'
  | 'network'
  | 'snapshot'
  | 'click'
  | 'fill'
  | 'mouse_click'
  | 'cdp'
  | 'key_type'
  | 'send_keys'
  | 'screenshot'
  | 'save_as_pdf'
  | 'upload'
  | 'close_tab'
  | 'list_tabs'
  | 'close_session';

// Tool Arguments
export interface NavigateArgs {
  url: string;
  newTab?: boolean;
  _session?: string;
  group_title?: string;
}

export interface EvaluateArgs {
  code: string;
}

export interface SnapshotArgs {
  // No args needed
}

export interface ClickArgs {
  selector: string; // CSS selector or @e ref
}

export interface FillArgs {
  selector: string;
  value: string;
}

export interface ScreenshotArgs {
  format?: 'png' | 'jpeg';
  quality?: number;
  selector?: string;
}

export interface SendKeysArgs {
  keys: string;
  repeat?: number;
}

export interface NetworkArgs {
  cmd: 'start' | 'stop' | 'list' | 'detail';
  filter?: string;
  requestId?: string;
}

// Chrome Extension Types
declare global {
  interface Window {
    chrome?: typeof chrome;
  }
}

// Manifest Type
export interface WebBridgeManifest {
  manifest_version: 3;
  name: string;
  description: string;
  version: string;
  icons: Record<string, string>;
  permissions: string[];
  host_permissions: string[];
  background: {
    service_worker: string;
  };
  action: {
    default_popup: string;
  };
  key?: string;
}

// Store Types
export type WebBridgeStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface ToolCall {
  id: string;
  name: ToolName;
  args: Record<string, unknown>;
  timestamp: number;
}

export interface ToolResult {
  id: string;
  name: ToolName;
  data?: unknown;
  error?: string;
  timestamp: number;
}
