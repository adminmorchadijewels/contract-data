import * as XLSX from "xlsx";

// ─── Types ──────────────────────────────────────────────────────────
export type TableName =
  | "companies"
  | "contracts"
  | "atolls"
  | "pricing_standard"
  | "pricing_special"
  | "contract_baggage"
  | "contract_booking"
  | "contract_age"
  | "contract_addons"
  | "contract_insurance"
  | "contract_government_charges"
  | "contract_fuel"
  | "contract_payment_plan"
  | "contract_service_commitment"
  | "contract_termination"
  | "contract_notes"
  | "table_settings";

const ALL_TABLES: TableName[] = [
  "companies",
  "contracts",
  "atolls",
  "pricing_standard",
  "pricing_special",
  "contract_baggage",
  "contract_booking",
  "contract_age",
  "contract_addons",
  "contract_insurance",
  "contract_government_charges",
  "contract_fuel",
  "contract_payment_plan",
  "contract_service_commitment",
  "contract_termination",
  "contract_notes",
  "table_settings",
];

// ─── In-Memory Data Store (replaces localStorage) ───────────────────
// Data is loaded from Excel on startup and persisted back on every write.
const dataStore = new Map<TableName, Record<string, unknown>[]>();

// ─── Helpers ────────────────────────────────────────────────────────
function genId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

// ─── Auto-persist to Excel via dev server ───────────────────────────

let _persistEnabled = false;

function persistTableToExcel(table: TableName, rows: unknown[]): void {
  if (!_persistEnabled) return;

  fetch("/__api/save-table", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ table, rows }),
  }).catch(() => {
    // Silently ignore — server may not be available (e.g. production build)
  });
}

// ─── Core In-Memory CRUD ────────────────────────────────────────────

function getTable<T = Record<string, unknown>>(table: TableName): T[] {
  return (dataStore.get(table) || []) as T[];
}

function setTable<T = Record<string, unknown>>(table: TableName, data: T[]): void {
  dataStore.set(table, data as Record<string, unknown>[]);
  persistTableToExcel(table, data);
}

export function selectAll<T = Record<string, unknown>>(table: TableName): T[] {
  return getTable<T>(table);
}

export function selectById<T extends Record<string, unknown> = Record<string, unknown>>(table: TableName, id: string): T | undefined {
  return getTable<T>(table).find((r) => r.id === id);
}

export function selectWhere<T extends Record<string, unknown> = Record<string, unknown>>(
  table: TableName,
  field: string,
  value: unknown
): T[] {
  return getTable<T>(table).filter((r) => r[field] === value);
}

export function insertRow<T = Record<string, unknown>>(
  table: TableName,
  row: Partial<T>
): T {
  const rows = getTable<T>(table);
  const record = {
    id: genId(),
    created_at: now(),
    updated_at: now(),
    ...row,
  } as T;
  rows.push(record);
  setTable(table, rows);
  return record;
}

export function updateRow<T extends Record<string, unknown> = Record<string, unknown>>(
  table: TableName,
  id: string,
  updates: Partial<T>
): T | null {
  const rows = getTable<T>(table);
  const idx = rows.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  rows[idx] = { ...rows[idx], ...updates, updated_at: now() } as T;
  setTable(table, rows);
  return rows[idx];
}

export function deleteRow(table: TableName, id: string): boolean {
  const rows = getTable(table);
  const filtered = rows.filter((r) => r.id !== id);
  if (filtered.length === rows.length) return false;
  setTable(table, filtered);
  return true;
}

export function deleteWhere(table: TableName, field: string, value: unknown): number {
  const rows = getTable(table);
  const filtered = rows.filter((r) => r[field] !== value);
  const deleted = rows.length - filtered.length;
  setTable(table, filtered);
  return deleted;
}

// ─── Excel Export (download to user) ────────────────────────────────

function addTableSheet(wb: XLSX.WorkBook, table: TableName): void {
  const data = getTable(table);
  if (data.length === 0) {
    const ws = XLSX.utils.json_to_sheet([]);
    XLSX.utils.book_append_sheet(wb, ws, table);
  } else {
    const flatData = data.map((row) => {
      const flat: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(row)) {
        flat[key] = Array.isArray(val) ? JSON.stringify(val) : val;
      }
      return flat;
    });
    const ws = XLSX.utils.json_to_sheet(flatData);
    XLSX.utils.book_append_sheet(wb, ws, table);
  }
}

const RESORT_TABLES: TableName[] = ["companies", "atolls"];

const CONTRACT_TABLES: TableName[] = [
  "contracts",
  "pricing_standard",
  "pricing_special",
  "contract_baggage",
  "contract_booking",
  "contract_age",
  "contract_addons",
  "contract_insurance",
  "contract_government_charges",
  "contract_fuel",
  "contract_payment_plan",
  "contract_service_commitment",
  "contract_termination",
  "contract_notes",
];

export function exportResortData(): void {
  const wb = XLSX.utils.book_new();
  for (const table of RESORT_TABLES) addTableSheet(wb, table);
  XLSX.writeFile(wb, "tma_resort_data.xlsx");
}

export function exportContractData(): void {
  const wb = XLSX.utils.book_new();
  for (const table of CONTRACT_TABLES) addTableSheet(wb, table);
  XLSX.writeFile(wb, "tma_contracts_data.xlsx");
}

// ─── Load Data from Excel files in public/data/ ─────────────────────

const SEED_TABLES: TableName[] = [
  "atolls", "companies", "contracts",
  "pricing_standard", "pricing_special",
  "contract_baggage", "contract_booking", "contract_age",
  "contract_addons", "contract_insurance", "contract_government_charges",
  "contract_fuel", "contract_payment_plan", "contract_service_commitment",
  "contract_termination", "contract_notes",
];

function parseExcelRows(ws: XLSX.WorkSheet): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws);
  return rows.map((row) => {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(row)) {
      if (typeof val === "string" && val.startsWith("[") && val.endsWith("]")) {
        try { out[key] = JSON.parse(val); } catch { out[key] = val; }
      } else {
        out[key] = val;
      }
    }
    return out;
  });
}

export async function initializeData(): Promise<void> {
  // Always load fresh from Excel files — no caching
  _persistEnabled = false;

  for (const table of SEED_TABLES) {
    try {
      const resp = await fetch(`/data/${table}.xlsx`);
      if (!resp.ok) continue;
      const buf = await resp.arrayBuffer();
      const wb = XLSX.read(new Uint8Array(buf), { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      if (!ws) continue;
      const rows = parseExcelRows(ws);
      dataStore.set(table, rows);
    } catch {
      console.warn(`Failed to load data for ${table}`);
    }
  }

  // Initialize empty tables that aren't in seed
  if (!dataStore.has("table_settings")) {
    dataStore.set("table_settings", []);
  }

  _persistEnabled = true;
}
