// RoomDrop Service Worker — enables PWA install + basic offline shell caching
const CACHE_NAME = "roomdrop-v1";
const SHELL_ASSETS = [
  "/",
  "/favicon.ico",
  "/android-chrome-192x192.png",
  "/android-chrome-512x512.png",
];

// Install: cache the app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  // Activate immediately without waiting for existing tabs to close
  self.skipWaiting();
});

// Activate: clean up old caches
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

// Fetch: network-first strategy
// API calls and realtime: always network
// Static assets: try network first, fall back to cache
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  // Skip API routes and Supabase requests — always go to network
  if (
    url.pathname.startsWith("/api/") ||
    url.hostname.includes("supabase")
  ) {
    return;
  }

  // For navigation requests (HTML pages): network-first with cache fallback
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache a copy for offline
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match("/")))
    );
    return;
  }

  // For other assets: network-first
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache static assets
        if (response.ok && (url.pathname.match(/\.(js|css|png|ico|woff2?|svg)$/))) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
