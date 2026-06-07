import { describe, it, expect } from 'vitest';
import { lazyComponents } from '../performance/lazyComponents';

describe('lazyComponents', () => {
  it('should export all panel components', () => {
    expect(lazyComponents.ChatPanel).toBeDefined();
    expect(lazyComponents.ImprovePanel).toBeDefined();
    expect(lazyComponents.SyncPanel).toBeDefined();
    expect(lazyComponents.VersionPanel).toBeDefined();
  });
});
