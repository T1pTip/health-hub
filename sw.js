// Health Hub service worker.
// Real same-origin file (NOT a blob: URL) so Chromium accepts it and the PWA becomes installable.
// Strategy:
//   - HTML document / navigations: NETWORK-FIRST, so a new deploy reaches the user immediately
//     when online (falls back to cache only when offline). This fixes the "stale app" problem
//     where a freshly deployed change did not appear until a second reload.
//   - Other same-origin GETs: stale-while-revalidate.
//   - Cross-origin (Supabase API, CDNs): passed through untouched.
const CACHE = 'hh-v1.5';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.add('./').catch(() => {})));
  // No skipWaiting here: the page shows a "new version - refresh" banner and the user
  // applies the update via the SKIP_WAITING message handler below.
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Manual-aware update: the page posts this when the user clicks the refresh banner.
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  // Only handle same-origin GETs. Let cross-origin (Supabase, CDNs) pass through untouched.
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
