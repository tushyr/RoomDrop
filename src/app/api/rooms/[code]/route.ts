import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isValidRoomCode, isRoomExpired } from "@/lib/utils";

interface Params {
  params: Promise<{ code: string }>;
}

/**
 * GET /api/rooms/[code]
 * Fetches a room by its code.
 * Returns 400 for invalid code format.
 * Returns 404 for unknown room.
 * Returns 410 for expired rooms.
 */
export async function GET(_req: NextRequest, { params }: Params) {
  const { code } = await params;
  const upperCode = code.toUpperCase();

  if (!isValidRoomCode(upperCode)) {
    return NextResponse.json(
      { error: "Invalid room code format." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseServerClient();

  const { data: room, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("code", upperCode)
    .single();

  if (error || !room) {
    return NextResponse.json({ error: "Room not found." }, { status: 404 });
  }

  if (isRoomExpired(room.expires_at)) {
    return NextResponse.json({ error: "Room has expired.", expired: true }, { status: 410 });
  }

  return NextResponse.json({ room });
}

/**
 * PATCH /api/rooms/[code]
 * Updates the content of a room.
 * Body: { content: string }
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  const { code } = await params;
  const upperCode = code.toUpperCase();

  if (!isValidRoomCode(upperCode)) {
    return NextResponse.json(
      { error: "Invalid room code format." },
      { status: 400 }
    );
  }

  let body: { content?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (typeof body.content !== "string") {
    return NextResponse.json({ error: "Content must be a string." }, { status: 400 });
  }

  // Limit content to 50,000 characters
  if (body.content.length > 50000) {
    return NextResponse.json(
      { error: "Content exceeds maximum length of 50,000 characters." },
      { status: 413 }
    );
  }

  const supabase = getSupabaseServerClient();

  // Only update non-expired rooms (RLS also enforces this)
  const { data: room, error } = await supabase
    .from("rooms")
    .update({ content: body.content })
    .eq("code", upperCode)
    .gt("expires_at", new Date().toISOString())
    .select()
    .single();

  if (error || !room) {
    return NextResponse.json(
      { error: "Room not found or has expired." },
      { status: 404 }
    );
  }

  return NextResponse.json({ room });
}
