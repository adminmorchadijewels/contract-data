/**
 * Generate seed data Excel files for TMA Contracts.
 * Run with: node scripts/generateSeedData.mjs
 *
 * Creates one .xlsx file per table in public/data/
 */
import * as XLSX from "xlsx";
import { randomUUID } from "crypto";
import { mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "../public/data");
mkdirSync(OUT_DIR, { recursive: true });

const ts = new Date().toISOString();

function rec(extra) {
  return { id: randomUUID(), created_at: ts, updated_at: ts, ...extra };
}

function writeTable(name, rows) {
  const wb = XLSX.utils.book_new();
  if (rows.length === 0) {
    const ws = XLSX.utils.aoa_to_sheet([]);
    XLSX.utils.book_append_sheet(wb, ws, name);
  } else {
    const flat = rows.map((row) => {
      const out = {};
      for (const [k, v] of Object.entries(row)) {
        out[k] = Array.isArray(v) ? JSON.stringify(v) : v;
      }
      return out;
    });
    const ws = XLSX.utils.json_to_sheet(flat);
    XLSX.utils.book_append_sheet(wb, ws, name);
  }
  XLSX.writeFile(wb, resolve(OUT_DIR, `${name}.xlsx`));
  console.log(`  ${name}.xlsx  (${rows.length} rows)`);
}

// ─── Atolls ──────────────────────────────────────────────────────────
const atolls = [
  "North Malé Atoll", "South Malé Atoll", "Baa Atoll", "Noonu Atoll",
  "Dhaalu Atoll", "Raa Atoll", "Lhaviyani Atoll", "Ari Atoll",
  "Meemu Atoll", "Laamu Atoll", "Gaafu Alifu Atoll", "Addu Atoll",
].map((name) => rec({ name }));

// ─── Groups ──────────────────────────────────────────────────────────
const groupSeed = [
  { name: "Marriott International", code: "MAR", address: "Bethesda, Maryland, USA", registration_no: "MI-2024-001", coordinates: "38.9807, -77.0962" },
  { name: "Soneva Group", code: "SON", address: "Bangkok, Thailand", registration_no: "SG-2024-002", coordinates: "13.7563, 100.5018" },
  { name: "LVMH Hospitality", code: "LVMH", address: "Paris, France", registration_no: "LV-2024-003", coordinates: "48.8566, 2.3522" },
  { name: "Four Seasons Hotels & Resorts", code: "FS", address: "Toronto, Ontario, Canada", registration_no: "FS-2024-004", coordinates: "43.6532, -79.3832" },
  { name: "Minor International (Anantara)", code: "MINT", address: "Bangkok, Thailand", registration_no: "MT-2024-005", coordinates: "13.7235, 100.5284" },
];
const groups = groupSeed.map((g) => rec({ ...g, type: "Group", atoll: "" }));
const gid = Object.fromEntries(groups.map((g) => [g.code, g.id]));

// ─── Resorts ─────────────────────────────────────────────────────────
const resortSeed = [
  { name: "Soneva Fushi", code: "SF", atoll: "Baa Atoll", address: "Kunfunadhoo Island, Baa Atoll, Maldives", registration_no: "SF-2024-R01", coordinates: "5.1100, 73.0700" },
  { name: "Waldorf Astoria Maldives Ithaafushi", code: "WAI", atoll: "South Malé Atoll", address: "Ithaafushi Island, South Malé Atoll, Maldives", registration_no: "WA-2024-R02", coordinates: "4.1500, 73.4200" },
  { name: "St. Regis Maldives Vommuli", code: "SRV", atoll: "Dhaalu Atoll", address: "Vommuli Island, Dhaalu Atoll, Maldives", registration_no: "SR-2024-R03", coordinates: "2.8200, 73.3900" },
  { name: "Patina Maldives Fari Islands", code: "PMF", atoll: "North Malé Atoll", address: "Fari Islands, North Malé Atoll, Maldives", registration_no: "PM-2024-R04", coordinates: "4.3100, 73.4800" },
  { name: "Cheval Blanc Randheli", code: "CBR", atoll: "Noonu Atoll", address: "Randheli Island, Noonu Atoll, Maldives", registration_no: "CB-2024-R05", coordinates: "5.7200, 73.0100" },
  { name: "Four Seasons Landaa Giraavaru", code: "FSLG", atoll: "Baa Atoll", address: "Landaa Giraavaru, Baa Atoll, Maldives", registration_no: "FL-2024-R06", coordinates: "5.2840, 73.0710" },
  { name: "Four Seasons Kuda Huraa", code: "FSKH", atoll: "North Malé Atoll", address: "Kuda Huraa Island, North Malé Atoll, Maldives", registration_no: "FK-2024-R07", coordinates: "4.3300, 73.5900" },
  { name: "Anantara Kihavah Maldives", code: "AKV", atoll: "Baa Atoll", address: "Kihavah Huravalhi, Baa Atoll, Maldives", registration_no: "AK-2024-R08", coordinates: "5.3050, 73.0690" },
  { name: "The Ritz-Carlton Maldives Fari Islands", code: "RCFI", atoll: "North Malé Atoll", address: "Fari Islands, North Malé Atoll, Maldives", registration_no: "RC-2024-R09", coordinates: "4.3150, 73.4750" },
  { name: "Soneva Jani", code: "SJ", atoll: "Noonu Atoll", address: "Medhufaru Island, Noonu Atoll, Maldives", registration_no: "SJ-2024-R10", coordinates: "5.7600, 73.3800" },
];
const resorts = resortSeed.map((r) => rec({ ...r, type: "Resort" }));
const rid = Object.fromEntries(resorts.map((r) => [r.code, r.id]));

const companies = [...groups, ...resorts];

