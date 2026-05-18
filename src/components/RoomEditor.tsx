"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import TransitionLink from "./TransitionLink";
import { useRouter } from "next/navigation";
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

// Fun placeholder texts — one is picked randomly per room session
const PLACEHOLDERS = [
  "Paste your YouTube link here and let the squad decide...",
  "Drop your wifi password. We won't tell.",
  "Write your grocery list. Milk, eggs, regrets...",
  "Draft that risky text message here first.",
  "Share the address. We're already on the way.",
  "Type your hottest take. No screenshots allowed.",
  "Paste that recipe you found at 2am.",
  "Write the group plan nobody will follow.",
  "Drop the Spotify playlist link. Judge-free zone.",
  "Paste your code snippet. We'll pretend to understand.",
  "Write your resignation letter draft here.",
  "Share the meeting notes nobody asked for.",
  "Type your unpopular opinion. Go.",
  "Paste the flight details. Window seat or we riot.",
  "Drop your best pickup line. For research purposes.",
  "Write the caption before posting. Get feedback.",
  "Share that meme link that made you wheeze.",
  "Paste the error message. Stack Overflow can wait.",
  "Type your shower thoughts here.",
  "Draft your out-of-office reply. Make it legendary.",
  "Paste the restaurant menu link. Decide already.",
  "Write your New Year's resolutions. Again.",
  "Share the Airbnb link. Split the cost later.",
  "Type your controversial food opinion.",
  "Paste the job listing you're too scared to apply to.",
  "Write the toast speech. The wedding is tomorrow.",
  "Drop your fantasy team trades here.",
  "Paste that tweet you screenshotted.",
  "Type what you'd say if you had no filter.",
  "Share the Netflix recommendation nobody asked for.",
  "Write the excuse for being late. Make it creative.",
  "Paste the tracking number. Refresh every 5 minutes.",
  "Type your coffee order so nobody gets it wrong.",
  "Share the parking spot location. You'll forget.",
  "Write your bio in exactly three words.",
  "Paste the directions. GPS is lying again.",
  "Drop your controversial music ranking here.",
  "Type the inside joke for context.",
  "Share the secret ingredient. The people need to know.",
  "Write your elevator pitch. You have 30 seconds.",
  "Paste the apartment listing before it's gone.",
  "Type the plot twist nobody saw coming.",
  "Share the password. Yes, the Netflix one.",
  "Write your Tinder bio draft. Be honest this time.",
  "Paste the workout routine you'll do once.",
  "Drop the coordinates. Treasure hunt starts now.",
  "Type your conspiracy theory. No judgment.",
  "Share the deadline you're definitely going to miss.",
  "Write the apology text you'll never send.",
  "Paste the lyrics you've been mishearing.",
];

