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
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    setCode(val);
    setError(null);
  };

  const handleJoin = async () => {
    const trimmed = code.trim();

    if (!trimmed) {
      setError("Please enter a room code.");
      inputRef.current?.focus();
      return;
    }

    if (!isValidRoomCode(trimmed)) {
      setError("Room codes are 6 characters (letters and numbers).");
      inputRef.current?.focus();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/rooms/${trimmed}`);
      const data = await res.json();

      if (res.status === 404) {
        setError("Room not found. Check the code and try again.");
        return;
      }

      if (res.status === 410 || data.expired) {
        setError("This room has expired.");
        return;
      }

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      // Cache room data so RoomLoader uses the fast path (no second DB call)
      sessionStorage.setItem(`room:${trimmed}`, JSON.stringify(data.room));
      router.push(`/room/${trimmed}`);
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleJoin();
  };

  return (
    <div className="w-full">
      {/* "or join" Divider */}
      <div className="flex items-center gap-3 my-3 w-full">
        <div className="h-[1px] flex-1 bg-[var(--border)]" />
        <span className="text-xs font-medium text-[var(--accent-yellow)] tracking-wide">
          or join
        </span>
        <div className="h-[1px] flex-1 bg-[var(--border)]" />
      </div>

      {/* Input + Join Button */}
      <div className="flex items-center gap-2.5 w-full">
        <div className="relative flex-1">
          {/* Skeleton Key Icon */}
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[var(--text-muted)]"
            >
              <circle cx="7.5" cy="15.5" r="4.5" />
              <path d="m10.7 12.3 9.3-9.3" />
              <path d="m18 5 2 2" />
              <path d="m15 8 2 2" />
            </svg>
          </div>

          <input
            ref={inputRef}
            id="room-code-input"
            className="cozy-input text-sm sm:text-base py-2.5 sm:py-3 pl-10 pr-3 font-ui"
            type="text"
            value={code}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter room code"
            maxLength={6}
            autoCapitalize="characters"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            aria-label="Room code"
            aria-describedby={error ? "join-error" : undefined}
            style={{ letterSpacing: code ? "0.2em" : "normal" }}
          />
        </div>

        <button
          id="join-room-btn"
          type="button"
          className="btn-butter whitespace-nowrap shrink-0 px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-bold cursor-pointer"
          onClick={handleJoin}
          disabled={loading || code.length === 0}
          aria-label="Join room"
        >
          {loading ? (
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
          ) : (
            "Join →"
          )}
        </button>
      </div>

      {error && (
        <p
          id="join-error"
          role="alert"
          className="mt-1.5 text-xs font-medium text-[var(--danger)] text-center animate-fade-in"
        >
          {error}
        </p>
      )}
    </div>
  );
}