// ─── Contracts ───────────────────────────────────────────────────────
// Today is ~2026-02-15. Statuses:
//   Active  = end date well after 2026-03-15
//   Expiring = end date between 2026-02-15 and 2026-03-17
//   Expired  = end date before 2026-02-15
//
// Multiple sub-contracts per parent contract where applicable.
// Mix of 1-year, 2-year, and 3-year contracts.
const allDays = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const contractSeed = [
  // CTR-001: Waldorf Astoria — 2 sub-contracts (Transfer + Charter) — EXPIRING
  { contract_id: "CTR-001", contract_code: "MAR-WAI-2025", carrier_id: "TMA101", group_id: gid.MAR, resort_id: rid.WAI, sub_contract_id: "CTR-001-001", sub_contract_type: "Transfer", start_date: "2025-01-01", end_date: "2026-03-01", agreement_type: "Exclusive Seaplane (Day time)" },
  { contract_id: "CTR-001", contract_code: "MAR-WAI-2025", carrier_id: "TMA101", group_id: gid.MAR, resort_id: rid.WAI, sub_contract_id: "CTR-001-002", sub_contract_type: "Charter", start_date: "2025-06-01", end_date: "2026-05-31", agreement_type: "Charter Agreement" },

  // CTR-002: St. Regis Vommuli — 1 sub-contract — ACTIVE (2-year)
  { contract_id: "CTR-002", contract_code: "MAR-SRV-2025", carrier_id: "TMA101", group_id: gid.MAR, resort_id: rid.SRV, sub_contract_id: "CTR-002-001", sub_contract_type: "Transfer", start_date: "2025-03-01", end_date: "2027-02-28", agreement_type: "Exclusive Seaplane (Day time)" },

  // CTR-003: Soneva Fushi — 3 sub-contracts (Charter + Transfer + Signed Charter) — ACTIVE
  { contract_id: "CTR-003", contract_code: "SON-SF-2025", carrier_id: "TMA101", group_id: gid.SON, resort_id: rid.SF, sub_contract_id: "CTR-003-001", sub_contract_type: "Charter", start_date: "2025-06-01", end_date: "2027-05-31", agreement_type: "Charter Agreement" },
  { contract_id: "CTR-003", contract_code: "SON-SF-2025", carrier_id: "TMA101", group_id: gid.SON, resort_id: rid.SF, sub_contract_id: "CTR-003-002", sub_contract_type: "Transfer", start_date: "2025-06-01", end_date: "2026-12-31", agreement_type: "Exclusive Seaplane (Day time)" },
  { contract_id: "CTR-003", contract_code: "SON-SF-2025", carrier_id: "TMA101", group_id: gid.SON, resort_id: rid.SF, sub_contract_id: "CTR-003-003", sub_contract_type: "Signed Charter", start_date: "2025-10-01", end_date: "2026-09-30", agreement_type: "Signed Charter Agreement" },

  // CTR-004: Cheval Blanc — 1 sub-contract — EXPIRED
  { contract_id: "CTR-004", contract_code: "LVMH-CBR-2024", carrier_id: "TMA101", group_id: gid.LVMH, resort_id: rid.CBR, sub_contract_id: "CTR-004-001", sub_contract_type: "Signed Charter", start_date: "2024-01-01", end_date: "2024-12-31", agreement_type: "Signed Charter Agreement" },

  // CTR-005: Patina Maldives — 2 sub-contracts (Transfer + Charter) — ACTIVE
  { contract_id: "CTR-005", contract_code: "MAR-PMF-2025", carrier_id: "TMA101", group_id: gid.MAR, resort_id: rid.PMF, sub_contract_id: "CTR-005-001", sub_contract_type: "Transfer", start_date: "2025-04-01", end_date: "2027-03-31", agreement_type: "Exclusive Seaplane (Day time)" },
  { contract_id: "CTR-005", contract_code: "MAR-PMF-2025", carrier_id: "TMA101", group_id: gid.MAR, resort_id: rid.PMF, sub_contract_id: "CTR-005-002", sub_contract_type: "Charter", start_date: "2025-11-01", end_date: "2026-10-31", agreement_type: "Charter Agreement" },

  // CTR-006: Four Seasons Landaa — 3 sub-contracts (Transfer + Charter + Signed Charter) — ACTIVE (3-year)
  { contract_id: "CTR-006", contract_code: "FS-FSLG-2025", carrier_id: "TMA101", group_id: gid.FS, resort_id: rid.FSLG, sub_contract_id: "CTR-006-001", sub_contract_type: "Transfer", start_date: "2025-01-01", end_date: "2027-12-31", agreement_type: "Exclusive Seaplane (Day time)" },
  { contract_id: "CTR-006", contract_code: "FS-FSLG-2025", carrier_id: "TMA101", group_id: gid.FS, resort_id: rid.FSLG, sub_contract_id: "CTR-006-002", sub_contract_type: "Charter", start_date: "2025-06-01", end_date: "2027-05-31", agreement_type: "Charter Agreement" },
  { contract_id: "CTR-006", contract_code: "FS-FSLG-2025", carrier_id: "TMA101", group_id: gid.FS, resort_id: rid.FSLG, sub_contract_id: "CTR-006-003", sub_contract_type: "Signed Charter", start_date: "2026-01-01", end_date: "2026-12-31", agreement_type: "Signed Charter Agreement" },

  // CTR-007: Four Seasons Kuda Huraa — 2 sub-contracts (Speedboat Transfer + Seaplane Transfer) — EXPIRING
  { contract_id: "CTR-007", contract_code: "FS-FSKH-2025", carrier_id: "TMA101", group_id: gid.FS, resort_id: rid.FSKH, sub_contract_id: "CTR-007-001", sub_contract_type: "Transfer", start_date: "2025-01-01", end_date: "2026-03-10", agreement_type: "Exclusive Speedboat" },
  { contract_id: "CTR-007", contract_code: "FS-FSKH-2025", carrier_id: "TMA101", group_id: gid.FS, resort_id: rid.FSKH, sub_contract_id: "CTR-007-002", sub_contract_type: "Transfer", start_date: "2025-01-01", end_date: "2026-03-10", agreement_type: "Exclusive Seaplane (Day time)" },

  // CTR-008: Anantara Kihavah — 2 sub-contracts (Charter + Transfer) — ACTIVE (2-year)
  { contract_id: "CTR-008", contract_code: "MINT-AKV-2025", carrier_id: "TMA101", group_id: gid.MINT, resort_id: rid.AKV, sub_contract_id: "CTR-008-001", sub_contract_type: "Charter", start_date: "2025-10-01", end_date: "2027-09-30", agreement_type: "Charter Agreement" },
  { contract_id: "CTR-008", contract_code: "MINT-AKV-2025", carrier_id: "TMA101", group_id: gid.MINT, resort_id: rid.AKV, sub_contract_id: "CTR-008-002", sub_contract_type: "Transfer", start_date: "2025-10-01", end_date: "2026-09-30", agreement_type: "Exclusive Seaplane (Day time)" },

  // CTR-009: Ritz-Carlton Fari — 1 sub-contract — ACTIVE
  { contract_id: "CTR-009", contract_code: "MAR-RCFI-2026", carrier_id: "TMA101", group_id: gid.MAR, resort_id: rid.RCFI, sub_contract_id: "CTR-009-001", sub_contract_type: "Transfer", start_date: "2025-11-01", end_date: "2026-10-31", agreement_type: "Exclusive Speedboat" },

  // CTR-010: Soneva Jani — 2 sub-contracts — EXPIRED
  { contract_id: "CTR-010", contract_code: "SON-SJ-2024", carrier_id: "TMA101", group_id: gid.SON, resort_id: rid.SJ, sub_contract_id: "CTR-010-001", sub_contract_type: "Charter", start_date: "2024-03-01", end_date: "2025-02-28", agreement_type: "Charter Agreement" },
  { contract_id: "CTR-010", contract_code: "SON-SJ-2024", carrier_id: "TMA101", group_id: gid.SON, resort_id: rid.SJ, sub_contract_id: "CTR-010-002", sub_contract_type: "Transfer", start_date: "2024-03-01", end_date: "2025-02-28", agreement_type: "Exclusive Seaplane (Day time)" },
];
const contracts = contractSeed.map((c) => rec(c));
const cid = Object.fromEntries(contracts.map((c) => [c.contract_id, c.id]));

