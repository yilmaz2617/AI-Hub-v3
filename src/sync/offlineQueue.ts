import type { AppState } from '../store/appStore';

interface QueuedItem {
  state: AppState;
  timestamp: number;
  retries: number;
}

const STORAGE_KEY = 'ai-hub-offline-queue';

class OfflineQueue {
  private queue: QueuedItem[] = [];

  constructor() {
    this.load();
  }

  private load(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) this.queue = JSON.parse(stored);
    } catch {
      this.queue = [];
    }
  }

  private save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
  }

  enqueue(state: AppState): void {
    this.queue.push({
      state: JSON.parse(JSON.stringify(state)),
      timestamp: Date.now(),
      retries: 0,
    });
    this.save();
  }

  dequeue(): QueuedItem | undefined {
    const item = this.queue.shift();
    this.save();
    return item;
  }

  peek(): QueuedItem | undefined {
    return this.queue[0];
  }

  get length(): number {
    return this.queue.length;
  }

  clear(): void {
    this.queue = [];
    this.save();
  }

  async process(processFn: (state: AppState) => Promise<void>): Promise<void> {
    while (this.queue.length > 0) {
      const item = this.peek();
      if (!item) break;
      try {
        await processFn(item.state);
        this.dequeue();
      } catch {
        item.retries++;
        if (item.retries >= 5) this.dequeue();
        this.save();
        break;
      }
    }
  }
}

export const offlineQueue = new OfflineQueue();
