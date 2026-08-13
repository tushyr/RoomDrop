// RoomDrop Service Worker v3 — Automatic instant updates & cache bust
const CACHE_NAME = "roomdrop-v3";
const STATIC_SHELL = [
  "/",
  "/favicon.ico",
  "/android-chrome-192x192.png",
  "/site.webmanifest",
];

// ── Install: precache and force activate immediately ────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(STATIC_SHELL).catch(() => {
        // Silently continue if an asset fails
      })
    )
  );
  // Force new SW to become active immediately (replaces old v1/v2 SW)
  self.skipWaiting();
});

// ── Activate: purge all old caches and take control of all open clients ─────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log("[RoomDrop] Deleting old cache:", key);
            return caches.delete(key);
          })
      )
    )
  );
  // Take control of all open windows/PWAs immediately
  self.clients.claim();
});

// ── Fetch strategy ─────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  // Always bypass cache for API routes, Supabase, and realtime
  if (
    url.pathname.startsWith("/api/") ||
    url.hostname.includes("supabase") ||
    url.hostname.includes("realtime")
  ) {
    return;
  }

  // Skip dev HMR
  if (url.pathname.startsWith("/_next/webpack-hmr")) return;

  // Next.js hashed immutable chunks: cache-first with network fallback
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

  // Navigation requests (HTML pages): Network-first to always fetch the latest UI, with cache fallback
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) =>
              cache.put(event.request, clone)
            );
          }
          return res;
        })
        .catch(() =>
          caches.match(event.request).then((cached) => cached || caches.match("/"))
        )
    );
    return;
  }

  // Other static assets (icons, manifest, fonts): stale-while-revalidate
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

// Allow clients to trigger skipWaiting via postMessage
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
