"use client";

import { useState } from "react";
import { useTransitionRouter } from "@/lib/useTransitionRouter";

export default function CreateRoomButton() {
  const router = useTransitionRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/rooms", { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data.room) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      // Cache room data so RoomLoader can skip a second DB round-trip
      sessionStorage.setItem(`room:${data.room.code}`, JSON.stringify(data.room));
      router.push(`/room/${data.room.code}`);
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        id="create-room-btn"
        className="btn-primary w-full text-[15px] py-3.5"
        onClick={handleCreate}
        disabled={loading}
        aria-label="Create a new room"
      >
        {loading ? (
          <>
            <SpinnerIcon />
            Creating room…
          </>
        ) : (
          <>
            <PlusIcon />
            Create Room
          </>
        )}
      </button>

      {error && (
        <p
          role="alert"
          style={{
            marginTop: 10,
            fontSize: "0.8125rem",
            color: "var(--danger)",
            textAlign: "center",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      width="18"
      height="18"
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
