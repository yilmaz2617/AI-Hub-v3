// ═══════════════════════════════════════════
// AI HUB v3 — Chat State (Zustand)
// ═══════════════════════════════════════════
import { create } from 'zustand';
import type { ChatSession, Message, Provider } from '@/types';
import { STORAGE_KEYS, DEFAULT_SYSTEM_PROMPT } from '@/lib/constants';

interface ChatState {
  sessions: ChatSession[];
  activeSessionId: string | null;
  provider: Provider;
  model: string;
  systemPrompt: string;
  isStreaming: boolean;

  setProvider: (p: Provider, model?: string) => void;
  setModel: (m: string) => void;
  setSystemPrompt: (p: string) => void;
  createSession: () => string;
  deleteSession: (id: string) => void;
  setActiveSession: (id: string) => void;
  addMessage: (sessionId: string, msg: Message) => void;
  updateMessage: (sessionId: string, msgId: string, content: string) => void;
  clearSession: (id: string) => void;
  getActiveSession: () => ChatSession | null;
  setIsStreaming: (v: boolean) => void;
  saveSessions: () => void;
  loadSessions: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);
const now = () => Date.now();

const createDefaultSession = (): ChatSession => ({
  id: generateId(),
  title: 'Yeni Sohbet',
  messages: [{
    id: generateId(),
    role: 'assistant',
    content: 'Merhaba! AI Hub\'a hoş geldin. Groq, OpenRouter, Gemini, Claude ve Pollinations ile sohbet edebilirsin. API Durumu sekmesinden key\'lerini ekle veya Pollinations\'ı key\'siz dene!',
    timestamp: now(),
    provider: 'pollinations',
    model: 'openai',
  }],
  provider: 'groq',
  model: 'llama-3.3-70b-versatile',
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  createdAt: now(),
  updatedAt: now(),
});

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  activeSessionId: null,
  provider: 'groq',
  model: 'llama-3.3-70b-versatile',
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  isStreaming: false,

  setProvider: (p, model) => {
    set({ provider: p, model: model || get().model });
  },
  setModel: (m) => set({ model: m }),
  setSystemPrompt: (p) => set({ systemPrompt: p }),

  createSession: () => {
    const session = createDefaultSession();
    session.provider = get().provider;
    session.model = get().model;
    session.systemPrompt = get().systemPrompt;
    set(s => {
      const updated = [...s.sessions, session];
      return { sessions: updated, activeSessionId: session.id };
    });
    get().saveSessions();
    return session.id;
  },

  deleteSession: (id) => {
    set(s => {
      const filtered = s.sessions.filter(se => se.id !== id);
      let activeId = s.activeSessionId;
      if (activeId === id) {
        activeId = filtered.length > 0 ? filtered[filtered.length - 1].id : null;
      }
      return { sessions: filtered, activeSessionId: activeId };
    });
    get().saveSessions();
  },

  setActiveSession: (id) => {
    const session = get().sessions.find(s => s.id === id);
    if (session) {
      set({
        activeSessionId: id,
        provider: session.provider,
        model: session.model,
        systemPrompt: session.systemPrompt,
      });
    }
  },

  addMessage: (sessionId, msg) => {
    set(s => {
      const updated = s.sessions.map(se => {
        if (se.id !== sessionId) return se;
        const messages = [...se.messages, msg];
        // Auto-title first user message
        let title = se.title;
        if (title === 'Yeni Sohbet' && msg.role === 'user') {
          title = msg.content.substring(0, 40) + (msg.content.length > 40 ? '...' : '');
        }
        return { ...se, messages, title, updatedAt: now() };
      });
      return { sessions: updated };
    });
    get().saveSessions();
  },

  updateMessage: (sessionId, msgId, content) => {
    set(s => {
      const updated = s.sessions.map(se => {
        if (se.id !== sessionId) return se;
        const messages = se.messages.map(m =>
          m.id === msgId ? { ...m, content, isStreaming: false } : m
        );
        return { ...se, messages, updatedAt: now() };
      });
      return { sessions: updated };
    });
    get().saveSessions();
  },

  clearSession: (id) => {
    set(s => {
      const updated = s.sessions.map(se => {
        if (se.id !== id) return se;
        return {
          ...se,
          messages: [{
            id: generateId(),
            role: 'assistant' as const,
            content: 'Sohbet temizlendi.',
            timestamp: now(),
          }],
          updatedAt: now(),
        };
      });
      return { sessions: updated };
    });
    get().saveSessions();
  },

  getActiveSession: () => {
    const { sessions, activeSessionId } = get();
    return sessions.find(s => s.id === activeSessionId) || null;
  },

  setIsStreaming: (v) => set({ isStreaming: v }),

  saveSessions: () => {
    try {
      const { sessions } = get();
      const trimmed = sessions.slice(-20); // Keep last 20
      localStorage.setItem(STORAGE_KEYS.CHAT_SESSIONS, JSON.stringify(trimmed));
    } catch { /* ignore */ }
  },

  loadSessions: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CHAT_SESSIONS);
      if (stored) {
        const sessions: ChatSession[] = JSON.parse(stored);
        set({ sessions, activeSessionId: sessions.length > 0 ? sessions[sessions.length - 1].id : null });
      } else {
        // Create default session
        const session = createDefaultSession();
        set({ sessions: [session], activeSessionId: session.id });
      }
    } catch {
      const session = createDefaultSession();
      set({ sessions: [session], activeSessionId: session.id });
    }
  },
}));
