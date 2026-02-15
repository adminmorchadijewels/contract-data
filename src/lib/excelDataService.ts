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

const STORAGE_PREFIX = "aero_data_";

// ─── Helpers ────────────────────────────────────────────────────────
function genId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

// ─── Auto-persist to Excel via dev server ───────────────────────────

let _persistEnabled = true;

function persistTableToExcel(table: TableName, rows: unknown[]): void {
  if (!_persistEnabled) return;

  // Fire-and-forget POST to the Vite dev server plugin
  fetch("/__api/save-table", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ table, rows }),
  }).catch(() => {
    // Silently ignore — server may not be available (e.g. production build)
  });
}

// ─── Core localStorage CRUD ─────────────────────────────────────────

function getTable<T = Record<string, unknown>>(table: TableName): T[] {
  const raw = localStorage.getItem(STORAGE_PREFIX + table);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function setTable<T = Record<string, unknown>>(table: TableName, data: T[]): void {
  localStorage.setItem(STORAGE_PREFIX + table, JSON.stringify(data));
  // Auto-persist to Excel file via dev server
  persistTableToExcel(table, data);
}

export function selectAll<T = Record<string, unknown>>(table: TableName): T[] {
  return getTable<T>(table);
}

export function selectById<T = Record<string, unknown>>(table: TableName, id: string): T | undefined {
  return getTable<T>(table).find((r: any) => r.id === id);
}

export function selectWhere<T = Record<string, unknown>>(
  table: TableName,
  field: string,
  value: unknown
): T[] {
  return getTable<T>(table).filter((r: any) => r[field] === value);
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

export function updateRow<T = Record<string, unknown>>(
  table: TableName,
  id: string,
  updates: Partial<T>
): T | null {
  const rows = getTable<T>(table);
  const idx = rows.findIndex((r: any) => r.id === id);
  if (idx === -1) return null;
  rows[idx] = { ...rows[idx], ...updates, updated_at: now() } as T;
  setTable(table, rows);
  return rows[idx];
}

export function deleteRow(table: TableName, id: string): boolean {
  const rows = getTable(table);
  const filtered = rows.filter((r: any) => r.id !== id);
  if (filtered.length === rows.length) return false;
  setTable(table, filtered);
  return true;
}

export function deleteWhere(table: TableName, field: string, value: unknown): number {
  const rows = getTable(table);
  const filtered = rows.filter((r: any) => r[field] !== value);
  const deleted = rows.length - filtered.length;
  setTable(table, filtered);
  return deleted;
}

// ─── Excel Import / Export ──────────────────────────────────────────

function addTableSheet(wb: XLSX.WorkBook, table: TableName): void {
  const data = getTable(table);
  if (data.length === 0) {
    const ws = XLSX.utils.json_to_sheet([]);
    XLSX.utils.book_append_sheet(wb, ws, table);
  } else {
    const flatData = data.map((row: any) => {
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

// ─── Seed Data (loaded from Excel files in public/data/) ────────────
// Each table has its own .xlsx file generated by: node scripts/generateSeedData.mjs

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
  // Only seed if no data exists yet
  if (localStorage.getItem(STORAGE_PREFIX + "companies")) return;

  // Disable persist during seeding so we don't overwrite source files
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
      if (rows.length > 0) {
        setTable(table, rows);
      }
    } catch {
      console.warn(`Failed to load seed data for ${table}`);
    }
  }

  _persistEnabled = true;

  // Clear old destinations if any
  localStorage.removeItem(STORAGE_PREFIX + "destinations");
}
