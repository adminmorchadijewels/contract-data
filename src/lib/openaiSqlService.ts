/**
 * OpenAI SQL generation — proxied through /api/generate-sql (Vercel Edge Function).
 *
 * The OPENAI_API_KEY is stored as a Vercel environment variable and never
 * sent to the browser.  The /api/generate-sql endpoint does all OpenAI calls.
 */

export interface OpenAISQLResult {
  sql: string;
  explanation: string;
  error?: string;
}

/** AI generation is always available — key is managed server-side. */
export function hasOpenAIKey(): boolean {
  return true;
}

export async function generateSQLWithOpenAI(userQuery: string): Promise<OpenAISQLResult> {
  try {
    const res = await fetch("/api/generate-sql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userQuery }),
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
