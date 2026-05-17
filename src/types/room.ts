export interface Room {
  id: string;
  code: string;
  content: string;
  created_at: string;
  expires_at: string;
}

export interface RoomBroadcastPayload {
  content: string;
  sender_id: string;
}
