/**
 * seed-supabase.mjs
 *
 * Reads every Excel file from public/data/ and upserts the data into
 * Supabase, respecting FK dependency order.
 *
 * Prerequisites
 * ─────────────
 * 1. Run the schema migration in Supabase SQL Editor first:
 *      supabase/migrations/20260412000001_align-schema-with-excel-data.sql
 *
 * 2. Create a .env file (copy .env.example) and fill in:
 *      SUPABASE_URL=https://xxxx.supabase.co
 *      SUPABASE_SERVICE_ROLE_KEY=eyJhb...   ← Settings → API → service_role
 *
 *    Do NOT use the anon key — RLS would block bulk inserts.
 *
 * Usage
 * ─────
 *   node scripts/seed-supabase.mjs
 *
 * The script is idempotent: it upserts on (id), so re-running is safe.
 */

import { createClient }     from "@supabase/supabase-js";
import * as XLSX             from "xlsx";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname }  from "path";
import { fileURLToPath }     from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = resolve(__dirname, "..");

// ─── Load .env manually (no dotenv dependency needed) ──────────────────────
function loadEnv() {
  const envPath = resolve(ROOT, ".env");
  if (!existsSync(envPath)) return;
  readFileSync(envPath, "utf8")
    .split("\n")
    .forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const eq = trimmed.indexOf("=");
      if (eq === -1) return;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
      if (key && !process.env[key]) process.env[key] = val;
    });
}
loadEnv();

// ─── Supabase client ────────────────────────────────────────────────────────
const SUPABASE_URL              = process.env.SUPABASE_URL              || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "\nERROR: Missing env vars.\n" +
    "Add to .env:\n" +
    "  SUPABASE_URL=https://xxxx.supabase.co\n" +
    "  SUPABASE_SERVICE_ROLE_KEY=eyJ...\n" +
    "(service_role key from Supabase Dashboard → Settings → API)\n"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ─── Excel helpers ──────────────────────────────────────────────────────────

/** Read a sheet into rows, auto-parsing JSON arrays stored as strings. */
function readSheet(tableName) {
  const filePath = resolve(ROOT, "public/data", `${tableName}.xlsx`);
  if (!existsSync(filePath)) {
    console.warn(`  ⚠  No file for ${tableName} — skipping`);
    return [];
  }
  const wb   = XLSX.readFile(filePath);
  const ws   = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: null });

  return rows.map((row) => {
    const out = {};
    for (const [k, v] of Object.entries(row)) {
      if (typeof v === "string" && v.startsWith("[") && v.endsWith("]")) {
        try { out[k] = JSON.parse(v); } catch { out[k] = v; }
      } else {
        out[k] = v === "" ? null : v;
      }
    }
    return out;
  });
}

// ─── Upsert helper ─────────────────────────────────────────────────────────

async function upsert(table, rows, label) {
  if (!rows.length) {
    console.log(`  ⏭  ${label ?? table}: 0 rows — skipped`);
    return;
  }

  // Supabase upserts in batches of 500 to avoid request size limits
  const BATCH = 500;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase
      .from(table)
      .upsert(batch, { onConflict: "id", ignoreDuplicates: false });

    if (error) {
      console.error(`  ✗  ${label ?? table} batch ${i}–${i + batch.length - 1}:`, error.message);
      console.error("     First row:", JSON.stringify(batch[0], null, 2));
      process.exit(1);
    }
    inserted += batch.length;
  }
  console.log(`  ✓  ${label ?? table}: ${inserted} rows upserted`);
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🚀  TMA Contract Data — Supabase seeder");
  console.log(`    Target: ${SUPABASE_URL}\n`);

  // ── Step 1: atolls ────────────────────────────────────────────────────────
  // Must come first — companies.atoll_id references atolls(id)
  console.log("Step 1/8  atolls");
  const atollRows = readSheet("atolls");
  await upsert("atolls", atollRows);

  // Build name → id lookup for resolving companies.atoll → atoll_id
  const atollByName = Object.fromEntries(atollRows.map((a) => [a.name, a.id]));

  // ── Step 2: companies ─────────────────────────────────────────────────────
  // Resolve atoll (text) → atoll_id (uuid), strip original text column
  console.log("Step 2/8  companies");
  const companyRows = readSheet("companies").map(({ atoll, ...rest }) => ({
    ...rest,
    atoll_id: atoll ? (atollByName[atoll] ?? null) : null,
  }));
  await upsert("companies", companyRows);

  // ── Step 3: contracts ─────────────────────────────────────────────────────
  // group_id and resort_id reference companies(id) — already UUIDs in Excel
  console.log("Step 3/8  contracts");
  await upsert("contracts", readSheet("contracts"));

  // ── Step 4: pricing tables ────────────────────────────────────────────────
  // pricing_standard.weekdays is already parsed to a JS array by readSheet()
  // point_a_id / point_b_id reference companies(id) — already UUIDs in Excel
  console.log("Step 4/8  pricing_standard + pricing_special");
  await upsert("pricing_standard", readSheet("pricing_standard"));
  await upsert("pricing_special",  readSheet("pricing_special"));

  // ── Step 5: contract parameter tables ─────────────────────────────────────
  console.log("Step 5/8  contract_baggage + contract_booking + contract_age");
  await upsert("contract_baggage", readSheet("contract_baggage"));
  await upsert("contract_booking", readSheet("contract_booking"));
  await upsert("contract_age",     readSheet("contract_age"));

  // ── Step 6: more parameter tables ─────────────────────────────────────────
  console.log("Step 6/8  contract_addons + contract_insurance + contract_government_charges");
  await upsert("contract_addons",             readSheet("contract_addons"));
  await upsert("contract_insurance",          readSheet("contract_insurance"));
  await upsert("contract_government_charges", readSheet("contract_government_charges"));

  // ── Step 7: remaining parameter tables ────────────────────────────────────
  console.log("Step 7/8  contract_fuel + contract_payment_plan + contract_service_commitment + contract_termination");
  await upsert("contract_fuel",               readSheet("contract_fuel"));
  await upsert("contract_payment_plan",       readSheet("contract_payment_plan"));
  await upsert("contract_service_commitment", readSheet("contract_service_commitment"));
  await upsert("contract_termination",        readSheet("contract_termination"));

  // ── Step 8: contract_notes ────────────────────────────────────────────────
  // contract_id references contracts(id) — must come after contracts
  console.log("Step 8/8  contract_notes");
  await upsert("contract_notes", readSheet("contract_notes"));

  console.log("\n✅  All done!\n");
}

main().catch((err) => {
  console.error("\n✗  Unexpected error:", err);
  process.exit(1);
});
