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
--         from destinations(id) → no FK (companies or destinations both valid)
-- ============================================================


-- ─────────────────────────────────────────────────────────────
-- D1: NEW TABLE — atolls
--     Exists in Excel (12 rows), completely missing from SQL.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.atolls (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL UNIQUE,   -- seeding script resolves name → id
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.atolls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated access"
  ON public.atolls FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE TRIGGER update_atolls_updated_at
  BEFORE UPDATE ON public.atolls
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ─────────────────────────────────────────────────────────────
-- D3: companies — add missing columns
--     code:     short identifier (MAR, SON, LVMH …).
--               Must be unique — these are company identifiers.
--     atoll_id: FK to atolls(id).
--               Only resort-type companies carry an atoll (33 % null).
--               Stored as text names in Excel; load step must resolve
--               name → atolls.id before inserting.
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS code     text,
  ADD COLUMN IF NOT EXISTS atoll_id uuid REFERENCES public.atolls(id);

-- Unique index on code (separate statement so IF NOT EXISTS is safe
-- even if the column was added in a prior partial run).
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
--     PostgreSQL text[] uses a different wire format {Mon,Tue,...}
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
--     Actual Excel data has UUIDs matching companies.id
--     (resorts are the route endpoints in practice).
--     Drop the old FK; add a correct FK to companies.
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.pricing_standard
  DROP CONSTRAINT IF EXISTS pricing_standard_point_a_id_fkey,
  DROP CONSTRAINT IF EXISTS pricing_standard_point_b_id_fkey;

ALTER TABLE public.pricing_standard
  ADD CONSTRAINT pricing_standard_point_a_id_fkey
    FOREIGN KEY (point_a_id) REFERENCES public.companies(id),
  ADD CONSTRAINT pricing_standard_point_b_id_fkey
    FOREIGN KEY (point_b_id) REFERENCES public.companies(id);

-- ─────────────────────────────────────────────────────────────
-- D8 follow-up: destinations table
--     The destinations table was defined in migration 1 and seeded
--     with airport/resort rows.  No destinations.xlsx exists in
--     public/data/ and point_a/b_id now reference companies instead.
--     The table is kept for historical reference but is no longer
--     part of the active data model.  Do NOT drop it yet — confirm
--     with the team that no code path queries it before removing.
-- ─────────────────────────────────────────────────────────────
COMMENT ON TABLE public.destinations IS
  'Legacy table — superseded by companies.  '
  'point_a_id/point_b_id in pricing_standard now reference companies(id).  '
  'Verify no active queries before dropping.';


-- ─────────────────────────────────────────────────────────────
-- D4: Add updated_at to every sub-table that has it in Excel
--     but is missing it in SQL. Also add the trigger for each.
--
--     Tables affected (12):
--       pricing_standard, pricing_special,
--       contract_baggage, contract_booking, contract_age,
--       contract_addons, contract_insurance,
--       contract_government_charges, contract_fuel,
--       contract_payment_plan, contract_service_commitment,
--       contract_termination
-- ─────────────────────────────────────────────────────────────

-- pricing_standard
ALTER TABLE public.pricing_standard
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_pricing_standard_updated_at'
  ) THEN
    CREATE TRIGGER update_pricing_standard_updated_at
      BEFORE UPDATE ON public.pricing_standard
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;


-- pricing_special
ALTER TABLE public.pricing_special
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_pricing_special_updated_at'
  ) THEN
    CREATE TRIGGER update_pricing_special_updated_at
      BEFORE UPDATE ON public.pricing_special
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;


-- contract_baggage
ALTER TABLE public.contract_baggage
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_contract_baggage_updated_at'
  ) THEN
    CREATE TRIGGER update_contract_baggage_updated_at
      BEFORE UPDATE ON public.contract_baggage
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;


-- contract_booking
ALTER TABLE public.contract_booking
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_contract_booking_updated_at'
  ) THEN
    CREATE TRIGGER update_contract_booking_updated_at
      BEFORE UPDATE ON public.contract_booking
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;


-- contract_age
ALTER TABLE public.contract_age
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_contract_age_updated_at'
  ) THEN
    CREATE TRIGGER update_contract_age_updated_at
      BEFORE UPDATE ON public.contract_age
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;


-- contract_addons
ALTER TABLE public.contract_addons
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_contract_addons_updated_at'
  ) THEN
    CREATE TRIGGER update_contract_addons_updated_at
      BEFORE UPDATE ON public.contract_addons
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;


-- contract_insurance
ALTER TABLE public.contract_insurance
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_contract_insurance_updated_at'
  ) THEN
    CREATE TRIGGER update_contract_insurance_updated_at
      BEFORE UPDATE ON public.contract_insurance
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;


-- contract_government_charges
ALTER TABLE public.contract_government_charges
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_contract_government_charges_updated_at'
  ) THEN
    CREATE TRIGGER update_contract_government_charges_updated_at
      BEFORE UPDATE ON public.contract_government_charges
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;


-- contract_fuel
ALTER TABLE public.contract_fuel
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_contract_fuel_updated_at'
  ) THEN
    CREATE TRIGGER update_contract_fuel_updated_at
      BEFORE UPDATE ON public.contract_fuel
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;


-- contract_payment_plan
ALTER TABLE public.contract_payment_plan
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_contract_payment_plan_updated_at'
  ) THEN
    CREATE TRIGGER update_contract_payment_plan_updated_at
      BEFORE UPDATE ON public.contract_payment_plan
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;


-- contract_service_commitment
ALTER TABLE public.contract_service_commitment
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_contract_service_commitment_updated_at'
  ) THEN
    CREATE TRIGGER update_contract_service_commitment_updated_at
      BEFORE UPDATE ON public.contract_service_commitment
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;


-- contract_termination
ALTER TABLE public.contract_termination
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_contract_termination_updated_at'
  ) THEN
    CREATE TRIGGER update_contract_termination_updated_at
      BEFORE UPDATE ON public.contract_termination
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;
