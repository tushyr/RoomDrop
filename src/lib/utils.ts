import {
  ROOM_CODE_CHARSET,
  ROOM_CODE_LENGTH,
  ROOM_EXPIRY_MS,
} from "./constants";

/**
 * Generates a random room code from the safe charset.
 * Example output: "K7P2X9"
 */
export function generateRoomCode(): string {
  let code = "";
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += ROOM_CODE_CHARSET.charAt(
      Math.floor(Math.random() * ROOM_CODE_CHARSET.length)
    );
  }
  return code;
}

/**
 * Validates that a room code matches the expected format.
 */
export function isValidRoomCode(code: string): boolean {
  if (!code || code.length !== ROOM_CODE_LENGTH) return false;
  // Allow uppercase letters and digits
  return /^[A-Z0-9]{6}$/.test(code);
}

/**
 * Returns true if the room has expired.
 */
export function isRoomExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() < Date.now();
}

/**
 * Returns the ISO timestamp for 1 hour from now.
 */
export function getRoomExpiryTimestamp(): string {
  return new Date(Date.now() + ROOM_EXPIRY_MS).toISOString();
}

/**
 * Formats milliseconds into MM:SS display string.
 */
export function formatTimeRemaining(ms: number): {
  display: string;
  isUrgent: boolean;
} {
  if (ms <= 0) return { display: "00:00", isUrgent: true };

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, "0");

  const display =
    hours > 0
      ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(minutes)}:${pad(seconds)}`;

  const isUrgent = ms < 5 * 60 * 1000; // < 5 minutes

  return { display, isUrgent };
}

/**
 * Generates a random ephemeral ID for the current user session.
 * Used to avoid echoing broadcast messages back to the sender.
 */
export function generateSenderId(): string {
  return Math.random().toString(36).slice(2, 10);
}
