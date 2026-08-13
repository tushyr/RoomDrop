"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
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

// A stable sender ID for this browser tab session
const SENDER_ID = generateSenderId();

const PLACEHOLDERS = [
  "Paste your text, link, code, or anything here…",
  "Drop your wifi password. We won't tell.",
  "Share the address. We're already on the way.",
  "Type your hottest take. No screenshots allowed.",
  "Paste that recipe you found at 2am.",
  "Write the group plan nobody will follow.",
  "Drop the Spotify playlist link. Judge-free zone.",
  "Paste your code snippet. We'll pretend to understand.",
  "Share the password. Yes, the Netflix one.",
];

/** Synchronous copy fallback for mobile Safari / HTTP contexts. */
function copyViaExecCommand(text: string): boolean {
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0;";
    document.body.appendChild(el);
    el.focus();
    el.select();
    el.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

export default function RoomEditor({ room }: RoomEditorProps) {
  const [content, setContent] = useState(room.content);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [expired, setExpired] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [placeholder, setPlaceholder] = useState("");
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    setPlaceholder(PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)]);
  }, [room.code]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const realtimeChannelRef = useRef<RealtimeChannel | null>(null);

  // ── Check ownership (client-side localStorage) ────────────────────────────
  useEffect(() => {
    const storedToken = localStorage.getItem(`roomdrop_owner:${room.code}`);
    const isOwnerCheck =
      !!storedToken &&
      !!room.owner_token &&
      storedToken === room.owner_token;
    setIsOwner(isOwnerCheck);
    if (isOwnerCheck) textareaRef.current?.focus();
  }, [room.code, room.owner_token]);

  const handleCopyCode = useCallback(() => {
    if (copiedCode) return;

    const text = room.code;

    const markCopied = () => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    };

    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(markCopied)
        .catch(() => {
          if (copyViaExecCommand(text)) markCopied();
        });
      return;
    }

    if (copyViaExecCommand(text)) markCopied();
  }, [room.code, copiedCode]);

  // ── Save to DB via PATCH /api/rooms/[code] ─────────────────────────────────
  const saveToDb = useCallback(
    async (newContent: string) => {
      const storedToken = localStorage.getItem(`roomdrop_owner:${room.code}`);
      if (!storedToken) return;

      setSaveStatus("saving");

      try {
        const res = await fetch(`/api/rooms/${room.code}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-owner-token": storedToken,
          },
          body: JSON.stringify({ content: newContent }),
        });

        if (res.status === 410) {
          setExpired(true);
          return;
        }

        if (!res.ok) {
          setSaveStatus("error");
          return;
        }

        setSaveStatus("saved");
        setTimeout(() => {
          setSaveStatus((current) => (current === "saved" ? "idle" : current));
        }, 2000);
      } catch {
        setSaveStatus("error");
      }
    },
    [room.code]
  );

  // ── Broadcast change to peers via Supabase Realtime Broadcast ─────────────
  const broadcastChange = useCallback((newContent: string) => {
    const channel = realtimeChannelRef.current;
    if (!channel) return;

    const payload: RoomBroadcastPayload = {
      content: newContent,
      sender_id: SENDER_ID,
    };

    channel.send({
      type: "broadcast",
      event: BROADCAST_EVENT,
      payload,
    });
  }, []);

  // ── Handle local typing (owner only) ──────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    broadcastChange(newContent);

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      saveToDb(newContent);
    }, SAVE_DEBOUNCE_MS);
  };

  // ── Set up Supabase Realtime channel ──────────────────────────────────────
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const channelName = `room:${room.code}`;

    const channel = supabase.channel(channelName, {
      config: { broadcast: { self: false } },
    });

    channel
      .on("broadcast", { event: BROADCAST_EVENT }, ({ payload }) => {
        const data = payload as RoomBroadcastPayload;
        if (data.sender_id === SENDER_ID) return;
        setContent(data.content);
      })
      .subscribe();

    realtimeChannelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      realtimeChannelRef.current = null;
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [room.code]);

  const handleExpired = useCallback(() => {
    setExpired(true);
  }, []);

  if (expired || isRoomExpired(room.expires_at)) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-4 bg-[var(--bg-primary)]">
        <div className="cozy-card animate-slide-up text-center p-8 max-w-md w-full">
          <div className="text-4xl mb-3">⏱️</div>
          <h1 className="font-hand text-3xl font-bold text-[var(--text-primary)] mb-2">
            This room has expired
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            Room <code className="font-mono bg-[var(--code-badge-bg)] px-2 py-0.5 rounded text-[var(--code-badge-text)] font-bold">{room.code}</code> has vanished.
          </p>
          <TransitionLink
            href="/"
            className="btn-matcha no-underline"
          >
            Create a new room
          </TransitionLink>
        </div>
      </main>
    );
  }

  return (
    <>
      <main
        className="animate-fade-in flex flex-col justify-between h-dvh max-h-dvh w-full overflow-hidden max-w-4xl mx-auto px-4 py-3 sm:px-6 sm:py-4 select-none box-border"
      >
        {/* Top Header */}
        <header
          className="animate-slide-up flex items-center justify-between gap-3 mb-3 w-full flex-shrink-0"
        >
          {/* Left: Back Link + Room Code Badge */}
          <div className="flex items-center gap-2.5 min-w-0">
            <TransitionLink
              href="/"
              aria-label="Back to home"
              className="flex items-center gap-1.5 no-underline text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
              <span className="font-hand font-bold text-xl sm:text-2xl text-[var(--text-primary)]">
                RoomDrop
              </span>
            </TransitionLink>

            {/* Room Code Badge */}
            <button
              type="button"
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-[var(--code-badge-border)] bg-[var(--code-badge-bg)] hover:scale-102 active:scale-98 transition-all cursor-pointer shadow-xs"
              title="Click to copy room code"
              aria-label="Room code, click to copy"
            >
              <span className="font-mono text-xs sm:text-sm font-bold tracking-wider text-[var(--code-badge-text)]">
                {copiedCode ? "COPIED! ✓" : room.code}
              </span>
              {!copiedCode && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[var(--code-badge-text)] opacity-70"
                >
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
              )}
            </button>
          </div>

          {/* Right: Save Status + Countdown Timer + Info Button */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isOwner && <SaveIndicator status={saveStatus} />}
            
            <CountdownTimer
              expiresAt={room.expires_at}
              onExpired={handleExpired}
            />

            <button
              type="button"
              onClick={() => setShowInfo(true)}
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all cursor-pointer shadow-xs active:scale-95"
              title="About this room"
              aria-label="About this room"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="animate-slide-up delay-100 relative flex-1 flex flex-col min-h-0 w-full">
          {isOwner === null ? null : isOwner ? (
            <div className="cozy-card w-full h-full relative flex flex-col">
              <textarea
                ref={textareaRef}
                id="room-textarea"
                value={content}
                onChange={handleChange}
                placeholder={placeholder}
                aria-label="Shared room content"
                spellCheck
                className="cozy-textarea flex-1 w-full h-full p-4 sm:p-6 text-sm sm:text-base font-ui"
                maxLength={50000}
              />
              <div className="dog-ear-corner" aria-hidden="true" />
            </div>
          ) : (
            <ContentRenderer content={content} />
          )}
        </div>

        {/* Footer */}
        <footer
          className="animate-fade-in delay-200 flex items-center justify-between gap-2 mt-2.5 pt-1 w-full flex-shrink-0"
        >
          <p className="text-xs text-[var(--text-muted)] font-mono font-medium">
            {content.length.toLocaleString()} chars
            {isOwner ? " · synced ⚡" : " · view only 👁️"}
          </p>
          
          <CopyButton
            id="copy-content-btn"
            text={content}
            label="Copy text"
          />
        </footer>

        {/* Toast notifications */}
        {toast && (
          <Toast message={toast} onDismiss={() => setToast(null)} />
        )}
      </main>

      {/* Clean Minimalist Modal */}
      {showInfo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in"
          onClick={() => setShowInfo(false)}
        >
          <div
            className="cozy-card max-w-sm w-full p-7 text-left animate-slide-up relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowInfo(false)}
              className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1 rounded-lg cursor-pointer"
              aria-label="Close modal"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="mb-5">
              <h3 className="font-hand text-3xl font-bold text-[var(--text-primary)] leading-none mb-1.5">
                Room {room.code}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-ui leading-relaxed">
                Live ephemeral space. Anything typed here broadcasts live.
              </p>
            </div>

            <div className="space-y-4 mb-6 font-ui">
              <div className="flex items-start gap-3.5">
                <span className="font-mono text-xs font-bold text-[var(--accent-yellow)] bg-[rgba(245,158,11,0.12)] px-2 py-0.5 rounded border border-[rgba(245,158,11,0.25)] flex-shrink-0 mt-0.5">
                  01
                </span>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)] mb-0.5">Live Sync</h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Share the code with anyone to read or edit simultaneously.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="font-mono text-xs font-bold text-[var(--accent-rose)] bg-[rgba(248,113,113,0.1)] px-2 py-0.5 rounded border border-[rgba(248,113,113,0.2)] flex-shrink-0 mt-0.5">
                  02
                </span>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)] mb-0.5">Vanishes in 1 Hour</h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    This room and all its text permanently delete when the timer ends.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowInfo(false)}
              className="btn-butter w-full justify-center py-2.5 text-sm font-bold cursor-pointer"
            >
              Back to editor
            </button>

            <div className="dog-ear-corner" aria-hidden="true" />
          </div>
        </div>
      )}
    </>
  );
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;

  return (
    <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-medium font-ui">
      {status === "saving" && (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-yellow)] animate-ping" />
          <span>Saving…</span>
        </>
      )}
      {status === "saved" && (
        <>
          <span className="text-[var(--success)]">✓</span>
          <span>Saved</span>
        </>
      )}
      {status === "error" && (
        <>
          <span className="text-[var(--danger)]">✕</span>
          <span className="text-[var(--danger)]">Failed to save</span>
        </>
      )}
    </div>
  );
}
