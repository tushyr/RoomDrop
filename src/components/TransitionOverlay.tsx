"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Full-screen veil overlay that enables smooth page transitions.
 */
export default function TransitionOverlay() {
  const veilRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  // Expose the veil element globally so useTransitionRouter can control it
  useEffect(() => {
    // @ts-expect-error - global bridge between TransitionOverlay and useTransitionRouter
    window.__veil = veilRef.current;
    return () => {
      // @ts-expect-error - cleanup global bridge on unmount
      delete window.__veil;
    };
  }, []);

  // When the pathname changes (navigation complete) → fade veil out
  useEffect(() => {
    if (pathname === prevPathname.current) return;
    prevPathname.current = pathname;

    const veil = veilRef.current;
    if (!veil) return;

    // Small rAF delay so the new page has painted at least one frame
    const raf = requestAnimationFrame(() => {
      veil.style.opacity = "0";
      veil.style.pointerEvents = "none";
    });

    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return (
    <div
      ref={veilRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--bg-primary)",
        zIndex: 9999,
        opacity: 0,
        pointerEvents: "none",
        transition: "opacity 0.22s ease",
        willChange: "opacity",
      }}
    />
  );
}
