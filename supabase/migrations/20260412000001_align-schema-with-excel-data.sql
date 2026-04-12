-- ============================================================
-- Migration: Align schema with actual Excel data
-- Generated: 2026-04-12
-- Source:    Analysis of public/data/*.xlsx
-- Report:    .claude/excel-schema-report.md
--
-- Changes:
--   D1  CREATE TABLE atolls  (new — exists in Excel, not in SQL)
--   D3  ALTER companies      ADD COLUMN code (UNIQUE), atoll_id (FK → atolls)
--   D4  ALTER 12 sub-tables  ADD COLUMN updated_at + triggers
--   D5  ALTER contract_fuel  value  numeric → text  (CRITICAL type fix)
--   D6  ALTER pricing_special  expand request_type CHECK (add VIP Guest)
--   D7  ALTER pricing_standard weekdays  text[] → jsonb
--   D8  ALTER pricing_standard  re-point point_a_id/point_b_id FK
--         from destinations(id) → companies(id)
--
-- Design choices:
--   • $func$ delimiter used for function body to avoid any SQL-editor
--     mis-pairing of $$ when the file contains multiple quoted blocks.
--   • All triggers use DROP ... IF EXISTS before CREATE so re-running
--     this file never errors on "trigger already exists".
--   • All policies use DROP ... IF EXISTS for the same reason.
-- ============================================================


-- ─────────────────────────────────────────────────────────────
-- Prerequisite: updated_at trigger function
--     Re-declared here so this file is fully self-contained
--     when pasted directly into the Supabase SQL Editor.
--     $func$ delimiter avoids any conflict with the $$ blocks
--     that some editors parse greedily.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $func$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql SET search_path = public;


-- ─────────────────────────────────────────────────────────────
-- D1: NEW TABLE — atolls
--     Exists in Excel (12 rows), completely missing from SQL.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.atolls (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.atolls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated access" ON public.atolls;
CREATE POLICY "Authenticated access"
  ON public.atolls FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS update_atolls_updated_at ON public.atolls;
CREATE TRIGGER update_atolls_updated_at
  BEFORE UPDATE ON public.atolls
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ─────────────────────────────────────────────────────────────
-- D3: companies — add missing columns
--     code:     short identifier (MAR, SON, LVMH …) — must be unique.
--     atoll_id: FK to atolls(id); null for Group-type companies.
--               The seeding script resolves atoll name → id.
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS code     text,
  ADD COLUMN IF NOT EXISTS atoll_id uuid REFERENCES public.atolls(id);

-- Partial unique index — allows multiple NULLs, rejects duplicate codes.
CREATE UNIQUE INDEX IF NOT EXISTS companies_code_unique
  ON public.companies (code)
  WHERE code IS NOT NULL;


-- ─────────────────────────────────────────────────────────────
-- D5: contract_fuel — fix value column type
--     Excel stores free-form text: "Included", "$48 per flight
--     hour", "Bundled into fare".
--     Old SQL defined numeric(10,2) — data cannot be stored.
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.contract_fuel
  ALTER COLUMN value TYPE text USING value::text;


-- ─────────────────────────────────────────────────────────────
-- D6: pricing_special — expand request_type CHECK
--     Excel contains "VIP Guest" which is absent from the old
--     CHECK list and would cause INSERTs to fail.
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.pricing_special
  DROP CONSTRAINT IF EXISTS pricing_special_request_type_check;

ALTER TABLE public.pricing_special
  ADD CONSTRAINT pricing_special_request_type_check
    CHECK (request_type IN (
      'Management',
      'Staff',
      'Service providers',
      'FAM trips',
      'Tour Operators',
      'Tour Guides',
      'Journalists',
      'Advertisers',
      'VIP Guest',
      'Others'
    ));


-- ─────────────────────────────────────────────────────────────
-- D7: pricing_standard — weekdays type text[] → jsonb
--     Excel stores JSON arrays: ["Mon","Tue","Wed",...]
--     jsonb is the correct type for JSON array data from Excel.
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.pricing_standard
  ALTER COLUMN weekdays TYPE jsonb
    USING CASE
      WHEN weekdays IS NULL THEN NULL
      ELSE to_jsonb(weekdays)
    END;


-- ─────────────────────────────────────────────────────────────
-- D8: pricing_standard — fix FK on point_a_id / point_b_id
--     Old SQL referenced destinations(id).
--     Actual Excel UUIDs match companies.id, not destinations.id.
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.pricing_standard
  DROP CONSTRAINT IF EXISTS pricing_standard_point_a_id_fkey,
  DROP CONSTRAINT IF EXISTS pricing_standard_point_b_id_fkey;

ALTER TABLE public.pricing_standard
  ADD CONSTRAINT pricing_standard_point_a_id_fkey
    FOREIGN KEY (point_a_id) REFERENCES public.companies(id),
  ADD CONSTRAINT pricing_standard_point_b_id_fkey
    FOREIGN KEY (point_b_id) REFERENCES public.companies(id);

COMMENT ON TABLE public.destinations IS
  'Legacy — point_a/b_id in pricing_standard now reference companies(id). '
  'Confirm no active queries before dropping.';


-- ─────────────────────────────────────────────────────────────
-- D4: Add updated_at + trigger to the 12 sub-tables that have
--     it in Excel but were missing it in SQL.
--     DROP TRIGGER IF EXISTS before each CREATE avoids errors
--     when this file is re-run after a partial failure.
-- ─────────────────────────────────────────────────────────────

-- pricing_standard
ALTER TABLE public.pricing_standard
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS update_pricing_standard_updated_at ON public.pricing_standard;
CREATE TRIGGER update_pricing_standard_updated_at
  BEFORE UPDATE ON public.pricing_standard
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- pricing_special
ALTER TABLE public.pricing_special
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS update_pricing_special_updated_at ON public.pricing_special;
CREATE TRIGGER update_pricing_special_updated_at
  BEFORE UPDATE ON public.pricing_special
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- contract_baggage
ALTER TABLE public.contract_baggage
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS update_contract_baggage_updated_at ON public.contract_baggage;
CREATE TRIGGER update_contract_baggage_updated_at
  BEFORE UPDATE ON public.contract_baggage
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- contract_booking
ALTER TABLE public.contract_booking
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS update_contract_booking_updated_at ON public.contract_booking;
CREATE TRIGGER update_contract_booking_updated_at
  BEFORE UPDATE ON public.contract_booking
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- contract_age
ALTER TABLE public.contract_age
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS update_contract_age_updated_at ON public.contract_age;
CREATE TRIGGER update_contract_age_updated_at
  BEFORE UPDATE ON public.contract_age
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- contract_addons
ALTER TABLE public.contract_addons
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS update_contract_addons_updated_at ON public.contract_addons;
CREATE TRIGGER update_contract_addons_updated_at
  BEFORE UPDATE ON public.contract_addons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- contract_insurance
ALTER TABLE public.contract_insurance
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS update_contract_insurance_updated_at ON public.contract_insurance;
CREATE TRIGGER update_contract_insurance_updated_at
  BEFORE UPDATE ON public.contract_insurance
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- contract_government_charges
ALTER TABLE public.contract_government_charges
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS update_contract_government_charges_updated_at ON public.contract_government_charges;
CREATE TRIGGER update_contract_government_charges_updated_at
  BEFORE UPDATE ON public.contract_government_charges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- contract_fuel
ALTER TABLE public.contract_fuel
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS update_contract_fuel_updated_at ON public.contract_fuel;
CREATE TRIGGER update_contract_fuel_updated_at
  BEFORE UPDATE ON public.contract_fuel
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- contract_payment_plan
ALTER TABLE public.contract_payment_plan
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS update_contract_payment_plan_updated_at ON public.contract_payment_plan;
CREATE TRIGGER update_contract_payment_plan_updated_at
  BEFORE UPDATE ON public.contract_payment_plan
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- contract_service_commitment
ALTER TABLE public.contract_service_commitment
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS update_contract_service_commitment_updated_at ON public.contract_service_commitment;
CREATE TRIGGER update_contract_service_commitment_updated_at
  BEFORE UPDATE ON public.contract_service_commitment
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- contract_termination
ALTER TABLE public.contract_termination
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS update_contract_termination_updated_at ON public.contract_termination;
CREATE TRIGGER update_contract_termination_updated_at
  BEFORE UPDATE ON public.contract_termination
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
