// ═══════════════════════════════════════════
// AI HUB v3 — Tip Tanımlamaları
// ═══════════════════════════════════════════

export type Provider = 'groq' | 'openrouter' | 'gemini' | 'anthropic' | 'pollinations';

export type ThemeId = 'dark' | 'light' | 'ocean' | 'sunset' | 'matrix' | 'purple' | 'nord';

export type PanelId = 'chat' | 'premium' | 'image' | 'status' | 'improve';

export type IntentId = 'genel' | 'ui' | 'ozellik' | 'performans' | 'guvenlik';

export interface ModelInfo {
  id: string;
  name: string;
  info: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  provider?: string;
  model?: string;
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  provider: Provider;
  model: string;
  systemPrompt: string;
  createdAt: number;
  updatedAt: number;
}

export interface APIKeyEntry {
  id: Provider;
  name: string;
  key: string;
  status: 'unknown' | 'checking' | 'up' | 'down' | 'nokey';
  desc: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  model: string;
  size: string;
  seed: number;
  negative?: string;
  createdAt: number;
}

export interface Suggestion {
  icon: string;
  title: string;
  detail: string;
  category: string;
  inject: string;
}

export interface ImprovementBackup {
  id: string;
  title: string;
  detail: string;
  codeSnapshot: string;
  timestamp: number;
}

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  icon: string;
  vars: Record<string, string>;
}

export interface ImageModel {
  id: string;
  name: string;
  group: string;
}

export interface QuickPrompt {
  icon: string;
  label: string;
  prompt: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  duration: number;
}

// ═══════════════════════════════════════════
// Deep Research Types
// ═══════════════════════════════════════════

export interface ResearchTask {
  id: string;
  query: string;
  status: 'pending' | 'researching' | 'coding' | 'testing' | 'done' | 'error';
  findings: ResearchFinding[];
  generatedCode: GeneratedCodeFile[];
  testResults: TestResult;
  createdAt: number;
  completedAt?: number;
}

export interface ResearchFinding {
  source: string;
  title: string;
  snippet: string;
  url?: string;
  relevance: number;
}

export interface GeneratedCodeFile {
  path: string;
  content: string;
  description: string;
}

export interface TestResult {
  lint: boolean;
  tests: boolean;
  errors: string[];
}

export type ResearchPanelId = PanelId | 'research';

export interface ResearchTask {
  id: string;
  query: string;
  status: 'pending' | 'researching' | 'coding' | 'testing' | 'done' | 'error';
  findings: ResearchFinding[];
  generatedCode: GeneratedCodeFile[];
  testResults: TestResult;
  createdAt: number;
  completedAt?: number;
}

export interface ResearchFinding {
  source: string;
  title: string;
  snippet: string;
  url?: string;
  relevance: number;
}

export interface GeneratedCodeFile {
  path: string;
  content: string;
  description: string;
}

export interface TestResult {
  lint: boolean;
  tests: boolean;
  errors: string[];
}

export type ResearchPanelId = PanelId | 'research';
