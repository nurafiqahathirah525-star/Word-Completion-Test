const CACHE_NAME = 'word-completion-v6';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg'
];

// Install service worker baru
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// Buang cache versi lama
// dan terus aktifkan versi baru
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Network first
// Sentiasa cuba ambil versi terbaru dahulu.
// Kalau offline, guna versi dalam cache.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request, { cache: 'no-cache' })
      .then(response => {

        if (
          response &&
          response.ok &&
          response.type === 'basic'
        ) {
          const copy = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, copy);
            });
        }

        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
