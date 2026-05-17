import TransitionLink from "@/components/TransitionLink";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 bg-[var(--bg-primary)]">
      <div
        className="glass-card animate-slide-up text-center"
        style={{ padding: "48px 40px", maxWidth: 420 }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            marginBottom: 8,
            letterSpacing: "-0.03em",
          }}
        >
          Room not found
        </h1>
        <p
          style={{
            color: "var(--text-secondary)",
            marginBottom: 32,
            lineHeight: 1.6,
          }}
        >
          That room doesn&apos;t exist or the code is incorrect.
          Double-check the code and try again.
        </p>
        <TransitionLink href="/" className="btn-primary" style={{ textDecoration: "none" }}>
          Back to home
        </TransitionLink>
      </div>
    </main>
  );
}
