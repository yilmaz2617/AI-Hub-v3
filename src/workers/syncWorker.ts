/// <reference lib="webworker" />

const CACHE_NAME = 'ai-hub-v3-cache-v1';

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(['/', '/index.html'])));
  self.skipWaiting();
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames =>
        Promise.all(cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name)))
      )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)));
});

self.addEventListener('sync', (event: SyncEvent) => {
  if (event.tag === 'ai-hub-sync') {
    event.waitUntil(
      self.clients
        .matchAll()
        .then(clients =>
          clients.forEach(client => client.postMessage({ type: 'PROCESS_OFFLINE_QUEUE' }))
        )
    );
  }
});

export {};
