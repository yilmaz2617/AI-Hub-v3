// ═══════════════════════════════════════════
// AI HUB v3 — Ayarlar Store (Zustand)
// ═══════════════════════════════════════════
import { create } from 'zustand';

interface SettingsState {
  soundEnabled: boolean;
  fontSize: number;
  lineHeight: number;
  animationsEnabled: boolean;
  streamSpeed: number; // ms per char
  compactMode: boolean;
  
  toggleSound: () => void;
  setFontSize: (size: number) => void;
  setLineHeight: (height: number) => void;
  toggleAnimations: () => void;
  setStreamSpeed: (speed: number) => void;
  toggleCompactMode: () => void;
  
  loadSettings: () => void;
  saveSettings: () => void;
}

const STORAGE_KEY = 'aihub_settings';

export const useSettingsStore = create<SettingsState>((set, get) => ({
  soundEnabled: true,
  fontSize: 13,
  lineHeight: 1.5,
  animationsEnabled: true,
  streamSpeed: 15,
  compactMode: false,

  toggleSound: () => {
    set(s => ({ soundEnabled: !s.soundEnabled }));
    get().saveSettings();
  },
  setFontSize: (size) => { set({ fontSize: size }); get().saveSettings(); },
  setLineHeight: (height) => { set({ lineHeight: height }); get().saveSettings(); },
  toggleAnimations: () => { set(s => ({ animationsEnabled: !s.animationsEnabled })); get().saveSettings(); },
  setStreamSpeed: (speed) => { set({ streamSpeed: speed }); get().saveSettings(); },
  toggleCompactMode: () => { set(s => ({ compactMode: !s.compactMode })); get().saveSettings(); },

  loadSettings: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        set(parsed);
      }
    } catch { /* ignore */ }
  },
  saveSettings: () => {
    try {
      const { soundEnabled, fontSize, lineHeight, animationsEnabled, streamSpeed, compactMode } = get();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ soundEnabled, fontSize, lineHeight, animationsEnabled, streamSpeed, compactMode }));
    } catch { /* ignore */ }
  },
}));
