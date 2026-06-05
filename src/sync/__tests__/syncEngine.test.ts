import { describe, it, expect } from 'vitest';
import { syncEngine } from '../engine';

describe('syncEngine', () => {
  it('should create device id', () => {
    expect(syncEngine.getDeviceId()).toBeTruthy();
  });

  it('should allow subscription', () => {
    const received: unknown[] = [];
    const unsub = syncEngine.subscribe((msg) => received.push(msg));
    expect(typeof unsub).toBe('function');
    unsub();
  });
});
