const CACHE = 'the-veil-v5';
const ASSETS = [
  './',
  './styles.css',
  './app.js',
  './astrology.js',
  './manifest.json',
  './assets/favicon.svg',
  './assets/card-back.png',
  './data/reference.json'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, clone)).catch(() => {});
      return res;
    }).catch(() => caches.match('./')))
  );
});
