/**
 * Vercel Edge Function — RAG feedback writer.
 *
 * Routes feedback through the server so the service-role key handles the
 * insert, bypassing the client-side RLS/auth issue where the Supabase JS
 * client sends requests as `anon` instead of `authenticated`.
 *
 * POST /api/feedback
 * Body: {
 *   type:         "positive" | "negative"
 *   question:     string
 *   sql:          string          — generated SQL (or corrected SQL for positive)
 *   correctedSql?: string         — user correction (negative only)
 * }
 * Response: { ok: true } | { error: string }
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { createClient } from "@supabase/supabase-js";

export const config = { runtime: "edge" };

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  // ── Auth: require a valid Supabase session ──────────────────────────────────
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

  const supabaseUrl  = (process.env as Record<string, string | undefined>).VITE_SUPABASE_URL;
  const anonKey      = (process.env as Record<string, string | undefined>).VITE_SUPABASE_ANON_KEY;
  const serviceKey   = (process.env as Record<string, string | undefined>).SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) return json({ error: "Server not configured." }, 503);

  if (anonKey) {
    const token = authHeader.slice(7);
    const authClient = createClient(supabaseUrl, anonKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data, error } = await authClient.auth.getUser(token);
    if (error || !data?.user) return json({ error: "Unauthorized" }, 401);
  }
  // ────────────────────────────────────────────────────────────────────────────

  // Use service role — bypasses RLS so the insert always succeeds for auth'd users
  const admin = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

  let body: { type?: string; question?: string; sql?: string; correctedSql?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const { type, question, sql, correctedSql } = body;
  if (!type || !question?.trim() || !sql?.trim()) {
    return json({ error: "type, question, and sql are required" }, 400);
  }

  if (type === "positive") {
    const { error } = await admin.from("approved_examples").insert({
      question: question.trim(),
      sql: sql.trim(),
      thumbs_up_count: 1,
    });
    if (error) return json({ error: error.message }, 500);

  } else if (type === "negative") {
    const { error } = await admin.from("rejected_examples").insert({
      question: question.trim(),
      bad_sql: sql.trim(),
      corrected_sql: correctedSql?.trim() ?? null,
    });
    if (error) return json({ error: error.message }, 500);

    // If correction provided, also store as an approved example
    if (correctedSql?.trim()) {
      await admin.from("approved_examples").insert({
        question: question.trim(),
        sql: correctedSql.trim(),
        thumbs_up_count: 1,
      });
    }

  } else {
    return json({ error: 'type must be "positive" or "negative"' }, 400);
  }

  return json({ ok: true });
}
