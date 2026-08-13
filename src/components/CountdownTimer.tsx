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
        router.refresh();
      }
    };

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
      className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-mono font-bold tracking-tight transition-all"
      style={{
        background: isUrgent ? "rgba(240, 113, 113, 0.15)" : "var(--bg-card)",
        border: `1.5px solid ${isUrgent ? "rgba(240, 113, 113, 0.4)" : "var(--border-card)"}`,
        color: isUrgent ? "var(--danger)" : "var(--text-primary)",
      }}
    >
      <ClockIcon urgent={isUrgent} />
      <span>{display}</span>
    </div>
  );
}

function ClockIcon({ urgent }: { urgent: boolean }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke={urgent ? "var(--danger)" : "currentColor"}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
