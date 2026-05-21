// Health Hub service worker.
// Real same-origin file (NOT a blob: URL) so Chromium accepts it and the PWA becomes installable.
// Strategy: stale-while-revalidate for same-origin GETs; skips cross-origin (Supabase API).
const CACHE = 'hh-v1.4';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.add('./').catch(() => {})));
  // NOTE: intentionally NOT calling skipWaiting() here.
  // The new worker stays in 'waiting' so the page can show a
  // "new version - refresh" banner (manual-aware update model).
  // It skips waiting only when the user clicks refresh, via the
  // SKIP_WAITING message handler below.
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
  // Only handle same-origin GETs. Let cross-origin (Supabase, CDNs) pass through untouched.
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const network = fetch(e.request)
        .then((resp) => {
          if (resp && resp.status === 200) {
            const clone = resp.clone();
            caches.open(CACHE).then((c) => c.put(e.request, clone));
          }
          return resp;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
