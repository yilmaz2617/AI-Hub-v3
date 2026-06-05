import { MAX_VERSIONS, type VersionSnapshot } from './types';
import { hashContent } from './conflictResolver';
import type { AppState } from '../store/appStore';

const STORAGE_KEY = 'ai-hub-versions';

class VersionManager {
  private versions: VersionSnapshot[] = [];

  constructor() {
    this.load();
  }

  private load(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) this.versions = JSON.parse(stored);
    } catch {
      this.versions = [];
    }
  }

  private save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.versions));
  }

  createSnapshot(state: AppState, source: VersionSnapshot['source'], label?: string): VersionSnapshot {
    const snapshot: VersionSnapshot = {
      id: `v-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      hash: hashContent(state),
      snapshot: JSON.parse(JSON.stringify(state)),
      source,
      label,
    };

    this.versions.unshift(snapshot);
    if (this.versions.length > MAX_VERSIONS) {
      this.versions = this.versions.slice(0, MAX_VERSIONS);
    }

    this.save();
    return snapshot;
  }

  getVersions(): VersionSnapshot[] {
    return [...this.versions];
  }

  getVersion(id: string): VersionSnapshot | undefined {
    return this.versions.find(v => v.id === id);
  }

  rollbackTo(id: string): VersionSnapshot | null {
    const target = this.getVersion(id);
    if (!target) return null;

    const rollbackVersion: VersionSnapshot = {
      id: `v-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      hash: target.hash,
      snapshot: target.snapshot,
      source: 'rollback',
      label: `Rollback to ${new Date(target.timestamp).toLocaleString()}`,
    };

    this.versions.unshift(rollbackVersion);
    this.save();
    return rollbackVersion;
  }

  deleteVersion(id: string): boolean {
    const idx = this.versions.findIndex(v => v.id === id);
    if (idx === -1) return false;
    this.versions.splice(idx, 1);
    this.save();
    return true;
  }

  clear(): void {
    this.versions = [];
    this.save();
  }

  getLatest(): VersionSnapshot | undefined {
    return this.versions[0];
  }
}

export const versionManager = new VersionManager();
