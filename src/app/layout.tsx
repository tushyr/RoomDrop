import type { Metadata, Viewport } from "next";
import TransitionOverlay from "@/components/TransitionOverlay";
import "./globals.css";

export const metadata: Metadata = {
  title: "RoomDrop",
  description:
    "Create a private temporary room and share text in real time. No accounts. No clutter. Rooms expire after 1 hour.",
  keywords: ["realtime", "text share", "collaboration", "temporary room"],
  openGraph: {
    title: "RoomDrop",
    description: "Instant real-time text sharing. No accounts. Rooms expire in 1 hour.",
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
  themeColor: "#0a0a0b",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <TransitionOverlay />
        {children}
      </body>
    </html>
  );
}
