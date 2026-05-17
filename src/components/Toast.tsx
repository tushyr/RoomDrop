"use client";

import { useEffect, useRef, useState } from "react";

interface ToastProps {
  message: string;
  duration?: number;
  onDismiss: () => void;
}

export default function Toast({ message, duration = 2500, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(true);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    const hideTimer = setTimeout(() => setVisible(false), duration - 250);
    const removeTimer = setTimeout(() => onDismissRef.current(), duration);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
    };
  }, [duration]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={visible ? "animate-toast-in" : "animate-toast-out"}
      style={{
        position: "fixed",
        bottom: "calc(24px + env(safe-area-inset-bottom, 0px))",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 18px",
        borderRadius: 999,
        background: "rgba(30,30,35,0.95)",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(16px)",
        color: "var(--text-primary)",
        fontSize: "0.875rem",
        fontWeight: 500,
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        // Wrap on narrow screens instead of overflowing
        whiteSpace: "normal",
        maxWidth: "calc(100vw - 48px)",
        textAlign: "center",
        wordBreak: "break-word",
      }}
    >
      <span style={{ color: "#22c55e" }}>✓</span>
      {message}
    </div>
  );
}
