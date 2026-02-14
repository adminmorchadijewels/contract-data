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
  { name: "Gaafu Alifu Atoll" },
  { name: "Addu Atoll" },
];

const SEED_GROUPS = [
  { name: "Marriott International", type: "Group", code: "MAR", atoll: "", address: "Bethesda, Maryland, USA", registration_no: "MI-2024-001", coordinates: "38.9807, -77.0962" },
  { name: "Soneva Group", type: "Group", code: "SON", atoll: "", address: "Bangkok, Thailand", registration_no: "SG-2024-002", coordinates: "13.7563, 100.5018" },
  { name: "LVMH Hospitality", type: "Group", code: "LVMH", atoll: "", address: "Paris, France", registration_no: "LV-2024-003", coordinates: "48.8566, 2.3522" },
  { name: "Four Seasons Hotels & Resorts", type: "Group", code: "FS", atoll: "", address: "Toronto, Ontario, Canada", registration_no: "FS-2024-004", coordinates: "43.6532, -79.3832" },
  { name: "Minor International (Anantara)", type: "Group", code: "MINT", atoll: "", address: "Bangkok, Thailand", registration_no: "MT-2024-005", coordinates: "13.7235, 100.5284" },
];

const SEED_RESORTS = [
  { name: "Soneva Fushi", type: "Resort", code: "SF", atoll: "Baa Atoll", address: "Kunfunadhoo Island, Baa Atoll, Maldives", registration_no: "SF-2024-R01", coordinates: "5.1100, 73.0700" },
  { name: "Waldorf Astoria Maldives Ithaafushi", type: "Resort", code: "WAI", atoll: "South Malé Atoll", address: "Ithaafushi Island, South Malé Atoll, Maldives", registration_no: "WA-2024-R02", coordinates: "4.1500, 73.4200" },
  { name: "St. Regis Maldives Vommuli", type: "Resort", code: "SRV", atoll: "Dhaalu Atoll", address: "Vommuli Island, Dhaalu Atoll, Maldives", registration_no: "SR-2024-R03", coordinates: "2.8200, 73.3900" },
  { name: "Patina Maldives Fari Islands", type: "Resort", code: "PMF", atoll: "North Malé Atoll", address: "Fari Islands, North Malé Atoll, Maldives", registration_no: "PM-2024-R04", coordinates: "4.3100, 73.4800" },
  { name: "Cheval Blanc Randheli", type: "Resort", code: "CBR", atoll: "Noonu Atoll", address: "Randheli Island, Noonu Atoll, Maldives", registration_no: "CB-2024-R05", coordinates: "5.7200, 73.0100" },
  { name: "Four Seasons Landaa Giraavaru", type: "Resort", code: "FSLG", atoll: "Baa Atoll", address: "Landaa Giraavaru, Baa Atoll, Maldives", registration_no: "FL-2024-R06", coordinates: "5.2840, 73.0710" },
  { name: "Four Seasons Kuda Huraa", type: "Resort", code: "FSKH", atoll: "North Malé Atoll", address: "Kuda Huraa Island, North Malé Atoll, Maldives", registration_no: "FK-2024-R07", coordinates: "4.3300, 73.5900" },
  { name: "Anantara Kihavah Maldives", type: "Resort", code: "AKV", atoll: "Baa Atoll", address: "Kihavah Huravalhi, Baa Atoll, Maldives", registration_no: "AK-2024-R08", coordinates: "5.3050, 73.0690" },
  { name: "The Ritz-Carlton Maldives Fari Islands", type: "Resort", code: "RCFI", atoll: "North Malé Atoll", address: "Fari Islands, North Malé Atoll, Maldives", registration_no: "RC-2024-R09", coordinates: "4.3150, 73.4750" },
  { name: "Soneva Jani", type: "Resort", code: "SJ", atoll: "Noonu Atoll", address: "Medhufaru Island, Noonu Atoll, Maldives", registration_no: "SJ-2024-R10", coordinates: "5.7600, 73.3800" },
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

  // ─── 10 Contracts (mix of Active, Expiring, Expired) ─────────────
  const seedContracts = [
    // CTR-001: Marriott → Waldorf Astoria (Active Transfer)
    { contract_id: "CTR-001", contract_code: "MAR-WAI-2025", carrier_id: "TMA101", group_id: groupIds["MAR"], resort_id: resortIds["WAI"], sub_contract_id: "CTR-001-001", sub_contract_type: "Transfer", start_date: "2025-01-01", end_date: "2025-12-31", agreement_type: "Exclusive Seaplane (Day time)" },
    // CTR-002: Marriott → St. Regis (Active Transfer)
    { contract_id: "CTR-002", contract_code: "MAR-SRV-2025", carrier_id: "TMA101", group_id: groupIds["MAR"], resort_id: resortIds["SRV"], sub_contract_id: "CTR-002-001", sub_contract_type: "Transfer", start_date: "2025-03-01", end_date: "2026-02-28", agreement_type: "Exclusive Seaplane (Day time)" },
    // CTR-003: Soneva → Soneva Fushi (Active Charter)
    { contract_id: "CTR-003", contract_code: "SON-SF-2025", carrier_id: "TMA101", group_id: groupIds["SON"], resort_id: resortIds["SF"], sub_contract_id: "CTR-003-001", sub_contract_type: "Charter", start_date: "2025-06-01", end_date: "2026-05-31", agreement_type: "Charter Agreement" },
    // CTR-004: LVMH → Cheval Blanc (Expired Signed Charter)
    { contract_id: "CTR-004", contract_code: "LVMH-CBR-2025", carrier_id: "TMA101", group_id: groupIds["LVMH"], resort_id: resortIds["CBR"], sub_contract_id: "CTR-004-001", sub_contract_type: "Signed Charter", start_date: "2024-01-01", end_date: "2024-12-31", agreement_type: "Signed Charter Agreement" },
    // CTR-005: Marriott → Patina Maldives (Active Transfer)
    { contract_id: "CTR-005", contract_code: "MAR-PMF-2025", carrier_id: "TMA101", group_id: groupIds["MAR"], resort_id: resortIds["PMF"], sub_contract_id: "CTR-005-001", sub_contract_type: "Transfer", start_date: "2025-04-01", end_date: "2026-03-31", agreement_type: "Exclusive Seaplane (Day time)" },
    // CTR-006: Four Seasons → Landaa Giraavaru (Active Transfer)
    { contract_id: "CTR-006", contract_code: "FS-FSLG-2026", carrier_id: "TMA101", group_id: groupIds["FS"], resort_id: resortIds["FSLG"], sub_contract_id: "CTR-006-001", sub_contract_type: "Transfer", start_date: "2026-01-01", end_date: "2026-12-31", agreement_type: "Exclusive Seaplane (Day time)" },
    // CTR-007: Four Seasons → Kuda Huraa (Expiring Transfer)
    { contract_id: "CTR-007", contract_code: "FS-FSKH-2025", carrier_id: "TMA101", group_id: groupIds["FS"], resort_id: resortIds["FSKH"], sub_contract_id: "CTR-007-001", sub_contract_type: "Transfer", start_date: "2025-01-01", end_date: "2026-03-10", agreement_type: "Exclusive Seaplane (Day time)" },
    // CTR-008: Minor → Anantara Kihavah (Active Charter)
    { contract_id: "CTR-008", contract_code: "MINT-AKV-2026", carrier_id: "TMA101", group_id: groupIds["MINT"], resort_id: resortIds["AKV"], sub_contract_id: "CTR-008-001", sub_contract_type: "Charter", start_date: "2025-10-01", end_date: "2026-09-30", agreement_type: "Charter Agreement" },
    // CTR-009: Marriott → Ritz-Carlton Fari (Active Transfer)
    { contract_id: "CTR-009", contract_code: "MAR-RCFI-2026", carrier_id: "TMA101", group_id: groupIds["MAR"], resort_id: resortIds["RCFI"], sub_contract_id: "CTR-009-001", sub_contract_type: "Transfer", start_date: "2025-11-01", end_date: "2026-10-31", agreement_type: "Exclusive Seaplane (Day time)" },
    // CTR-010: Soneva → Soneva Jani (Expired Charter)
    { contract_id: "CTR-010", contract_code: "SON-SJ-2024", carrier_id: "TMA101", group_id: groupIds["SON"], resort_id: resortIds["SJ"], sub_contract_id: "CTR-010-001", sub_contract_type: "Charter", start_date: "2024-03-01", end_date: "2025-02-28", agreement_type: "Charter Agreement" },
  ];

  const contractIds: Record<string, string> = {};
  for (const contract of seedContracts) {
    const row = insertRow("contracts", contract) as any;
    contractIds[contract.contract_id] = row.id;
  }

  // ─── Standard Pricing (per contract with resort-to-resort routes) ─
  const stdPricing = [
    // CTR-001: Waldorf Astoria
    { sub_contract_id: "CTR-001-001", weekdays: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], point_a_id: resortIds["WAI"], point_b_id: resortIds["WAI"], transfer_type: "Seaplane", pax_condition: "", passenger_type: "Adult", return_fare_usd: 680, one_way_fare_usd: 400, start_date: "2025-01-01", end_date: "2025-12-31" },
    { sub_contract_id: "CTR-001-001", weekdays: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], point_a_id: resortIds["WAI"], point_b_id: resortIds["WAI"], transfer_type: "Seaplane", pax_condition: "Age 2-11", passenger_type: "Child", return_fare_usd: 410, one_way_fare_usd: 240, start_date: "2025-01-01", end_date: "2025-12-31" },
    // CTR-002: St. Regis
    { sub_contract_id: "CTR-002-001", weekdays: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], point_a_id: resortIds["SRV"], point_b_id: resortIds["SRV"], transfer_type: "Seaplane", pax_condition: "", passenger_type: "Adult", return_fare_usd: 620, one_way_fare_usd: 370, start_date: "2025-03-01", end_date: "2026-02-28" },
    { sub_contract_id: "CTR-002-001", weekdays: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], point_a_id: resortIds["SRV"], point_b_id: resortIds["SRV"], transfer_type: "Seaplane", pax_condition: "Age 2-11", passenger_type: "Child", return_fare_usd: 370, one_way_fare_usd: 220, start_date: "2025-03-01", end_date: "2026-02-28" },
    // CTR-003: Soneva Fushi
    { sub_contract_id: "CTR-003-001", weekdays: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], point_a_id: resortIds["SF"], point_b_id: resortIds["SF"], transfer_type: "Seaplane", pax_condition: "", passenger_type: "Adult", return_fare_usd: 600, one_way_fare_usd: 350, start_date: "2025-06-01", end_date: "2026-05-31" },
    { sub_contract_id: "CTR-003-001", weekdays: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], point_a_id: resortIds["SF"], point_b_id: resortIds["SF"], transfer_type: "Seaplane", pax_condition: "Age 2-11", passenger_type: "Child", return_fare_usd: 360, one_way_fare_usd: 210, start_date: "2025-06-01", end_date: "2026-05-31" },
    // CTR-004: Cheval Blanc (expired)
    { sub_contract_id: "CTR-004-001", weekdays: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], point_a_id: resortIds["CBR"], point_b_id: resortIds["CBR"], transfer_type: "Seaplane", pax_condition: "", passenger_type: "Adult", return_fare_usd: 740, one_way_fare_usd: 440, start_date: "2024-01-01", end_date: "2024-12-31" },
    { sub_contract_id: "CTR-004-001", weekdays: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], point_a_id: resortIds["CBR"], point_b_id: resortIds["CBR"], transfer_type: "Seaplane", pax_condition: "Age 2-11", passenger_type: "Child", return_fare_usd: 440, one_way_fare_usd: 260, start_date: "2024-01-01", end_date: "2024-12-31" },
    // CTR-005: Patina Maldives
    { sub_contract_id: "CTR-005-001", weekdays: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], point_a_id: resortIds["PMF"], point_b_id: resortIds["PMF"], transfer_type: "Seaplane", pax_condition: "", passenger_type: "Adult", return_fare_usd: 590, one_way_fare_usd: 345, start_date: "2025-04-01", end_date: "2026-03-31" },
    { sub_contract_id: "CTR-005-001", weekdays: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], point_a_id: resortIds["PMF"], point_b_id: resortIds["PMF"], transfer_type: "Seaplane", pax_condition: "Age 2-11", passenger_type: "Child", return_fare_usd: 355, one_way_fare_usd: 207, start_date: "2025-04-01", end_date: "2026-03-31" },
    // CTR-006: Four Seasons Landaa Giraavaru
    { sub_contract_id: "CTR-006-001", weekdays: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], point_a_id: resortIds["FSLG"], point_b_id: resortIds["FSLG"], transfer_type: "Seaplane", pax_condition: "", passenger_type: "Adult", return_fare_usd: 640, one_way_fare_usd: 380, start_date: "2026-01-01", end_date: "2026-12-31" },
    { sub_contract_id: "CTR-006-001", weekdays: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], point_a_id: resortIds["FSLG"], point_b_id: resortIds["FSLG"], transfer_type: "Seaplane", pax_condition: "Age 2-11", passenger_type: "Child", return_fare_usd: 385, one_way_fare_usd: 228, start_date: "2026-01-01", end_date: "2026-12-31" },
    // CTR-007: Four Seasons Kuda Huraa
    { sub_contract_id: "CTR-007-001", weekdays: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], point_a_id: resortIds["FSKH"], point_b_id: resortIds["FSKH"], transfer_type: "Speedboat", pax_condition: "", passenger_type: "Adult", return_fare_usd: 320, one_way_fare_usd: 190, start_date: "2025-01-01", end_date: "2026-03-10" },
    { sub_contract_id: "CTR-007-001", weekdays: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], point_a_id: resortIds["FSKH"], point_b_id: resortIds["FSKH"], transfer_type: "Speedboat", pax_condition: "Age 2-11", passenger_type: "Child", return_fare_usd: 190, one_way_fare_usd: 115, start_date: "2025-01-01", end_date: "2026-03-10" },
    // CTR-008: Anantara Kihavah
    { sub_contract_id: "CTR-008-001", weekdays: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], point_a_id: resortIds["AKV"], point_b_id: resortIds["AKV"], transfer_type: "Seaplane", pax_condition: "", passenger_type: "Adult", return_fare_usd: 660, one_way_fare_usd: 390, start_date: "2025-10-01", end_date: "2026-09-30" },
    { sub_contract_id: "CTR-008-001", weekdays: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], point_a_id: resortIds["AKV"], point_b_id: resortIds["AKV"], transfer_type: "Seaplane", pax_condition: "Age 2-11", passenger_type: "Child", return_fare_usd: 395, one_way_fare_usd: 234, start_date: "2025-10-01", end_date: "2026-09-30" },
    // CTR-009: Ritz-Carlton Fari
    { sub_contract_id: "CTR-009-001", weekdays: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], point_a_id: resortIds["RCFI"], point_b_id: resortIds["RCFI"], transfer_type: "Speedboat", pax_condition: "", passenger_type: "Adult", return_fare_usd: 350, one_way_fare_usd: 210, start_date: "2025-11-01", end_date: "2026-10-31" },
    { sub_contract_id: "CTR-009-001", weekdays: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], point_a_id: resortIds["RCFI"], point_b_id: resortIds["RCFI"], transfer_type: "Speedboat", pax_condition: "Age 2-11", passenger_type: "Child", return_fare_usd: 210, one_way_fare_usd: 125, start_date: "2025-11-01", end_date: "2026-10-31" },
    // CTR-010: Soneva Jani (expired)
    { sub_contract_id: "CTR-010-001", weekdays: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], point_a_id: resortIds["SJ"], point_b_id: resortIds["SJ"], transfer_type: "Seaplane", pax_condition: "", passenger_type: "Adult", return_fare_usd: 710, one_way_fare_usd: 420, start_date: "2024-03-01", end_date: "2025-02-28" },
    { sub_contract_id: "CTR-010-001", weekdays: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], point_a_id: resortIds["SJ"], point_b_id: resortIds["SJ"], transfer_type: "Seaplane", pax_condition: "Age 2-11", passenger_type: "Child", return_fare_usd: 425, one_way_fare_usd: 252, start_date: "2024-03-01", end_date: "2025-02-28" },
  ];
  for (const p of stdPricing) { insertRow("pricing_standard", p); }

  // ─── Special Pricing ──────────────────────────────────────────────
  const specialPricing = [
    // CTR-001: Waldorf Astoria
    { sub_contract_id: "CTR-001-001", request_type: "Management", discount_type: "Percentage", return_fare_usd: 100, one_way_fare_usd: 100, pax_condition: "Hotel GM and above", start_date: "2025-01-01", end_date: "2025-12-31" },
    { sub_contract_id: "CTR-001-001", request_type: "Staff", discount_type: "Absolute", return_fare_usd: 150, one_way_fare_usd: 90, pax_condition: "Resort staff with valid ID", start_date: "2025-01-01", end_date: "2025-12-31" },
    // CTR-002: St. Regis
    { sub_contract_id: "CTR-002-001", request_type: "FAM trips", discount_type: "Percentage", return_fare_usd: 50, one_way_fare_usd: 50, pax_condition: "Approved travel agents only", start_date: "2025-03-01", end_date: "2026-02-28" },
    // CTR-003: Soneva Fushi
    { sub_contract_id: "CTR-003-001", request_type: "Management", discount_type: "Percentage", return_fare_usd: 100, one_way_fare_usd: 100, pax_condition: "Soneva executives", start_date: "2025-06-01", end_date: "2026-05-31" },
    { sub_contract_id: "CTR-003-001", request_type: "Journalists", discount_type: "Percentage", return_fare_usd: 75, one_way_fare_usd: 75, pax_condition: "Pre-approved media only", start_date: "2025-06-01", end_date: "2026-05-31" },
    // CTR-005: Patina Maldives
    { sub_contract_id: "CTR-005-001", request_type: "Tour Operators", discount_type: "Absolute", return_fare_usd: 490, one_way_fare_usd: 285, pax_condition: "Min 10 pax per group", start_date: "2025-04-01", end_date: "2026-03-31" },
    // CTR-006: Four Seasons Landaa Giraavaru
    { sub_contract_id: "CTR-006-001", request_type: "Management", discount_type: "Percentage", return_fare_usd: 100, one_way_fare_usd: 100, pax_condition: "FS executives", start_date: "2026-01-01", end_date: "2026-12-31" },
    { sub_contract_id: "CTR-006-001", request_type: "Staff", discount_type: "Absolute", return_fare_usd: 160, one_way_fare_usd: 95, pax_condition: "Resort staff", start_date: "2026-01-01", end_date: "2026-12-31" },
    { sub_contract_id: "CTR-006-001", request_type: "FAM trips", discount_type: "Percentage", return_fare_usd: 50, one_way_fare_usd: 50, pax_condition: "Approved agents", start_date: "2026-01-01", end_date: "2026-12-31" },
    // CTR-008: Anantara Kihavah
    { sub_contract_id: "CTR-008-001", request_type: "Management", discount_type: "Percentage", return_fare_usd: 100, one_way_fare_usd: 100, pax_condition: "Minor Hotels executive team", start_date: "2025-10-01", end_date: "2026-09-30" },
    { sub_contract_id: "CTR-008-001", request_type: "Tour Guides", discount_type: "Absolute", return_fare_usd: 200, one_way_fare_usd: 120, pax_condition: "Licensed Maldives tour guides", start_date: "2025-10-01", end_date: "2026-09-30" },
    // CTR-009: Ritz-Carlton Fari
    { sub_contract_id: "CTR-009-001", request_type: "Staff", discount_type: "Absolute", return_fare_usd: 100, one_way_fare_usd: 60, pax_condition: "RC staff with employee badge", start_date: "2025-11-01", end_date: "2026-10-31" },
    { sub_contract_id: "CTR-009-001", request_type: "Advertisers", discount_type: "Percentage", return_fare_usd: 60, one_way_fare_usd: 60, pax_condition: "Approved brand partners", start_date: "2025-11-01", end_date: "2026-10-31" },
  ];
  for (const p of specialPricing) { insertRow("pricing_special", p); }

  // ─── Contract Baggage ─────────────────────────────────────────────
  const baggageData = [
    { sub_contract_id: "CTR-001-001", parameter: "Checked baggage", value: "25 kg per adult", remark: "Soft bags preferred for seaplane" },
    { sub_contract_id: "CTR-001-001", parameter: "Hand baggage", value: "5 kg per person", remark: "Must fit under seat" },
    { sub_contract_id: "CTR-002-001", parameter: "Checked baggage", value: "25 kg per adult", remark: "Hard cases accepted" },
    { sub_contract_id: "CTR-003-001", parameter: "Checked baggage", value: "30 kg per adult", remark: "Charter allows heavier luggage" },
    { sub_contract_id: "CTR-003-001", parameter: "Excess baggage", value: "$5 per kg", remark: "Payable at check-in counter" },
    { sub_contract_id: "CTR-005-001", parameter: "Checked baggage", value: "25 kg per adult", remark: "Standard allowance" },
    { sub_contract_id: "CTR-006-001", parameter: "Checked baggage", value: "25 kg per adult", remark: "Soft bags strongly preferred" },
    { sub_contract_id: "CTR-006-001", parameter: "Hand baggage", value: "5 kg per person", remark: null },
    { sub_contract_id: "CTR-006-001", parameter: "Excess baggage", value: "$6 per kg", remark: "Subject to availability" },
    { sub_contract_id: "CTR-008-001", parameter: "Checked baggage", value: "32 kg per adult", remark: "Charter premium allowance" },
    { sub_contract_id: "CTR-008-001", parameter: "Sports equipment", value: "Pre-approval required", remark: "Surfboards, dive gear etc." },
    { sub_contract_id: "CTR-009-001", parameter: "Checked baggage", value: "20 kg per adult", remark: "Speedboat transfer" },
    { sub_contract_id: "CTR-010-001", parameter: "Checked baggage", value: "30 kg per adult", remark: "Soneva charter allowance" },
  ];
  for (const b of baggageData) { insertRow("contract_baggage", b); }

  // ─── Contract Booking ─────────────────────────────────────────────
  const bookingData = [
    { sub_contract_id: "CTR-001-001", parameter: "Advance booking", value: "48 hours minimum", remark: "Peak season may require 72 hours" },
    { sub_contract_id: "CTR-001-001", parameter: "Cancellation", value: "24 hours before departure", remark: "No-show fee: 50% of fare" },
    { sub_contract_id: "CTR-002-001", parameter: "Advance booking", value: "48 hours minimum", remark: null },
    { sub_contract_id: "CTR-002-001", parameter: "Cancellation", value: "24 hours before departure", remark: "100% refund if cancelled 48h prior" },
    { sub_contract_id: "CTR-003-001", parameter: "Charter booking", value: "72 hours minimum", remark: "Full manifest required 24h before" },
    { sub_contract_id: "CTR-005-001", parameter: "Advance booking", value: "48 hours minimum", remark: null },
    { sub_contract_id: "CTR-006-001", parameter: "Advance booking", value: "48 hours minimum", remark: "Online portal booking available" },
    { sub_contract_id: "CTR-006-001", parameter: "Cancellation", value: "24 hours before departure", remark: "No-show fee: 50% of fare" },
    { sub_contract_id: "CTR-006-001", parameter: "Amendment", value: "Free up to 12h before", remark: "Name changes $25 per pax" },
    { sub_contract_id: "CTR-007-001", parameter: "Advance booking", value: "24 hours minimum", remark: "Speedboat more flexible" },
    { sub_contract_id: "CTR-008-001", parameter: "Charter booking", value: "72 hours minimum", remark: "Full pax manifest 48h before" },
    { sub_contract_id: "CTR-008-001", parameter: "Cancellation", value: "48 hours before departure", remark: "50% penalty for late cancel" },
    { sub_contract_id: "CTR-009-001", parameter: "Advance booking", value: "24 hours minimum", remark: "Speedboat schedule" },
    { sub_contract_id: "CTR-010-001", parameter: "Charter booking", value: "72 hours minimum", remark: "Soneva concierge handles" },
  ];
  for (const b of bookingData) { insertRow("contract_booking", b); }

  // ─── Contract Age ─────────────────────────────────────────────────
  const ageData = [
    { sub_contract_id: "CTR-001-001", type: "Adult", min_age: 12, max_age: null },
    { sub_contract_id: "CTR-001-001", type: "Child", min_age: 2, max_age: 11 },
    { sub_contract_id: "CTR-002-001", type: "Adult", min_age: 12, max_age: null },
    { sub_contract_id: "CTR-002-001", type: "Child", min_age: 2, max_age: 11 },
    { sub_contract_id: "CTR-003-001", type: "Adult", min_age: 12, max_age: null },
    { sub_contract_id: "CTR-003-001", type: "Child", min_age: 2, max_age: 11 },
    { sub_contract_id: "CTR-005-001", type: "Adult", min_age: 12, max_age: null },
    { sub_contract_id: "CTR-005-001", type: "Child", min_age: 2, max_age: 11 },
    { sub_contract_id: "CTR-006-001", type: "Adult", min_age: 12, max_age: null },
    { sub_contract_id: "CTR-006-001", type: "Child", min_age: 2, max_age: 11 },
    { sub_contract_id: "CTR-007-001", type: "Adult", min_age: 13, max_age: null },
    { sub_contract_id: "CTR-007-001", type: "Child", min_age: 2, max_age: 12 },
    { sub_contract_id: "CTR-008-001", type: "Adult", min_age: 12, max_age: null },
    { sub_contract_id: "CTR-008-001", type: "Child", min_age: 2, max_age: 11 },
    { sub_contract_id: "CTR-009-001", type: "Adult", min_age: 12, max_age: null },
    { sub_contract_id: "CTR-009-001", type: "Child", min_age: 2, max_age: 11 },
    { sub_contract_id: "CTR-010-001", type: "Adult", min_age: 12, max_age: null },
    { sub_contract_id: "CTR-010-001", type: "Child", min_age: 2, max_age: 11 },
  ];
  for (const a of ageData) { insertRow("contract_age", a); }

  // ─── Contract Add-ons ─────────────────────────────────────────────
  const addonsData = [
    { sub_contract_id: "CTR-001-001", sub_category: "Dedicated Vehicle", type: "VIP Lounge Access", value: 150, remark: "Velana Airport VIP terminal" },
    { sub_contract_id: "CTR-001-001", sub_category: "Dedicated Vehicle", type: "Airport Transfer SUV", value: 85, remark: "Airport to seaplane terminal" },
    { sub_contract_id: "CTR-003-001", sub_category: "Dedicated Vehicle", type: "VIP Lounge Access", value: 200, remark: "Private charter lounge" },
    { sub_contract_id: "CTR-005-001", sub_category: "Dedicated Vehicle", type: "Airport Transfer SUV", value: 85, remark: null },
    { sub_contract_id: "CTR-006-001", sub_category: "Dedicated Vehicle", type: "VIP Lounge Access", value: 175, remark: "TMA Lounge included for suites" },
    { sub_contract_id: "CTR-006-001", sub_category: "Dedicated Vehicle", type: "Airport Transfer SUV", value: 90, remark: "Meet & greet included" },
    { sub_contract_id: "CTR-006-001", sub_category: "Photography", type: "Aerial Photography Package", value: 350, remark: "20-minute scenic flight with photographer" },
    { sub_contract_id: "CTR-008-001", sub_category: "Dedicated Vehicle", type: "VIP Lounge Access", value: 180, remark: "Anantara lounge" },
    { sub_contract_id: "CTR-008-001", sub_category: "Dedicated Vehicle", type: "Airport Transfer Van", value: 60, remark: "Group transfer vehicle" },
    { sub_contract_id: "CTR-009-001", sub_category: "Dedicated Vehicle", type: "Luxury Speedboat Upgrade", value: 250, remark: "Private yacht-style transfer" },
  ];
  for (const a of addonsData) { insertRow("contract_addons", a); }

  // ─── Contract Insurance ───────────────────────────────────────────
  const insuranceData = [
    { sub_contract_id: "CTR-001-001", parameter: "Insurance cover", value: "Yes", remark: "Included in transfer fare" },
    { sub_contract_id: "CTR-002-001", parameter: "Insurance cover", value: "Yes", remark: "Basic cover included" },
    { sub_contract_id: "CTR-003-001", parameter: "Insurance cover", value: "Yes", remark: "Charter insurance included" },
    { sub_contract_id: "CTR-004-001", parameter: "Insurance cover", value: "Yes", remark: "Comprehensive cover" },
    { sub_contract_id: "CTR-005-001", parameter: "Insurance cover", value: "Yes", remark: "Standard cover" },
    { sub_contract_id: "CTR-006-001", parameter: "Insurance cover", value: "Yes", remark: "Full coverage per TMA policy" },
    { sub_contract_id: "CTR-007-001", parameter: "Insurance cover", value: "Yes", remark: "Speedboat insurance included" },
    { sub_contract_id: "CTR-008-001", parameter: "Insurance cover", value: "Yes", remark: "Charter insurance included" },
    { sub_contract_id: "CTR-009-001", parameter: "Insurance cover", value: "Yes", remark: "Marine transit coverage" },
    { sub_contract_id: "CTR-010-001", parameter: "Insurance cover", value: "No", remark: "Resort arranges own cover" },
  ];
  for (const i of insuranceData) { insertRow("contract_insurance", i); }

  // ─── Government Charges ───────────────────────────────────────────
  const govCharges = [
    { sub_contract_id: "CTR-001-001", parameter: "Government_charges", value: 3.50, remark: "Return per pax excluding GST" },
    { sub_contract_id: "CTR-002-001", parameter: "Government_charges", value: 3.50, remark: "Return per pax excluding GST" },
    { sub_contract_id: "CTR-003-001", parameter: "Government_charges", value: 3.50, remark: "Per pax excluding GST" },
    { sub_contract_id: "CTR-005-001", parameter: "Government_charges", value: 3.50, remark: "Standard government levy" },
    { sub_contract_id: "CTR-006-001", parameter: "Government_charges", value: 3.50, remark: "Return per pax excluding GST" },
    { sub_contract_id: "CTR-007-001", parameter: "Government_charges", value: 2.00, remark: "Speedboat lower levy" },
    { sub_contract_id: "CTR-008-001", parameter: "Government_charges", value: 3.50, remark: "Per pax excluding GST" },
    { sub_contract_id: "CTR-009-001", parameter: "Government_charges", value: 2.00, remark: "Speedboat levy" },
    { sub_contract_id: "CTR-010-001", parameter: "Government_charges", value: 3.50, remark: "Per pax excluding GST" },
  ];
  for (const g of govCharges) { insertRow("contract_government_charges", g); }

  // ─── Fuel Surcharges ──────────────────────────────────────────────
  const fuelData = [
    { sub_contract_id: "CTR-001-001", type: "Fuel surcharge", value: "Included", remark: "Bundled into transfer fare" },
    { sub_contract_id: "CTR-002-001", type: "Fuel surcharge", value: "Included", remark: "Bundled into fare" },
    { sub_contract_id: "CTR-003-001", type: "Fuel surcharge", value: "$45 per flight hour", remark: "Variable based on Platts index" },
    { sub_contract_id: "CTR-006-001", type: "Fuel surcharge", value: "Included", remark: "Bundled into transfer fare" },
    { sub_contract_id: "CTR-008-001", type: "Fuel surcharge", value: "$50 per flight hour", remark: "Reviewed quarterly" },
    { sub_contract_id: "CTR-009-001", type: "Fuel surcharge", value: "$15 per trip", remark: "Speedboat fuel levy" },
    { sub_contract_id: "CTR-010-001", type: "Fuel surcharge", value: "$40 per flight hour", remark: "Based on Platts Singapore" },
  ];
  for (const f of fuelData) { insertRow("contract_fuel", f); }

  // ─── Payment Plan ─────────────────────────────────────────────────
  const paymentData = [
    { sub_contract_id: "CTR-001-001", parameter: "Payment terms", value: "Net 30 days", remark: "Monthly invoice cycle" },
    { sub_contract_id: "CTR-001-001", parameter: "Payment method", value: "Bank transfer / Wire", remark: "USD account at BML" },
    { sub_contract_id: "CTR-002-001", parameter: "Payment terms", value: "Net 30 days", remark: "Monthly billing" },
    { sub_contract_id: "CTR-003-001", parameter: "Payment terms", value: "Net 15 days", remark: "Charter prepayment required" },
    { sub_contract_id: "CTR-005-001", parameter: "Payment terms", value: "Net 30 days", remark: "Standard Marriott terms" },
    { sub_contract_id: "CTR-006-001", parameter: "Payment terms", value: "Net 30 days", remark: "Monthly invoice to FS finance" },
    { sub_contract_id: "CTR-006-001", parameter: "Payment method", value: "Bank transfer / Wire", remark: "USD or EUR accepted" },
    { sub_contract_id: "CTR-006-001", parameter: "Late payment", value: "1.5% per month", remark: "Applied after 45 days" },
    { sub_contract_id: "CTR-007-001", parameter: "Payment terms", value: "Net 30 days", remark: null },
    { sub_contract_id: "CTR-008-001", parameter: "Payment terms", value: "Net 15 days", remark: "Charter prepayment" },
    { sub_contract_id: "CTR-008-001", parameter: "Deposit", value: "20% upfront", remark: "Balance on monthly invoice" },
    { sub_contract_id: "CTR-009-001", parameter: "Payment terms", value: "Net 30 days", remark: "Marriott centralized billing" },
    { sub_contract_id: "CTR-010-001", parameter: "Payment terms", value: "Net 15 days", remark: "Charter prepayment" },
  ];
  for (const p of paymentData) { insertRow("contract_payment_plan", p); }

  // ─── Service Commitment ───────────────────────────────────────────
  const serviceData = [
    { sub_contract_id: "CTR-001-001", parameter: "Operating hours", value: "06:00 - 16:30", remark: "Daylight seaplane operations" },
    { sub_contract_id: "CTR-001-001", parameter: "Guaranteed seats", value: "40 seats/day", remark: "Peak season Nov-Apr" },
    { sub_contract_id: "CTR-002-001", parameter: "Operating hours", value: "06:00 - 16:30", remark: "Standard daylight hours" },
    { sub_contract_id: "CTR-003-001", parameter: "Dedicated aircraft", value: "1 DHC-6 Twin Otter", remark: "Charter dedicated asset" },
    { sub_contract_id: "CTR-005-001", parameter: "Operating hours", value: "06:00 - 16:30", remark: null },
    { sub_contract_id: "CTR-006-001", parameter: "Operating hours", value: "06:00 - 16:30", remark: "Daylight operations only" },
    { sub_contract_id: "CTR-006-001", parameter: "Guaranteed seats", value: "50 seats/day", remark: "Peak season commitment" },
    { sub_contract_id: "CTR-006-001", parameter: "Response time", value: "2 hours", remark: "Booking confirmation SLA" },
    { sub_contract_id: "CTR-007-001", parameter: "Operating hours", value: "06:00 - 22:00", remark: "Speedboat extended hours" },
    { sub_contract_id: "CTR-007-001", parameter: "Frequency", value: "Every 30 minutes", remark: "Peak hours 07:00-10:00, 14:00-17:00" },
    { sub_contract_id: "CTR-008-001", parameter: "Dedicated aircraft", value: "1 DHC-6 Twin Otter", remark: "Charter asset for Anantara" },
    { sub_contract_id: "CTR-008-001", parameter: "Operating hours", value: "06:00 - 16:30", remark: null },
    { sub_contract_id: "CTR-009-001", parameter: "Operating hours", value: "06:00 - 22:00", remark: "Speedboat schedule" },
    { sub_contract_id: "CTR-009-001", parameter: "Frequency", value: "Every 45 minutes", remark: "Fixed schedule" },
    { sub_contract_id: "CTR-010-001", parameter: "Dedicated aircraft", value: "1 DHC-6 Twin Otter", remark: "Soneva dedicated charter" },
  ];
  for (const s of serviceData) { insertRow("contract_service_commitment", s); }

  // ─── Termination ──────────────────────────────────────────────────
  const terminationData = [
    { sub_contract_id: "CTR-001-001", parameter: "Notice period", value: "90 days", remark: "Written notice required" },
    { sub_contract_id: "CTR-001-001", parameter: "Early termination fee", value: "3 months transfer revenue", remark: "Based on trailing average" },
    { sub_contract_id: "CTR-002-001", parameter: "Notice period", value: "90 days", remark: "Written notice" },
    { sub_contract_id: "CTR-003-001", parameter: "Notice period", value: "180 days", remark: "Charter requires longer notice" },
    { sub_contract_id: "CTR-005-001", parameter: "Notice period", value: "90 days", remark: "Standard Marriott terms" },
    { sub_contract_id: "CTR-006-001", parameter: "Notice period", value: "90 days", remark: "Written notice to both parties" },
    { sub_contract_id: "CTR-006-001", parameter: "Early termination fee", value: "3 months revenue", remark: "Trailing 3-month average" },
    { sub_contract_id: "CTR-006-001", parameter: "Force majeure", value: "No penalty", remark: "Natural disaster, pandemic, govt order" },
    { sub_contract_id: "CTR-007-001", parameter: "Notice period", value: "60 days", remark: "Speedboat shorter notice" },
    { sub_contract_id: "CTR-008-001", parameter: "Notice period", value: "180 days", remark: "Charter termination notice" },
    { sub_contract_id: "CTR-008-001", parameter: "Early termination fee", value: "6 months charter fees", remark: "Due to dedicated asset" },
    { sub_contract_id: "CTR-009-001", parameter: "Notice period", value: "60 days", remark: "Speedboat notice period" },
    { sub_contract_id: "CTR-010-001", parameter: "Notice period", value: "180 days", remark: "Charter notice" },
  ];
  for (const t of terminationData) { insertRow("contract_termination", t); }

  // ─── Contract Notes (HTML for rich text editor) ───────────────────
  const notesData = [
    { contract_id: contractIds["CTR-001"], content: "<h2>Waldorf Astoria Transfer Contract</h2><p>Premium seaplane transfer service for Waldorf Astoria Maldives Ithaafushi guests. <strong>Key highlights:</strong></p><ul><li>VIP lounge access included for suite guests</li><li>Dedicated check-in counter at TMA terminal</li><li>Priority boarding during peak season</li></ul><p>Contact: Reservations team at +960 400-0000</p>" },
    { contract_id: contractIds["CTR-002"], content: "<h2>St. Regis Vommuli Transfer</h2><p>Standard seaplane transfer contract. Flight time approximately <strong>45 minutes</strong> from Velana International Airport.</p><ul><li>Butler service coordination for arrivals</li><li>Weather delay protocol: speedboat backup if needed</li></ul>" },
    { contract_id: contractIds["CTR-003"], content: "<h2>Soneva Fushi Charter Agreement</h2><p>Dedicated charter service for Soneva Fushi resort. <strong>Aircraft:</strong> DHC-6 Twin Otter (19 seats).</p><ul><li>Aircraft branded with Soneva livery</li><li>Custom in-flight refreshments provided by resort</li><li>Flexible scheduling based on guest arrivals</li></ul><p><em>Renewal discussions to begin Q1 2026.</em></p>" },
    { contract_id: contractIds["CTR-004"], content: "<h2>Cheval Blanc - Expired Contract</h2><p>This contract expired on 31 Dec 2024. <strong>Status:</strong> Pending renewal negotiations.</p><p>LVMH team to provide updated terms by March 2025.</p>" },
    { contract_id: contractIds["CTR-005"], content: "<h2>Patina Maldives Transfer</h2><p>Transfer service for Patina Maldives, Fari Islands. Located in <strong>North Malé Atoll</strong> - shorter flight time (~20 min).</p><ul><li>Combined service with Ritz-Carlton Fari where possible</li><li>Shared lounge facilities at VIA</li></ul>" },
    { contract_id: contractIds["CTR-006"], content: "<h2>Four Seasons Landaa Giraavaru</h2><p>Premium seaplane service to Baa Atoll. <strong>Flight time:</strong> ~35 minutes.</p><ul><li>UNESCO Biosphere Reserve location - special approach required</li><li>Marine biology equipment transport arrangements in place</li><li>Peak season (Nov-Apr): 50 guaranteed seats daily</li><li>Aerial photography package available as add-on</li></ul><p>Account manager: Sarah Chen, FS Regional Office</p>" },
    { contract_id: contractIds["CTR-007"], content: "<h2>Four Seasons Kuda Huraa - Speedboat</h2><p>Speedboat transfer service. <strong>Duration:</strong> ~25 minutes from Velana Airport.</p><ul><li>Closest Four Seasons property to airport</li><li>Extended operating hours until 22:00</li><li>High-frequency service during peak hours</li></ul><p><em>Contract expiring soon - renewal terms under discussion.</em></p>" },
    { contract_id: contractIds["CTR-008"], content: "<h2>Anantara Kihavah Charter</h2><p>Charter agreement for Anantara Kihavah Villas, Baa Atoll. <strong>Includes:</strong></p><ul><li>Dedicated DHC-6 Twin Otter aircraft</li><li>Overwater observatory transfers for astronomy programme</li><li>Dive equipment transport arrangements</li></ul><p>Minor Hotels regional team oversees operations.</p>" },
    { contract_id: contractIds["CTR-009"], content: "<h2>Ritz-Carlton Fari Islands - Speedboat</h2><p>Speedboat transfer for The Ritz-Carlton Maldives, Fari Islands.</p><ul><li>Shared speedboat service with Patina Maldives (same island cluster)</li><li>Luxury speedboat upgrade available at $250 per trip</li><li>20-minute journey from Velana Airport</li></ul>" },
    { contract_id: contractIds["CTR-010"], content: "<h2>Soneva Jani - Expired Charter</h2><p>This charter contract expired on 28 Feb 2025. <strong>Status:</strong> Under renewal.</p><p>Soneva Group consolidating charter terms for both Fushi and Jani properties. New combined contract expected Q2 2025.</p>" },
  ];
  for (const n of notesData) { insertRow("contract_notes", n); }

  // Clear old destinations if any
  localStorage.removeItem(STORAGE_PREFIX + "destinations");
}
