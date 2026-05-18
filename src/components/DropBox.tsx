"use client";

import { useState, useEffect, useCallback } from "react";
import { useTransitionRouter } from "@/lib/useTransitionRouter";
import { generateRoomCode, getRoomExpiryTimestamp } from "@/lib/utils";

const PLACEHOLDERS = [
  "Paste your text, link, code, or anything…",
  "Drop your wifi password. We won't tell.",
  "Paste that recipe you found at 2am.",
  "Share the address. We're already on the way.",
  "Paste your code snippet. We'll pretend to understand.",
  "Type your hottest take. No screenshots allowed.",
  "Paste the error message. Stack Overflow can wait.",
  "Drop the Spotify playlist link. Judge-free zone.",
  "Write the group plan nobody will follow.",
  "Share the password. Yes, the Netflix one.",
];

export default function DropBox() {
  const router = useTransitionRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [placeholder, setPlaceholder] = useState("");

  // Set placeholder on client mount to avoid hydration mismatch
  useEffect(() => {
    setPlaceholder(PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)]);
  }, []);

  const handleDrop = useCallback(() => {
    setLoading(true);

    // 1. Optimistic UI: Generate room details on the client instantly
    const code = generateRoomCode();
    const ownerToken = crypto.randomUUID();
    const expiresAt = getRoomExpiryTimestamp();

    // 2. Set up local state instantly
    localStorage.setItem(`roomdrop_owner:${code}`, ownerToken);

    // 3. Cache the optimistic room state so RoomLoader can use it instantly
    const optimisticRoom = {
      code,
      content,
      owner_token: ownerToken,
      expires_at: expiresAt,
      created_at: new Date().toISOString()
    };
    sessionStorage.setItem(`room:${code}`, JSON.stringify(optimisticRoom));

    // 4. Instantly trigger the router transition (Zero latency)
    router.push(`/room/${code}`);

    // 5. Fire the actual DB insertion in the background
    fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        content,
        code,
        owner_token: ownerToken,
        expires_at: expiresAt
      }),
    }).catch((err) => {
      console.error("Background save failed:", err);
      // We don't block the user, but if it truly fails, the room won't persist
      // across devices or after refresh. In a real production app we'd add 
      // an offline-retry queue here.
    });
  }, [content, router]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Ctrl/Cmd + Enter → create room
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleDrop();
      }
    },
    [handleDrop]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Textarea */}
      <div style={{ position: "relative" }}>
        <textarea
          id="drop-textarea"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Content to share"
          spellCheck
          rows={3}
          style={{
            width: "100%",
            padding: "16px",
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.09)",
            borderRadius: 14,
            color: "var(--text-primary)",
            caretColor: "var(--text-primary)",
            resize: "none",
            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.4)",
            lineHeight: 1.7,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "rgba(255, 255, 255, 0.35)";
            e.target.style.background = "rgba(255, 255, 255, 0.05)";
            e.target.style.boxShadow = "inset 0 1px 2px rgba(0,0,0,0.4), 0 0 0 3px rgba(255,255,255,0.06)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "rgba(255, 255, 255, 0.09)";
            e.target.style.background = "rgba(255, 255, 255, 0.03)";
            e.target.style.boxShadow = "inset 0 1px 2px rgba(0,0,0,0.4)";
          }}
        />
        {/* Character hint */}
        <span
          style={{
            position: "absolute",
            bottom: 10,
            right: 14,
            fontSize: "0.7rem",
            color: "var(--text-muted)",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          {content.length > 0 ? `${content.length.toLocaleString()} chars` : "⌘↵ to drop"}
        </span>
      </div>

      {/* Create button */}
      <button
        id="drop-room-btn"
        className="btn-primary w-full"
        onClick={handleDrop}
        disabled={loading}
        aria-label="Create room and get a shareable code"
        style={{ fontSize: "0.9375rem", paddingTop: 14, paddingBottom: 14 }}
      >
        {loading ? (
          <>
            <SpinnerIcon />
            Creating room…
          </>
        ) : (
          <>
            <DropIcon />
            Drop It
          </>
        )}
      </button>

      {error && (
        <p
          role="alert"
          style={{
            fontSize: "0.8125rem",
            color: "var(--danger)",
            textAlign: "center",
            marginTop: 2,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

function DropIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      style={{ animation: "spin 0.8s linear infinite" }}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
