import { syncEngine } from './engine';
import { type SyncMessage } from './types';
import { useAppStore } from '../store/appStore';

export function initRealtimeSync(): () => void {
  const unsubscribe = syncEngine.subscribe((msg: SyncMessage) => {
    switch (msg.type) {
      case 'STORE_UPDATE': {
        const currentState = useAppStore.getState();
        const incomingState = msg.payload as Record<string, unknown>;
        const merged = { ...currentState };
        let hasChanges = false;

        for (const [key, value] of Object.entries(incomingState)) {
          if (
            JSON.stringify((currentState as Record<string, unknown>)[key]) !== JSON.stringify(value)
          ) {
            (merged as Record<string, unknown>)[key] = value;
            hasChanges = true;
          }
        }

        if (hasChanges) {
          useAppStore.setState(merged, false);
        }
        break;
      }

      case 'SYNC_COMPLETE': {
        useAppStore.setState({
          _sync: {
            ...useAppStore.getState()._sync,
            lastSyncTime: (msg.payload as { time: number }).time,
            isSyncing: false,
          },
        });
        break;
      }
    }
  });

  return unsubscribe;
}
