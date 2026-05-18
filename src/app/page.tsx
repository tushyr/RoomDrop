import DropBox from "@/components/DropBox";
import JoinRoomForm from "@/components/JoinRoomForm";
import InstallAppButton from "@/components/InstallAppButton";

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-2 sm:py-8 bg-[var(--bg-primary)]">

      <div className="relative z-10 w-full max-w-lg">
        {/* Brand */}
        <div className="mb-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-2 gradient-text animate-fade-in">
            RoomDrop
          </h1>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed max-w-[320px] mx-auto animate-fade-in delay-100">
            Paste your text, get a shareable code. No sign-ups. Rooms vanish in one hour.
          </p>
        </div>

        {/* Action Card */}
        <div className="glass-card p-4 sm:p-8 animate-slide-up delay-200">
          {/* Drop Box — write/paste then create */}
          <section aria-label="Create a new room">
            <DropBox />
          </section>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="h-px flex-1 bg-[var(--border)]" />
            <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">or join</span>
            <div className="h-px flex-1 bg-[var(--border)]" />
          </div>

          {/* Join Room */}
          <section aria-label="Join an existing room">
            <JoinRoomForm />
          </section>
        </div>

        {/* Footer */}
        <div className="animate-fade-in delay-300 mt-5 flex flex-col items-center gap-2">
          <InstallAppButton />
          <p className="text-center text-[11px] text-[var(--text-muted)]">
            Free & Open. End-to-end ephemeral.
          </p>
        </div>
      </div>
    </main>
  );
}
