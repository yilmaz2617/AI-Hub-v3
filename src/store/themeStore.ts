// ═══════════════════════════════════════════
// AI HUB v3 — Tema Yönetimi (Zustand)
// ═══════════════════════════════════════════
import { create } from 'zustand';
import { THEMES, STORAGE_KEYS } from '@/lib/constants';
import type { ThemeId } from '@/types';

interface ThemeState {
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
  toggleTheme: () => void;
  applyTheme: () => void;
}

const getStoredTheme = (): ThemeId => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeId;
    if (stored && THEMES.find(t => t.id === stored)) return stored;
  } catch {
    /* ignore */
  }
  return 'dark';
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  themeId: getStoredTheme(),

  setTheme: (id: ThemeId) => {
    set({ themeId: id });
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, id);
    } catch {
      /* ignore */
    }
    setTimeout(() => get().applyTheme(), 0);
  },

  toggleTheme: () => {
    const themes: ThemeId[] = ['dark', 'light', 'ocean', 'sunset', 'matrix', 'purple', 'nord'];
    const current = get().themeId;
    const idx = themes.indexOf(current);
    const next = themes[(idx + 1) % themes.length];
    get().setTheme(next);
  },

  applyTheme: () => {
    const theme = THEMES.find(t => t.id === get().themeId);
    if (!theme) return;
    const root = document.documentElement;
    Object.entries(theme.vars).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });
    root.setAttribute('data-theme', theme.id);
  },
}));
