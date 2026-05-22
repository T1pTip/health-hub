// Health Hub service worker.
// Real same-origin file (NOT a blob: URL) so Chromium accepts it and the PWA stays installable.
//
// UPDATE MODEL: AUTO-UPDATE. A new service worker skips waiting and claims clients immediately,
// so a fresh deploy applies on the NEXT app launch with no manual "refresh" step and no
// "stuck waiting" worker. Combined with network-first HTML below, the app can never get stuck
// on a stale cached version.
//
// FETCH STRATEGY:
//   - HTML document / navigations: NETWORK-FIRST (freshest app when online, cache only offline).
//   - Other same-origin GETs: stale-while-revalidate.
//   - Cross-origin (Supabase API, CDNs): passed through untouched.
const CACHE = 'hh-v1.8';

self.addEventListener('install', (e) => {
  self.skipWaiting(); // auto-activate the new worker -> no more "waiting"/stale app
  e.waitUntil(caches.open(CACHE).then((c) => c.add('./').catch(() => {})));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Kept for backward compatibility with the in-page "refresh" banner, if it ever fires.
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  // Only handle same-origin GETs. Cross-origin (Supabase, CDNs) passes through untouched.
  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) return;

  const isDocument = req.mode === 'navigate' || req.destination === 'document';
  if (isDocument){
    // NETWORK-FIRST: always try the freshest HTML when online; fall back to cache offline.
    e.respondWith(
      fetch(req)
        .then((resp) => {
          if (resp && resp.status === 200){
            const clone = resp.clone();
            caches.open(CACHE).then((c) => c.put('./', clone));
          }
          return resp;
        })
        .catch(() => caches.match(req).then((m) => m || caches.match('./')))
    );
    return;
  }

  // STALE-WHILE-REVALIDATE for other same-origin assets.
  e.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((resp) => {
          if (resp && resp.status === 200){
            const clone = resp.clone();
            caches.open(CACHE).then((c) => c.put(req, clone));
          }
          return resp;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
