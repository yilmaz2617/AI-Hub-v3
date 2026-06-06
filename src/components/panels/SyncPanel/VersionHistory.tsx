import React from 'react';

interface VersionRecord {
  id: string;
  version: string;
  date: string;
  changes: string[];
}

interface VersionHistoryProps {
  versions: VersionRecord[];
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({ versions }) => {
  return (
    <div className="space-y-3">
      {versions.map(version => (
        <div
          key={version.id}
          className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">v{version.version}</h3>
            <span className="text-sm text-gray-500">
              {new Date(version.date).toLocaleDateString()}
            </span>
          </div>
          <ul className="mt-2 space-y-1">
            {version.changes.map((change, index) => (
              <li
                key={index}
                className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                {change}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default VersionHistory;
