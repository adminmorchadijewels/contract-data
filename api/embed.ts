/**
 * Vercel Edge Function — OpenAI embedding proxy.
 *
 * Keeps OPENAI_API_KEY server-side so it is never exposed to the browser.
 * Used by ragSqlService.ts to embed NL questions before similarity search
 * and before storing approved/rejected feedback pairs.
 *
 * POST /api/embed
 * Body:     { text: string }
 * Response: { embedding: number[] }  — 1536-dim vector (text-embedding-3-small)
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck — Supabase createClient generic inference causes false positives in edge function context

import { createClient } from "@supabase/supabase-js";

export const config = { runtime: "edge" };

const MAX_TEXT_LENGTH = 8_000; // text-embedding-3-small supports ~8191 tokens; 8000 chars is safe

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

  const supabaseUrl = (process.env as Record<string, string | undefined>).VITE_SUPABASE_URL;
  const anonKey    = (process.env as Record<string, string | undefined>).VITE_SUPABASE_ANON_KEY;
  if (supabaseUrl && anonKey) {
    const token = authHeader.slice(7);
    const client = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data, error } = await client.auth.getUser(token);
    if (error || !data?.user) return json({ error: "Unauthorized" }, 401);
  }
  // ────────────────────────────────────────────────────────────────────────────

  const apiKey = (process.env as Record<string, string | undefined>).OPENAI_API_KEY;
  if (!apiKey) {
    return json(
      { error: "Embedding service is not configured on this server. Set OPENAI_API_KEY in Vercel environment variables." },
      503,
    );
  }

  let body: { text?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const text = body.text?.trim();
  if (!text) return json({ error: "text is required" }, 400);
  if (text.length > MAX_TEXT_LENGTH) {
    return json({ error: `Text too long (max ${MAX_TEXT_LENGTH} characters)` }, 400);
  }

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text,
      }),
    });

    if (!openaiRes.ok) {
      if (openaiRes.status === 401) return json({ error: "Invalid OpenAI API key on server." }, 502);
      if (openaiRes.status === 429) return json({ error: "Rate limit exceeded. Please try again shortly." }, 429);
      const errBody = await openaiRes.json().catch(() => ({})) as { error?: { message?: string } };
      return json({ error: errBody?.error?.message ?? "OpenAI embedding request failed." }, 502);
    }

    const data = await openaiRes.json() as { data: [{ embedding: number[] }] };
    const embedding = data.data?.[0]?.embedding;

    if (!embedding || embedding.length !== 1536) {
      return json({ error: "Unexpected embedding shape from OpenAI." }, 502);
    }

    return json({ embedding });
  } catch {
    return json({ error: "Failed to reach embedding service. Check your connection." }, 500);
  }
}
