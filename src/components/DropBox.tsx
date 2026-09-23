"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { generateRoomCode, getRoomExpiryTimestamp } from "@/lib/utils";

export default function DropBox() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  // Prefetch a dummy room route on mount so the JS bundle is already
  // loaded when the user hits Drop It — eliminates the cold-start delay.
  useEffect(() => {
    router.prefetch("/room/XXXXXX");
  }, [router]);

  const handleDrop = useCallback(() => {
    setLoading(true);
    const code = generateRoomCode();
    const ownerToken = crypto.randomUUID();
    const expiresAt = getRoomExpiryTimestamp();

    // Store optimistically — RoomLoader reads this instantly, no API wait
    localStorage.setItem(`roomdrop_owner:${code}`, ownerToken);
    sessionStorage.setItem(
      `room:${code}`,
      JSON.stringify({
        code,
        content,
        owner_token: ownerToken,
        expires_at: expiresAt,
        created_at: new Date().toISOString(),
      })
    );

    // Navigate immediately (no delay)
    router.push(`/room/${code}`);

    // Fire-and-forget DB write in background
    fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, code, owner_token: ownerToken, expires_at: expiresAt }),
    }).catch(console.error);
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
    <div className="flex flex-col gap-3">
      {/* Textarea */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] focus-within:border-[var(--border-focus)] transition-colors">
        <textarea
          value={content}
          onChange={(e) => {
            if (e.target.value.length <= 10000) setContent(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Paste or type anything…"
          rows={4}
          maxLength={10000}
          className="w-full bg-transparent outline-none resize-none text-[var(--text)] placeholder-[var(--text-muted)] p-4 text-base leading-relaxed"
          style={{ minHeight: "108px", maxHeight: "160px", fontSize: "16px" }}
          aria-label="Content to share"
        />
        {content.length > 0 && (
          <div className="px-4 pb-3 text-right text-xs text-[var(--text-muted)] font-mono select-none">
            {content.length.toLocaleString()} / 10,000
          </div>
        )}
      </div>

      {/* Drop Button */}
      <button
        onClick={handleDrop}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-[var(--green)] hover:bg-[var(--green-hover)] active:scale-[0.98] text-white font-semibold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none"
      >
        {loading ? "Opening room…" : "Drop It →"}
      </button>
    </div>
  );
}
