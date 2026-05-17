import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client.
 * Used in API routes only — never imported by client components.
 * Uses the same anon key with RLS enforced.
 */
export function getSupabaseServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
