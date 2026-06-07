// ═══════════════════════════════════════════
// AI HUB v3 — UI State Yönetimi
// ═══════════════════════════════════════════
import { create } from 'zustand';

interface UIState {
  showCommandPalette: boolean;
  showOnboarding: boolean;
  showCompareMode: boolean;
  activeRightPanel: 'notes' | 'kanban' | 'files' | null;
  isZenMode: boolean;
  isFullscreen: boolean;

  setCommandPalette: (v: boolean) => void;
  setOnboarding: (v: boolean) => void;
  setCompareMode: (v: boolean) => void;
  setActiveRightPanel: (panel: 'notes' | 'kanban' | 'files' | null) => void;
  toggleZenMode: () => void;
  toggleFullscreen: () => void;
}

export const useUIStore = create<UIState>(set => ({
  showCommandPalette: false,
  showOnboarding: (() => {
    try {
      return !localStorage.getItem('aihub_onboarding_done');
    } catch {
      return true;
    }
  })(),
  showCompareMode: false,
  activeRightPanel: null,
  isZenMode: false,
  isFullscreen: false,

  setCommandPalette: v => set({ showCommandPalette: v }),
  setOnboarding: v => {
    set({ showOnboarding: v });
    if (!v)
      try {
        localStorage.setItem('aihub_onboarding_done', '1');
      } catch {
        /* */
      }
  },
  setCompareMode: v => set({ showCompareMode: v }),
  setActiveRightPanel: panel =>
    set(s => ({ activeRightPanel: s.activeRightPanel === panel ? null : panel })),
  toggleZenMode: () => set(s => ({ isZenMode: !s.isZenMode })),
  toggleFullscreen: () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      set({ isFullscreen: true });
    } else {
      document.exitFullscreen();
      set({ isFullscreen: false });
    }
  },
}));
