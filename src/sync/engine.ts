import { SYNC_CHANNEL_NAME, type SyncMessage } from './types';

class SyncEngine {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<(msg: SyncMessage) => void> = new Set();
  private deviceId: string;

  constructor() {
    this.deviceId = this.getDeviceId();
    this.initChannel();
  }

  private getDeviceId(): string {
    const stored = localStorage.getItem('ai-hub-device-id');
    if (stored) return stored;
    const id = `device-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem('ai-hub-device-id', id);
    return id;
  }

  private initChannel(): void {
    try {
      this.channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
      this.channel.onmessage = (event: MessageEvent<SyncMessage>) => {
        if (event.data.deviceId === this.deviceId) return;
        this.listeners.forEach(cb => cb(event.data));
      };
    } catch {
      window.addEventListener('storage', e => {
        if (e.key === SYNC_CHANNEL_NAME) {
          try {
            const msg = JSON.parse(e.newValue || '{}') as SyncMessage;
            if (msg.deviceId !== this.deviceId) {
              this.listeners.forEach(cb => cb(msg));
            }
          } catch {
            /* ignore */
          }
        }
      });
    }
  }

  broadcast(msg: Omit<SyncMessage, 'timestamp' | 'deviceId'>): void {
    const fullMsg: SyncMessage = {
      ...msg,
      timestamp: Date.now(),
      deviceId: this.deviceId,
    };

    if (this.channel) {
      this.channel.postMessage(fullMsg);
    } else {
      localStorage.setItem(SYNC_CHANNEL_NAME, JSON.stringify(fullMsg));
    }
  }

  subscribe(callback: (msg: SyncMessage) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  destroy(): void {
    this.channel?.close();
    this.listeners.clear();
  }
}

export const syncEngine = new SyncEngine();
