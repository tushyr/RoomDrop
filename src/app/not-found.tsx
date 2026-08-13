import TransitionLink from "@/components/TransitionLink";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 bg-[var(--bg-primary)] select-none">
      <div className="cozy-card animate-slide-up text-center p-8 max-w-sm w-full relative">
        <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-2xl bg-[var(--border-card)] text-[var(--accent-yellow)]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h1 className="font-hand text-3xl font-bold text-[var(--text-primary)] mb-1.5">
          Page not found
        </h1>
        <p className="text-xs text-[var(--text-secondary)] font-ui leading-relaxed mb-6">
          That page doesn&apos;t exist or the code is incorrect. Double-check and try again.
        </p>
        <TransitionLink href="/" className="btn-butter no-underline w-full justify-center">
          Back to home
        </TransitionLink>

        <div className="dog-ear-corner" aria-hidden="true" />
      </div>
    </main>
  );
}
