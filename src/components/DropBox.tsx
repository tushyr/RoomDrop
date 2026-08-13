"use client";

import { useState, useCallback } from "react";
import { useTransitionRouter } from "@/lib/useTransitionRouter";
import { generateRoomCode, getRoomExpiryTimestamp } from "@/lib/utils";
import { RayBursts, RayBurstsRight } from "./DoodleDecorations";

export default function DropBox() {
  const router = useTransitionRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const placeholder = "Type your hottest take. No screenshots allowed.";

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
      created_at: new Date().toISOString(),
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
        expires_at: expiresAt,
      }),
    }).catch((err) => {
      console.error("Background save failed:", err);
    });
  }, [content, router]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleDrop();
      }
    },
    [handleDrop]
  );

  return (
    <div className="flex flex-col items-center gap-3.5 w-full">
      {/* Paper Card with Dog-ear Corner */}
      <div className="cozy-card w-full relative">
        <textarea
          id="drop-textarea"
          value={content}
          onChange={(e) => {
            if (e.target.value.length <= 10000) {
              setContent(e.target.value);
              setError(null);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Content to share"
          spellCheck
          rows={3}
          className="cozy-textarea text-base p-4 sm:p-5"
          maxLength={10000}
          style={{ minHeight: "92px", maxHeight: "140px", fontSize: "16px" }}
        />

        {/* Bottom bar inside card: Character counter & Pencil icon */}
        <div className="flex items-center justify-end gap-1.5 px-4 pb-2.5 pt-0 select-none pointer-events-none text-xs text-[var(--text-muted)] font-mono font-medium">
          <span>{content.length.toLocaleString()} / 10,000</span>
          {/* Pencil Icon */}
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[var(--text-muted)] opacity-85"
          >
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
          </svg>
        </div>

        {/* Dog-ear corner fold */}
        <div className="dog-ear-corner" aria-hidden="true" />
      </div>

      {/* "Drop It" Action Area with Ray Bursts */}
      <div className="flex items-center justify-center gap-3 w-full">
        <RayBursts />
        
        <button
          id="drop-room-btn"
          type="button"
          className="btn-matcha px-8 py-2.5 sm:py-3 text-base font-bold shadow-md cursor-pointer"
          onClick={handleDrop}
          disabled={loading}
          aria-label="Drop It and create room"
        >
          {loading ? (
            <>
              <SpinnerIcon />
              <span>Creating...</span>
            </>
          ) : (
            <>
              <PaperPlaneIcon />
              <span>Drop It</span>
            </>
          )}
        </button>

        <RayBurstsRight />
      </div>

      {error && (
        <p
          role="alert"
          className="text-xs text-[var(--danger)] text-center font-medium mt-0.5 animate-fade-in"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function PaperPlaneIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className="-rotate-12 transform"
    >
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
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
      className="animate-spin"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
