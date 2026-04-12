# Excel Schema Report
> Generated: 2026-04-12  
> Source: `public/data/*.xlsx` — parsed with SheetJS  
> Compared against: `supabase/migrations/20260212113817_*.sql`

---

## Table: atolls
**Row count: 12** | Excel file: `atolls.xlsx` | **No corresponding SQL table**

| Column | Type | Nullable | Key | Sample Values |
|--------|------|----------|-----|---------------|
| id | string (UUID) | No | PK | `c983362a-...`, `78ce8bc7-...` |
| created_at | datetime (ISO) | No | — | `2026-02-15T07:01:23.175Z` |
| updated_at | datetime (ISO) | No | — | `2026-02-15T07:01:23.175Z` |
| name | string | No | — | `North Malé Atoll`, `South Malé Atoll`, `Baa Atoll` |

> **Note:** This table exists in Excel only. No SQL table defined in any migration.

---

## Table: companies
**Row count: 15** | Excel file: `companies.xlsx`

| Column | Type | Nullable | Key | Sample Values |
|--------|------|----------|-----|---------------|
| id | string (UUID) | No | PK | `3878f7f2-...`, `777dac53-...` |
| created_at | datetime (ISO) | No | — | `2026-02-15T07:01:23.175Z` |
| updated_at | datetime (ISO) | No | — | `2026-02-15T07:01:23.175Z` |
| name | string | No | — | `Marriott International`, `Soneva Group`, `LVMH Hospitality` |
| code | string | No | — | `MAR`, `SON`, `LVMH` |
| address | string | No | — | `Bethesda, Maryland, USA`, `Bangkok, Thailand` |
| registration_no | string | No | — | `MI-2024-001`, `SG-2024-002` |
| coordinates | string | No | — | `38.9807, -77.0962`, `13.7563, 100.5018` |
| type | string | No | — | `Group`, `Resort` |
| atoll | string | Yes (33%) | — | `Baa Atoll`, `South Malé Atoll`, `Dhaalu Atoll` |

> **Note:** `code` and `atoll` columns exist in Excel but are **missing from SQL schema**.

---

## Table: contracts
**Row count: 19** | Excel file: `contracts.xlsx`

| Column | Type | Nullable | Key | Sample Values |
|--------|------|----------|-----|---------------|
| id | string (UUID) | No | PK | `c0f92e8a-...`, `78cd917a-...` |
| created_at | datetime (ISO) | No | — | `2026-02-15T07:01:23.175Z` |
| updated_at | datetime (ISO) | No | — | `2026-02-15T07:01:23.175Z` |
| contract_id | string | No | — | `CTR-001`, `CTR-002` |
| contract_code | string | No | — | `MAR-WAI-2025`, `MAR-SRV-2025` |
| carrier_id | string | No | — | `TMA101` |
| group_id | string (UUID) | No | FK → companies | `3878f7f2-...` |
| resort_id | string (UUID) | No | FK → companies | `ebf035b5-...`, `42e6bcee-...` |
| sub_contract_id | string | No | UNIQUE | `CTR-001-001`, `CTR-001-002`, `CTR-002-001` |
| sub_contract_type | string | No | — | `Transfer`, `Charter` |
| start_date | date (ISO) | No | — | `2025-01-01`, `2025-06-01` |
| end_date | date (ISO) | No | — | `2026-03-01`, `2026-05-31` |
| agreement_type | string | No | — | `Exclusive Seaplane (Day time)`, `Charter Agreement` |

---

## Table: pricing_standard
**Row count: 38** | Excel file: `pricing_standard.xlsx`

| Column | Type | Nullable | Key | Sample Values |
|--------|------|----------|-----|---------------|
| id | string (UUID) | No | PK | `b14da057-...`, `28b3c775-...` |
| created_at | datetime (ISO) | No | — | `2026-02-15T07:01:23.175Z` |
| updated_at | datetime (ISO) | No | — | `2026-02-15T07:01:23.175Z` |
| sub_contract_id | string | No | FK → contracts | `CTR-001-001`, `CTR-001-002` |
| weekdays | string (JSON) | No | — | `["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]` |
| point_a_id | string (UUID) | No | FK → companies | `ebf035b5-...` |
| point_b_id | string (UUID) | No | FK → companies | `ebf035b5-...` |
| transfer_type | string | No | — | `Seaplane` |
| pax_condition | string | Yes (50%) | — | `Age 2-11` |
| passenger_type | string | No | — | `Adult`, `Child` |
| return_fare_usd | number | No | currency (USD) | `680`, `410`, `850` |
| one_way_fare_usd | number | No | currency (USD) | `400`, `240`, `500` |
| start_date | date (ISO) | No | — | `2025-01-01`, `2025-06-01` |
| end_date | date (ISO) | No | — | `2026-03-01`, `2026-05-31` |

