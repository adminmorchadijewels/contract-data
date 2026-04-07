/**
 * OpenAI-powered natural-language → SQL generator.
 *
 * Sends the full database schema plus the user's plain-English question to
 * OpenAI and returns a validated SQL query that runs against the in-memory
 * SQL engine.
 */

import OpenAI from "openai";
import { getTableNames, getTableColumns } from "./sqlEngine";

// ── API key management (localStorage) ────────────────────────────────

const STORAGE_KEY = "tma_openai_api_key";

export function getOpenAIKey(): string {
  return localStorage.getItem(STORAGE_KEY) ?? "";
}

export function setOpenAIKey(key: string) {
  if (key.trim()) {
    localStorage.setItem(STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function hasOpenAIKey(): boolean {
  return !!getOpenAIKey();
}

// ── Schema builder ───────────────────────────────────────────────────

function buildSchemaDescription(): string {
  const tables = getTableNames();
  const parts: string[] = [];

  for (const table of tables) {
    const cols = getTableColumns(table);
    if (cols.length === 0) continue;
    parts.push(`Table: ${table}\n  Columns: ${cols.join(", ")}`);
  }

  return parts.join("\n\n");
}

// ── Main generation function ─────────────────────────────────────────

export interface OpenAISQLResult {
  sql: string;
  explanation: string;
  error?: string;
}

export async function generateSQLWithOpenAI(userQuery: string): Promise<OpenAISQLResult> {
  const apiKey = getOpenAIKey();
  if (!apiKey) {
    return { sql: "", explanation: "", error: "No OpenAI API key configured. Add your key in Settings." };
  }

  const schema = buildSchemaDescription();

  const systemPrompt = `You are a SQL query generator for a contract management system (Trans Maldivian Airways). The database runs entirely in the browser using a custom SQL engine.

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
${schema}

## Key relationships
- contracts.resort_id → companies.id (resort)
- contracts.group_id → companies.id (group)
- contracts.carrier_id → companies.id (carrier)
- pricing_standard.sub_contract_id links to contracts
- pricing_special.sub_contract_id links to contracts
- contract_* tables (baggage, booking, age, addons, insurance, government_charges, fuel, payment_plan, service_commitment, termination, notes) link via sub_contract_id to contracts
- companies.type can be 'Resort', 'Group', or 'Carrier'

## Response format
Respond ONLY with valid JSON (no markdown fences, no extra text):
{
  "sql": "THE SQL QUERY HERE",
  "explanation": "Brief explanation of what the query does"
}

If the user's request is unclear or impossible with the available schema, still provide your best attempt and explain any assumptions in the explanation field.`;

  try {
    const client = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      max_tokens: 1024,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userQuery },
      ],
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      return { sql: "", explanation: "", error: "Empty response from OpenAI." };
    }

    // Parse JSON response — strip markdown fences if present
    const cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      sql: parsed.sql || "",
      explanation: parsed.explanation || "",
    };
  } catch (err: unknown) {
    const apiErr = err as { status?: number; code?: string; message?: string };
    // Handle specific OpenAI errors
    if (apiErr?.status === 401) {
      return { sql: "", explanation: "", error: "Invalid API key. Please check your OpenAI key in Settings." };
    }
    if (apiErr?.status === 429) {
      return { sql: "", explanation: "", error: "Rate limit exceeded. Please wait a moment and try again." };
    }
    if (apiErr?.status === 402 || apiErr?.code === "insufficient_quota") {
      return { sql: "", explanation: "", error: "OpenAI quota exceeded. Please check your billing." };
    }
    if (err instanceof SyntaxError) {
      return { sql: "", explanation: "", error: "Failed to parse OpenAI response. Please try rephrasing." };
    }
    return {
      sql: "",
      explanation: "",
      error: apiErr.message || "Failed to connect to OpenAI.",
    };
  }
}
