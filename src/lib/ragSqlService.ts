/**
 * RAG SQL Service — client-side orchestrator for the Query Guide.
 *
 * Follows the same conventions as openaiSqlService.ts:
 *   - supabase.auth.getSession() for the Bearer token
 *   - ...(token && { Authorization: `Bearer ${token}` }) header pattern
 *   - try/catch returning error objects (never throws to callers)
 *
 * Flow (generation):
 *   1. Embed the NL question → POST /api/embed
 *   2. Search approved_examples for similar pairs → supabase.rpc(match_approved_examples)
 *   3. Generate SQL with examples injected → POST /api/generate-sql
 *   4. Self-heal: if executeQuery returns an error, retry once with error context
 *
 * Flow (feedback):
 *   submitPositiveFeedback  → embed → near-duplicate check (0.95) → insert or increment
 *   submitNegativeFeedback  → insert rejection → if correction given, also store as approved
 */

import { supabase } from "./supabase";
import { executeQuery } from "./sqlEngine";

// ── Public types ──────────────────────────────────────────────────────────────

export interface RAGSQLResult {
  sql: string;
  explanation: string;
  error?: string;
  examplesUsed: number;      // number of approved examples injected into the prompt
  selfHealed: boolean;       // true if the first attempt errored and a retry succeeded
}

interface ApprovedExample {
  id: string;
  question: string;
  sql: string;
  thumbs_up_count: number;
  similarity: number;
}

// ── Auth helper ───────────────────────────────────────────────────────────────

async function getToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

// ── Step 1: Embed a text string ───────────────────────────────────────────────

async function embedText(text: string): Promise<number[] | null> {
  try {
    const token = await getToken();
    const res = await fetch("/api/embed", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) return null;
    const data = await res.json() as { embedding?: number[] };
    return data.embedding ?? null;
  } catch {
    return null;
  }
}

// ── Step 2: Retrieve similar approved examples ────────────────────────────────

async function searchSimilarExamples(
  embedding: number[],
  threshold = 0.78,
  count = 5,
): Promise<ApprovedExample[]> {
  try {
    const { data, error } = await supabase.rpc("match_approved_examples", {
      query_embedding: embedding,
      match_threshold: threshold,
      match_count: count,
    });
    if (error) return [];
    return (data ?? []) as ApprovedExample[];
  } catch {
    return [];
  }
}

// ── Step 3: Call the SQL generation endpoint ──────────────────────────────────

async function callGenerateSQL(
  userQuery: string,
  examples: ApprovedExample[],
  errorContext?: string,
): Promise<{ sql: string; explanation: string; error?: string }> {
  try {
    const token = await getToken();
    const res = await fetch("/api/generate-sql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({
        userQuery,
        examples,
        ...(errorContext && { errorContext }),
      }),
    });
    const data = await res.json() as { sql?: string; explanation?: string; error?: string };
    if (!res.ok || data.error) {
      return { sql: "", explanation: "", error: data.error ?? "Request failed." };
    }
    return { sql: data.sql ?? "", explanation: data.explanation ?? "" };
  } catch {
    return { sql: "", explanation: "", error: "Failed to reach AI service. Check your connection." };
  }
}

// ── Main: generate SQL with RAG + self-healing ────────────────────────────────

export async function generateSQLWithRAG(userQuery: string): Promise<RAGSQLResult> {
  try {
    // 1. Embed (best-effort — generation continues even if embedding fails)
    const embedding = await embedText(userQuery);

    // 2. Retrieve similar approved examples (empty array if embedding failed)
    const examples = embedding ? await searchSimilarExamples(embedding) : [];

    // 3. First generation attempt
    const first = await callGenerateSQL(userQuery, examples);
    if (first.error) {
      return { sql: "", explanation: "", error: first.error, examplesUsed: examples.length, selfHealed: false };
    }

    // 4. Self-healing: test the SQL; if it errors, retry once with the error context
    if (first.sql) {
      const testResult = await executeQuery(first.sql);
      if (testResult.error) {
        const retry = await callGenerateSQL(userQuery, examples, testResult.error);
        if (!retry.error && retry.sql) {
          return { sql: retry.sql, explanation: retry.explanation, examplesUsed: examples.length, selfHealed: true };
        }
        // Retry also failed — return the original result with the exec error surfaced
        return {
          sql: first.sql,
          explanation: first.explanation,
          error: `Query generated but may not execute correctly: ${testResult.error}`,
          examplesUsed: examples.length,
          selfHealed: false,
        };
      }
    }

    return { sql: first.sql, explanation: first.explanation, examplesUsed: examples.length, selfHealed: false };
  } catch {
    return { sql: "", explanation: "", error: "Unexpected error. Please try again.", examplesUsed: 0, selfHealed: false };
  }
}

// ── Feedback: thumbs up ───────────────────────────────────────────────────────

export async function submitPositiveFeedback(question: string, sql: string): Promise<void> {
  try {
    const embedding = await embedText(question);
    if (!embedding) return;

    // Near-duplicate check: if a very similar question already exists (≥0.95), increment its count
    const nearDupes = await searchSimilarExamples(embedding, 0.95, 1);
    if (nearDupes.length > 0) {
      await supabase
        .from("approved_examples")
        .update({
          thumbs_up_count: nearDupes[0].thumbs_up_count + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", nearDupes[0].id);
      return;
    }

    // New example — insert with embedding
    await supabase.from("approved_examples").insert({
      question,
      sql,
      embedding,
      thumbs_up_count: 1,
    });
  } catch {
    // Feedback failure is non-critical — swallow silently
  }
}

// ── Feedback: thumbs down (+ optional correction) ────────────────────────────

export async function submitNegativeFeedback(
  question: string,
  badSql: string,
  correctedSql?: string,
): Promise<void> {
  try {
    // Always record the rejection
    await supabase.from("rejected_examples").insert({
      question,
      bad_sql: badSql,
      corrected_sql: correctedSql ?? null,
    });

    // If the user provided a correction, store it as an approved example too
    if (correctedSql?.trim()) {
      await submitPositiveFeedback(question, correctedSql.trim());
    }
  } catch {
    // Feedback failure is non-critical — swallow silently
  }
}
