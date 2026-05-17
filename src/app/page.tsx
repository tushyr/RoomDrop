import CreateRoomButton from "@/components/CreateRoomButton";
import JoinRoomForm from "@/components/JoinRoomForm";
import InstallAppButton from "@/components/InstallAppButton";

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-8 sm:py-16 bg-[var(--bg-primary)]">
      
      {/* Super subtle background mesh/grid could go here, but keeping it empty for maximum minimalism */}

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-3 gradient-text animate-fade-in">
            RoomDrop
          </h1>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed max-w-[280px] mx-auto animate-fade-in delay-100">
            Instant, ephemeral text sharing. No sign-ups. Rooms vanish in one hour.
          </p>
        </div>

        {/* Action Card */}
        <div className="glass-card p-6 sm:p-8 animate-slide-up delay-200">
          {/* Create Room */}
          <section>
            <CreateRoomButton />
          </section>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-[var(--border)]" />
            <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">or join</span>
            <div className="h-px flex-1 bg-[var(--border)]" />
          </div>

          {/* Join Room */}
          <section>
            <JoinRoomForm />
          </section>
        </div>

        {/* Footer */}
        <div className="animate-slide-up delay-200 mt-8 flex flex-col items-center gap-3">
          <InstallAppButton />
          <p className="text-center text-xs text-[var(--text-muted)]">
            Free & Open. End-to-end ephemeral.
          </p>
        </div>
      </div>
    </main>
  );
}
