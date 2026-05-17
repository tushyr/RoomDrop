import { createClient } from "@supabase/supabase-js";

/**
 * Browser-side Supabase client.
 * Uses NEXT_PUBLIC_ env vars so it's safe to expose to the client.
 * Realtime subscriptions must use this client.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Singleton to avoid creating multiple clients on re-renders
let client: ReturnType<typeof createClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }
  return client;
}
