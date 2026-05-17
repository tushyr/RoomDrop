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
    // ── Fast path: room was just created, data is in sessionStorage ────────
    const cacheKey = `room:${code}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      sessionStorage.removeItem(cacheKey); // consume once
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
        // corrupt cache — fall through to API fetch
      }
    }

    // ── Slow path: direct URL visit or join-by-code ─────────────────────────
    fetch(`/api/rooms/${code}`)
      .then(async (res) => {
        if (res.status === 404) { setStatus("not-found"); return; }
        if (res.status === 410) { setStatus("expired");   return; }
        if (!res.ok)            { setStatus("not-found"); return; }
        const data = await res.json();
        setRoom(data.room as Room);
        setStatus("ready");
      })
      .catch(() => setStatus("not-found"));
  }, [code]);

  if (status === "loading")   return <LoadingScreen />;
  if (status === "not-found") return <NotFoundScreen />;
  if (status === "expired")   return <ExpiredScreen code={code} />;
  if (room)                   return <RoomEditor room={room} />;
  return null;
}

// ── Loading skeleton ───────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <main
      className="animate-fade-in"
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        maxWidth: 800,
        margin: "0 auto",
        padding: "20px 16px 16px",
      }}
    >
      {/* Header skeleton */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            className="animate-pulse-subtle"
            style={{
              width: 96,
              height: 22,
              borderRadius: 6,
              background: "var(--bg-card-hover)",
            }}
          />
          <div
            className="animate-pulse-subtle"
            style={{
              width: 80,
              height: 32,
              borderRadius: 8,
              background: "var(--bg-card-hover)",
              animationDelay: "100ms",
            }}
          />
        </div>
        <div
          className="animate-pulse-subtle"
          style={{
            width: 72,
            height: 28,
            borderRadius: 999,
            background: "var(--bg-card-hover)",
            animationDelay: "200ms",
          }}
        />
      </div>

      {/* Textarea skeleton */}
      <div
        className="animate-pulse-subtle"
        style={{
          flex: 1,
          minHeight: "calc(100dvh - 160px)",
          borderRadius: 12,
          border: "1px solid var(--border)",
          background: "var(--bg-primary)",
          animationDelay: "150ms",
        }}
      />
    </main>
  );
}

// ── Not found screen ───────────────────────────────────────────────────────
function NotFoundScreen() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 bg-[var(--bg-primary)]">
      <div
        className="glass-card animate-slide-up text-center"
        style={{ padding: "48px 40px", maxWidth: 420 }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            marginBottom: 8,
            letterSpacing: "-0.03em",
          }}
        >
          Room not found
        </h1>
        <p
          style={{
            color: "var(--text-secondary)",
            marginBottom: 32,
            lineHeight: 1.6,
          }}
        >
          That room doesn&apos;t exist or the code is incorrect. Double-check and try again.
        </p>
        <TransitionLink href="/" className="btn-primary" style={{ textDecoration: "none" }}>
          Back to home
        </TransitionLink>
      </div>
    </main>
  );
}

// ── Expired screen ─────────────────────────────────────────────────────────
function ExpiredScreen({ code }: { code: string }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 bg-[var(--bg-primary)]">
      {/* Subtle red glow */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
      </div>

      <div
        className="glass-card animate-slide-up text-center"
        style={{ padding: "48px 40px", maxWidth: 420 }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>⏱</div>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            marginBottom: 8,
            letterSpacing: "-0.03em",
          }}
        >
          This room has expired
        </h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: 8, lineHeight: 1.6 }}>
          Room{" "}
          <code
            style={{
              fontFamily: "JetBrains Mono, monospace",
              color: "var(--text-primary)",
              background: "rgba(255,255,255,0.06)",
              padding: "2px 8px",
              borderRadius: 6,
            }}
          >
            {code}
          </code>{" "}
          is no longer available.
        </p>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.875rem",
            marginBottom: 32,
          }}
        >
          Rooms automatically expire after 1 hour.
        </p>
        <TransitionLink href="/" className="btn-primary" style={{ textDecoration: "none" }}>
          Create a new room
        </TransitionLink>
      </div>
    </main>
  );
}
