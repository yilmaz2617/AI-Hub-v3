export interface DiffResult {
  path: string;
  oldValue: unknown;
  newValue: unknown;
  type: 'added' | 'removed' | 'changed';
}

export function diffObjects(
  oldObj: Record<string, unknown>,
  newObj: Record<string, unknown>
): DiffResult[] {
  const results: DiffResult[] = [];
  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
  for (const key of allKeys) {
    const oldVal = oldObj[key];
    const newVal = newObj[key];
    if (!(key in oldObj))
      results.push({ path: key, oldValue: undefined, newValue: newVal, type: 'added' });
    else if (!(key in newObj))
      results.push({ path: key, oldValue: oldVal, newValue: undefined, type: 'removed' });
    else if (JSON.stringify(oldVal) !== JSON.stringify(newVal))
      results.push({ path: key, oldValue: oldVal, newValue: newVal, type: 'changed' });
  }
  return results;
}

export function diffToString(diff: DiffResult[]): string {
  return diff
    .map(d => {
      if (d.type === 'added') return '+ ' + d.path + ': ' + JSON.stringify(d.newValue);
      if (d.type === 'removed') return '- ' + d.path + ': ' + JSON.stringify(d.oldValue);
      return (
        '~ ' + d.path + ': ' + JSON.stringify(d.oldValue) + ' -> ' + JSON.stringify(d.newValue)
      );
    })
    .join('\n');
}
