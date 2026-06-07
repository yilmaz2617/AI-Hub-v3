import React from 'react';
import type { VersionSnapshot } from '../../../sync/types';
import { Badge } from '../../ui/Badge';

interface VersionTimelineProps {
  versions: VersionSnapshot[];
  selected: [string | null, string | null];
  onSelect: (id: string, index: 0 | 1) => void;
  onRollback: (id: string) => void;
  onDelete: (id: string) => boolean;
}

export const VersionTimeline: React.FC<VersionTimelineProps> = ({
  versions,
  selected,
  onSelect,
  onRollback,
  onDelete,
}) => {
  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
      <div className="space-y-4">
        {versions.map((version, index) => (
          <TimelineItem
            key={version.id}
            version={version}
            index={versions.length - index}
            isSelected={selected.includes(version.id)}
            isLeft={selected[0] === version.id}
            isRight={selected[1] === version.id}
            onSelect={idx => onSelect(version.id, idx as 0 | 1)}
            onRollback={() => onRollback(version.id)}
            onDelete={() => onDelete(version.id)}
          />
        ))}
      </div>
      {versions.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-2">📭</div>
          <p>Henüz versiyon kaydı yok</p>
        </div>
      )}
    </div>
  );
};

const TimelineItem: React.FC<{
  version: VersionSnapshot;
  index: number;
  isSelected: boolean;
  isLeft: boolean;
  isRight: boolean;
  onSelect: (index: 0 | 1) => void;
  onRollback: () => void;
  onDelete: () => void;
}> = ({ version, index, isSelected, isLeft, isRight, onSelect, onRollback, onDelete }) => {
  const sourceColors = {
    auto: 'bg-blue-500',
    manual: 'bg-green-500',
    sync: 'bg-purple-500',
    rollback: 'bg-orange-500',
  };

  return (
    <div
      className={`relative flex items-start gap-4 p-4 rounded-lg transition-colors ${
        isSelected
          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
      }`}
    >
      <div
        className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${sourceColors[version.source] || 'bg-gray-500'}`}
      >
        {index}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-gray-500">{version.hash.slice(0, 8)}</span>
            <Badge
              variant={
                version.source === 'auto'
                  ? 'info'
                  : version.source === 'manual'
                    ? 'success'
                    : 'default'
              }
            >
              {version.source}
            </Badge>
            {index === 1 && <Badge variant="success">Mevcut</Badge>}
          </div>
          <span className="text-xs text-gray-400">
            {new Date(version.timestamp).toLocaleString('tr-TR')}
          </span>
        </div>
        {version.label && (
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{version.label}</p>
        )}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => onSelect(0)}
            className={`text-xs px-2 py-1 rounded ${isLeft ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          >
            Sol
          </button>
          <button
            onClick={() => onSelect(1)}
            className={`text-xs px-2 py-1 rounded ${isRight ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          >
            Sağ
          </button>
          <button
            onClick={onRollback}
            className="text-xs px-2 py-1 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 hover:bg-orange-200"
          >
            🔄 Rollback
          </button>
          <button
            onClick={onDelete}
            className="text-xs px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200"
          >
            🗑️ Sil
          </button>
        </div>
      </div>
    </div>
  );
};
