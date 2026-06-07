import { describe, it, expect } from 'vitest';
import { hashContent, detectConflicts, resolveByLWW, mergeStates } from '../sync/conflictResolver';

describe('hashContent', () => {
  it('should return consistent hash for same object', () => {
    const obj = { a: 1, b: 'test' };
    expect(hashContent(obj)).toBe(hashContent(obj));
  });

  it('should return different hash for different objects', () => {
    expect(hashContent({ a: 1 })).not.toBe(hashContent({ a: 2 }));
  });
});

describe('detectConflicts', () => {
  it('should detect conflicting keys', () => {
    const local = { name: 'Alice', age: 30 };
    const remote = { name: 'Bob', age: 30 };
    const conflicts = detectConflicts(local, remote, 1000, 2000);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].key).toBe('name');
  });

  it('should return empty when no conflicts', () => {
    const local = { name: 'Alice' };
    const remote = { name: 'Alice' };
    expect(detectConflicts(local, remote, 1000, 2000)).toHaveLength(0);
  });
});

describe('resolveByLWW', () => {
  it('should prefer local when local is newer', () => {
    const conflicts = [
      {
        key: 'x',
        localValue: 'a',
        remoteValue: 'b',
        localTime: 2000,
        remoteTime: 1000,
        resolved: false,
      },
    ];
    const result = resolveByLWW(conflicts);
    expect(result.winner).toBe('local');
  });

  it('should prefer remote when remote is newer', () => {
    const conflicts = [
      {
        key: 'x',
        localValue: 'a',
        remoteValue: 'b',
        localTime: 1000,
        remoteTime: 2000,
        resolved: false,
      },
    ];
    const result = resolveByLWW(conflicts);
    expect(result.winner).toBe('remote');
  });
});

describe('mergeStates', () => {
  it('should merge with local winning on conflicts', () => {
    const local = { name: 'Alice', age: 30 };
    const remote = { name: 'Bob', age: 25 };
    const conflicts = [
      {
        key: 'name',
        localValue: 'Alice',
        remoteValue: 'Bob',
        localTime: 2000,
        remoteTime: 1000,
        resolved: true,
        resolution: 'local' as const,
      },
      {
        key: 'age',
        localValue: 30,
        remoteValue: 25,
        localTime: 2000,
        remoteTime: 1000,
        resolved: true,
        resolution: 'local' as const,
      },
    ];
    const merged = mergeStates(local, remote, conflicts);
    expect(merged.name).toBe('Alice');
    expect(merged.age).toBe(30);
  });
});