> **Notes:**  
> - `weekdays` stored as a JSON string array in Excel. SQL defines it as `text[]` (PostgreSQL native array — different wire format). Should be `jsonb`.  
> - `point_a_id` / `point_b_id` reference UUID values matching `companies.id`, **not** `destinations.id` as the old SQL FK stated.  
> - `updated_at` is present in Excel but **missing from SQL**.

---

## Table: pricing_special
**Row count: 20** | Excel file: `pricing_special.xlsx`

| Column | Type | Nullable | Key | Sample Values |
|--------|------|----------|-----|---------------|
| id | string (UUID) | No | PK | `11f717dc-...`, `e6a09bcd-...` |
| created_at | datetime (ISO) | No | — | `2026-02-15T07:01:23.175Z` |
| updated_at | datetime (ISO) | No | — | `2026-02-15T07:01:23.175Z` |
| sub_contract_id | string | No | FK → contracts | `CTR-001-001`, `CTR-001-002` |
| request_type | string | No | — | `Management`, `Staff`, `VIP Guest` |
| discount_type | string | No | — | `Percentage`, `Absolute` |
| return_fare_usd | number | No | currency (USD) | `100`, `150`, `80` |
| one_way_fare_usd | number | No | currency (USD) | `100`, `90`, `80` |
| pax_condition | string | No | — | `Hotel GM and above`, `Resort staff with valid ID` |
| start_date | date (ISO) | No | — | `2025-01-01`, `2025-06-01` |
| end_date | date (ISO) | No | — | `2026-03-01`, `2026-05-31` |

> **Notes:**  
> - `request_type` value `"VIP Guest"` is **not in the old SQL CHECK constraint**.  
> - `updated_at` present in Excel but **missing from SQL**.

---

## Table: contract_baggage
**Row count: 26** | Excel file: `contract_baggage.xlsx`

| Column | Type | Nullable | Key | Sample Values |
|--------|------|----------|-----|---------------|
| id | string (UUID) | No | PK | `ebf84ed7-...`, `f4b71d83-...` |
| created_at | datetime (ISO) | No | — | `2026-02-15T07:01:23.175Z` |
| updated_at | datetime (ISO) | No | — | `2026-02-15T07:01:23.175Z` |
| sub_contract_id | string | No | FK → contracts | `CTR-001-001`, `CTR-001-002` |
| parameter | string | No | — | `Checked baggage`, `Hand baggage` |
| value | string | No | — | `25 kg per adult`, `5 kg per person` |
| remark | string | Yes (8%) | — | `Soft bags preferred for seaplane` |

> **Note:** `updated_at` present in Excel but **missing from SQL**.

---

## Table: contract_booking
**Row count: 23** | Excel file: `contract_booking.xlsx`

| Column | Type | Nullable | Key | Sample Values |
|--------|------|----------|-----|---------------|
| id | string (UUID) | No | PK | `26ee8ef8-...`, `f5666ed6-...` |
| created_at | datetime (ISO) | No | — | `2026-02-15T07:01:23.175Z` |
| updated_at | datetime (ISO) | No | — | `2026-02-15T07:01:23.175Z` |
| sub_contract_id | string | No | FK → contracts | `CTR-001-001`, `CTR-001-002` |
| parameter | string | No | — | `Advance booking`, `Cancellation` |
| value | string | No | — | `48 hours minimum`, `24 hours before departure` |
| remark | string | Yes (22%) | — | `Peak season may require 72 hours` |

> **Note:** `updated_at` present in Excel but **missing from SQL**.

---

## Table: contract_age
**Row count: 38** | Excel file: `contract_age.xlsx`