// ─── Standard Pricing ────────────────────────────────────────────────
// Each sub-contract gets Adult + Child pricing
const pricing_standard = [
  // CTR-001-001 (WAI Transfer)
  { sub_contract_id: "CTR-001-001", weekdays: allDays, point_a_id: rid.WAI, point_b_id: rid.WAI, transfer_type: "Seaplane", pax_condition: "", passenger_type: "Adult", return_fare_usd: 680, one_way_fare_usd: 400, start_date: "2025-01-01", end_date: "2026-03-01" },
  { sub_contract_id: "CTR-001-001", weekdays: allDays, point_a_id: rid.WAI, point_b_id: rid.WAI, transfer_type: "Seaplane", pax_condition: "Age 2-11", passenger_type: "Child", return_fare_usd: 410, one_way_fare_usd: 240, start_date: "2025-01-01", end_date: "2026-03-01" },
  // CTR-001-002 (WAI Charter)
  { sub_contract_id: "CTR-001-002", weekdays: allDays, point_a_id: rid.WAI, point_b_id: rid.WAI, transfer_type: "Seaplane", pax_condition: "", passenger_type: "Adult", return_fare_usd: 850, one_way_fare_usd: 500, start_date: "2025-06-01", end_date: "2026-05-31" },
  { sub_contract_id: "CTR-001-002", weekdays: allDays, point_a_id: rid.WAI, point_b_id: rid.WAI, transfer_type: "Seaplane", pax_condition: "Age 2-11", passenger_type: "Child", return_fare_usd: 510, one_way_fare_usd: 300, start_date: "2025-06-01", end_date: "2026-05-31" },

  // CTR-002-001 (SRV Transfer)
  { sub_contract_id: "CTR-002-001", weekdays: allDays, point_a_id: rid.SRV, point_b_id: rid.SRV, transfer_type: "Seaplane", pax_condition: "", passenger_type: "Adult", return_fare_usd: 620, one_way_fare_usd: 370, start_date: "2025-03-01", end_date: "2027-02-28" },
  { sub_contract_id: "CTR-002-001", weekdays: allDays, point_a_id: rid.SRV, point_b_id: rid.SRV, transfer_type: "Seaplane", pax_condition: "Age 2-11", passenger_type: "Child", return_fare_usd: 370, one_way_fare_usd: 220, start_date: "2025-03-01", end_date: "2027-02-28" },

  // CTR-003-001 (SF Charter)
  { sub_contract_id: "CTR-003-001", weekdays: allDays, point_a_id: rid.SF, point_b_id: rid.SF, transfer_type: "Seaplane", pax_condition: "", passenger_type: "Adult", return_fare_usd: 750, one_way_fare_usd: 440, start_date: "2025-06-01", end_date: "2027-05-31" },
  { sub_contract_id: "CTR-003-001", weekdays: allDays, point_a_id: rid.SF, point_b_id: rid.SF, transfer_type: "Seaplane", pax_condition: "Age 2-11", passenger_type: "Child", return_fare_usd: 450, one_way_fare_usd: 264, start_date: "2025-06-01", end_date: "2027-05-31" },
  // CTR-003-002 (SF Transfer)
  { sub_contract_id: "CTR-003-002", weekdays: allDays, point_a_id: rid.SF, point_b_id: rid.SF, transfer_type: "Seaplane", pax_condition: "", passenger_type: "Adult", return_fare_usd: 600, one_way_fare_usd: 350, start_date: "2025-06-01", end_date: "2026-12-31" },
  { sub_contract_id: "CTR-003-002", weekdays: allDays, point_a_id: rid.SF, point_b_id: rid.SF, transfer_type: "Seaplane", pax_condition: "Age 2-11", passenger_type: "Child", return_fare_usd: 360, one_way_fare_usd: 210, start_date: "2025-06-01", end_date: "2026-12-31" },
  // CTR-003-003 (SF Signed Charter)
  { sub_contract_id: "CTR-003-003", weekdays: allDays, point_a_id: rid.SF, point_b_id: rid.SF, transfer_type: "Seaplane", pax_condition: "", passenger_type: "Adult", return_fare_usd: 900, one_way_fare_usd: 530, start_date: "2025-10-01", end_date: "2026-09-30" },
  { sub_contract_id: "CTR-003-003", weekdays: allDays, point_a_id: rid.SF, point_b_id: rid.SF, transfer_type: "Seaplane", pax_condition: "Age 2-11", passenger_type: "Child", return_fare_usd: 540, one_way_fare_usd: 318, start_date: "2025-10-01", end_date: "2026-09-30" },

  // CTR-004-001 (CBR Signed Charter) — Expired
  { sub_contract_id: "CTR-004-001", weekdays: allDays, point_a_id: rid.CBR, point_b_id: rid.CBR, transfer_type: "Seaplane", pax_condition: "", passenger_type: "Adult", return_fare_usd: 740, one_way_fare_usd: 440, start_date: "2024-01-01", end_date: "2024-12-31" },
  { sub_contract_id: "CTR-004-001", weekdays: allDays, point_a_id: rid.CBR, point_b_id: rid.CBR, transfer_type: "Seaplane", pax_condition: "Age 2-11", passenger_type: "Child", return_fare_usd: 440, one_way_fare_usd: 260, start_date: "2024-01-01", end_date: "2024-12-31" },

  // CTR-005-001 (PMF Transfer)
  { sub_contract_id: "CTR-005-001", weekdays: allDays, point_a_id: rid.PMF, point_b_id: rid.PMF, transfer_type: "Seaplane", pax_condition: "", passenger_type: "Adult", return_fare_usd: 590, one_way_fare_usd: 345, start_date: "2025-04-01", end_date: "2027-03-31" },
  { sub_contract_id: "CTR-005-001", weekdays: allDays, point_a_id: rid.PMF, point_b_id: rid.PMF, transfer_type: "Seaplane", pax_condition: "Age 2-11", passenger_type: "Child", return_fare_usd: 355, one_way_fare_usd: 207, start_date: "2025-04-01", end_date: "2027-03-31" },
  // CTR-005-002 (PMF Charter)
  { sub_contract_id: "CTR-005-002", weekdays: allDays, point_a_id: rid.PMF, point_b_id: rid.PMF, transfer_type: "Seaplane", pax_condition: "", passenger_type: "Adult", return_fare_usd: 780, one_way_fare_usd: 460, start_date: "2025-11-01", end_date: "2026-10-31" },
  { sub_contract_id: "CTR-005-002", weekdays: allDays, point_a_id: rid.PMF, point_b_id: rid.PMF, transfer_type: "Seaplane", pax_condition: "Age 2-11", passenger_type: "Child", return_fare_usd: 468, one_way_fare_usd: 276, start_date: "2025-11-01", end_date: "2026-10-31" },

  // CTR-006-001 (FSLG Transfer)
  { sub_contract_id: "CTR-006-001", weekdays: allDays, point_a_id: rid.FSLG, point_b_id: rid.FSLG, transfer_type: "Seaplane", pax_condition: "", passenger_type: "Adult", return_fare_usd: 640, one_way_fare_usd: 380, start_date: "2025-01-01", end_date: "2027-12-31" },
  { sub_contract_id: "CTR-006-001", weekdays: allDays, point_a_id: rid.FSLG, point_b_id: rid.FSLG, transfer_type: "Seaplane", pax_condition: "Age 2-11", passenger_type: "Child", return_fare_usd: 385, one_way_fare_usd: 228, start_date: "2025-01-01", end_date: "2027-12-31" },
  // CTR-006-002 (FSLG Charter)
  { sub_contract_id: "CTR-006-002", weekdays: allDays, point_a_id: rid.FSLG, point_b_id: rid.FSLG, transfer_type: "Seaplane", pax_condition: "", passenger_type: "Adult", return_fare_usd: 820, one_way_fare_usd: 485, start_date: "2025-06-01", end_date: "2027-05-31" },
  { sub_contract_id: "CTR-006-002", weekdays: allDays, point_a_id: rid.FSLG, point_b_id: rid.FSLG, transfer_type: "Seaplane", pax_condition: "Age 2-11", passenger_type: "Child", return_fare_usd: 492, one_way_fare_usd: 291, start_date: "2025-06-01", end_date: "2027-05-31" },
  // CTR-006-003 (FSLG Signed Charter)
  { sub_contract_id: "CTR-006-003", weekdays: allDays, point_a_id: rid.FSLG, point_b_id: rid.FSLG, transfer_type: "Seaplane", pax_condition: "", passenger_type: "Adult", return_fare_usd: 950, one_way_fare_usd: 560, start_date: "2026-01-01", end_date: "2026-12-31" },
  { sub_contract_id: "CTR-006-003", weekdays: allDays, point_a_id: rid.FSLG, point_b_id: rid.FSLG, transfer_type: "Seaplane", pax_condition: "Age 2-11", passenger_type: "Child", return_fare_usd: 570, one_way_fare_usd: 336, start_date: "2026-01-01", end_date: "2026-12-31" },

  // CTR-007-001 (FSKH Speedboat Transfer)
  { sub_contract_id: "CTR-007-001", weekdays: allDays, point_a_id: rid.FSKH, point_b_id: rid.FSKH, transfer_type: "Speedboat", pax_condition: "", passenger_type: "Adult", return_fare_usd: 320, one_way_fare_usd: 190, start_date: "2025-01-01", end_date: "2026-03-10" },
  { sub_contract_id: "CTR-007-001", weekdays: allDays, point_a_id: rid.FSKH, point_b_id: rid.FSKH, transfer_type: "Speedboat", pax_condition: "Age 2-11", passenger_type: "Child", return_fare_usd: 190, one_way_fare_usd: 115, start_date: "2025-01-01", end_date: "2026-03-10" },
  // CTR-007-002 (FSKH Seaplane Transfer)
  { sub_contract_id: "CTR-007-002", weekdays: allDays, point_a_id: rid.FSKH, point_b_id: rid.FSKH, transfer_type: "Seaplane", pax_condition: "", passenger_type: "Adult", return_fare_usd: 520, one_way_fare_usd: 310, start_date: "2025-01-01", end_date: "2026-03-10" },
  { sub_contract_id: "CTR-007-002", weekdays: allDays, point_a_id: rid.FSKH, point_b_id: rid.FSKH, transfer_type: "Seaplane", pax_condition: "Age 2-11", passenger_type: "Child", return_fare_usd: 312, one_way_fare_usd: 186, start_date: "2025-01-01", end_date: "2026-03-10" },

  // CTR-008-001 (AKV Charter)
  { sub_contract_id: "CTR-008-001", weekdays: allDays, point_a_id: rid.AKV, point_b_id: rid.AKV, transfer_type: "Seaplane", pax_condition: "", passenger_type: "Adult", return_fare_usd: 660, one_way_fare_usd: 390, start_date: "2025-10-01", end_date: "2027-09-30" },
  { sub_contract_id: "CTR-008-001", weekdays: allDays, point_a_id: rid.AKV, point_b_id: rid.AKV, transfer_type: "Seaplane", pax_condition: "Age 2-11", passenger_type: "Child", return_fare_usd: 395, one_way_fare_usd: 234, start_date: "2025-10-01", end_date: "2027-09-30" },
  // CTR-008-002 (AKV Transfer)
  { sub_contract_id: "CTR-008-002", weekdays: allDays, point_a_id: rid.AKV, point_b_id: rid.AKV, transfer_type: "Seaplane", pax_condition: "", passenger_type: "Adult", return_fare_usd: 580, one_way_fare_usd: 340, start_date: "2025-10-01", end_date: "2026-09-30" },
  { sub_contract_id: "CTR-008-002", weekdays: allDays, point_a_id: rid.AKV, point_b_id: rid.AKV, transfer_type: "Seaplane", pax_condition: "Age 2-11", passenger_type: "Child", return_fare_usd: 348, one_way_fare_usd: 204, start_date: "2025-10-01", end_date: "2026-09-30" },

  // CTR-009-001 (RCFI Speedboat Transfer)
  { sub_contract_id: "CTR-009-001", weekdays: allDays, point_a_id: rid.RCFI, point_b_id: rid.RCFI, transfer_type: "Speedboat", pax_condition: "", passenger_type: "Adult", return_fare_usd: 350, one_way_fare_usd: 210, start_date: "2025-11-01", end_date: "2026-10-31" },
  { sub_contract_id: "CTR-009-001", weekdays: allDays, point_a_id: rid.RCFI, point_b_id: rid.RCFI, transfer_type: "Speedboat", pax_condition: "Age 2-11", passenger_type: "Child", return_fare_usd: 210, one_way_fare_usd: 125, start_date: "2025-11-01", end_date: "2026-10-31" },

  // CTR-010-001 (SJ Charter) — Expired
  { sub_contract_id: "CTR-010-001", weekdays: allDays, point_a_id: rid.SJ, point_b_id: rid.SJ, transfer_type: "Seaplane", pax_condition: "", passenger_type: "Adult", return_fare_usd: 710, one_way_fare_usd: 420, start_date: "2024-03-01", end_date: "2025-02-28" },
  { sub_contract_id: "CTR-010-001", weekdays: allDays, point_a_id: rid.SJ, point_b_id: rid.SJ, transfer_type: "Seaplane", pax_condition: "Age 2-11", passenger_type: "Child", return_fare_usd: 425, one_way_fare_usd: 252, start_date: "2024-03-01", end_date: "2025-02-28" },
  // CTR-010-002 (SJ Transfer) — Expired
  { sub_contract_id: "CTR-010-002", weekdays: allDays, point_a_id: rid.SJ, point_b_id: rid.SJ, transfer_type: "Seaplane", pax_condition: "", passenger_type: "Adult", return_fare_usd: 550, one_way_fare_usd: 325, start_date: "2024-03-01", end_date: "2025-02-28" },
  { sub_contract_id: "CTR-010-002", weekdays: allDays, point_a_id: rid.SJ, point_b_id: rid.SJ, transfer_type: "Seaplane", pax_condition: "Age 2-11", passenger_type: "Child", return_fare_usd: 330, one_way_fare_usd: 195, start_date: "2024-03-01", end_date: "2025-02-28" },
].map((r) => rec(r));

