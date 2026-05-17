import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { generateRoomCode, getRoomExpiryTimestamp } from "@/lib/utils";
import { randomUUID } from "crypto";

/**
 * POST /api/rooms
 * Creates a new room with a random 6-char code and a unique owner_token.
 * Retries up to 3 times on code collision.
 */
export async function POST() {
  const supabase = getSupabaseServerClient();

  let room = null;
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    const code = generateRoomCode();
    const expires_at = getRoomExpiryTimestamp();
    const owner_token = randomUUID();

    const { data, error } = await supabase
      .from("rooms")
      .insert({ code, content: "", expires_at, owner_token })
      .select()
      .single();

    if (!error && data) {
      room = data;
      break;
    }

    // If it's NOT a unique violation, bail immediately
    if (error && !error.message.includes("duplicate")) {
      console.error("[POST /api/rooms] Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to create room. Please try again." },
        { status: 500 }
      );
    }

    attempts++;
  }

  if (!room) {
    return NextResponse.json(
      { error: "Could not generate a unique room code. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ room }, { status: 201 });
}
