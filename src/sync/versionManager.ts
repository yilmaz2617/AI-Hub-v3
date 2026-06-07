export const versionManager = {
  getCurrentVersion: () => '3.1.0',
  compareVersions: (v1: string, v2: string): number => {
    const [a1, b1, c1] = v1.split('.').map(Number);
    const [a2, b2, c2] = v2.split('.').map(Number);
    if (a1 !== a2) return a1 - a2;
    if (b1 !== b2) return b1 - b2;
    return c1 - c2;
  },
  parseVersion: (v: string): { major: number; minor: number; patch: number } => {
    const parts = v.split('.');
    if (parts.length !== 3 || parts.some(p => isNaN(Number(p)))) {
      throw new Error('Invalid version format');
    }
    const [major, minor, patch] = parts.map(Number);
    return { major, minor, patch };
  },
  getAllVersions: (): string[] => ['3.1.0', '3.0.0'],
};
