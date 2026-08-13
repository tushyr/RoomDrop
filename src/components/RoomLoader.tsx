"use client";

import { useEffect, useState } from "react";
import TransitionLink from "./TransitionLink";
import { isRoomExpired } from "@/lib/utils";
import type { Room } from "@/types/room";
import RoomEditor from "./RoomEditor";

interface RoomLoaderProps {
  code: string;
}

type Status = "loading" | "ready" | "not-found" | "expired";

export default function RoomLoader({ code }: RoomLoaderProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    // Fast path: room was just created, data is in sessionStorage
    const cacheKey = `room:${code}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      sessionStorage.removeItem(cacheKey);
      try {
        const parsed = JSON.parse(cached) as Room;
        if (isRoomExpired(parsed.expires_at)) {
          setStatus("expired");
        } else {
          setRoom(parsed);
          setStatus("ready");
        }
        return;
      } catch {
        // Fall through to API fetch
      }
    }

    // Slow path: direct URL visit or join-by-code
    fetch(`/api/rooms/${code}`)
      .then(async (res) => {
        if (res.status === 404) { setStatus("not-found"); return; }
        if (res.status === 410) { setStatus("expired"); return; }
        if (!res.ok) { setStatus("not-found"); return; }
        const data = await res.json();
        setRoom(data.room as Room);
        setStatus("ready");
      })
      .catch(() => setStatus("not-found"));
  }, [code]);

  if (status === "loading") return <LoadingScreen />;
  if (status === "not-found") return <NotFoundScreen />;
  if (status === "expired") return <ExpiredScreen code={code} />;
  if (room) return <RoomEditor room={room} />;
  return null;
}

// ── Loading skeleton ───────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <main
      className="animate-fade-in flex flex-col h-dvh max-h-dvh w-full max-w-4xl mx-auto px-4 py-3 sm:px-6 sm:py-4 select-none box-border"
    >
      {/* Header skeleton */}
      <div className="flex items-center justify-between gap-3 mb-3 w-full flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="animate-pulse w-24 h-7 rounded-lg bg-[var(--border-card)]" />
          <div className="animate-pulse w-20 h-7 rounded-xl bg-[var(--border-card)]" />
        </div>
        <div className="animate-pulse w-16 h-7 rounded-full bg-[var(--border-card)]" />
      </div>

      {/* Textarea skeleton */}
      <div className="animate-pulse flex-1 w-full rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)]" />
    </main>
  );
}

// ── Not found screen ───────────────────────────────────────────────────────
function NotFoundScreen() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 bg-[var(--bg-primary)] select-none">
      <div className="cozy-card animate-slide-up text-center p-8 max-w-sm w-full relative">
        <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-2xl bg-[var(--border-card)] text-[var(--accent-yellow)]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h1 className="font-hand text-3xl font-bold text-[var(--text-primary)] mb-1.5">
          Room not found
        </h1>
        <p className="text-xs text-[var(--text-secondary)] font-ui leading-relaxed mb-6">
          That room doesn&apos;t exist or the code is incorrect. Double-check and try again.
        </p>
        <TransitionLink
          href="/"
          className="btn-butter no-underline w-full justify-center"
        >
          Back to home
        </TransitionLink>

        <div className="dog-ear-corner" aria-hidden="true" />
      </div>
    </main>
  );
}

// ── Expired screen ─────────────────────────────────────────────────────────
function ExpiredScreen({ code }: { code: string }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 bg-[var(--bg-primary)] select-none">
      <div className="cozy-card animate-slide-up text-center p-8 max-w-sm w-full relative">
        <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-2xl bg-[var(--border-card)] text-[var(--accent-rose)]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>

        <h1 className="font-hand text-3xl font-bold text-[var(--text-primary)] mb-1.5">
          Room expired
        </h1>
        <p className="text-xs text-[var(--text-secondary)] font-ui mb-1">
          Room <code className="font-mono font-bold bg-[var(--border-card)] px-2 py-0.5 rounded text-[var(--code-badge-text)]">{code}</code> has vanished.
        </p>
        <p className="text-[11px] text-[var(--text-muted)] font-ui mb-6">
          Rooms automatically delete after 1 hour.
        </p>
        <TransitionLink
          href="/"
          className="btn-matcha no-underline w-full justify-center"
        >
          Create a new room
        </TransitionLink>

        <div className="dog-ear-corner" aria-hidden="true" />
      </div>
    </main>
  );
}
