import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/** Only accounts from this domain may sign up or sign in. */
export const ALLOWED_DOMAIN = "transmaldivian.com";

/** Layer 1 — domain check (fast, no network call). */
export function isAllowedEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`);
}

/**
 * Layer 2 — allowlist check (queries Supabase `allowed_users` table).
 *
 * Returns true only if the exact email exists in the table.
 * Add rows via Supabase Dashboard → Table Editor → allowed_users.
 */
export async function isUserAllowed(email: string): Promise<boolean> {
  const { data } = await supabase
    .from("allowed_users")
    .select("email")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();
  return data !== null;
}
