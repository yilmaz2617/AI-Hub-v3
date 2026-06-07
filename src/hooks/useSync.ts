import { useCallback, useEffect, useState } from 'react';
import { useAppStore } from '../store/appStore';
import type { SyncState } from '../sync/types';

export function useSync() {
  const [syncState, setSyncState] = useState<SyncState>({
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSyncTime: null,
    syncError: null,
    pendingCount: 0,
    conflictCount: 0,
  });

  const state = useAppStore();

  useEffect(() => {
    const handleOnline = () => setSyncState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setSyncState(prev => ({ ...prev, isOnline: false }));
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncState(prev => ({ ...prev, pendingCount: offlineQueue.length }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const manualSync = useCallback(async () => {
    setSyncState(prev => ({ ...prev, isSyncing: true, syncError: null }));
    try {
      await githubSync.push(state);
      setSyncState(prev => ({ ...prev, isSyncing: false, lastSyncTime: Date.now() }));
    } catch (err) {
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        syncError: err instanceof Error ? err.message : 'Sync failed',
      }));
    }
  }, [state]);

  const setGitHubCredentials = useCallback((token: string, gistId?: string) => {
    githubSync.setCredentials(token, gistId);
  }, []);

  return {
    ...syncState,
    manualSync,
    setGitHubCredentials,
    isGitHubConfigured: githubSync.isConfigured(),
    deviceId: syncEngine.getDeviceId(),
  };
}