/** Synchronous copy fallback for mobile Safari / HTTP contexts. */
function copyViaExecCommand(text: string): boolean {
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    // Position off-screen so it doesn't cause a scroll jump
    el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0;";
    document.body.appendChild(el);
    el.focus();
    el.select();
    el.setSelectionRange(0, text.length); // iOS requires this
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

export default function RoomEditor({ room }: RoomEditorProps) {
  const router = useRouter();
  const [content, setContent] = useState(room.content);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [expired, setExpired] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  // null = not yet checked (avoids owner flash); true/false = determined
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [placeholder, setPlaceholder] = useState("");

  // Set random placeholder client-side to avoid SSR hydration mismatch
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
    // Only focus if owner
    if (isOwnerCheck) textareaRef.current?.focus();
  }, [room.code, room.owner_token]);



  const handleCopyCode = useCallback(() => {
    if (copiedCode) return;

    const text = room.code;

    const markCopied = () => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    };

    // Primary: modern Clipboard API (works on HTTPS + desktop)
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        markCopied();
      }).catch(() => {
        // Fallback for mobile Safari / insecure contexts
        if (copyViaExecCommand(text)) {
          markCopied();
        } else {
          setToast("Copy failed — long-press the code to copy manually.");
        }
      });
      return;
    }

    // Fallback for browsers without Clipboard API
    if (copyViaExecCommand(text)) {
      markCopied();
    } else {
      setToast("Copy failed — long-press the code to copy manually.");
    }
  }, [room.code, copiedCode]);

  // ── Realtime subscription ──────────────────────────────────────────────────
  useEffect(() => {
    if (isRoomExpired(room.expires_at)) {
      setExpired(true);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const channelName = `room:${room.code}`;

    const channel = supabase
      .channel(channelName, {
        config: {
          broadcast: { self: false }, // Don't echo back to sender
        },
      })
      .on(
        "broadcast",
        { event: BROADCAST_EVENT },
        (payload: { payload: RoomBroadcastPayload }) => {
          // Ignore our own messages (extra safety)
          if (payload.payload.sender_id === SENDER_ID) return;
          setContent(payload.payload.content);
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(`[RoomDrop] Connected to channel ${channelName}`);
        }
      });

    realtimeChannelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room.code, room.expires_at]);

  // ── Save to DB (debounced) ─────────────────────────────────────────────────
  const saveToDb = useCallback(
    async (text: string) => {
      setSaveStatus("saving");
      try {
        const res = await fetch(`/api/rooms/${room.code}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: text }),
        });

        if (res.ok) {
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2000);
        } else {
          setSaveStatus("error");
        }
      } catch {
        setSaveStatus("error");
      }
    },
    [room.code]
  );

  // ── Handle typing ──────────────────────────────────────────────────────────
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value;
      setContent(newContent);

      // Broadcast to other users immediately (WebSocket, no DB write)
      if (realtimeChannelRef.current) {
        realtimeChannelRef.current.send({
          type: "broadcast",
          event: BROADCAST_EVENT,
          payload: {
            content: newContent,
            sender_id: SENDER_ID,
          } satisfies RoomBroadcastPayload,
        });
      }

      // Debounced DB save
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        saveToDb(newContent);
      }, SAVE_DEBOUNCE_MS);
    },
    [saveToDb]
  );

  // Cleanup save timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const handleExpired = useCallback(() => {
    setExpired(true);
    router.refresh();
  }, [router]);

  // ── Expired overlay ────────────────────────────────────────────────────────
  if (expired) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-4">
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
          <p
            style={{ color: "var(--text-secondary)", marginBottom: 32, lineHeight: 1.6 }}
          >
            Rooms automatically expire after 1 hour.
          </p>
          <TransitionLink
            href="/"
            className="btn-primary"
            style={{ textDecoration: "none" }}
          >
            Create a new room
          </TransitionLink>
        </div>
      </main>
    );
  }

  // ── Main editor UI ─────────────────────────────────────────────────────────
  return (
    <main
      className="animate-fade-in"
      style={{
        height: "100dvh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        maxWidth: 800,
        margin: "0 auto",
        padding: "16px 16px 12px",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <header
        className="animate-slide-up"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "nowrap",
          gap: 8,
          marginBottom: 16,
          minWidth: 0,
        }}
      >
        {/* Left: Logo + Room Code */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: "1 1 auto", overflow: "hidden" }}>
          <TransitionLink
            href="/"
            aria-label="Back to home"
            style={{
              fontWeight: 700,
              fontSize: "1.125rem",
              letterSpacing: "-0.03em",
              textDecoration: "none",
            }}
            className="gradient-text"
          >
            RoomDrop
          </TransitionLink>

          <div
            onClick={handleCopyCode}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              borderRadius: 8,
              background: copiedCode ? "rgba(16, 185, 129, 0.1)" : "var(--bg-card)",
              border: `1px solid ${copiedCode ? "rgba(16, 185, 129, 0.3)" : "var(--border)"}`,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            title="Click to copy room code"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleCopyCode();
              }
            }}
          >
            <span
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: copiedCode ? "#10B981" : "var(--text-primary)",
                letterSpacing: "0.1em",
                transition: "color 0.2s ease",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              aria-label={`Room code: ${room.code}`}
            >
              {copiedCode ? "COPIED" : room.code}
            </span>
          </div>
        </div>

        {/* Right: QR + Timer + save status */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {isOwner && <SaveIndicator status={saveStatus} />}
          <CountdownTimer
            expiresAt={room.expires_at}
            onExpired={handleExpired}
          />
        </div>
      </header>


      {/* Content area: textarea for owner, rendered view for viewers.
          isOwner===null means localStorage check is in flight — render nothing
          to avoid a flash of the wrong UI. */}
      <div className="animate-slide-up delay-100" style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        {isOwner === null ? null : isOwner ? (
          <textarea
            ref={textareaRef}
            id="room-textarea"
            value={content}
            onChange={handleChange}
            placeholder={placeholder}
            aria-label="Shared room content"
            spellCheck
            style={{
              flex: 1,
              width: "100%",
              /* Fill remaining vertical space without overflowing viewport */
              height: "100%",
              minHeight: 0,
              padding: "24px",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.09)",
              borderRadius: 16,
              color: "var(--text-primary)",
              caretColor: "var(--text-primary)",
              resize: "none",
              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.4)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(255, 255, 255, 0.35)";
              e.target.style.background = "rgba(255, 255, 255, 0.05)";
              e.target.style.boxShadow = "inset 0 1px 2px rgba(0,0,0,0.4), 0 0 0 3px rgba(255,255,255,0.06)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(255, 255, 255, 0.09)";
              e.target.style.background = "rgba(255, 255, 255, 0.03)";
              e.target.style.boxShadow = "inset 0 1px 2px rgba(0,0,0,0.4)";
            }}
          />
        ) : (
          <ContentRenderer content={content} />
        )}
      </div>

      {/* Footer */}
      <footer
        className="animate-fade-in delay-200"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          marginTop: 10,
          paddingBottom: "max(8px, env(safe-area-inset-bottom, 8px))",
          flexWrap: "wrap",
        }}
      >
        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--text-muted)",
          }}
        >
          {content.length.toLocaleString()} chars
          {isOwner ? " · synced in real time" : " · view only"}
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
  );
}

// ── Save indicator ─────────────────────────────────────────────────────────
function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;

  const config: Record<SaveStatus, { text: string; color: string } | null> = {
    idle: null,
    saving: { text: "Saving…", color: "var(--text-muted)" },
    saved: { text: "Saved", color: "#22c55e" },
    error: { text: "Save failed", color: "#ef4444" },
  };

  const c = config[status];
  if (!c) return null;

  return (
    <span
      aria-live="polite"
      style={{
        fontSize: "0.75rem",
        color: c.color,
        display: "flex",
        alignItems: "center",
        gap: 4,
        transition: "color 0.3s ease",
      }}
    >
      {status === "saving" && (
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ animation: "spin 0.8s linear infinite" }}
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      )}
      {status === "saved" && (
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
      {c.text}
    </span>
  );
}
