"use client";

import { useEffect, useRef } from "react";

/**
 * Registers and monitors the Service Worker.
 * Automatically checks for updates on launch/focus, forces the new SW to activate,
 * purges old caches, and reloads the page seamlessly so installed PWA users
 * and existing visitors immediately get the latest UI.
 */
export default function ServiceWorkerRegistrar() {
  const registered = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    if (registered.current) return;
    registered.current = true;

    // When the new SW takes over (controller changes) → reload once to show new UI
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      console.log("[RoomDrop] New version active, refreshing page...");
      window.location.reload();
    });

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        // 1. Check for SW updates immediately on page load
        reg.update().catch(() => {});

        // 2. Check for updates whenever user returns to the app / refocuses tab
        const checkUpdate = () => {
          if (document.visibilityState === "visible") {
            reg.update().catch(() => {});
          }
        };
        document.addEventListener("visibilitychange", checkUpdate);
        window.addEventListener("focus", checkUpdate);

        // 3. If a new SW is found, tell it to activate immediately
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // New SW is installed and waiting — trigger immediate takeover
              newWorker.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });
      })
      .catch((err) => {
        console.warn("[RoomDrop] SW registration error:", err);
      });
  }, []);

  return null;
}
