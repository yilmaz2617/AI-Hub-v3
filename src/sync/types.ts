export interface SyncMeta {
  lastModified: number;
  lastSynced: number;
  version: string;
  deviceId: string;
}

export interface VersionSnapshot {
  id: string;
  timestamp: number;
  hash: string;
  snapshot: Record<string, unknown>;
  source: 'auto' | 'manual' | 'sync' | 'rollback';
  label?: string;
}

export interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: number | null;
  syncError: string | null;
  pendingCount: number;
  conflictCount: number;
}

export interface ConflictInfo {
  key: string;
  localValue: unknown;
  remoteValue: unknown;
  localTime: number;
  remoteTime: number;
  resolved: boolean;
  resolution?: 'local' | 'remote' | 'merge';
}

export interface SyncMessage {
  type: 'STORE_UPDATE' | 'SYNC_REQUEST' | 'SYNC_COMPLETE' | 'CONFLICT_DETECTED' | 'VERSION_CREATED';
  payload: unknown;
  timestamp: number;
  deviceId: string;
}

export const SYNC_CHANNEL_NAME = 'ai-hub-v3-sync';
export const MAX_VERSIONS = 50;
export const DEBOUNCE_MS = 2000;
export const RETRY_DELAYS = [2000, 4000, 8000, 16000, 32000];
