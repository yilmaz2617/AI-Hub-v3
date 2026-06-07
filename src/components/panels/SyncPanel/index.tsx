import React, { useState, useCallback } from 'react';
import { useAppStore } from '../../../store/appStore';

interface SyncStatus {
  isSyncing: boolean;
  lastSync: string | null;
  error: string | null;
}

export const SyncPanel: React.FC = () => {
  const [status, setStatus] =
    useState << SyncStatus >
    {
      isSyncing: false,
      lastSync: null,
      error: null,
    };
  const { theme } = useAppStore();

  const handleSync = useCallback(async () => {
    setStatus(prev => ({ ...prev, isSyncing: true, error: null }));

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      setStatus({
        isSyncing: false,
        lastSync: new Date().toISOString(),
        error: null,
      });
    } catch (error: unknown) {
      setStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Sync failed',
      }));
    }
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sync Panel</h2>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSync}
          disabled={status.isSyncing}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {status.isSyncing ? 'Syncing...' : 'Sync Now'}
        </button>

        {status.lastSync && (
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Last sync: {new Date(status.lastSync).toLocaleString()}
          </span>
        )}
      </div>

      {status.error && (
        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
          {status.error}
        </div>
      )}
    </div>
  );
};

export default SyncPanel;
