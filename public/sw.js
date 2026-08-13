// RoomDrop Service Worker v2 — PWA install + shell caching + stale-while-revalidate
const CACHE_NAME = "roomdrop-v2";
const STATIC_SHELL = [
  "/",
  "/favicon.ico",
  "/android-chrome-192x192.png",
  "/site.webmanifest",
];

// ── Install: precache shell assets ─────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(STATIC_SHELL).catch(() => {
        // Silently fail if any shell asset is unavailable
      })
    )
  );
  // Activate immediately — don't wait for old tabs
  self.skipWaiting();
});

// ── Activate: delete stale caches from previous SW versions ───────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  // Take control of all open clients immediately
  self.clients.claim();
});

// ── Fetch: smart routing strategy ─────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests entirely
  if (event.request.method !== "GET") return;

  // Skip API routes and Supabase realtime — always network
  if (
    url.pathname.startsWith("/api/") ||
    url.hostname.includes("supabase") ||
    url.hostname.includes("realtime")
  ) {
    return;
  }

  // Skip Next.js HMR and dev runtime
  if (url.pathname.startsWith("/_next/webpack-hmr")) return;

  // Next.js immutable static chunks: cache-first (they have content hashes)
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) =>
          cached ||
          fetch(event.request).then((res) => {
            if (res.ok) {
              const clone = res.clone();
              caches.open(CACHE_NAME).then((cache) =>
                cache.put(event.request, clone)
              );
            }
            return res;
          })
      )
    );
    return;
  }

  // Navigation requests (HTML pages): network-first, cache fallback
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) =>
            cache.put(event.request, clone)
          );
          return res;
        })
        .catch(() =>
          caches.match(event.request).then((cached) => cached || caches.match("/"))
        )
    );
    return;
  }

  // All other static assets (fonts, icons, images): stale-while-revalidate
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(event.request).then((cached) => {
        const networkFetch = fetch(event.request).then((res) => {
          if (res.ok) cache.put(event.request, res.clone());
          return res;
        });
        return cached || networkFetch;
      })
    )
  );
});
