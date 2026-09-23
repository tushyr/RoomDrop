import { notFound } from "next/navigation";
import { isValidRoomCode } from "@/lib/utils";
import RoomLoader from "@/components/RoomLoader";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `Room ${code.toUpperCase()} | RoomDrop`,
  };
}

export default async function RoomPage({ params }: Props) {
  const { code } = await params;
  const upperCode = code.toUpperCase();

  // Reject clearly invalid codes immediately (no DB call needed)
  if (!isValidRoomCode(upperCode)) {
    notFound();
  }

  // RoomLoader handles everything client-side:
  // - Fast path: reads room from sessionStorage (fresh create, zero extra DB calls)
  // - Slow path: fetches via GET /api/rooms/[code] (direct URL access / join by code)
  return <RoomLoader code={upperCode} />;
}
