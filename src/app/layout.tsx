import type { Metadata, Viewport } from "next";
import TransitionOverlay from "@/components/TransitionOverlay";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import "./globals.css";

export const metadata: Metadata = {
  title: "RoomDrop — Instant Ephemeral Text Sharing",
  description:
    "Paste your text, get a shareable code. No sign-ups. Rooms vanish in one hour.",
  keywords: ["realtime", "text share", "collaboration", "temporary room", "roomdrop"],
  openGraph: {
    title: "RoomDrop",
    description: "Paste your text, get a shareable code. No sign-ups. Rooms vanish in 1 hour.",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    other: [
      { rel: "apple-touch-icon", url: "/apple-touch-icon.png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  interactiveWidget: "resizes-content",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased min-h-dvh">
        <ServiceWorkerRegistrar />
        <TransitionOverlay />
        {children}
      </body>
    </html>
  );
}
