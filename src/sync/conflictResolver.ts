import { type ConflictInfo } from './types';

export function hashContent(obj: unknown): string {
  const str = JSON.stringify(obj, Object.keys(obj as object).sort());
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return h.toString(36);
}

export function detectConflicts(
  local: Record<string, unknown>,
  remote: Record<string, unknown>,
  localTime: number,
  remoteTime: number
): ConflictInfo[] {
  const conflicts: ConflictInfo[] = [];
  const allKeys = new Set([...Object.keys(local), ...Object.keys(remote)]);

  for (const key of allKeys) {
    const localVal = local[key];
    const remoteVal = remote[key];

    if (JSON.stringify(localVal) !== JSON.stringify(remoteVal)) {
      conflicts.push({
        key,
        localValue: localVal,
        remoteValue: remoteVal,
        localTime,
        remoteTime,
        resolved: false,
      });
    }
  }

  return conflicts;
}

export function resolveByLWW(conflicts: ConflictInfo[]): {
  resolved: ConflictInfo[];
  winner: 'local' | 'remote';
} {
  let localWins = 0;
  let remoteWins = 0;

  const resolved = conflicts.map(c => {
    const winner = c.localTime >= c.remoteTime ? 'local' : 'remote';
    if (winner === 'local') localWins++;
    else remoteWins++;

    return {
      ...c,
      resolved: true,
      resolution: winner as 'local' | 'remote',
    };
  });

  return { resolved, winner: localWins >= remoteWins ? 'local' : 'remote' };
}

export function mergeStates(
  local: Record<string, unknown>,
  remote: Record<string, unknown>,
  conflicts: ConflictInfo[]
): Record<string, unknown> {
  const result = { ...remote };
  for (const conflict of conflicts) {
    if (conflict.resolved && conflict.resolution === 'local') {
      result[conflict.key] = conflict.localValue;
    }
  }
  return result;
}
