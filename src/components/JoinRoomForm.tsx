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
    <div>
      <label
        htmlFor="room-code-input"
        className="block mb-2 text-sm font-medium text-[var(--text-secondary)]"
      >
        Enter room code
      </label>

      <div className="flex gap-2">
        <input
          ref={inputRef}
          id="room-code-input"
          className="input-base"
          type="text"
          value={code}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="K7P2X9"
          maxLength={6}
          autoCapitalize="characters"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          aria-label="Room code"
          aria-describedby={error ? "join-error" : undefined}
          style={{ letterSpacing: code ? "0.25em" : "0.05em" }}
        />

        <button
          id="join-room-btn"
          className="btn-secondary whitespace-nowrap shrink-0"
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
              style={{ animation: "spin 0.8s linear infinite" }}
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
          className="mt-2 text-[13px] text-[var(--danger)]"
        >
          {error}
        </p>
      )}
    </div>
  );
}
