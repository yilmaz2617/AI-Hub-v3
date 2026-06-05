import React, { useState, useEffect } from 'react';
import { VersionHistory } from '../SyncPanel/VersionHistory';

interface VersionRecord {
  id: string;
  version: string;
  date: string;
  changes: string[];
}

export const VersionPanel: React.FC = () => {
  const [versions, setVersions] = useState<VersionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockVersions: VersionRecord[] = [
      {
        id: '1',
        version: '3.1.0',
        date: new Date().toISOString(),
        changes: ['Added Research & Improve Hub', 'Added Sync Panel', 'Performance optimizations'],
      },
      {
        id: '2',
        version: '3.0.0',
        date: new Date(Date.now() - 86400000).toISOString(),
        changes: ['Initial v3 release', 'React 19 + TypeScript', 'Tailwind CSS'],
      },
    ];
    
    setVersions(mockVersions);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="p-6 text-gray-600 dark:text-gray-300">Loading versions...</div>;
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Version History</h2>
      <VersionHistory versions={versions} />
    </div>
  );
};

export default VersionPanel;



