import { describe, it, expect } from 'vitest';
import { versionManager } from '../versionManager';

describe('versionManager', () => {
  it('should return current version', () => {
    const version = versionManager.getCurrentVersion();
    expect(version).toBeDefined();
    expect(typeof version).toBe('string');
  });

  it('should compare versions correctly', () => {
    const result = versionManager.compareVersions('3.1.0', '3.0.0');
    expect(result).toBeGreaterThan(0);
  });

  it('should parse version string', () => {
    const parsed = versionManager.parseVersion('3.1.0');
    expect(parsed).toEqual({ major: 3, minor: 1, patch: 0 });
  });

  it('should handle invalid version', () => {
    expect(() => versionManager.parseVersion('invalid')).toThrow();
  });

  it('should list all versions', () => {
    const versions = versionManager.getAllVersions();
    expect(Array.isArray(versions)).toBe(true);
  });
});
