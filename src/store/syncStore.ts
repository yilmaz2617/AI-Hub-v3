import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SyncStoreState {
  autoSync: boolean;
  crossTabRealtime: boolean;
  githubBackup: boolean;
  conflictModal: boolean;
  offlineQueue: boolean;
  syncInterval: number;
  setAutoSync: (enabled: boolean) => void;
  setCrossTabRealtime: (enabled: boolean) => void;
  setGitHubBackup: (enabled: boolean) => void;
  setConflictModal: (enabled: boolean) => void;
  setOfflineQueue: (enabled: boolean) => void;
  setSyncInterval: (ms: number) => void;
}

export const useSyncStore = create<SyncStoreState>()(
  persist(
    (set) => ({
      autoSync: true,
      crossTabRealtime: true,
      githubBackup: true,
      conflictModal: false,
      offlineQueue: true,
      syncInterval: 2000,
      setAutoSync: (enabled) => set({ autoSync: enabled }),
      setCrossTabRealtime: (enabled) => set({ crossTabRealtime: enabled }),
      setGitHubBackup: (enabled) => set({ githubBackup: enabled }),
      setConflictModal: (enabled) => set({ conflictModal: enabled }),
      setOfflineQueue: (enabled) => set({ offlineQueue: enabled }),
      setSyncInterval: (ms) => set({ syncInterval: ms }),
    }),
    { name: 'ai-hub-sync-settings' }
  )
);
