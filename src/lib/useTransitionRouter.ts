"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

const VEIL_DURATION = 200; // ms — matches the CSS transition (0.22s)

/**
 * Drop-in replacement for `useRouter` that wraps `push()` with a smooth
 * veil transition. No dynamic imports, no class mutations on <body>,
 * no blur/scale/filter — just one opacity change on a fixed overlay.
 */
export function useTransitionRouter() {
  const router = useRouter();

  const push = useCallback(
    (url: string) => {
      // @ts-expect-error - global bridge set by TransitionOverlay component
      const veil: HTMLDivElement | undefined = window.__veil;

      if (!veil) {
        // Graceful fallback — no overlay mounted yet
        router.push(url);
        return;
      }

      // Step 1: fade veil in to cover current page
      veil.style.opacity = "1";
      veil.style.pointerEvents = "all";

      // Step 2: navigate after veil is fully opaque
      // TransitionOverlay's useEffect will fade the veil back out
      // once usePathname() reports the new route.
      setTimeout(() => {
        router.push(url);
      }, VEIL_DURATION);
    },
    [router]
  );

  return { push };
}
