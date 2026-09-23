import type { Metadata, Viewport } from "next";
import { Gaegu, JetBrains_Mono } from "next/font/google";
import TransitionOverlay from "@/components/TransitionOverlay";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import "./globals.css";

// Self-hosted via next/font — no external DNS lookup, no render-blocking request
const gaegu = Gaegu({
  weight: "700",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-brand",
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  weight: "500",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  preload: false, // only used in room pages, not critical path
});

export const metadata: Metadata = {
  title: "RoomDrop — Instant Ephemeral Text Sharing",
  description: "Paste your text, get a shareable code. No sign-ups. Rooms vanish in one hour.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  interactiveWidget: "resizes-content",
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${gaegu.variable} ${jetbrainsMono.variable}`}>
      <head>
        {/* Preconnect to Supabase so realtime & API calls start faster */}
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""} />
      </head>
      <body className="bg-[var(--bg)] text-[var(--text)] antialiased">
        <ServiceWorkerRegistrar />
        <TransitionOverlay />
        {children}
      </body>
    </html>
  );
}
