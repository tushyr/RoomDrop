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
    // Fast path: room was just created — data is already in sessionStorage
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

    // Slow path: direct URL visit or join-by-code → fetch from API
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

function LoadingScreen() {
  return (
    <main className="flex flex-col h-dvh max-h-dvh w-full max-w-3xl mx-auto px-4 py-3 sm:px-6 sm:py-4 box-border">
      <div className="flex items-center justify-between gap-3 mb-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="animate-pulse w-24 h-6 rounded-lg bg-[var(--border)]" />
          <div className="animate-pulse w-20 h-6 rounded-lg bg-[var(--border)]" />
        </div>
        <div className="animate-pulse w-14 h-5 rounded bg-[var(--border)]" />
      </div>
      <div className="animate-pulse flex-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)]" />
    </main>
  );
}

function NotFoundScreen() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-5 bg-[var(--bg)] select-none">
      <div className="w-full max-w-sm text-center animate-fade-in">
        <h1 className="font-brand text-4xl font-bold text-white mb-2">Room not found</h1>
        <p className="text-sm text-[var(--text-sub)] mb-6">
          That room doesn&apos;t exist or the code is wrong. Double-check and try again.
        </p>
        <TransitionLink
          href="/"
          className="inline-block px-6 py-3 rounded-xl bg-[var(--amber)] hover:bg-[var(--amber-hover)] text-white font-semibold text-sm transition-colors no-underline"
        >
          Back to home
        </TransitionLink>
      </div>
    </main>
  );
}

function ExpiredScreen({ code }: { code: string }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-5 bg-[var(--bg)] select-none">
      <div className="w-full max-w-sm text-center animate-fade-in">
        <h1 className="font-brand text-4xl font-bold text-white mb-2">Room expired</h1>
        <p className="text-sm text-[var(--text-sub)] mb-6">
          Room <span className="font-mono text-white">{code}</span> has vanished.
        </p>
        <TransitionLink
          href="/"
          className="inline-block px-6 py-3 rounded-xl bg-[var(--green)] hover:bg-[var(--green-hover)] text-white font-semibold text-sm transition-colors no-underline"
        >
          Create a new room
        </TransitionLink>
      </div>
    </main>
  );
}