// ─── Special Pricing ─────────────────────────────────────────────────
const pricing_special = [
  { sub_contract_id: "CTR-001-001", request_type: "Management", discount_type: "Percentage", return_fare_usd: 100, one_way_fare_usd: 100, pax_condition: "Hotel GM and above", start_date: "2025-01-01", end_date: "2026-03-01" },
  { sub_contract_id: "CTR-001-001", request_type: "Staff", discount_type: "Absolute", return_fare_usd: 150, one_way_fare_usd: 90, pax_condition: "Resort staff with valid ID", start_date: "2025-01-01", end_date: "2026-03-01" },
  { sub_contract_id: "CTR-001-002", request_type: "VIP Guest", discount_type: "Percentage", return_fare_usd: 80, one_way_fare_usd: 80, pax_condition: "Platinum loyalty members", start_date: "2025-06-01", end_date: "2026-05-31" },
  { sub_contract_id: "CTR-002-001", request_type: "FAM trips", discount_type: "Percentage", return_fare_usd: 50, one_way_fare_usd: 50, pax_condition: "Approved travel agents only", start_date: "2025-03-01", end_date: "2027-02-28" },
  { sub_contract_id: "CTR-003-001", request_type: "Management", discount_type: "Percentage", return_fare_usd: 100, one_way_fare_usd: 100, pax_condition: "Soneva executives", start_date: "2025-06-01", end_date: "2027-05-31" },
  { sub_contract_id: "CTR-003-001", request_type: "Journalists", discount_type: "Percentage", return_fare_usd: 75, one_way_fare_usd: 75, pax_condition: "Pre-approved media only", start_date: "2025-06-01", end_date: "2027-05-31" },
  { sub_contract_id: "CTR-003-002", request_type: "Staff", discount_type: "Absolute", return_fare_usd: 120, one_way_fare_usd: 70, pax_condition: "Soneva staff", start_date: "2025-06-01", end_date: "2026-12-31" },
  { sub_contract_id: "CTR-003-003", request_type: "Management", discount_type: "Percentage", return_fare_usd: 100, one_way_fare_usd: 100, pax_condition: "Soneva board members", start_date: "2025-10-01", end_date: "2026-09-30" },
  { sub_contract_id: "CTR-005-001", request_type: "Tour Operators", discount_type: "Absolute", return_fare_usd: 490, one_way_fare_usd: 285, pax_condition: "Min 10 pax per group", start_date: "2025-04-01", end_date: "2027-03-31" },
  { sub_contract_id: "CTR-005-002", request_type: "Management", discount_type: "Percentage", return_fare_usd: 100, one_way_fare_usd: 100, pax_condition: "Marriott VP and above", start_date: "2025-11-01", end_date: "2026-10-31" },
  { sub_contract_id: "CTR-006-001", request_type: "Management", discount_type: "Percentage", return_fare_usd: 100, one_way_fare_usd: 100, pax_condition: "FS executives", start_date: "2025-01-01", end_date: "2027-12-31" },
  { sub_contract_id: "CTR-006-001", request_type: "Staff", discount_type: "Absolute", return_fare_usd: 160, one_way_fare_usd: 95, pax_condition: "Resort staff", start_date: "2025-01-01", end_date: "2027-12-31" },
  { sub_contract_id: "CTR-006-001", request_type: "FAM trips", discount_type: "Percentage", return_fare_usd: 50, one_way_fare_usd: 50, pax_condition: "Approved agents", start_date: "2025-01-01", end_date: "2027-12-31" },
  { sub_contract_id: "CTR-006-002", request_type: "Journalists", discount_type: "Percentage", return_fare_usd: 70, one_way_fare_usd: 70, pax_condition: "Accredited media", start_date: "2025-06-01", end_date: "2027-05-31" },
  { sub_contract_id: "CTR-006-003", request_type: "VIP Guest", discount_type: "Percentage", return_fare_usd: 85, one_way_fare_usd: 85, pax_condition: "FS Private Jet guests", start_date: "2026-01-01", end_date: "2026-12-31" },
  { sub_contract_id: "CTR-008-001", request_type: "Management", discount_type: "Percentage", return_fare_usd: 100, one_way_fare_usd: 100, pax_condition: "Minor Hotels executive team", start_date: "2025-10-01", end_date: "2027-09-30" },
  { sub_contract_id: "CTR-008-001", request_type: "Tour Guides", discount_type: "Absolute", return_fare_usd: 200, one_way_fare_usd: 120, pax_condition: "Licensed Maldives tour guides", start_date: "2025-10-01", end_date: "2027-09-30" },
  { sub_contract_id: "CTR-008-002", request_type: "Staff", discount_type: "Absolute", return_fare_usd: 140, one_way_fare_usd: 85, pax_condition: "Anantara resort staff", start_date: "2025-10-01", end_date: "2026-09-30" },
  { sub_contract_id: "CTR-009-001", request_type: "Staff", discount_type: "Absolute", return_fare_usd: 100, one_way_fare_usd: 60, pax_condition: "RC staff with employee badge", start_date: "2025-11-01", end_date: "2026-10-31" },
  { sub_contract_id: "CTR-009-001", request_type: "Advertisers", discount_type: "Percentage", return_fare_usd: 60, one_way_fare_usd: 60, pax_condition: "Approved brand partners", start_date: "2025-11-01", end_date: "2026-10-31" },
].map((r) => rec(r));

