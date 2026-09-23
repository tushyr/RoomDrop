export interface Room {
  id: string;
  code: string;
  content: string;
  created_at: string;
  expires_at: string;
  owner_token: string | null;
}

export interface RoomBroadcastPayload {
  content: string;
  sender_id: string;
}
