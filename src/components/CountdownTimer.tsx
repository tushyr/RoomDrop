"use client";

import { useState, useEffect, useRef } from "react";
import { formatTimeRemaining } from "@/lib/utils";

interface CountdownTimerProps {
  expiresAt: string;
  onExpired?: () => void;
}

export default function CountdownTimer({ expiresAt, onExpired }: CountdownTimerProps) {
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
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const { display, isUrgent } = formatTimeRemaining(remaining);

  return (
    <span
      role="timer"
      suppressHydrationWarning
      aria-label={`Room expires in ${display}`}
      className="font-mono text-xs tabular-nums select-none"
      style={{ color: isUrgent ? "var(--danger)" : "var(--text-muted)" }}
    >
      {display}
    </span>
  );
}
