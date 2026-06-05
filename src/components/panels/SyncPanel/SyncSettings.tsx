import React from 'react';
import { useSyncStore } from '../../../store/syncStore';

export const SyncSettings: React.FC = () => {
  const settings = useSyncStore();

  const Toggle: React.FC<{ label: string; checked: boolean; onChange: (v: boolean) => void }> = ({ label, checked, onChange }) => (
    <label className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <button onClick={() => onChange(!checked)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </label>
  );

  return (
    <div className="space-y-2">
      <Toggle label="Otomatik Sync (2s debounce)" checked={settings.autoSync} onChange={settings.setAutoSync} />
      <Toggle label="Cross-Tab Realtime" checked={settings.crossTabRealtime} onChange={settings.setCrossTabRealtime} />
      <Toggle label="GitHub Gist Backup" checked={settings.githubBackup} onChange={settings.setGitHubBackup} />
      <Toggle label="Çakışma Modalı (Auto-resolve kapalı)" checked={settings.conflictModal} onChange={settings.setConflictModal} />
      <Toggle label="Offline Kuyruk" checked={settings.offlineQueue} onChange={settings.setOfflineQueue} />
      <div className="pt-4">
        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Sync Aralığı: {settings.syncInterval}ms</label>
        <input type="range" min="1000" max="10000" step="500" value={settings.syncInterval} onChange={(e) => settings.setSyncInterval(Number(e.target.value))} className="w-full" />
      </div>
    </div>
  );
};
