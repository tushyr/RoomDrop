// Room expiry: 1 hour
export const ROOM_EXPIRY_MS = 60 * 60 * 1000;

// Room code: 6 uppercase alphanumeric chars
// Removes ambiguous chars: 0 (zero), O, 1, I, L
export const ROOM_CODE_LENGTH = 6;
export const ROOM_CODE_CHARSET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

// How long to debounce DB saves (ms)
export const SAVE_DEBOUNCE_MS = 1000;

// Broadcast event name
export const BROADCAST_EVENT = "content-update";
