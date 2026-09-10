/* TastyGain service worker — offline shell, no Base44 calls */
const CACHE = 'tastygain-v2';

self.addEventListener('install', (event) => {
  const scope = self.registration.scope;
  const precache = ['index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'brand/logo.jpg'].map(
    (p) => new URL(p, scope).href
  );
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(precache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(new URL('index.html', self.registration.scope).href, copy));
          return res;
        })
        .catch(() => caches.match(new URL('index.html', self.registration.scope).href))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((res) => {
        if (res.ok && /\/(icons|brand|assets|splash)\//.test(url.pathname)) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
        }
        return res;
      });
    })
  );
});
