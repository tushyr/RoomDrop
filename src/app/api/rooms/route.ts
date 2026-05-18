import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { generateRoomCode, getRoomExpiryTimestamp } from "@/lib/utils";
import { randomUUID } from "crypto";

/**
 * POST /api/rooms
 * Creates a new room with a random 6-char code and a unique owner_token.
 * Body (optional): { content: string }  — seeds the room with initial text.
 * Retries up to 3 times on code collision.
 */
export async function POST(req: NextRequest) {
  const supabase = getSupabaseServerClient();

  // Parse optional initial content, code, and owner_token from body
  let initialContent = "";
  let clientCode: string | null = null;
  let clientOwnerToken: string | null = null;
  let clientExpiresAt: string | null = null;

  try {
    const body = await req.json();
    if (typeof body?.content === "string") {
      initialContent = body.content.slice(0, 50000);
    }
    if (typeof body?.code === "string" && body.code.length === 6) {
      clientCode = body.code;
    }
    if (typeof body?.owner_token === "string") {
      clientOwnerToken = body.owner_token;
    }
    if (typeof body?.expires_at === "string") {
      clientExpiresAt = body.expires_at;
    }
  } catch {
    // No body or non-JSON body — that's fine
  }

  let room = null;
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    // Use client values on first attempt if provided, otherwise generate
    const code = (attempts === 0 && clientCode) ? clientCode : generateRoomCode();
    const owner_token = (attempts === 0 && clientOwnerToken) ? clientOwnerToken : randomUUID();
    const expires_at = (attempts === 0 && clientExpiresAt) ? clientExpiresAt : getRoomExpiryTimestamp();

    const { data, error } = await supabase
      .from("rooms")
      .insert({ code, content: initialContent, expires_at, owner_token })
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
