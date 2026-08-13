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
    el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0;";
    document.body.appendChild(el);
    el.focus();
    el.select();
    el.setSelectionRange(0, text.length);
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

    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          if (copyViaExecCommand(text)) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }
        });
      return;
    }

    if (copyViaExecCommand(text)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text, copied]);

  return (
    <button
      id={id}
      type="button"
      className={`${className ?? "btn-cozy-subtle"} ${copied ? "animate-button-pop" : ""}`}
      onClick={handleCopy}
      aria-label={copied ? "Copied!" : label}
      title={copied ? "Copied!" : label}
      style={{
        minWidth: 92,
        padding: "7px 14px",
        fontSize: "0.875rem",
        fontWeight: 600,
        gap: 6,
        ...(copied && {
          borderColor: "var(--accent-green)",
          backgroundColor: "rgba(122, 170, 120, 0.15)",
          color: "var(--text-primary)",
        }),
        ...style,
      }}
    >
      {copied ? (
        <>
          <CheckIcon />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <CopyIcon />
          <span>{label}</span>
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
      stroke="var(--accent-green)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
