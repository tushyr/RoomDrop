import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Compiler optimizations ──────────────────────────────────────────────
  reactStrictMode: true,

  // ── Disable X-Powered-By header ────────────────────────────────────────
  poweredByHeader: false,

  // ── Security & performance HTTP headers ────────────────────────────────
  async headers() {
    return [
      {
        // Cache Next.js static chunks aggressively (content-hashed, immutable)
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Service worker — must always be fresh, never cached
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
      {
        // Security headers on all routes
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
