import { selectAll, type TableName } from "./excelDataService";

// ─── Ollama Configuration ─────────────────────────────────────────
const OLLAMA_BASE_URL = "http://localhost:11434";
const DEFAULT_MODEL = "llama3.2";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface OllamaStatus {
  connected: boolean;
  models: string[];
}

// ─── Connection Check ─────────────────────────────────────────────
export async function checkOllamaStatus(): Promise<OllamaStatus> {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return { connected: false, models: [] };
    const data = await res.json();
    const models = (data.models || []).map((m: { name: string }) => m.name);
    return { connected: true, models };
  } catch {
    return { connected: false, models: [] };
  }
}

// ─── Build Context from Contract Data ─────────────────────────────
function buildDataContext(): string {
  const companies = selectAll("companies");
  const contracts = selectAll("contracts");
  const atolls = selectAll("atolls");

  const summary = [
    `Database Summary:`,
    `- ${companies.length} companies/resorts`,
    `- ${contracts.length} contract records`,
    `- ${atolls.length} atolls`,
    ``,
    `Companies: ${companies.map((c) => `${c.name} (${c.type}, code: ${c.code || "N/A"})`).join("; ")}`,
    ``,
    `Atolls: ${atolls.map((a) => a.name).join(", ")}`,
    ``,
    `Contracts overview:`,
  ];

  for (const c of contracts as Record<string, unknown>[]) {
    const line = `  - ${c.contract_code}: resort=${c.resort_id || "?"}, type=${c.sub_contract_type || "?"}, dates=${c.start_date}→${c.end_date}`;
    summary.push(line);
  }

  return summary.join("\n");
}

function getSystemPrompt(): string {
  const dataContext = buildDataContext();
  return `You are an AI assistant for TMA (Trans Maldivian Airways) Contract Management System. You help users understand and analyze their contract data.

Here is the current data in the system:

${dataContext}

You can answer questions about:
- Contract details, statuses, and timelines
- Resort and company information
- Pricing and terms
- Data summaries and analytics
- General contract management guidance

Be concise, helpful, and accurate. When referring to specific data, cite the contract codes or company names. If you don't have enough information to answer, say so clearly.`;
}

// ─── Streaming Chat ───────────────────────────────────────────────
export async function* streamChat(
  messages: ChatMessage[],
  model: string = DEFAULT_MODEL,
): AsyncGenerator<string> {
  const systemMsg: ChatMessage = { role: "system", content: getSystemPrompt() };

  const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [systemMsg, ...messages],
      stream: true,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Ollama error (${res.status}): ${err}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const parsed = JSON.parse(line);
        if (parsed.message?.content) {
          yield parsed.message.content;
        }
      } catch {
        // skip malformed lines
      }
    }
  }
}
