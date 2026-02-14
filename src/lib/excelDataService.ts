import * as XLSX from "xlsx";

// ─── Types ──────────────────────────────────────────────────────────
export type TableName =
  | "companies"
  | "contracts"
  | "destinations"
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
  "destinations",
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
      // Create sheet with just headers (empty)
      const ws = XLSX.utils.json_to_sheet([]);
      XLSX.utils.book_append_sheet(wb, ws, table);
    } else {
      // Handle arrays in data by converting to JSON strings
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

          // Parse JSON-stringified arrays back
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

// ─── Seed Data ──────────────────────────────────────────────────────

const SEED_DESTINATIONS = [
  { name: "Velana International Airport", code: "MLE", coordinates: "4.1918, 73.5290" },
  { name: "Hanimaadhoo Airport", code: "HAQ", coordinates: "6.7442, 73.1705" },
  { name: "Kadhdhoo Airport", code: "KDO", coordinates: "1.8592, 73.5219" },
  { name: "Gan International Airport", code: "GAN", coordinates: "-0.6933, 73.1556" },
  { name: "Dhaalu Airport", code: "DDD", coordinates: "2.6681, 72.8878" },
  { name: "Ifuru Airport", code: "IFU", coordinates: "5.7083, 73.0250" },
  { name: "Maafaru Airport", code: "NMF", coordinates: "5.8183, 73.4700" },
  { name: "Soneva Fushi", code: "SVF", coordinates: "5.1100, 73.0700" },
  { name: "One&Only Reethi Rah", code: "ORR", coordinates: "4.3900, 73.3600" },
  { name: "Waldorf Astoria Ithaafushi", code: "WAI", coordinates: "4.1500, 73.4200" },
  { name: "St. Regis Vommuli", code: "SRV", coordinates: "2.8200, 73.3900" },
  { name: "Patina Maldives", code: "PTM", coordinates: "3.9100, 73.4800" },
  { name: "COMO Cocoa Island", code: "CCI", coordinates: "3.9600, 73.3700" },
  { name: "Cheval Blanc Randheli", code: "CBR", coordinates: "5.7200, 73.0100" },
  { name: "Four Seasons Landaa Giraavaru", code: "FSL", coordinates: "5.2900, 73.0700" },
];

const SEED_COMPANIES = [
  { name: "Marriott International", type: "Group", address: "Bethesda, Maryland, USA", registration_no: "MI-2024-001", coordinates: "38.9807, -77.0962" },
  { name: "Hilton Hotels Corporation", type: "Group", address: "McLean, Virginia, USA", registration_no: "HH-2024-002", coordinates: "38.9339, -77.1773" },
  { name: "Minor International", type: "Group", address: "Bangkok, Thailand", registration_no: "MN-2024-003", coordinates: "13.7563, 100.5018" },
  { name: "Soneva Group", type: "Group", address: "Bangkok, Thailand", registration_no: "SG-2024-004", coordinates: "13.7563, 100.5018" },
  { name: "Waldorf Astoria Maldives", type: "Resort", address: "Ithaafushi Island, Maldives", registration_no: "WA-2024-R01", coordinates: "4.1500, 73.4200" },
  { name: "St. Regis Maldives Vommuli", type: "Resort", address: "Dhaalu Atoll, Maldives", registration_no: "SR-2024-R02", coordinates: "2.8200, 73.3900" },
  { name: "Soneva Fushi", type: "Resort", address: "Baa Atoll, Maldives", registration_no: "SF-2024-R03", coordinates: "5.1100, 73.0700" },
  { name: "Four Seasons Landaa Giraavaru", type: "Resort", address: "Baa Atoll, Maldives", registration_no: "FS-2024-R04", coordinates: "5.2900, 73.0700" },
  { name: "Patina Maldives Fari Islands", type: "Resort", address: "North Malé Atoll, Maldives", registration_no: "PM-2024-R05", coordinates: "3.9100, 73.4800" },
  { name: "Cheval Blanc Randheli", type: "Resort", address: "Noonu Atoll, Maldives", registration_no: "CB-2024-R06", coordinates: "5.7200, 73.0100" },
];

export function initializeData(): void {
  // Only seed if no data exists yet
  if (localStorage.getItem(STORAGE_PREFIX + "destinations")) return;

  for (const dest of SEED_DESTINATIONS) {
    insertRow("destinations", dest);
  }
  for (const comp of SEED_COMPANIES) {
    insertRow("companies", comp);
  }
}
