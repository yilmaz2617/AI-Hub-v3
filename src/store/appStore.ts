// ═══════════════════════════════════════════
// AI HUB v3 — Ana Uygulama State (Zustand)
// ═══════════════════════════════════════════
import { create } from 'zustand';
import type { PanelId, ToastMessage, ImprovementBackup } from '@/types';
import { STORAGE_KEYS } from '@/lib/constants';

interface AppState {
  activePanel: PanelId;
  isSidebarOpen: boolean;
  toasts: ToastMessage[];
  apiKeys: Record<string, string>;
  backups: ImprovementBackup[];
  isTranslating: boolean;
  
  setPanel: (panel: PanelId) => void;
  toggleSidebar: () => void;
  addToast: (msg: string, type?: ToastMessage['type'], duration?: number) => void;
  removeToast: (id: string) => void;
  setApiKey: (provider: string, key: string) => void;
  getApiKey: (provider: string) => string;
  loadApiKeys: () => void;
  addBackup: (backup: ImprovementBackup) => void;
  removeBackup: (id: string) => void;
  restoreBackup: (id: string) => string | null;
  loadBackups: () => void;
  setIsTranslating: (v: boolean) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useAppStore = create<AppState>((set, get) => ({
  activePanel: (() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PANEL);
      if (stored) return stored as PanelId;
    } catch { /* ignore */ }
    return 'chat';
  })(),
  isSidebarOpen: true,
  toasts: [],
  apiKeys: {},
  backups: [],
  isTranslating: false,

  setPanel: (panel: PanelId) => {
    set({ activePanel: panel });
    try { localStorage.setItem(STORAGE_KEYS.PANEL, panel); } catch { /* ignore */ }
  },

  toggleSidebar: () => set(s => ({ isSidebarOpen: !s.isSidebarOpen })),

  addToast: (msg, type = 'info', duration = 3000) => {
    const id = generateId();
    const toast: ToastMessage = { id, message: msg, type, duration };
    set(s => ({ toasts: [...s.toasts, toast] }));
    setTimeout(() => get().removeToast(id), duration);
  },

  removeToast: (id: string) => {
    set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }));
  },

  setApiKey: (provider: string, key: string) => {
    set(s => {
      const updated = { ...s.apiKeys, [provider]: key };
      try {
        localStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(updated));
      } catch { /* ignore */ }
      return { apiKeys: updated };
    });
  },

  getApiKey: (provider: string) => get().apiKeys[provider] || '',

  loadApiKeys: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.API_KEYS);
      if (stored) {
        const keys = JSON.parse(stored);
        set({ apiKeys: keys });
      }
    } catch { /* ignore */ }
  },

  addBackup: (backup: ImprovementBackup) => {
    set(s => {
      const updated = [...s.backups, backup];
      try {
        localStorage.setItem(STORAGE_KEYS.BACKUPS, JSON.stringify(updated));
      } catch { /* ignore */ }
      return { backups: updated };
    });
  },

  removeBackup: (id: string) => {
    set(s => {
      const updated = s.backups.filter(b => b.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.BACKUPS, JSON.stringify(updated));
      } catch { /* ignore */ }
      return { backups: updated };
    });
  },

  restoreBackup: (id: string) => {
    const backup = get().backups.find(b => b.id === id);
    return backup ? backup.codeSnapshot : null;
  },

  loadBackups: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BACKUPS);
      if (stored) {
        const backups = JSON.parse(stored);
        set({ backups });
      }
    } catch { /* ignore */ }
  },

  setIsTranslating: (v: boolean) => set({ isTranslating: v }),
}));
