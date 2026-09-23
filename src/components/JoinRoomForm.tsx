"use client";

import { useState, useRef } from "react";
import { useTransitionRouter } from "@/lib/useTransitionRouter";
import { isValidRoomCode } from "@/lib/utils";

export default function JoinRoomForm() {
  const router = useTransitionRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6));
    setError(null);
  };

  const handleJoin = async () => {
    const trimmed = code.trim();
    if (!trimmed) { setError("Enter a room code."); inputRef.current?.focus(); return; }
    if (!isValidRoomCode(trimmed)) { setError("Codes are 6 characters — letters and numbers."); return; }

    setLoading(true);
    try {
      const res = await fetch(`/api/rooms/${trimmed}`);
      const data = await res.json();
      if (res.status === 404) { setError("Room not found."); return; }
      if (res.status === 410 || data.expired) { setError("This room has expired."); return; }
      if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
      sessionStorage.setItem(`room:${trimmed}`, JSON.stringify(data.room));
      router.push(`/room/${trimmed}`);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      {/* Divider */}
      <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] select-none">
        <div className="h-px flex-1 bg-[var(--border)]" />
        <span>or join a room</span>
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>

      {/* Input + Button row */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={code}
          onChange={handleChange}
          onKeyDown={(e) => e.key === "Enter" && handleJoin()}
          placeholder="Room code"
          maxLength={6}
          autoCapitalize="characters"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          aria-label="Room code"
          className="flex-1 min-w-0 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--border-focus)] transition-colors font-mono tracking-widest uppercase"
          style={{ fontSize: "16px", letterSpacing: code ? "0.2em" : undefined }}
        />
        <button
          onClick={handleJoin}
          disabled={loading || code.length === 0}
          className="px-5 py-3 rounded-xl bg-[var(--amber)] hover:bg-[var(--amber-hover)] active:scale-[0.98] text-white font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap select-none"
        >
          {loading ? "…" : "Join →"}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-500 text-center animate-fade-in">{error}</p>
      )}
    </div>
  );
}