// ─── Contract Baggage ────────────────────────────────────────────────
const contract_baggage = [
  { sub_contract_id: "CTR-001-001", parameter: "Checked baggage", value: "25 kg per adult", remark: "Soft bags preferred for seaplane" },
  { sub_contract_id: "CTR-001-001", parameter: "Hand baggage", value: "5 kg per person", remark: "Must fit under seat" },
  { sub_contract_id: "CTR-001-002", parameter: "Checked baggage", value: "30 kg per adult", remark: "Charter premium allowance" },
  { sub_contract_id: "CTR-001-002", parameter: "Hand baggage", value: "7 kg per person", remark: "Charter cabin allowance" },
  { sub_contract_id: "CTR-002-001", parameter: "Checked baggage", value: "25 kg per adult", remark: "Hard cases accepted" },
  { sub_contract_id: "CTR-002-001", parameter: "Hand baggage", value: "5 kg per person", remark: "" },
  { sub_contract_id: "CTR-003-001", parameter: "Checked baggage", value: "32 kg per adult", remark: "Soneva charter allows heavier luggage" },
  { sub_contract_id: "CTR-003-001", parameter: "Excess baggage", value: "$5 per kg", remark: "Payable at check-in counter" },
  { sub_contract_id: "CTR-003-002", parameter: "Checked baggage", value: "25 kg per adult", remark: "Standard seaplane allowance" },
  { sub_contract_id: "CTR-003-003", parameter: "Checked baggage", value: "35 kg per adult", remark: "Signed charter premium" },
  { sub_contract_id: "CTR-003-003", parameter: "Sports equipment", value: "Pre-approval required", remark: "Diving, surfing gear" },
  { sub_contract_id: "CTR-005-001", parameter: "Checked baggage", value: "25 kg per adult", remark: "Standard allowance" },
  { sub_contract_id: "CTR-005-002", parameter: "Checked baggage", value: "30 kg per adult", remark: "Charter allowance" },
  { sub_contract_id: "CTR-006-001", parameter: "Checked baggage", value: "25 kg per adult", remark: "Soft bags strongly preferred" },
  { sub_contract_id: "CTR-006-001", parameter: "Hand baggage", value: "5 kg per person", remark: "" },
  { sub_contract_id: "CTR-006-001", parameter: "Excess baggage", value: "$6 per kg", remark: "Subject to availability" },
  { sub_contract_id: "CTR-006-002", parameter: "Checked baggage", value: "30 kg per adult", remark: "Charter allowance" },
  { sub_contract_id: "CTR-006-003", parameter: "Checked baggage", value: "35 kg per adult", remark: "Signed charter premium" },
  { sub_contract_id: "CTR-007-001", parameter: "Checked baggage", value: "20 kg per adult", remark: "Speedboat weight restrictions" },
  { sub_contract_id: "CTR-007-002", parameter: "Checked baggage", value: "25 kg per adult", remark: "Standard seaplane" },
  { sub_contract_id: "CTR-008-001", parameter: "Checked baggage", value: "32 kg per adult", remark: "Charter premium allowance" },
  { sub_contract_id: "CTR-008-001", parameter: "Sports equipment", value: "Pre-approval required", remark: "Surfboards, dive gear etc." },
  { sub_contract_id: "CTR-008-002", parameter: "Checked baggage", value: "25 kg per adult", remark: "Standard seaplane" },
  { sub_contract_id: "CTR-009-001", parameter: "Checked baggage", value: "20 kg per adult", remark: "Speedboat transfer" },
  { sub_contract_id: "CTR-010-001", parameter: "Checked baggage", value: "30 kg per adult", remark: "Soneva charter allowance" },
  { sub_contract_id: "CTR-010-002", parameter: "Checked baggage", value: "25 kg per adult", remark: "Standard seaplane" },
].map((r) => rec(r));

// ─── Contract Booking ────────────────────────────────────────────────
const contract_booking = [
  { sub_contract_id: "CTR-001-001", parameter: "Advance booking", value: "48 hours minimum", remark: "Peak season may require 72 hours" },
  { sub_contract_id: "CTR-001-001", parameter: "Cancellation", value: "24 hours before departure", remark: "No-show fee: 50% of fare" },
  { sub_contract_id: "CTR-001-002", parameter: "Charter booking", value: "72 hours minimum", remark: "Full manifest required 24h before" },
  { sub_contract_id: "CTR-002-001", parameter: "Advance booking", value: "48 hours minimum", remark: "" },
  { sub_contract_id: "CTR-002-001", parameter: "Cancellation", value: "24 hours before departure", remark: "100% refund if cancelled 48h prior" },
  { sub_contract_id: "CTR-003-001", parameter: "Charter booking", value: "72 hours minimum", remark: "Full manifest required 24h before" },
  { sub_contract_id: "CTR-003-002", parameter: "Advance booking", value: "48 hours minimum", remark: "" },
  { sub_contract_id: "CTR-003-003", parameter: "Signed charter booking", value: "96 hours minimum", remark: "Requires Soneva GM approval" },
  { sub_contract_id: "CTR-005-001", parameter: "Advance booking", value: "48 hours minimum", remark: "" },
  { sub_contract_id: "CTR-005-002", parameter: "Charter booking", value: "72 hours minimum", remark: "Marriott group coordination" },
  { sub_contract_id: "CTR-006-001", parameter: "Advance booking", value: "48 hours minimum", remark: "Online portal booking available" },
  { sub_contract_id: "CTR-006-001", parameter: "Cancellation", value: "24 hours before departure", remark: "No-show fee: 50% of fare" },
  { sub_contract_id: "CTR-006-001", parameter: "Amendment", value: "Free up to 12h before", remark: "Name changes $25 per pax" },
  { sub_contract_id: "CTR-006-002", parameter: "Charter booking", value: "72 hours minimum", remark: "Full manifest 48h before" },
  { sub_contract_id: "CTR-006-003", parameter: "Signed charter booking", value: "96 hours minimum", remark: "FS Regional approval required" },
  { sub_contract_id: "CTR-007-001", parameter: "Advance booking", value: "24 hours minimum", remark: "Speedboat more flexible" },
  { sub_contract_id: "CTR-007-002", parameter: "Advance booking", value: "48 hours minimum", remark: "Seaplane requires more notice" },
  { sub_contract_id: "CTR-008-001", parameter: "Charter booking", value: "72 hours minimum", remark: "Full pax manifest 48h before" },
  { sub_contract_id: "CTR-008-001", parameter: "Cancellation", value: "48 hours before departure", remark: "50% penalty for late cancel" },
  { sub_contract_id: "CTR-008-002", parameter: "Advance booking", value: "48 hours minimum", remark: "" },
  { sub_contract_id: "CTR-009-001", parameter: "Advance booking", value: "24 hours minimum", remark: "Speedboat schedule" },
  { sub_contract_id: "CTR-010-001", parameter: "Charter booking", value: "72 hours minimum", remark: "Soneva concierge handles" },
  { sub_contract_id: "CTR-010-002", parameter: "Advance booking", value: "48 hours minimum", remark: "" },
].map((r) => rec(r));

// ─── Contract Age ────────────────────────────────────────────────────
// All sub-contracts get Adult + Child age definitions
const allSubIds = [
  "CTR-001-001","CTR-001-002","CTR-002-001",
  "CTR-003-001","CTR-003-002","CTR-003-003",
  "CTR-004-001","CTR-005-001","CTR-005-002",
  "CTR-006-001","CTR-006-002","CTR-006-003",
  "CTR-007-001","CTR-007-002","CTR-008-001","CTR-008-002",
  "CTR-009-001","CTR-010-001","CTR-010-002",
];
const contract_age = allSubIds.flatMap((sid) => [
  { sub_contract_id: sid, type: "Adult", min_age: sid.startsWith("CTR-007") ? 13 : 12, max_age: "" },
  { sub_contract_id: sid, type: "Child", min_age: 2, max_age: sid.startsWith("CTR-007") ? 12 : 11 },
]).map((r) => rec(r));

