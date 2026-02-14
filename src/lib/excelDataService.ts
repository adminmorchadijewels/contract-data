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

// ─── File System Access API (persist to Excel) ──────────────────────

let _dirHandle: FileSystemDirectoryHandle | null = null;
let _connected = false;
const _listeners: Array<(connected: boolean) => void> = [];

const DB_NAME = "aero_fs";
const STORE_NAME = "handles";

function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function storeHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  const db = await openIDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).put(handle, "dataDir");
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function loadHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await openIDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get("dataDir");
    return new Promise((resolve) => {
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

function setConnected(val: boolean) {
  _connected = val;
  _listeners.forEach((fn) => fn(val));
}

/** Subscribe to connection status changes. Returns unsubscribe function. */
export function onConnectionChange(fn: (connected: boolean) => void): () => void {
  _listeners.push(fn);
  return () => {
    const idx = _listeners.indexOf(fn);
    if (idx >= 0) _listeners.splice(idx, 1);
  };
}

/** Whether a data directory is connected for auto-persist. */
export function isDirectoryConnected(): boolean {
  return _connected;
}

/** Prompt user to select the public/data/ folder for auto-persist. */
export async function connectDataDirectory(): Promise<boolean> {
  try {
    const handle = await (window as any).showDirectoryPicker({ mode: "readwrite" });
    _dirHandle = handle;
    await storeHandle(handle);
    setConnected(true);
    return true;
  } catch {
    return false;
  }
}

/** Disconnect the data directory. */
export async function disconnectDataDirectory(): Promise<void> {
  _dirHandle = null;
  setConnected(false);
  try {
    const db = await openIDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete("dataDir");
  } catch { /* ignore */ }
}

/** Try to restore a previously connected directory from IndexedDB. */
export async function restoreDataDirectory(): Promise<boolean> {
  try {
    const handle = await loadHandle();
    if (!handle) return false;
    const perm = await (handle as any).requestPermission({ mode: "readwrite" });
    if (perm !== "granted") return false;
    _dirHandle = handle;
    setConnected(true);
    return true;
  } catch {
    return false;
  }
}

/** Write one table's current data to its .xlsx file in the connected directory. */
async function persistTableToExcel(table: TableName): Promise<void> {
  if (!_dirHandle) return;

  try {
    const data = getTable(table);
    const wb = XLSX.utils.book_new();

    if (data.length === 0) {
      const ws = XLSX.utils.aoa_to_sheet([]);
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

    const xlsxBuf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    const fileHandle = await _dirHandle.getFileHandle(`${table}.xlsx`, { create: true });
    const writable = await (fileHandle as any).createWritable();
    await writable.write(new Uint8Array(xlsxBuf));
    await writable.close();
  } catch (err) {
    console.warn(`Failed to persist ${table} to Excel:`, err);
  }
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
  // Auto-persist to Excel file (fire-and-forget)
  persistTableToExcel(table);
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

export function exportToExcel(): void {
  const wb = XLSX.utils.book_new();

  for (const table of ALL_TABLES) {
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

  XLSX.writeFile(wb, "aerocontracts_data.xlsx");
}

export function importFromExcel(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });

        for (const sheetName of wb.SheetNames) {
          const tableName = sheetName as TableName;
          if (!ALL_TABLES.includes(tableName)) continue;

          const ws = wb.Sheets[sheetName];
          const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws);

          const parsed = rows.map((row) => {
            const out: Record<string, unknown> = {};
            for (const [key, val] of Object.entries(row)) {
              if (typeof val === "string" && val.startsWith("[") && val.endsWith("]")) {
                try {
                  out[key] = JSON.parse(val);
                } catch {
                  out[key] = val;
                }
              } else {
                out[key] = val;
              }
            }
            return out;
          });

          setTable(tableName, parsed);
        }
        resolve();
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
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

  // Temporarily disconnect so seeding doesn't trigger file writes
  const prevHandle = _dirHandle;
  _dirHandle = null;

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

  // Restore handle
  _dirHandle = prevHandle;

  // Clear old destinations if any
  localStorage.removeItem(STORAGE_PREFIX + "destinations");
}