| Column | Type | Nullable | Key | Sample Values |
|--------|------|----------|-----|---------------|
| id | string (UUID) | No | PK | `c7acfe7c-...`, `d36f53dd-...` |
| created_at | datetime (ISO) | No | — | `2026-02-15T07:01:23.175Z` |
| updated_at | datetime (ISO) | No | — | `2026-02-15T07:01:23.175Z` |
| sub_contract_id | string | No | FK → contracts | `CTR-001-001`, `CTR-001-002` |
| type | string | No | — | `Adult`, `Child` |
| min_age | number (integer) | No | — | `12`, `2` |
| max_age | number (integer) | Yes (50%) | — | `11` |

> **Note:** `max_age` is 50% null (expected — Adults have no upper age cap). `updated_at` present in Excel but **missing from SQL**.

---

## Table: contract_addons
**Row count: 16** | Excel file: `contract_addons.xlsx`

| Column | Type | Nullable | Key | Sample Values |
|--------|------|----------|-----|---------------|
| id | string (UUID) | No | PK | `7ddb91dd-...`, `93742c9d-...` |
| created_at | datetime (ISO) | No | — | `2026-02-15T07:01:23.175Z` |
| updated_at | datetime (ISO) | No | — | `2026-02-15T07:01:23.175Z` |
| sub_contract_id | string | No | FK → contracts | `CTR-001-001`, `CTR-001-002` |
| sub_category | string | No | — | `Dedicated Vehicle`, `Photography` |
| type | string | No | — | `VIP Lounge Access`, `Airport Transfer SUV` |
| value | number | No | currency (USD) | `150`, `85`, `400` |
| remark | string | Yes (6%) | — | `Velana Airport VIP terminal` |

> **Note:** `updated_at` present in Excel but **missing from SQL**.

---

## Table: contract_insurance
**Row count: 19** | Excel file: `contract_insurance.xlsx`

| Column | Type | Nullable | Key | Sample Values |
|--------|------|----------|-----|---------------|
| id | string (UUID) | No | PK | `b849968c-...`, `be40e6c9-...` |
| created_at | datetime (ISO) | No | — | `2026-02-15T07:01:23.175Z` |
| updated_at | datetime (ISO) | No | — | `2026-02-15T07:01:23.175Z` |
| sub_contract_id | string | No | FK → contracts | `CTR-001-001`, `CTR-002-001` |
| parameter | string | No | — | `Insurance cover` |
| value | string | No | — | `Yes`, `No` |
| remark | string | No | — | `Included in fare`, `Standard cover` |

> **Note:** `updated_at` present in Excel but **missing from SQL**.

---

## Table: contract_government_charges
**Row count: 19** | Excel file: `contract_government_charges.xlsx`

| Column | Type | Nullable | Key | Sample Values |
|--------|------|----------|-----|---------------|
| id | string (UUID) | No | PK | `68298850-...`, `777b2047-...` |
| created_at | datetime (ISO) | No | — | `2026-02-15T07:01:23.175Z` |
| updated_at | datetime (ISO) | No | — | `2026-02-15T07:01:23.175Z` |
| sub_contract_id | string | No | FK → contracts | `CTR-001-001`, `CTR-002-001` |
| parameter | string | No | — | `Government_charges` |
| value | number | No | currency (USD) | `3.5` |
| remark | string | No | — | `Return per pax excluding GST` |

> **Note:** `updated_at` present in Excel but **missing from SQL**.

---

## Table: contract_fuel
**Row count: 18** | Excel file: `contract_fuel.xlsx`

| Column | Type | Nullable | Key | Sample Values |
|--------|------|----------|-----|---------------|
| id | string (UUID) | No | PK | `74b1ee3f-...`, `204bcafa-...` |
| created_at | datetime (ISO) | No | — | `2026-02-15T07:01:23.175Z` |
| updated_at | datetime (ISO) | No | — | `2026-02-15T07:01:23.175Z` |
| sub_contract_id | string | No | FK → contracts | `CTR-001-001`, `CTR-001-002` |
| type | string | No | — | `Fuel surcharge` |
| value | **string** | No | — | `Included`, `$48 per flight hour`, `Bundled into fare` |
| remark | string | No | — | `Bundled into transfer fare`, `Charter fuel variable` |

