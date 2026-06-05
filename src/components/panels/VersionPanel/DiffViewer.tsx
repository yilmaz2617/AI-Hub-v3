import React from 'react';
import type { VersionSnapshot } from '../../../sync/types';

interface DiffViewerProps {
  left: VersionSnapshot | undefined;
  right: VersionSnapshot | undefined;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ left, right }) => {
  if (!left || !right) return <div className="text-center text-gray-500">İki versiyon seçmelisiniz</div>;

  const diff = computeDiff(left.snapshot, right.snapshot);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <div className="flex-1">
          <span className="font-medium text-red-600">Sol: </span>
          <span className="text-gray-600">{left.label || left.hash.slice(0, 8)}</span>
        </div>
        <div className="px-4 text-gray-400">→</div>
        <div className="flex-1 text-right">
          <span className="font-medium text-green-600">Sağ: </span>
          <span className="text-gray-600">{right.label || right.hash.slice(0, 8)}</span>
        </div>
      </div>
      <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-96">
        <pre className="text-sm font-mono">
          {diff.map((line, i) => (
            <div key={i} className={line.type === 'added' ? 'text-green-400' : line.type === 'removed' ? 'text-red-400' : 'text-gray-300'}>
              {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '} {line.content}
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
};

interface DiffLine { type: 'added' | 'removed' | 'unchanged'; content: string; }

function computeDiff(left: Record<string, unknown>, right: Record<string, unknown>): DiffLine[] {
  const allKeys = new Set([...Object.keys(left), ...Object.keys(right)]);
  const result: DiffLine[] = [];
  for (const key of allKeys) {
    const leftVal = JSON.stringify(left[key], null, 2);
    const rightVal = JSON.stringify(right[key], null, 2);
    if (leftVal === rightVal) {
      result.push({ type: 'unchanged', content: `${key}: ${leftVal}` });
    } else {
      if (key in left) result.push({ type: 'removed', content: `${key}: ${leftVal}` });
      if (key in right) result.push({ type: 'added', content: `${key}: ${rightVal}` });
    }
  }
  return result;
}
