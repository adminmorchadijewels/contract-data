/**
 * Vercel Edge Function — RAG feedback writer.
 *
 * Uses raw fetch against the Supabase REST API with the service-role key
 * instead of the supabase-js client, which can behave unexpectedly in
 * edge runtimes and may not attach the service-role credentials correctly.
 *
 * POST /api/feedback
 * Body: {
 *   type:         "positive" | "negative"
 *   question:     string
 *   sql:          string
 *   correctedSql?: string   — user correction (negative only)
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

// ── Raw REST insert — bypasses supabase-js client layer entirely ──────────────
async function restInsert(
  supabaseUrl: string,
  serviceKey: string,
  table: string,
  row: Record<string, unknown>,
): Promise<string | null> {
  const res = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": serviceKey,
      "Authorization": `Bearer ${serviceKey}`,
      "Prefer": "return=minimal",
    },
    body: JSON.stringify(row),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => String(res.status));
    return text;
  }
  return null; // null = success
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  // ── Auth: require a valid Supabase session ──────────────────────────────────
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

  const supabaseUrl = (process.env as Record<string, string | undefined>).VITE_SUPABASE_URL;
  const anonKey     = (process.env as Record<string, string | undefined>).VITE_SUPABASE_ANON_KEY;
  const serviceKey  = (process.env as Record<string, string | undefined>).SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return json({ error: "Server not configured. Set SUPABASE_SERVICE_ROLE_KEY in Vercel." }, 503);
  }

  if (anonKey) {
    const token = authHeader.slice(7);
    const authClient = createClient(supabaseUrl, anonKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data, error } = await authClient.auth.getUser(token);
    if (error || !data?.user) return json({ error: "Unauthorized" }, 401);
  }
  // ────────────────────────────────────────────────────────────────────────────

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
    const err = await restInsert(supabaseUrl, serviceKey, "approved_examples", {
      question: question.trim(),
      sql: sql.trim(),
      thumbs_up_count: 1,
    });
    if (err) return json({ error: err }, 500);

  } else if (type === "negative") {
    const err = await restInsert(supabaseUrl, serviceKey, "rejected_examples", {
      question: question.trim(),
      bad_sql: sql.trim(),
      corrected_sql: correctedSql?.trim() ?? null,
    });
    if (err) return json({ error: err }, 500);

    // If correction provided, also store as an approved example
    if (correctedSql?.trim()) {
      await restInsert(supabaseUrl, serviceKey, "approved_examples", {
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
