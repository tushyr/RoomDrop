"use client";

import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="w-full max-w-md mx-auto px-5 pt-4 pb-1 flex justify-end select-none">
        <button
          onClick={() => setOpen(true)}
          className="w-7 h-7 flex items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-sub)] hover:border-[var(--border-focus)] transition-colors cursor-pointer"
          aria-label="How RoomDrop works"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
        </button>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-brand text-3xl font-bold text-white mb-5">How it works</h3>

            <div className="space-y-4 text-sm">
              <div className="flex gap-3">
                <span className="text-[var(--text-muted)] font-mono text-xs mt-0.5 select-none">01</span>
                <div>
                  <span className="text-white font-medium">Drop</span>
                  <span className="text-[var(--text-sub)]"> — paste text, code, or links and hit Drop It.</span>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-[var(--text-muted)] font-mono text-xs mt-0.5 select-none">02</span>
                <div>
                  <span className="text-white font-medium">Share</span>
                  <span className="text-[var(--text-sub)]"> — send the 6-character code to anyone.</span>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-[var(--text-muted)] font-mono text-xs mt-0.5 select-none">03</span>
                <div>
                  <span className="text-white font-medium">Gone</span>
                  <span className="text-[var(--text-sub)]"> — room auto-deletes after 1 hour.</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="mt-6 w-full py-2.5 rounded-xl bg-[var(--border-focus)] text-white text-sm font-medium hover:bg-[#484848] transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
