/**
 * Șahist — Service Worker v3
 * Activ doar pe HTTP(S) (GitHub Pages etc.), nu pe file://.
 * Răspunde la mesajul SKIP_WAITING pentru preluare imediată.
 */

const CACHE = 'sahist-v3';
const ASSETS = [
  './',
  './index.html',
  './chess-engine.js',
  './engine-local.js',
  './storage.js',
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Preia controlul imediat când pagina cere (SKIP_WAITING message)
self.addEventListener('message', e => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('api.anthropic.com')) {
    e.respondWith(fetch(e.request));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        }
        return res;
      });
    })
  );
});
