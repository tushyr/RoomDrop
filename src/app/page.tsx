import DropBox from "@/components/DropBox";
import JoinRoomForm from "@/components/JoinRoomForm";
import Header from "@/components/Header";

export default function HomePage() {
  return (
    <div className="h-dvh max-h-dvh w-full overflow-hidden flex flex-col bg-[var(--bg)]">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-5 pb-6 min-h-0">
        <div className="w-full max-w-md flex flex-col gap-5">

          {/* Title */}
          <div className="text-center animate-fade-in">
            <h1 className="font-brand text-6xl sm:text-7xl font-bold text-white leading-none">
              RoomDrop
            </h1>
            <p className="mt-2 text-sm text-[var(--text-sub)]">
              Drop text. Share the code. Gone in an hour.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 animate-fade-in delay-100">
            <DropBox />
            <JoinRoomForm />
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-[var(--text-muted)] animate-fade-in delay-150 select-none">
            Free · No sign-up · Ephemeral
          </p>
        </div>
      </main>
    </div>
  );
}
