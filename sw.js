/**
 * Șahist — Service Worker v2
 * Cache bump la fiecare versiune nouă forțează înlocuirea completă.
 * Strategia: cache-first pentru assets locale, network-first pentru API.
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
      .then(() => self.skipWaiting()) // activează imediat, nu așteptă tab-uri vechi
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim()) // preia controlul imediat asupra tuturor tab-urilor
  );
});

self.addEventListener('fetch', e => {
  // Network-first pentru API calls (viitor)
  if (e.request.url.includes('api.anthropic.com')) {
    e.respondWith(fetch(e.request));
    return;
  }
  // Cache-first pentru assets locale
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      });
    })
  );
});