// ─── Contract Add-ons ────────────────────────────────────────────────
const contract_addons = [
  { sub_contract_id: "CTR-001-001", sub_category: "Dedicated Vehicle", type: "VIP Lounge Access", value: 150, remark: "Velana Airport VIP terminal" },
  { sub_contract_id: "CTR-001-001", sub_category: "Dedicated Vehicle", type: "Airport Transfer SUV", value: 85, remark: "Airport to seaplane terminal" },
  { sub_contract_id: "CTR-001-002", sub_category: "Photography", type: "Aerial Photography Package", value: 400, remark: "Charter scenic flight with photographer" },
  { sub_contract_id: "CTR-003-001", sub_category: "Dedicated Vehicle", type: "VIP Lounge Access", value: 200, remark: "Private charter lounge" },
  { sub_contract_id: "CTR-003-003", sub_category: "Dedicated Vehicle", type: "Luxury Transfer", value: 300, remark: "Yacht transfer from airport" },
  { sub_contract_id: "CTR-005-001", sub_category: "Dedicated Vehicle", type: "Airport Transfer SUV", value: 85, remark: "" },
  { sub_contract_id: "CTR-005-002", sub_category: "Dedicated Vehicle", type: "VIP Lounge Access", value: 175, remark: "Marriott Bonvoy Platinum lounge" },
  { sub_contract_id: "CTR-006-001", sub_category: "Dedicated Vehicle", type: "VIP Lounge Access", value: 175, remark: "TMA Lounge included for suites" },
  { sub_contract_id: "CTR-006-001", sub_category: "Dedicated Vehicle", type: "Airport Transfer SUV", value: 90, remark: "Meet & greet included" },
  { sub_contract_id: "CTR-006-002", sub_category: "Photography", type: "Aerial Photography Package", value: 350, remark: "20-minute scenic flight with photographer" },
  { sub_contract_id: "CTR-006-003", sub_category: "Dedicated Vehicle", type: "Luxury Yacht Transfer", value: 500, remark: "Signed charter luxury option" },
  { sub_contract_id: "CTR-008-001", sub_category: "Dedicated Vehicle", type: "VIP Lounge Access", value: 180, remark: "Anantara lounge" },
  { sub_contract_id: "CTR-008-001", sub_category: "Dedicated Vehicle", type: "Airport Transfer Van", value: 60, remark: "Group transfer vehicle" },
  { sub_contract_id: "CTR-008-002", sub_category: "Photography", type: "Sunset Scenic Flight", value: 280, remark: "30-min scenic flight at golden hour" },
  { sub_contract_id: "CTR-009-001", sub_category: "Dedicated Vehicle", type: "Luxury Speedboat Upgrade", value: 250, remark: "Private yacht-style transfer" },
  { sub_contract_id: "CTR-010-001", sub_category: "Dedicated Vehicle", type: "VIP Lounge Access", value: 190, remark: "Soneva private lounge" },
].map((r) => rec(r));

// ─── Contract Insurance ──────────────────────────────────────────────
const contract_insurance = allSubIds.map((sid) => ({
  sub_contract_id: sid,
  parameter: "Insurance cover",
  value: sid === "CTR-010-001" ? "No" : "Yes",
  remark: sid === "CTR-010-001" ? "Resort arranges own cover" :
    sid.includes("007") ? "Marine transit coverage" :
    sid.includes("-002") && !sid.startsWith("CTR-010") ? "Standard cover" :
    "Included in fare",
})).map((r) => rec(r));

// ─── Government Charges ──────────────────────────────────────────────
const contract_government_charges = allSubIds.map((sid) => ({
  sub_contract_id: sid,
  parameter: "Government_charges",
  value: (sid === "CTR-007-001" || sid === "CTR-009-001") ? 2.00 : 3.50,
  remark: (sid === "CTR-007-001" || sid === "CTR-009-001")
    ? "Speedboat lower levy"
    : "Return per pax excluding GST",
})).map((r) => rec(r));

// ─── Fuel ────────────────────────────────────────────────────────────
const contract_fuel = [
  { sub_contract_id: "CTR-001-001", type: "Fuel surcharge", value: "Included", remark: "Bundled into transfer fare" },
  { sub_contract_id: "CTR-001-002", type: "Fuel surcharge", value: "$48 per flight hour", remark: "Charter fuel variable" },
  { sub_contract_id: "CTR-002-001", type: "Fuel surcharge", value: "Included", remark: "Bundled into fare" },
  { sub_contract_id: "CTR-003-001", type: "Fuel surcharge", value: "$45 per flight hour", remark: "Variable based on Platts index" },
  { sub_contract_id: "CTR-003-002", type: "Fuel surcharge", value: "Included", remark: "Bundled into fare" },
  { sub_contract_id: "CTR-003-003", type: "Fuel surcharge", value: "$52 per flight hour", remark: "Signed charter premium rate" },
  { sub_contract_id: "CTR-005-001", type: "Fuel surcharge", value: "Included", remark: "Bundled" },
  { sub_contract_id: "CTR-005-002", type: "Fuel surcharge", value: "$46 per flight hour", remark: "Charter rate" },
  { sub_contract_id: "CTR-006-001", type: "Fuel surcharge", value: "Included", remark: "Bundled into transfer fare" },
  { sub_contract_id: "CTR-006-002", type: "Fuel surcharge", value: "$47 per flight hour", remark: "Charter fuel" },
  { sub_contract_id: "CTR-006-003", type: "Fuel surcharge", value: "$55 per flight hour", remark: "Signed charter premium" },
  { sub_contract_id: "CTR-007-001", type: "Fuel surcharge", value: "$15 per trip", remark: "Speedboat fuel levy" },
  { sub_contract_id: "CTR-007-002", type: "Fuel surcharge", value: "Included", remark: "Seaplane fare inclusive" },
  { sub_contract_id: "CTR-008-001", type: "Fuel surcharge", value: "$50 per flight hour", remark: "Reviewed quarterly" },
  { sub_contract_id: "CTR-008-002", type: "Fuel surcharge", value: "Included", remark: "Bundled" },
  { sub_contract_id: "CTR-009-001", type: "Fuel surcharge", value: "$15 per trip", remark: "Speedboat fuel levy" },
  { sub_contract_id: "CTR-010-001", type: "Fuel surcharge", value: "$40 per flight hour", remark: "Based on Platts Singapore" },
  { sub_contract_id: "CTR-010-002", type: "Fuel surcharge", value: "Included", remark: "Bundled" },
].map((r) => rec(r));

// ─── Payment Plan ────────────────────────────────────────────────────
const contract_payment_plan = [
  { sub_contract_id: "CTR-001-001", parameter: "Payment terms", value: "Net 30 days", remark: "Monthly invoice cycle" },
  { sub_contract_id: "CTR-001-001", parameter: "Payment method", value: "Bank transfer / Wire", remark: "USD account at BML" },
  { sub_contract_id: "CTR-001-002", parameter: "Payment terms", value: "Net 15 days", remark: "Charter prepayment" },
  { sub_contract_id: "CTR-002-001", parameter: "Payment terms", value: "Net 30 days", remark: "Monthly billing" },
  { sub_contract_id: "CTR-003-001", parameter: "Payment terms", value: "Net 15 days", remark: "Charter prepayment required" },
  { sub_contract_id: "CTR-003-002", parameter: "Payment terms", value: "Net 30 days", remark: "Monthly billing" },
  { sub_contract_id: "CTR-003-003", parameter: "Payment terms", value: "Prepaid", remark: "Full payment before flight" },
  { sub_contract_id: "CTR-005-001", parameter: "Payment terms", value: "Net 30 days", remark: "Standard Marriott terms" },
  { sub_contract_id: "CTR-005-002", parameter: "Payment terms", value: "Net 15 days", remark: "Charter prepayment" },
  { sub_contract_id: "CTR-006-001", parameter: "Payment terms", value: "Net 30 days", remark: "Monthly invoice to FS finance" },
  { sub_contract_id: "CTR-006-001", parameter: "Payment method", value: "Bank transfer / Wire", remark: "USD or EUR accepted" },
  { sub_contract_id: "CTR-006-001", parameter: "Late payment", value: "1.5% per month", remark: "Applied after 45 days" },
  { sub_contract_id: "CTR-006-002", parameter: "Payment terms", value: "Net 15 days", remark: "Charter invoice" },
  { sub_contract_id: "CTR-006-003", parameter: "Payment terms", value: "Prepaid", remark: "Full payment 48h before" },
  { sub_contract_id: "CTR-007-001", parameter: "Payment terms", value: "Net 30 days", remark: "" },
  { sub_contract_id: "CTR-007-002", parameter: "Payment terms", value: "Net 30 days", remark: "" },
  { sub_contract_id: "CTR-008-001", parameter: "Payment terms", value: "Net 15 days", remark: "Charter prepayment" },
  { sub_contract_id: "CTR-008-001", parameter: "Deposit", value: "20% upfront", remark: "Balance on monthly invoice" },
  { sub_contract_id: "CTR-008-002", parameter: "Payment terms", value: "Net 30 days", remark: "Standard transfer billing" },
  { sub_contract_id: "CTR-009-001", parameter: "Payment terms", value: "Net 30 days", remark: "Marriott centralized billing" },
  { sub_contract_id: "CTR-010-001", parameter: "Payment terms", value: "Net 15 days", remark: "Charter prepayment" },
  { sub_contract_id: "CTR-010-002", parameter: "Payment terms", value: "Net 30 days", remark: "Monthly billing" },
].map((r) => rec(r));

