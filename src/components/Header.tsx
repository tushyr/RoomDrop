"use client";

import { useState } from "react";

export default function Header() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <header className="w-full px-5 py-3 sm:px-6 sm:py-4 flex items-center justify-end max-w-6xl mx-auto flex-shrink-0 select-none">
        {/* Minimalist Info Icon */}
        <button
          type="button"
          onClick={() => setShowInfo(true)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all cursor-pointer shadow-xs active:scale-95"
          title="About RoomDrop"
          aria-label="About RoomDrop"
        >
          <svg
            width="15"
            height="15"
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
      </header>

      {/* Clean, Human-Crafted Minimal Guide Modal */}
      {showInfo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in"
          onClick={() => setShowInfo(false)}
        >
          <div
            className="cozy-card max-w-sm w-full p-7 text-left animate-slide-up relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Button */}
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

            {/* Header */}
            <div className="mb-5">
              <h3 className="font-hand text-3xl font-bold text-[var(--text-primary)] leading-none mb-1.5">
                How RoomDrop works
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-ui leading-relaxed">
                Ephemeral, zero-friction text sharing between any device.
              </p>
            </div>

            {/* 3-Step Flow (Clean typography, no emojis, no nested cards) */}
            <div className="space-y-4 mb-6 font-ui">
              <div className="flex items-start gap-3.5">
                <span className="font-mono text-xs font-bold text-[var(--accent-yellow)] bg-[rgba(245,158,11,0.12)] px-2 py-0.5 rounded border border-[rgba(245,158,11,0.25)] flex-shrink-0 mt-0.5">
                  01
                </span>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)] mb-0.5">Drop</h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Paste text, code snippets, or links to generate a unique room code.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="font-mono text-xs font-bold text-[var(--accent-green)] bg-[rgba(74,222,128,0.1)] px-2 py-0.5 rounded border border-[rgba(74,222,128,0.2)] flex-shrink-0 mt-0.5">
                  02
                </span>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)] mb-0.5">Sync</h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Share the 6-character code. Edits broadcast live across all screens.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="font-mono text-xs font-bold text-[var(--accent-rose)] bg-[rgba(248,113,113,0.1)] px-2 py-0.5 rounded border border-[rgba(248,113,113,0.2)] flex-shrink-0 mt-0.5">
                  03
                </span>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)] mb-0.5">Vanish</h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Rooms automatically delete after 1 hour. No sign-ups, no tracking.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="button"
              onClick={() => setShowInfo(false)}
              className="btn-butter w-full justify-center py-2.5 text-sm font-bold cursor-pointer"
            >
              Got it
            </button>

            {/* Corner Fold */}
            <div className="dog-ear-corner" aria-hidden="true" />
          </div>
        </div>
      )}
    </>
  );
}
