"use client";

import { useEffect, useRef } from "react";

/**
 * Registers the service worker on mount.
 * This is required for PWA installability — browsers need an active SW
 * before they'll show the "Add to Home Screen" / "Install App" prompt.
 *
 * Renders nothing to the DOM.
 */
export default function ServiceWorkerRegistrar() {
  const registered = useRef(false);

  useEffect(() => {
    if (registered.current) return;
    registered.current = true;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          console.log("[RoomDrop] SW registered, scope:", reg.scope);
        })
        .catch((err) => {
          console.warn("[RoomDrop] SW registration failed:", err);
        });
    }
  }, []);

  return null;
}