// ─── Service Commitment ──────────────────────────────────────────────
const contract_service_commitment = [
  { sub_contract_id: "CTR-001-001", parameter: "Operating hours", value: "06:00 - 16:30", remark: "Daylight seaplane operations" },
  { sub_contract_id: "CTR-001-001", parameter: "Guaranteed seats", value: "40 seats/day", remark: "Peak season Nov-Apr" },
  { sub_contract_id: "CTR-001-002", parameter: "Dedicated aircraft", value: "1 DHC-6 Twin Otter", remark: "Charter dedicated asset for WAI" },
  { sub_contract_id: "CTR-002-001", parameter: "Operating hours", value: "06:00 - 16:30", remark: "Standard daylight hours" },
  { sub_contract_id: "CTR-002-001", parameter: "Guaranteed seats", value: "30 seats/day", remark: "Peak season" },
  { sub_contract_id: "CTR-003-001", parameter: "Dedicated aircraft", value: "1 DHC-6 Twin Otter", remark: "Soneva charter dedicated asset" },
  { sub_contract_id: "CTR-003-001", parameter: "Operating hours", value: "06:00 - 16:30", remark: "" },
  { sub_contract_id: "CTR-003-002", parameter: "Operating hours", value: "06:00 - 16:30", remark: "Daylight operations" },
  { sub_contract_id: "CTR-003-003", parameter: "Dedicated aircraft", value: "1 DHC-6 Twin Otter (Premium)", remark: "Signed charter luxury interior" },
  { sub_contract_id: "CTR-005-001", parameter: "Operating hours", value: "06:00 - 16:30", remark: "" },
  { sub_contract_id: "CTR-005-002", parameter: "Dedicated aircraft", value: "1 DHC-6 Twin Otter", remark: "Patina charter" },
  { sub_contract_id: "CTR-006-001", parameter: "Operating hours", value: "06:00 - 16:30", remark: "Daylight operations only" },
  { sub_contract_id: "CTR-006-001", parameter: "Guaranteed seats", value: "50 seats/day", remark: "Peak season commitment" },
  { sub_contract_id: "CTR-006-001", parameter: "Response time", value: "2 hours", remark: "Booking confirmation SLA" },
  { sub_contract_id: "CTR-006-002", parameter: "Dedicated aircraft", value: "1 DHC-6 Twin Otter", remark: "FS Landaa charter asset" },
  { sub_contract_id: "CTR-006-003", parameter: "Dedicated aircraft", value: "1 DHC-6 Twin Otter (VIP)", remark: "VIP configured cabin" },
  { sub_contract_id: "CTR-007-001", parameter: "Operating hours", value: "06:00 - 22:00", remark: "Speedboat extended hours" },
  { sub_contract_id: "CTR-007-001", parameter: "Frequency", value: "Every 30 minutes", remark: "Peak hours 07:00-10:00, 14:00-17:00" },
  { sub_contract_id: "CTR-007-002", parameter: "Operating hours", value: "06:00 - 16:30", remark: "Seaplane daylight only" },
  { sub_contract_id: "CTR-008-001", parameter: "Dedicated aircraft", value: "1 DHC-6 Twin Otter", remark: "Charter asset for Anantara" },
  { sub_contract_id: "CTR-008-001", parameter: "Operating hours", value: "06:00 - 16:30", remark: "" },
  { sub_contract_id: "CTR-008-002", parameter: "Operating hours", value: "06:00 - 16:30", remark: "Standard seaplane hours" },
  { sub_contract_id: "CTR-009-001", parameter: "Operating hours", value: "06:00 - 22:00", remark: "Speedboat schedule" },
  { sub_contract_id: "CTR-009-001", parameter: "Frequency", value: "Every 45 minutes", remark: "Fixed schedule" },
  { sub_contract_id: "CTR-010-001", parameter: "Dedicated aircraft", value: "1 DHC-6 Twin Otter", remark: "Soneva dedicated charter" },
  { sub_contract_id: "CTR-010-002", parameter: "Operating hours", value: "06:00 - 16:30", remark: "Standard hours" },
].map((r) => rec(r));

// ─── Termination ─────────────────────────────────────────────────────
const contract_termination = [
  { sub_contract_id: "CTR-001-001", parameter: "Notice period", value: "90 days", remark: "Written notice required" },
  { sub_contract_id: "CTR-001-001", parameter: "Early termination fee", value: "3 months transfer revenue", remark: "Based on trailing average" },
  { sub_contract_id: "CTR-001-002", parameter: "Notice period", value: "180 days", remark: "Charter longer notice" },
  { sub_contract_id: "CTR-002-001", parameter: "Notice period", value: "90 days", remark: "Written notice" },
  { sub_contract_id: "CTR-003-001", parameter: "Notice period", value: "180 days", remark: "Charter requires longer notice" },
  { sub_contract_id: "CTR-003-001", parameter: "Early termination fee", value: "6 months charter fees", remark: "Due to dedicated asset" },
  { sub_contract_id: "CTR-003-002", parameter: "Notice period", value: "90 days", remark: "Transfer standard notice" },
  { sub_contract_id: "CTR-003-003", parameter: "Notice period", value: "180 days", remark: "Signed charter notice" },
  { sub_contract_id: "CTR-005-001", parameter: "Notice period", value: "90 days", remark: "Standard Marriott terms" },
  { sub_contract_id: "CTR-005-002", parameter: "Notice period", value: "180 days", remark: "Charter notice" },
  { sub_contract_id: "CTR-006-001", parameter: "Notice period", value: "90 days", remark: "Written notice to both parties" },
  { sub_contract_id: "CTR-006-001", parameter: "Early termination fee", value: "3 months revenue", remark: "Trailing 3-month average" },
  { sub_contract_id: "CTR-006-001", parameter: "Force majeure", value: "No penalty", remark: "Natural disaster, pandemic, govt order" },
  { sub_contract_id: "CTR-006-002", parameter: "Notice period", value: "180 days", remark: "Charter notice" },
  { sub_contract_id: "CTR-006-003", parameter: "Notice period", value: "180 days", remark: "Signed charter notice" },
  { sub_contract_id: "CTR-006-003", parameter: "Early termination fee", value: "Full remaining contract value", remark: "Signed charter penalty" },
  { sub_contract_id: "CTR-007-001", parameter: "Notice period", value: "60 days", remark: "Speedboat shorter notice" },
  { sub_contract_id: "CTR-007-002", parameter: "Notice period", value: "90 days", remark: "Seaplane standard" },
  { sub_contract_id: "CTR-008-001", parameter: "Notice period", value: "180 days", remark: "Charter termination notice" },
  { sub_contract_id: "CTR-008-001", parameter: "Early termination fee", value: "6 months charter fees", remark: "Due to dedicated asset" },
  { sub_contract_id: "CTR-008-002", parameter: "Notice period", value: "90 days", remark: "Transfer notice" },
  { sub_contract_id: "CTR-009-001", parameter: "Notice period", value: "60 days", remark: "Speedboat notice period" },
  { sub_contract_id: "CTR-010-001", parameter: "Notice period", value: "180 days", remark: "Charter notice" },
  { sub_contract_id: "CTR-010-002", parameter: "Notice period", value: "90 days", remark: "Transfer notice" },
].map((r) => rec(r));

