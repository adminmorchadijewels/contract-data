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

// ─── Seed Data ──────────────────────────────────────────────────────

const SEED_ATOLLS = [
  { name: "North Malé Atoll" },
  { name: "South Malé Atoll" },
  { name: "Baa Atoll" },
  { name: "Noonu Atoll" },
  { name: "Dhaalu Atoll" },
  { name: "Raa Atoll" },
  { name: "Lhaviyani Atoll" },
  { name: "Ari Atoll" },
  { name: "Meemu Atoll" },
  { name: "Laamu Atoll" },
];

const SEED_GROUPS = [
  { name: "Marriott International", type: "Group", code: "MAR", atoll: "", address: "Bethesda, Maryland, USA", registration_no: "MI-2024-001", coordinates: "38.9807, -77.0962" },
  { name: "Soneva Group", type: "Group", code: "SON", atoll: "", address: "Bangkok, Thailand", registration_no: "SG-2024-002", coordinates: "13.7563, 100.5018" },
  { name: "LVMH Hospitality", type: "Group", code: "LVMH", atoll: "", address: "Paris, France", registration_no: "LV-2024-003", coordinates: "48.8566, 2.3522" },
];

const SEED_RESORTS = [
  { name: "Soneva Fushi", type: "Resort", code: "SF", atoll: "Baa Atoll", address: "Kunfunadhoo Island, Baa Atoll, Maldives", registration_no: "SF-2024-R01", coordinates: "5.1100, 73.0700" },
  { name: "Waldorf Astoria Maldives Ithaafushi", type: "Resort", code: "WAI", atoll: "South Malé Atoll", address: "Ithaafushi Island, South Malé Atoll, Maldives", registration_no: "WA-2024-R02", coordinates: "4.1500, 73.4200" },
  { name: "St. Regis Maldives Vommuli", type: "Resort", code: "SRV", atoll: "Dhaalu Atoll", address: "Vommuli Island, Dhaalu Atoll, Maldives", registration_no: "SR-2024-R03", coordinates: "2.8200, 73.3900" },
  { name: "Patina Maldives Fari Islands", type: "Resort", code: "PMF", atoll: "North Malé Atoll", address: "Fari Islands, North Malé Atoll, Maldives", registration_no: "PM-2024-R04", coordinates: "4.3100, 73.4800" },
  { name: "Cheval Blanc Randheli", type: "Resort", code: "CBR", atoll: "Noonu Atoll", address: "Randheli Island, Noonu Atoll, Maldives", registration_no: "CB-2024-R05", coordinates: "5.7200, 73.0100" },
];

export function initializeData(): void {
  // Only seed if no data exists yet
  if (localStorage.getItem(STORAGE_PREFIX + "companies")) return;

  // Seed atolls
  for (const atoll of SEED_ATOLLS) {
    insertRow("atolls", atoll);
  }

  // Seed groups and capture IDs
  const groupIds: Record<string, string> = {};
  for (const group of SEED_GROUPS) {
    const row = insertRow("companies", group) as any;
    groupIds[group.code] = row.id;
  }

  // Seed resorts and capture IDs
  const resortIds: Record<string, string> = {};
  for (const resort of SEED_RESORTS) {
    const row = insertRow("companies", resort) as any;
    resortIds[resort.code] = row.id;
  }

  // Seed contracts linking groups to resorts
  const seedContracts = [
    { contract_id: "CTR-001", contract_code: "MAR-WAI-2025", carrier_id: "TMA101", group_id: groupIds["MAR"], resort_id: resortIds["WAI"], sub_contract_id: "CTR-001-001", sub_contract_type: "Transfer", start_date: "2025-01-01", end_date: "2025-12-31", agreement_type: "Exclusive Seaplane (Day time)" },
    { contract_id: "CTR-002", contract_code: "MAR-SRV-2025", carrier_id: "TMA101", group_id: groupIds["MAR"], resort_id: resortIds["SRV"], sub_contract_id: "CTR-002-001", sub_contract_type: "Transfer", start_date: "2025-03-01", end_date: "2026-02-28", agreement_type: "Exclusive Seaplane (Day time)" },
    { contract_id: "CTR-003", contract_code: "SON-SF-2025", carrier_id: "TMA101", group_id: groupIds["SON"], resort_id: resortIds["SF"], sub_contract_id: "CTR-003-001", sub_contract_type: "Charter", start_date: "2025-06-01", end_date: "2026-05-31", agreement_type: "Charter Agreement" },
    { contract_id: "CTR-004", contract_code: "LVMH-CBR-2025", carrier_id: "TMA101", group_id: groupIds["LVMH"], resort_id: resortIds["CBR"], sub_contract_id: "CTR-004-001", sub_contract_type: "Signed Charter", start_date: "2024-01-01", end_date: "2024-12-31", agreement_type: "Signed Charter Agreement" },
    { contract_id: "CTR-005", contract_code: "MAR-PMF-2025", carrier_id: "TMA101", group_id: groupIds["MAR"], resort_id: resortIds["PMF"], sub_contract_id: "CTR-005-001", sub_contract_type: "Transfer", start_date: "2025-04-01", end_date: "2026-03-31", agreement_type: "Exclusive Seaplane (Day time)" },
  ];

  for (const contract of seedContracts) {
    insertRow("contracts", contract);
  }

  // Clear old destinations if any
  localStorage.removeItem(STORAGE_PREFIX + "destinations");
}
