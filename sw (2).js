// MenuKu Service Worker — cache shell untuk pemakaian offline
const CACHE = 'menuku-v1';
const SHELL = ['./', './index.html', './menu.html', './manifest.json', 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL).catch(() => {})));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // API Apps Script: jangan cache (selalu network)
  if (req.url.includes('script.google.com')) return;
  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      // Cache hanya resource same-origin atau dari CDN
      try {
        const url = new URL(req.url);
        if (url.origin === location.origin || url.hostname.includes('jsdelivr') || url.hostname.includes('imagekit')) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
      } catch (err) {}
      return res;
    }).catch(() => cached))
  );
});
