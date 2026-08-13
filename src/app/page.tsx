import Header from "@/components/Header";
import DropBox from "@/components/DropBox";
import JoinRoomForm from "@/components/JoinRoomForm";
import { HeroDoodle, PlantDoodle, TeaMugDoodle } from "@/components/DoodleDecorations";

export default function HomePage() {
  return (
    <div className="h-dvh max-h-dvh w-full overflow-hidden flex flex-col justify-between bg-[var(--bg-primary)] relative select-none">
      {/* Top Header with info button */}
      <Header />

      {/* Main Hero & Content Area - Lifted higher for balanced spacing */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-0 -mt-3 sm:-mt-6 relative z-10 w-full max-w-lg mx-auto min-h-0">
        {/* Interactive Hero Doodle: Cloud, Stars, Flight Trail, Origami Paper Airplane */}
        <div className="animate-fade-in -mb-1">
          <HeroDoodle />
        </div>

        {/* Brand Title (Interactive with playful spring bounce) */}
        <div className="text-center mb-3.5 sm:mb-4 animate-fade-in delay-100">
          <h1 className="font-hand text-5xl sm:text-6xl font-bold text-[var(--accent-green-dark)] tracking-tight select-none leading-none interactive-title">
            RoomDrop
          </h1>
        </div>

        {/* Central Action Stack: Drop Box + Join Section */}
        <div className="w-full flex flex-col items-center animate-slide-up delay-200">
          {/* Drop Box (Textarea + Drop It Button) */}
          <section aria-label="Drop text and create room" className="w-full">
            <DropBox />
          </section>

          {/* Join Room Form */}
          <section aria-label="Join an existing room" className="w-full">
            <JoinRoomForm />
          </section>
        </div>

        {/* Center Footer Bar */}
        <footer className="mt-4 mb-2 flex items-center justify-center gap-1.5 text-xs text-[var(--text-muted)] font-medium select-none animate-fade-in delay-300 font-ui">
          {/* Lock Icon */}
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[var(--text-muted)]"
          >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>Free &amp; open. End-to-end ephemeral.</span>
          {/* Cute Pink Outline Heart */}
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent-rose)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="inline-block transform hover:scale-125 transition-transform"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </footer>
      </main>

      {/* Decorative Bottom Corner Doodles */}
      <div className="absolute bottom-0 left-2 sm:left-6 z-0 hidden xs:block sm:block">
        <PlantDoodle />
      </div>

      <div className="absolute bottom-0 right-2 sm:right-6 z-0 hidden xs:block sm:block">
        <TeaMugDoodle />
      </div>
    </div>
  );
}
