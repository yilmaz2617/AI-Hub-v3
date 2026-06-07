import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { autoSync } from '../sync';

export interface AppState {
  // UI State
  activePanel: string;
  theme: 'light' | 'dark' | 'system';
  isSidebarOpen: boolean;

  // Chat State
  messages: Array<{ id: string; role: 'user' | 'assistant'; content: string; timestamp: number }>;

  // Improve State
  improveHistory: Array<{
    id: string;
    input: string;
    output: string;
    model: string;
    timestamp: number;
  }>;

  // API Keys
  groqApiKey: string;
  geminiApiKey: string;

  // Sync State
  _sync: {
    lastSyncTime: number | null;
    isSyncing: boolean;
    syncError: string | null;
  };

  // Actions
  setPanel: (panel: string) => void;
  setActivePanel: (panel: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
  addMessage: (message: Omit<AppState['messages'][0], 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  addImproveHistory: (item: Omit<AppState['improveHistory'][0], 'id' | 'timestamp'>) => void;
  setGroqApiKey: (key: string) => void;
  setGeminiApiKey: (key: string) => void;
  setSyncState: (state: Partial<AppState['_sync']>) => void;
}

export const useAppStore = create<AppState>()(
  subscribeWithSelector(
    persist(
      (set, _get) => ({
        // Initial state
        activePanel: 'chat',
        theme: 'system',
        isSidebarOpen: true,
        messages: [],
        improveHistory: [],
        groqApiKey: '',
        geminiApiKey: '',
        _sync: {
          lastSyncTime: null,
          isSyncing: false,
          syncError: null,
        },

        // Actions
        setPanel: panel => set({ activePanel: panel }),
        setActivePanel: panel => set({ activePanel: panel }),
        setTheme: theme => set({ theme }),
        toggleSidebar: () => set(s => ({ isSidebarOpen: !s.isSidebarOpen })),
        addMessage: message =>
          set(s => ({
            messages: [
              ...s.messages,
              { ...message, id: crypto.randomUUID(), timestamp: Date.now() },
            ],
          })),
        clearMessages: () => set({ messages: [] }),
        addImproveHistory: item =>
          set(s => ({
            improveHistory: [
              ...s.improveHistory,
              { ...item, id: crypto.randomUUID(), timestamp: Date.now() },
            ],
          })),
        setGroqApiKey: key => set({ groqApiKey: key }),
        setGeminiApiKey: key => set({ geminiApiKey: key }),
        setSyncState: state => set(s => ({ _sync: { ...s._sync, ...state } })),
      }),
      {
        name: 'ai-hub-v3-storage',
        partialize: state => ({
          activePanel: state.activePanel,
          theme: state.theme,
          isSidebarOpen: state.isSidebarOpen,
          messages: state.messages,
          improveHistory: state.improveHistory,
          groqApiKey: state.groqApiKey,
          geminiApiKey: state.geminiApiKey,
          _sync: state._sync,
        }),
      }
    )
  )
);

// Auto-sync subscription
let unsubscribeAutoSync: (() => void) | null = null;

export function initAutoSync(): () => void {
  if (unsubscribeAutoSync) return unsubscribeAutoSync;

  unsubscribeAutoSync = useAppStore.subscribe(
    state => state,
    state => {
      autoSync.trigger(state);
    }
  );

  return unsubscribeAutoSync;
}

export function setPanel(panel: string): void {
  useAppStore.getState().setActivePanel(panel);
}

export function toggleSidebar(): void {
  useAppStore.getState().toggleSidebar();
}

export function setTheme(theme: 'light' | 'dark' | 'system'): void {
  useAppStore.getState().setTheme(theme);
}
