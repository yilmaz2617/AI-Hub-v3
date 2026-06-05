import { debounce } from 'lodash-es';
import { syncEngine } from './engine';
import { versionManager } from './versionManager';
import { githubSync } from './githubSync';
import { offlineQueue } from './offlineQueue';
import { DEBOUNCE_MS } from './types';
import type { AppState } from '../store/appStore';

class AutoSync {
  private debouncedSync: ReturnType<typeof debounce>;
  private isEnabled = true;

  constructor() {
    this.debouncedSync = debounce(this.performSync.bind(this), DEBOUNCE_MS, {
      leading: false,
      trailing: true,
    });
  }

  trigger(state: AppState): void {
    if (!this.isEnabled) return;
    this.debouncedSync(state);
  }

  private async performSync(state: AppState): Promise<void> {
    versionManager.createSnapshot(state, 'auto');

    syncEngine.broadcast({
      type: 'STORE_UPDATE',
      payload: state,
    });

    if (navigator.onLine) {
      try {
        await githubSync.push(state);
        syncEngine.broadcast({
          type: 'SYNC_COMPLETE',
          payload: { time: Date.now() },
        });
      } catch (err) {
        offlineQueue.enqueue(state);
        console.warn('Sync failed, queued:', err);
      }
    } else {
      offlineQueue.enqueue(state);
    }
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.debouncedSync.cancel();
    }
  }

  flush(): void {
    this.debouncedSync.flush();
  }

  cancel(): void {
    this.debouncedSync.cancel();
  }
}

export const autoSync = new AutoSync();