// ─── Contract Notes ──────────────────────────────────────────────────
// Notes are per parent contract (using cid mapping)
const uniqueContractIds = [...new Set(contractSeed.map(c => c.contract_id))];
const ctrIdMap = {};
for (const c of contracts) {
  if (!ctrIdMap[c.contract_id]) ctrIdMap[c.contract_id] = c.id;
}

const contract_notes = [
  { contract_id: ctrIdMap["CTR-001"], content: "<h2>Waldorf Astoria Transfer & Charter</h2><p>Dual contract covering both scheduled seaplane transfers and dedicated charter service for Waldorf Astoria Maldives Ithaafushi. <strong>Key highlights:</strong></p><ul><li>Transfer (CTR-001-001): VIP lounge access included for suite guests, dedicated check-in at TMA terminal</li><li>Charter (CTR-001-002): Private aircraft for large group bookings, aerial photography add-on available</li><li>Priority boarding during peak season Nov-Apr</li></ul><p>Contact: Marriott Reservations at +960 400-0000</p><p><em>Transfer sub-contract expiring March 2026 - renewal talks initiated.</em></p>" },
  { contract_id: ctrIdMap["CTR-002"], content: "<h2>St. Regis Vommuli Transfer</h2><p>2-year seaplane transfer contract for St. Regis Maldives Vommuli. Flight time approximately <strong>45 minutes</strong> from Velana International Airport.</p><ul><li>Butler service coordination for VIP arrivals</li><li>Weather delay protocol: speedboat backup arrangement with partner operator</li><li>30 guaranteed seats daily during peak season</li></ul><p>Long-term contract secured through Feb 2027.</p>" },
  { contract_id: ctrIdMap["CTR-003"], content: "<h2>Soneva Fushi - Triple Contract</h2><p>Comprehensive 3-contract arrangement covering Charter, Transfer, and Signed Charter services for Soneva Fushi. <strong>Aircraft:</strong> DHC-6 Twin Otter (19 seats).</p><ul><li>Charter (CTR-003-001): Dedicated aircraft with Soneva livery, custom in-flight refreshments</li><li>Transfer (CTR-003-002): Standard scheduled seaplane service for regular guests</li><li>Signed Charter (CTR-003-003): Premium VIP service with luxury cabin configuration</li></ul><p>Soneva Group is TMA's largest charter partner in Baa Atoll. <em>Contract value exceeds $2M annually.</em></p>" },
  { contract_id: ctrIdMap["CTR-004"], content: "<h2>Cheval Blanc - Expired Contract</h2><p>This signed charter contract expired on 31 Dec 2024. <strong>Status:</strong> Pending renewal negotiations.</p><p>LVMH team evaluating competitive bids. TMA submitted revised proposal Jan 2025. Expected decision Q2 2025.</p><p><strong>Note:</strong> Interim transfer service provided on ad-hoc basis at published rates.</p>" },
  { contract_id: ctrIdMap["CTR-005"], content: "<h2>Patina Maldives - Transfer & Charter</h2><p>Dual contract for Patina Maldives, Fari Islands. Located in <strong>North Malé Atoll</strong> - shorter flight time (~20 min seaplane).</p><ul><li>Transfer (CTR-005-001): 2-year contract, shared service coordination with Ritz-Carlton Fari</li><li>Charter (CTR-005-002): Dedicated service for Marriott Bonvoy Platinum events</li><li>Shared lounge facilities at Velana International Airport</li></ul>" },
  { contract_id: ctrIdMap["CTR-006"], content: "<h2>Four Seasons Landaa Giraavaru - Premium Triple</h2><p>TMA's most comprehensive contract: 3-year transfer + 2-year charter + 1-year signed charter for FS Landaa Giraavaru in Baa Atoll. <strong>Flight time:</strong> ~35 minutes.</p><ul><li>UNESCO Biosphere Reserve location - special low-altitude approach required</li><li>Marine biology equipment transport arrangements in place</li><li>Peak season (Nov-Apr): 50 guaranteed seats daily</li><li>Aerial photography and sunset scenic flight packages available</li><li>Signed charter with VIP cabin configuration for ultra-high-net-worth guests</li></ul><p>Account manager: Sarah Chen, FS Regional Office. <em>Highest-value contract in portfolio at ~$3.5M/year.</em></p>" },
  { contract_id: ctrIdMap["CTR-007"], content: "<h2>Four Seasons Kuda Huraa - Dual Transfer</h2><p>Combined speedboat and seaplane transfer for the closest Four Seasons property to Male airport.</p><ul><li>Speedboat (CTR-007-001): 25-minute journey, extended hours until 22:00, every 30 minutes at peak</li><li>Seaplane (CTR-007-002): Alternative for guests preferring aerial arrival, ~15 min flight</li></ul><p><em>Both contracts expiring March 2026 - renewal terms under active discussion. FS requesting 10% rate reduction.</em></p>" },
  { contract_id: ctrIdMap["CTR-008"], content: "<h2>Anantara Kihavah - Charter & Transfer</h2><p>2-year charter + 1-year transfer for Anantara Kihavah Villas, Baa Atoll. <strong>Includes:</strong></p><ul><li>Charter (CTR-008-001): Dedicated DHC-6 Twin Otter, overwater observatory transfers for astronomy programme</li><li>Transfer (CTR-008-002): Standard scheduled seaplane, dive equipment transport arrangements</li><li>Sunset scenic flight add-on popular with honeymooners</li></ul><p>Minor Hotels regional team oversees operations. 20% deposit required for charter bookings.</p>" },
  { contract_id: ctrIdMap["CTR-009"], content: "<h2>Ritz-Carlton Fari Islands - Speedboat</h2><p>Speedboat transfer for The Ritz-Carlton Maldives, Fari Islands.</p><ul><li>Shared speedboat service coordination with Patina Maldives (same island cluster)</li><li>Luxury speedboat upgrade available at $250 per trip for private transfer</li><li>20-minute journey from Velana Airport</li><li>Fixed schedule every 45 minutes throughout the day</li></ul><p>Marriott centralized billing covers both RC Fari and Patina contracts.</p>" },
  { contract_id: ctrIdMap["CTR-010"], content: "<h2>Soneva Jani - Expired Dual Contract</h2><p>Both charter and transfer contracts expired Feb 2025. <strong>Status:</strong> Under renewal.</p><ul><li>Charter (CTR-010-001): Dedicated aircraft no longer assigned</li><li>Transfer (CTR-010-002): Ad-hoc service at published rates</li></ul><p>Soneva Group consolidating charter terms for both Fushi and Jani properties. New combined multi-property contract expected Q2 2025. Delay due to Soneva's expansion plans for third Maldives property.</p>" },
].map((r) => rec(r));

// ─── Write all tables ────────────────────────────────────────────────
console.log("Generating seed Excel files in public/data/ ...\n");

writeTable("atolls", atolls);
writeTable("companies", companies);
writeTable("contracts", contracts);
writeTable("pricing_standard", pricing_standard);
writeTable("pricing_special", pricing_special);
writeTable("contract_baggage", contract_baggage);
writeTable("contract_booking", contract_booking);
writeTable("contract_age", contract_age);
writeTable("contract_addons", contract_addons);
writeTable("contract_insurance", contract_insurance);
writeTable("contract_government_charges", contract_government_charges);
writeTable("contract_fuel", contract_fuel);
writeTable("contract_payment_plan", contract_payment_plan);
writeTable("contract_service_commitment", contract_service_commitment);
writeTable("contract_termination", contract_termination);
writeTable("contract_notes", contract_notes);
writeTable("table_settings", []);

console.log("\nDone! All seed Excel files generated.");
console.log(`\nSummary:`);
console.log(`  - ${groups.length} groups, ${resorts.length} resorts (${companies.length} total companies)`);
console.log(`  - ${contracts.length} contract records (${uniqueContractIds.length} parent contracts)`);
console.log(`  - ${pricing_standard.length} standard pricing rows`);
console.log(`  - ${pricing_special.length} special pricing rows`);