> **CRITICAL:** `value` is a **text field** in Excel (free-form like "Included", "$48 per flight hour").  
> The old SQL schema defined it as `numeric(10,2)` — **completely incompatible type mismatch**.  
> `updated_at` present in Excel but **missing from SQL**.

---

## Table: contract_payment_plan
**Row count: 22** | Excel file: `contract_payment_plan.xlsx`

| Column | Type | Nullable | Key | Sample Values |
|--------|------|----------|-----|---------------|
| id | string (UUID) | No | PK | `b676824d-...`, `4d803241-...` |
| created_at | datetime (ISO) | No | — | `2026-02-15T07:01:23.175Z` |
| updated_at | datetime (ISO) | No | — | `2026-02-15T07:01:23.175Z` |
| sub_contract_id | string | No | FK → contracts | `CTR-001-001`, `CTR-001-002` |
| parameter | string | No | — | `Payment terms`, `Payment method` |
| value | string | No | — | `Net 30 days`, `Bank transfer / Wire` |
| remark | string | Yes (9%) | — | `Monthly invoice cycle`, `USD account at BML` |

> **Note:** `updated_at` present in Excel but **missing from SQL**.

---

## Table: contract_service_commitment
**Row count: 26** | Excel file: `contract_service_commitment.xlsx`

| Column | Type | Nullable | Key | Sample Values |
|--------|------|----------|-----|---------------|
| id | string (UUID) | No | PK | `4a7f40d6-...`, `bfd72f38-...` |
| created_at | datetime (ISO) | No | — | `2026-02-15T07:01:23.175Z` |
| updated_at | datetime (ISO) | No | — | `2026-02-15T07:01:23.175Z` |
| sub_contract_id | string | No | FK → contracts | `CTR-001-001`, `CTR-001-002` |
| parameter | string | No | — | `Operating hours`, `Guaranteed seats` |
| value | string | No | — | `06:00 - 16:30`, `40 seats/day` |
| remark | string | Yes (12%) | — | `Daylight seaplane operations` |

> **Note:** `updated_at` present in Excel but **missing from SQL**.

---

## Table: contract_termination
**Row count: 24** | Excel file: `contract_termination.xlsx`

| Column | Type | Nullable | Key | Sample Values |
|--------|------|----------|-----|---------------|
| id | string (UUID) | No | PK | `6b7a880e-...`, `36aed8c8-...` |
| created_at | datetime (ISO) | No | — | `2026-02-15T07:01:23.175Z` |
| updated_at | datetime (ISO) | No | — | `2026-02-15T07:01:23.175Z` |
| sub_contract_id | string | No | FK → contracts | `CTR-001-001`, `CTR-001-002` |
| parameter | string | No | — | `Notice period`, `Early termination fee` |
| value | string | No | — | `90 days`, `3 months transfer revenue` |
| remark | string | No | — | `Written notice required`, `Based on trailing average` |

> **Note:** `updated_at` present in Excel but **missing from SQL**.

---

## Table: contract_notes
**Row count: 10** | Excel file: `contract_notes.xlsx`

| Column | Type | Nullable | Key | Sample Values |
|--------|------|----------|-----|---------------|
| id | string (UUID) | No | PK | `98c42733-...`, `65a44019-...` |
| created_at | datetime (ISO) | No | — | `2026-02-15T07:01:23.175Z` |
| updated_at | datetime (ISO) | No | — | `2026-02-15T07:01:23.175Z` |
| contract_id | string (UUID) | No | FK → contracts(id) | `c0f92e8a-...`, `b9037295-...` |
| content | string (HTML) | No | — | `<h2>Waldorf Astoria Transfer...` |

> **Note:** SQL schema matches Excel. `updated_at` exists in both. ✓

---

## Table: table_settings
**Row count: 0** | Excel file: `table_settings.xlsx` (empty)

| Column | Type | Nullable | Key | Sample Values |
|--------|------|----------|-----|---------------|
| *(no rows — empty file)* | | | | |

> SQL schema (migration 20260213114545) matches. File exists but is unpopulated. ✓

---

## Table: destinations *(SQL only)*
**No Excel file** | Defined in SQL migration only, seeded with 15 rows

SQL columns: `id`, `name`, `code`, `coordinates`, `created_at`

