"use client";

import { useState, useCallback } from "react";

interface CopyButtonProps {
  text: string;
  label?: string;
  id?: string;
  style?: React.CSSProperties;
  className?: string;
}

/** Synchronous copy fallback for mobile Safari / HTTP contexts. */
function copyViaExecCommand(text: string): boolean {
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    // Off-screen so it doesn't cause a scroll jump or flash
    el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0;";
    document.body.appendChild(el);
    el.focus();
    el.select();
    el.setSelectionRange(0, text.length); // Required on iOS for selection to register
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

export default function CopyButton({
  text,
  label = "Copy",
  id,
  style,
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (copied) return;

    // Primary path: async Clipboard API (works on HTTPS / desktop)
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        // Fallback: synchronous execCommand (mobile Safari, HTTP contexts)
        if (copyViaExecCommand(text)) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      });
      return;
    }

    // Fallback for browsers without Clipboard API at all
    if (copyViaExecCommand(text)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text, copied]);

  return (
    <button
      id={id}
      className={className ?? "btn-secondary"}
      onClick={handleCopy}
      aria-label={copied ? "Copied!" : label}
      title={copied ? "Copied!" : label}
      style={{
        minWidth: 88,
        padding: "8px 14px",
        fontSize: "0.8125rem",
        fontWeight: 500,
        gap: 6,
        transition: "all 0.2s ease",
        ...(copied && {
          borderColor: "rgba(34,197,94,0.4)",
          color: "#22c55e",
        }),
        ...style,
      }}
    >
      {copied ? (
        <>
          <CheckIcon />
          Copied!
        </>
      ) : (
        <>
          <CopyIcon />
          {label}
        </>
      )}
    </button>
  );
}

function CopyIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
