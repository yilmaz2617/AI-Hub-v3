import React from 'react';
import { Badge } from '../../ui/Badge';
import type { SyncState } from '../../../sync/types';

interface SyncStatusProps {
  sync: SyncState & { isGitHubConfigured: boolean; deviceId: string };
}

export const SyncStatus: React.FC<SyncStatusProps> = ({ sync }) => {
  const getStatusBadge = () => {
    if (!sync.isOnline) return <Badge variant="error">🔴 Offline</Badge>;
    if (sync.isSyncing) return <Badge variant="info">🔄 Senkronize ediliyor...</Badge>;
    if (sync.syncError) return <Badge variant="error">❌ Hata: {sync.syncError}</Badge>;
    if (sync.pendingCount > 0)
      return <Badge variant="warning">⏳ {sync.pendingCount} bekleyen</Badge>;
    return <Badge variant="success">✅ Senkronize</Badge>;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Durum</span>
        {getStatusBadge()}
      </div>
      <div className="space-y-2">
        <StatusRow
          label="Bağlantı"
          value={sync.isOnline ? 'Online' : 'Offline'}
          ok={sync.isOnline}
        />
        <StatusRow
          label="GitHub"
          value={sync.isGitHubConfigured ? 'Bağlı' : 'Bağlı değil'}
          ok={sync.isGitHubConfigured}
        />
        <StatusRow label="Cross-Tab" value="Aktif" ok={true} />
        <StatusRow label="Auto-Sync" value="Aktif (2s)" ok={true} />
      </div>
      {sync.syncError && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-400">{sync.syncError}</p>
        </div>
      )}
    </div>
  );
};

const StatusRow: React.FC<{ label: string; value: string; ok: boolean }> = ({
  label,
  value,
  ok,
}) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-gray-600 dark:text-gray-400">{label}</span>
    <span
      className={`font-medium ${ok ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
    >
      {ok ? '✓' : '✗'} {value}
    </span>
  </div>
);
