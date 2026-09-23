"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import TransitionLink from "./TransitionLink";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { generateSenderId, isRoomExpired } from "@/lib/utils";
import { BROADCAST_EVENT, SAVE_DEBOUNCE_MS } from "@/lib/constants";
import type { Room, RoomBroadcastPayload } from "@/types/room";
import CopyButton from "./CopyButton";
import CountdownTimer from "./CountdownTimer";
import Toast from "./Toast";
import ContentRenderer from "./ContentRenderer";

interface RoomEditorProps {
  room: Room;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

const SENDER_ID = generateSenderId();

const PLACEHOLDERS = [
  "Paste anything here…",
  "Drop your wifi password. We won't tell.",
  "Paste that recipe you found at 2am.",
  "Paste your code snippet.",
  "Share the address.",
  "Write the group plan nobody will follow.",
];

function copyText(text: string): boolean {
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.cssText = "position:fixed;top:-9999px;opacity:0;";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch { return false; }
}

export default function RoomEditor({ room }: RoomEditorProps) {
  const [content, setContent] = useState(room.content);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [expired, setExpired] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [placeholder] = useState(
    () => PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)]
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const realtimeChannelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem(`roomdrop_owner:${room.code}`);
    const owner = !!storedToken && !!room.owner_token && storedToken === room.owner_token;
    setIsOwner(owner);
    if (owner) textareaRef.current?.focus();
  }, [room.code, room.owner_token]);

  const handleCopyCode = useCallback(() => {
    if (copiedCode) return;
    const mark = () => { setCopiedCode(true); setTimeout(() => setCopiedCode(false), 2000); };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(room.code).then(mark).catch(() => { if (copyText(room.code)) mark(); });
    } else if (copyText(room.code)) mark();
  }, [room.code, copiedCode]);

  const saveToDb = useCallback(async (newContent: string) => {
    const storedToken = localStorage.getItem(`roomdrop_owner:${room.code}`);
    if (!storedToken) return;
    setSaveStatus("saving");
    try {
      const res = await fetch(`/api/rooms/${room.code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-owner-token": storedToken },
        body: JSON.stringify({ content: newContent }),
      });
      if (res.status === 410) { setExpired(true); return; }
      setSaveStatus(res.ok ? "saved" : "error");
      if (res.ok) setTimeout(() => setSaveStatus(s => s === "saved" ? "idle" : s), 2000);
    } catch { setSaveStatus("error"); }
  }, [room.code]);

  const broadcastChange = useCallback((newContent: string) => {
    realtimeChannelRef.current?.send({
      type: "broadcast",
      event: BROADCAST_EVENT,
      payload: { content: newContent, sender_id: SENDER_ID } satisfies RoomBroadcastPayload,
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    broadcastChange(val);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveToDb(val), SAVE_DEBOUNCE_MS);
  };

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const channel = supabase.channel(`room:${room.code}`, {
      config: { broadcast: { self: false } },
    });
    channel
      .on("broadcast", { event: BROADCAST_EVENT }, ({ payload }) => {
        const data = payload as RoomBroadcastPayload;
        if (data.sender_id !== SENDER_ID) setContent(data.content);
      })
      .subscribe();
    realtimeChannelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      realtimeChannelRef.current = null;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [room.code]);

  const handleExpired = useCallback(() => setExpired(true), []);

  // ── Expired state ──────────────────────────────────────────────────────
  if (expired || isRoomExpired(room.expires_at)) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-5 bg-[var(--bg)]">
        <div className="w-full max-w-sm text-center animate-fade-in">
          <p className="text-4xl mb-4">⌛</p>
          <h1 className="font-brand text-4xl font-bold text-white mb-2">Room expired</h1>
          <p className="text-sm text-[var(--text-sub)] mb-6">
            Room <span className="font-mono text-white">{room.code}</span> has vanished.
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

  return (
    <main className="animate-fade-in flex flex-col h-dvh max-h-dvh w-full overflow-hidden max-w-3xl mx-auto px-4 py-3 sm:px-6 sm:py-4 box-border">

      {/* Header */}
      <header className="flex items-center justify-between gap-3 mb-3 flex-shrink-0">
        {/* Left: back + code */}
        <div className="flex items-center gap-2 min-w-0">
          <TransitionLink
            href="/"
            aria-label="Back to home"
            className="flex items-center gap-1.5 no-underline text-[var(--text-sub)] hover:text-white transition-colors flex-shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span className="font-brand text-xl font-bold text-white">RoomDrop</span>
          </TransitionLink>

          <button
            onClick={handleCopyCode}
            title="Click to copy"
            className="px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-focus)] transition-colors cursor-pointer"
          >
            <span className="font-mono text-xs font-semibold tracking-widest text-[var(--success)]">
              {copiedCode ? "COPIED ✓" : room.code}
            </span>
          </button>
        </div>

        {/* Right: save + timer */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {isOwner && <SaveDot status={saveStatus} />}
          <CountdownTimer expiresAt={room.expires_at} onExpired={handleExpired} />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col min-h-0 w-full">
        {isOwner === null ? null : isOwner ? (
          <div className="w-full h-full rounded-xl border border-[var(--border)] bg-[var(--surface)] focus-within:border-[var(--border-focus)] transition-colors flex flex-col">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleChange}
              placeholder={placeholder}
              spellCheck
              maxLength={50000}
              aria-label="Room content"
              className="flex-1 w-full bg-transparent outline-none resize-none text-[var(--text)] placeholder-[var(--text-muted)] p-4 sm:p-5 text-base leading-relaxed"
              style={{ fontSize: "16px" }}
            />
          </div>
        ) : (
          <ContentRenderer content={content} />
        )}
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-between gap-2 mt-2.5 flex-shrink-0">
        <span className="text-xs text-[var(--text-muted)] font-mono select-none">
          {content.length.toLocaleString()} chars
          {isOwner !== null && (isOwner ? " · live" : " · view only")}
        </span>
        <CopyButton id="copy-content-btn" text={content} label="Copy" />
      </footer>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </main>
  );
}

function SaveDot({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;
  return (
    <span className="text-xs text-[var(--text-muted)] font-mono select-none">
      {status === "saving" && "saving…"}
      {status === "saved" && <span className="text-[var(--success)]">saved ✓</span>}
      {status === "error" && <span className="text-red-500">error</span>}
    </span>
  );
}
