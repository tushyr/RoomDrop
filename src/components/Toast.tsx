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
        padding: "10px 20px",
        borderRadius: 999,
        background: "#FFFDF9",
        border: "1.5px solid var(--border-card)",
        color: "var(--text-primary)",
        fontFamily: "var(--font-body)",
        fontSize: "0.9375rem",
        fontWeight: 600,
        boxShadow: "0 8px 24px -4px rgba(74, 99, 72, 0.15)",
        whiteSpace: "normal",
        maxWidth: "calc(100vw - 48px)",
        textAlign: "center",
        wordBreak: "break-word",
      }}
    >
      <span style={{ color: "#589B66", fontWeight: 800 }}>✓</span>
      <span>{message}</span>
    </div>
  );
}