> **Note:** No `destinations.xlsx` in `public/data/`. Data lives only in SQL seed.  
> Additionally, `pricing_standard.point_a_id` and `point_b_id` reference UUID values  
> that match `companies.id` in the Excel data — **not** `destinations.id` as the old FK claims.

---

---

# DISCREPANCIES

## D1 — Table in Excel with NO SQL Table
| Excel File | Status |
|------------|--------|
| `atolls.xlsx` | **MISSING** — no `atolls` table in any migration |

## D2 — Table in SQL with NO Excel File
| SQL Table | Status |
|-----------|--------|
| `destinations` | **MISSING** — no `destinations.xlsx`; data only in SQL seed |

## D3 — Columns in Excel MISSING from SQL Schema
| Table | Excel Column | SQL Status |
|-------|-------------|------------|
| `companies` | `code` | **MISSING** from SQL |
| `companies` | `atoll` | **MISSING** from SQL |

## D4 — `updated_at` Column: In Excel, Missing from SQL
All 12 sub-tables have `updated_at` in Excel but the SQL migration omits it:

| Table | updated_at in Excel | updated_at in SQL |
|-------|--------------------|--------------------|
| `pricing_standard` | ✓ | ✗ MISSING |
| `pricing_special` | ✓ | ✗ MISSING |
| `contract_baggage` | ✓ | ✗ MISSING |
| `contract_booking` | ✓ | ✗ MISSING |
| `contract_age` | ✓ | ✗ MISSING |
| `contract_addons` | ✓ | ✗ MISSING |
| `contract_insurance` | ✓ | ✗ MISSING |
| `contract_government_charges` | ✓ | ✗ MISSING |
| `contract_fuel` | ✓ | ✗ MISSING |
| `contract_payment_plan` | ✓ | ✗ MISSING |
| `contract_service_commitment` | ✓ | ✗ MISSING |
| `contract_termination` | ✓ | ✗ MISSING |

## D5 — Type Mismatches (CRITICAL)
| Table | Column | Excel Type | SQL Type | Verdict |
|-------|--------|------------|----------|---------|
| `contract_fuel` | `value` | **text** (e.g. "Included", "$48 per flight hour") | `numeric(10,2)` | **INCOMPATIBLE — data cannot be stored** |

## D6 — CHECK Constraint Violations
| Table | Column | Value in Excel | In SQL CHECK | Verdict |
|-------|--------|----------------|--------------|---------|
| `pricing_special` | `request_type` | `"VIP Guest"` | Not listed | **INSERT would fail** |

SQL CHECK allows: `Management`, `Staff`, `Service providers`, `FAM trips`, `Tour Operators`, `Tour Guides`, `Journalists`, `Advertisers`, `Others`  
Excel also contains: **`VIP Guest`** — would be rejected.

## D7 — Format Mismatch (Non-Critical)
| Table | Column | Excel Format | SQL Type | Verdict |
|-------|--------|-------------|----------|---------|
| `pricing_standard` | `weekdays` | JSON string: `["Mon","Tue",...]` | `text[]` | PostgreSQL native array format (`{Mon,Tue,...}`) differs from JSON array; recommend `jsonb` |

## D8 — FK Target Mismatch
| Table | Column | Old FK target | Actual data references | Verdict |
|-------|--------|---------------|----------------------|---------|
| `pricing_standard` | `point_a_id` | `destinations(id)` | UUIDs matching `companies.id` | **FK points to wrong table** |
| `pricing_standard` | `point_b_id` | `destinations(id)` | UUIDs matching `companies.id` | **FK points to wrong table** |

---

## Row Count Summary
| Table | Rows |
|-------|------|
| atolls | 12 |
| companies | 15 |
| contracts | 19 |
| pricing_standard | 38 |
| pricing_special | 20 |
| contract_baggage | 26 |
| contract_booking | 23 |
| contract_age | 38 |
| contract_addons | 16 |
| contract_insurance | 19 |
| contract_government_charges | 19 |
| contract_fuel | 18 |
| contract_payment_plan | 22 |
| contract_service_commitment | 26 |
| contract_termination | 24 |
| contract_notes | 10 |
| table_settings | 0 |
| **TOTAL** | **335** |
