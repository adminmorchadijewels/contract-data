import { CreateMLCEngine, type MLCEngine, type InitProgressReport } from "@mlc-ai/web-llm";
import { selectAll } from "./excelDataService";

// ─── Configuration ───────────────────────────────────────────────
const DEFAULT_MODEL = "Llama-3.2-1B-Instruct-q4f16_1-MLC";

export const AVAILABLE_MODELS = [
  { id: "Llama-3.2-1B-Instruct-q4f16_1-MLC", label: "Llama 3.2 1B (Fast, ~600MB)" },
  { id: "SmolLM2-1.7B-Instruct-q4f16_1-MLC", label: "SmolLM2 1.7B (~1GB)" },
  { id: "Phi-3.5-mini-instruct-q4f16_1-MLC", label: "Phi 3.5 Mini (~2GB)" },
];

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ModelStatus {
  ready: boolean;
  loading: boolean;
  progress: number;
  progressText: string;
  error: string | null;
  modelId: string;
}

// ─── Engine Singleton ────────────────────────────────────────────
let engine: MLCEngine | null = null;
let currentModelId: string | null = null;

export async function loadModel(
  modelId: string = DEFAULT_MODEL,
  onProgress?: (report: InitProgressReport) => void,
): Promise<void> {
  // If already loaded with this model, skip
  if (engine && currentModelId === modelId) return;

  // Unload previous model if switching
  if (engine) {
    engine.unload();
    engine = null;
    currentModelId = null;
  }

  engine = await CreateMLCEngine(modelId, {
    initProgressCallback: onProgress,
  });
  currentModelId = modelId;
}

export function isModelReady(): boolean {
  return engine !== null;
}

export function unloadModel(): void {
  if (engine) {
    engine.unload();
    engine = null;
    currentModelId = null;
  }
}

// ─── Build Context from Contract Data ────────────────────────────
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

// ─── Streaming Chat ──────────────────────────────────────────────
export async function* streamChat(
  messages: ChatMessage[],
): AsyncGenerator<string> {
  if (!engine) throw new Error("Model not loaded. Please load a model first.");

  const systemMsg: ChatMessage = { role: "system", content: getSystemPrompt() };

  const reply = await engine.chat.completions.create({
    messages: [systemMsg, ...messages],
    stream: true,
    temperature: 0.7,
    max_tokens: 1024,
  });

  for await (const chunk of reply) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}
