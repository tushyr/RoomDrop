"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { formatTimeRemaining } from "@/lib/utils";

interface CountdownTimerProps {
  expiresAt: string;
  onExpired?: () => void;
}

export default function CountdownTimer({ expiresAt, onExpired }: CountdownTimerProps) {
  const router = useRouter();
  const [remaining, setRemaining] = useState<number>(
    Math.max(0, new Date(expiresAt).getTime() - Date.now())
  );
  const onExpiredRef = useRef(onExpired);
  onExpiredRef.current = onExpired;

  useEffect(() => {
    const tick = () => {
      const ms = Math.max(0, new Date(expiresAt).getTime() - Date.now());
      setRemaining(ms);

      if (ms <= 0) {
        clearInterval(interval);
        onExpiredRef.current?.();
        // Redirect to show expired state
        router.refresh();
      }
    };

    // Tick immediately, then every second
    tick();
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, router]);

  const { display, isUrgent } = formatTimeRemaining(remaining);

  return (
    <div
      id="countdown-timer"
      role="timer"
      suppressHydrationWarning
      aria-label={`Room expires in ${display}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 12px",
        borderRadius: 999,
        background: isUrgent
          ? "rgba(239,68,68,0.12)"
          : "rgba(255,255,255,0.06)",
        border: `1px solid ${isUrgent ? "rgba(239,68,68,0.3)" : "var(--border)"}`,
        fontSize: "0.8125rem",
        fontFamily: "JetBrains Mono, monospace",
        color: isUrgent ? "#ef4444" : "var(--text-secondary)",
        transition: "all 0.3s ease",
      }}
    >
      <ClockIcon urgent={isUrgent} />
      {display}
    </div>
  );
}

function ClockIcon({ urgent }: { urgent: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke={urgent ? "#ef4444" : "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={urgent ? { animation: "shimmer 1s ease-in-out infinite" } : {}}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
