"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Captures the browser's `beforeinstallprompt` event and renders
 * an "Install App" button when the app is installable.
 *
 * Works on:
 *  - Chrome / Edge / Opera (desktop + Android): full prompt support
 *  - Safari (iOS): shows a manual instruction since Safari doesn't fire the event
 *  - Firefox: shows manual instruction
 *
 * Once installed (or dismissed), the button hides.
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);
  const promptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if already installed as PWA
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    ) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      const prompt = e as BeforeInstallPromptEvent;
      promptRef.current = prompt;
      setDeferredPrompt(prompt);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Listen for successful install
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      promptRef.current = null;
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    const prompt = promptRef.current;
    if (!prompt) return;

    setInstalling(true);
    try {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;

      if (outcome === "accepted") {
        setIsInstalled(true);
      }
    } catch {
      // User dismissed or error
    } finally {
      setDeferredPrompt(null);
      promptRef.current = null;
      setInstalling(false);
    }
  }, []);

  // Detect iOS Safari
  const isIOS =
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream;

  // Already installed — don't render
  if (isInstalled) return null;

  // iOS Safari — show manual guide
  if (isIOS && !deferredPrompt) {
    return (
      <>
        <button
          id="install-app-btn"
          className="btn-secondary"
          onClick={() => setShowIOSGuide(!showIOSGuide)}
          style={{
            fontSize: "0.8125rem",
            padding: "8px 14px",
            gap: 6,
          }}
          aria-label="Install RoomDrop as an app"
        >
          <DownloadIcon />
          Install App
        </button>

        {showIOSGuide && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(8px)",
              padding: "16px",
            }}
            onClick={() => setShowIOSGuide(false)}
          >
            <div
              className="glass-card animate-slide-up"
              onClick={(e) => e.stopPropagation()}
              style={{
                padding: "28px 24px",
                maxWidth: 360,
                width: "100%",
                textAlign: "center",
                marginBottom: 24,
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 12 }}>📲</div>
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  marginBottom: 8,
                  letterSpacing: "-0.02em",
                }}
              >
                Install RoomDrop
              </h3>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                  marginBottom: 20,
                }}
              >
                Tap the{" "}
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <ShareIcon /> Share
                </span>{" "}
                button in Safari, then tap{" "}
                <strong style={{ color: "var(--text-primary)" }}>
                  &quot;Add to Home Screen&quot;
                </strong>
              </p>
              <button
                className="btn-secondary"
                onClick={() => setShowIOSGuide(false)}
                style={{ width: "100%", justifyContent: "center" }}
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Chromium browsers — native install prompt available
  if (deferredPrompt) {
    return (
      <button
        id="install-app-btn"
        className="btn-secondary"
        onClick={handleInstall}
        disabled={installing}
        aria-label="Install RoomDrop as an app"
        style={{
          fontSize: "0.8125rem",
          padding: "8px 14px",
          gap: 6,
        }}
      >
        {installing ? (
          <>
            <SpinnerIcon />
            Installing…
          </>
        ) : (
          <>
            <DownloadIcon />
            Install App
          </>
        )}
      </button>
    );
  }

  // No install prompt available (Firefox, etc.) — don't show button
  return null;
}

// ── Icons ──────────────────────────────────────────────────────────────────────

function DownloadIcon() {
  return (
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
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ verticalAlign: "middle" }}
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      style={{ animation: "spin 0.8s linear infinite" }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
