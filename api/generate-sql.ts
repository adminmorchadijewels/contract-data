/**
 * Vercel Edge Function — OpenAI SQL generation proxy.
 *
 * Keeps the OPENAI_API_KEY server-side so it is never exposed to the browser.
 * Set the environment variable in Vercel → Project Settings → Environment Variables.
 *
 * POST /api/generate-sql
 * Body: {
 *   userQuery:    string                  — natural language question
 *   examples?:    ApprovedExample[]       — similar approved pairs from RAG retrieval
 *   errorContext?: string                 — SQL error from previous attempt (self-healing retry)
 * }
 * Response: { sql: string, explanation: string } | { error: string }
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck — Supabase createClient generic inference causes false positives in edge function context
import { createClient } from "@supabase/supabase-js";

export const config = { runtime: "edge" };

// ── Static schema definition (mirrors sqlEngine.ts TABLE_COLUMNS) ─────────────
const TABLE_COLUMNS: Record<string, string[]> = {
  companies: ["id", "name", "type", "code", "atoll_id", "address", "registration_no", "coordinates", "created_at"],
  atolls: ["id", "name", "created_at"],
  contracts: ["id", "contract_id", "sub_contract_id", "contract_code", "group_id", "resort_id", "sub_contract_type", "status", "start_date", "end_date", "created_at"],
  pricing_standard: ["id", "sub_contract_id", "season_type", "season_name", "route", "weekdays", "start_date", "end_date", "created_at"],
  pricing_special: ["id", "sub_contract_id", "request_type", "discount_type", "return_fare_usd", "one_way_fare_usd", "pax_condition", "start_date", "end_date", "created_at"],
  contract_baggage: ["id", "sub_contract_id", "baggage_allowance_kg", "excess_charge_usd", "notes", "created_at"],
  contract_booking: ["id", "sub_contract_id", "booking_lead_time_days", "cancellation_policy", "amendment_policy", "notes", "created_at"],
  contract_age: ["id", "sub_contract_id", "infant_age_max", "child_age_max", "junior_age_max", "youth_age_max", "notes", "created_at"],
  contract_addons: ["id", "sub_contract_id", "addon_type", "description", "price_usd", "currency", "notes", "created_at"],
  contract_insurance: ["id", "sub_contract_id", "insurance_required", "provider", "coverage_details", "notes", "created_at"],
  contract_government_charges: ["id", "sub_contract_id", "charge_type", "amount", "currency", "applicable_to", "notes", "created_at"],
  contract_fuel: ["id", "sub_contract_id", "fuel_surcharge_type", "value", "currency", "notes", "created_at"],
  contract_payment_plan: ["id", "sub_contract_id", "payment_terms", "deposit_percentage", "balance_due_days", "notes", "created_at"],
  contract_service_commitment: ["id", "sub_contract_id", "commitment_type", "minimum_seats", "notes", "created_at"],
  contract_termination: ["id", "sub_contract_id", "termination_notice_days", "termination_conditions", "notes", "created_at"],
  contract_notes: ["id", "sub_contract_id", "note_type", "content", "created_at"],
};

function buildSchema(): string {
  return Object.entries(TABLE_COLUMNS)
    .map(([table, cols]) => `Table: ${table}\n  Columns: ${cols.join(", ")}`)
    .join("\n\n");
}

// ── Format approved examples for injection into the user message ──────────────
interface ApprovedExample {
  question: string;
  sql: string;
  thumbs_up_count: number;
  similarity: number;
}

function buildExamplesSection(examples: ApprovedExample[]): string {
  if (examples.length === 0) return "";
  const formatted = examples
    .map((ex, i) =>
      `Example ${i + 1} (approved ${ex.thumbs_up_count}×, similarity ${(ex.similarity * 100).toFixed(0)}%):\n` +
      `  Question: ${ex.question}\n` +
      `  SQL:\n${ex.sql.split("\n").map(l => `    ${l}`).join("\n")}`,
    )
    .join("\n\n");
  return `## Approved examples from previous queries\nUse these as reference for style and table/column choices:\n\n${formatted}`;
}

const SYSTEM_PROMPT = `You are a SQL query generator for a contract management system (Trans Maldivian Airways). The database runs entirely in the browser using a custom SQL engine.

## Supported SQL syntax
- SELECT * | col1, col2, COUNT(*), COUNT(col)
- FROM table_name [alias]
- JOIN table2 [alias] ON table1.col = table2.col
- WHERE conditions (AND, OR, =, !=, <>, <, >, <=, >=, LIKE, IN, NOT IN, IS NULL, IS NOT NULL, BETWEEN)
- GROUP BY col1, col2
- ORDER BY col [ASC|DESC]
- LIMIT n

## Important constraints
- Only SELECT queries are supported (no INSERT, UPDATE, DELETE, CREATE).
- Table and column names are lowercase with underscores.
- String values must be in single quotes.
- Dates are stored as strings in 'YYYY-MM-DD' format.
- The engine does NOT support subqueries, HAVING, UNION, DISTINCT, SUM, AVG, MIN, MAX. Only COUNT(*) and COUNT(col) are available as aggregate functions.
- When joining, always use aliases (e.g., FROM contracts c JOIN companies r ON c.resort_id = r.id).

## Database schema
${buildSchema()}

## Key relationships
- contracts.resort_id → companies.id (resort)
- contracts.group_id → companies.id (group)
- pricing_standard.sub_contract_id → contracts.sub_contract_id
- pricing_special.sub_contract_id → contracts.sub_contract_id
- contract_* tables link via sub_contract_id to contracts
- companies.type can be 'Resort', 'Group', or 'Carrier'

## Response format
Respond ONLY with valid JSON (no markdown fences, no extra text):
{"sql": "THE SQL QUERY HERE", "explanation": "Brief explanation of what the query does"}`;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const MAX_QUERY_LENGTH = 2000;

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  // ── Auth: require a valid Supabase session ────────────────────────────────
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

  const supabaseUrl = (process.env as Record<string, string | undefined>).VITE_SUPABASE_URL;
  const anonKey    = (process.env as Record<string, string | undefined>).VITE_SUPABASE_ANON_KEY;
  if (supabaseUrl && anonKey) {
    const token = authHeader.slice(7);
    const client = createClient(supabaseUrl, anonKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data, error } = await client.auth.getUser(token);
    if (error || !data?.user) return json({ error: "Unauthorized" }, 401);
  }
  // ─────────────────────────────────────────────────────────────────────────

  const apiKey = (process.env as Record<string, string | undefined>).OPENAI_API_KEY;
  if (!apiKey) {
    return json({ error: "AI query generation is not configured on this server. Set OPENAI_API_KEY in Vercel environment variables." }, 503);
  }

  let body: { userQuery?: string; examples?: ApprovedExample[]; errorContext?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const userQuery = body.userQuery?.trim();
  if (!userQuery) return json({ error: "userQuery is required" }, 400);
  if (userQuery.length > MAX_QUERY_LENGTH) {
    return json({ error: `Query too long (max ${MAX_QUERY_LENGTH} characters)` }, 400);
  }

  const examples  = Array.isArray(body.examples) ? body.examples : [];
  const errorContext = body.errorContext?.trim() ?? null;

  // ── Build user message — inject examples and/or error context ────────────
  const parts: string[] = [];

  const examplesSection = buildExamplesSection(examples);
  if (examplesSection) parts.push(examplesSection);

  if (errorContext) {
    parts.push(
      `## Previous attempt failed\nThe SQL below was generated for this question but produced an error. Fix it.\n\nError: ${errorContext}`,
    );
  }

  parts.push(`## Question\n${userQuery}`);

  const userMessage = parts.join("\n\n");
  // ─────────────────────────────────────────────────────────────────────────

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0,
        max_tokens: 1024,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user",   content: userMessage },
        ],
      }),
    });

    if (!openaiRes.ok) {
      if (openaiRes.status === 401) return json({ error: "Invalid OpenAI API key on server." }, 502);
      if (openaiRes.status === 429) return json({ error: "Rate limit exceeded. Please try again shortly." }, 429);
      const errBody = await openaiRes.json().catch(() => ({})) as { error?: { message?: string } };
      return json({ error: errBody?.error?.message ?? "OpenAI request failed." }, 502);
    }

    const data = await openaiRes.json() as { choices: Array<{ message: { content: string } }> };
    const content = data.choices?.[0]?.message?.content?.trim() ?? "";
    const cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(cleaned) as { sql?: string; explanation?: string };

    return json({ sql: parsed.sql ?? "", explanation: parsed.explanation ?? "" });
  } catch (err) {
    if (err instanceof SyntaxError) return json({ error: "Failed to parse AI response. Please try rephrasing." }, 502);
    return json({ error: "Unexpected error contacting AI service." }, 500);
  }
}
