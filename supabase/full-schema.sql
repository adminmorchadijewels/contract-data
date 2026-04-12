-- ============================================================
-- TMA Contract Data — Full Schema (authoritative, corrected)
-- ============================================================
-- Run this single file in Supabase Dashboard → SQL Editor
-- on a FRESH database to set up the complete schema.
--
-- If you already have tables from earlier migrations, run the
-- individual files in supabase/migrations/ in timestamp order.
--
-- All statements are idempotent (IF NOT EXISTS / OR REPLACE /
-- DROP ... IF EXISTS) so re-running is safe.
-- ============================================================


-- ─────────────────────────────────────────────────────────────
-- Trigger helper function
-- $func$ delimiter avoids pairing issues in SQL editors that
-- scan for $$ matches across the whole file.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $func$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql SET search_path = public;


-- ─────────────────────────────────────────────────────────────
-- atolls
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.atolls (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.atolls ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated access" ON public.atolls;
CREATE POLICY "Authenticated access" ON public.atolls
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS update_atolls_updated_at ON public.atolls;
CREATE TRIGGER update_atolls_updated_at
  BEFORE UPDATE ON public.atolls
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ─────────────────────────────────────────────────────────────
-- companies
-- Corrections vs migration 1:
--   + code text (unique per company)
--   + atoll_id uuid FK → atolls(id)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.companies (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text        NOT NULL,
  code            text,
  address         text,
  type            text        NOT NULL CHECK (type IN ('Group', 'Resort')),
  registration_no text,
  coordinates     text,
  atoll_id        uuid        REFERENCES public.atolls(id),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS companies_code_unique
  ON public.companies (code) WHERE code IS NOT NULL;

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access"        ON public.companies;
DROP POLICY IF EXISTS "Authenticated access" ON public.companies;
CREATE POLICY "Authenticated access" ON public.companies
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ─────────────────────────────────────────────────────────────
-- destinations  (legacy — kept for reference)
-- point_a_id / point_b_id in pricing_standard now reference
-- companies(id) instead of this table.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.destinations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  code        text UNIQUE,
  coordinates text,
  created_at  timestamptz DEFAULT now()
);

COMMENT ON TABLE public.destinations IS
  'Legacy — superseded by companies. '
  'Verify no active queries before dropping.';

ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access"        ON public.destinations;
DROP POLICY IF EXISTS "Authenticated access" ON public.destinations;
CREATE POLICY "Authenticated access" ON public.destinations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────
-- contracts
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contracts (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id      text        NOT NULL,
  contract_code    text        NOT NULL,
  carrier_id       text        DEFAULT 'TMA101',
  group_id         uuid        REFERENCES public.companies(id),
  resort_id        uuid        REFERENCES public.companies(id),
  sub_contract_id  text        UNIQUE,
  sub_contract_type text       CHECK (sub_contract_type IN ('Transfer', 'Charter', 'Signed Charter')),
  start_date       date        NOT NULL,
  end_date         date        NOT NULL,
  agreement_type   text        DEFAULT 'Exclusive Seaplane (Day time)',
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access"        ON public.contracts;
DROP POLICY IF EXISTS "Authenticated access" ON public.contracts;
CREATE POLICY "Authenticated access" ON public.contracts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS update_contracts_updated_at ON public.contracts;
CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ─────────────────────────────────────────────────────────────
-- pricing_standard
-- Corrections vs migration 1:
--   weekdays  text[] → jsonb  (Excel stores JSON arrays)
--   point_a_id / point_b_id → companies(id)  (not destinations)
--   + updated_at
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pricing_standard (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_contract_id text        REFERENCES public.contracts(sub_contract_id),
  weekdays        jsonb       NOT NULL,
  point_a_id      uuid        REFERENCES public.companies(id),
  point_b_id      uuid        REFERENCES public.companies(id),
  transfer_type   text,
  pax_condition   text,
  passenger_type  text        CHECK (passenger_type IN ('Adult', 'Child')),
  return_fare_usd numeric(10,2),
  one_way_fare_usd numeric(10,2),
  start_date      date,
  end_date        date,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE public.pricing_standard ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access"        ON public.pricing_standard;
DROP POLICY IF EXISTS "Authenticated access" ON public.pricing_standard;
CREATE POLICY "Authenticated access" ON public.pricing_standard
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS update_pricing_standard_updated_at ON public.pricing_standard;
CREATE TRIGGER update_pricing_standard_updated_at
  BEFORE UPDATE ON public.pricing_standard
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ─────────────────────────────────────────────────────────────
-- pricing_special
-- Corrections vs migration 1:
--   request_type CHECK expanded to include 'VIP Guest'
--   + updated_at
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pricing_special (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_contract_id  text        REFERENCES public.contracts(sub_contract_id),
  request_type     text        CHECK (request_type IN (
                                 'Management', 'Staff', 'Service providers',
                                 'FAM trips', 'Tour Operators', 'Tour Guides',
                                 'Journalists', 'Advertisers', 'VIP Guest', 'Others'
                               )),
  discount_type    text        CHECK (discount_type IN ('Absolute', 'Percentage')),
  return_fare_usd  numeric(10,2),
  one_way_fare_usd numeric(10,2),
  pax_condition    text,
  start_date       date,
  end_date         date,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

ALTER TABLE public.pricing_special ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access"        ON public.pricing_special;
DROP POLICY IF EXISTS "Authenticated access" ON public.pricing_special;
CREATE POLICY "Authenticated access" ON public.pricing_special
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS update_pricing_special_updated_at ON public.pricing_special;
CREATE TRIGGER update_pricing_special_updated_at
  BEFORE UPDATE ON public.pricing_special
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ─────────────────────────────────────────────────────────────
-- contract_baggage  (+ updated_at)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contract_baggage (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_contract_id text        REFERENCES public.contracts(sub_contract_id),
  parameter       text        NOT NULL,
  value           text        NOT NULL,
  remark          text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE public.contract_baggage ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access"        ON public.contract_baggage;
DROP POLICY IF EXISTS "Authenticated access" ON public.contract_baggage;
CREATE POLICY "Authenticated access" ON public.contract_baggage
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS update_contract_baggage_updated_at ON public.contract_baggage;
CREATE TRIGGER update_contract_baggage_updated_at
  BEFORE UPDATE ON public.contract_baggage
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ─────────────────────────────────────────────────────────────
-- contract_booking  (+ updated_at)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contract_booking (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_contract_id text        REFERENCES public.contracts(sub_contract_id),
  parameter       text        NOT NULL,
  value           text        NOT NULL,
  remark          text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE public.contract_booking ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access"        ON public.contract_booking;
DROP POLICY IF EXISTS "Authenticated access" ON public.contract_booking;
CREATE POLICY "Authenticated access" ON public.contract_booking
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS update_contract_booking_updated_at ON public.contract_booking;
CREATE TRIGGER update_contract_booking_updated_at
  BEFORE UPDATE ON public.contract_booking
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ─────────────────────────────────────────────────────────────
-- contract_age  (+ updated_at)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contract_age (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_contract_id text        REFERENCES public.contracts(sub_contract_id),
  type            text        NOT NULL CHECK (type IN ('Infant', 'Child', 'Adult')),
  min_age         integer     NOT NULL,
  max_age         integer,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE public.contract_age ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access"        ON public.contract_age;
DROP POLICY IF EXISTS "Authenticated access" ON public.contract_age;
CREATE POLICY "Authenticated access" ON public.contract_age
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS update_contract_age_updated_at ON public.contract_age;
CREATE TRIGGER update_contract_age_updated_at
  BEFORE UPDATE ON public.contract_age
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ─────────────────────────────────────────────────────────────
-- contract_addons  (+ updated_at)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contract_addons (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_contract_id text        REFERENCES public.contracts(sub_contract_id),
  sub_category    text        NOT NULL,
  type            text        NOT NULL,
  value           numeric(10,2) NOT NULL,
  remark          text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE public.contract_addons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access"        ON public.contract_addons;
DROP POLICY IF EXISTS "Authenticated access" ON public.contract_addons;
CREATE POLICY "Authenticated access" ON public.contract_addons
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS update_contract_addons_updated_at ON public.contract_addons;
CREATE TRIGGER update_contract_addons_updated_at
  BEFORE UPDATE ON public.contract_addons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ─────────────────────────────────────────────────────────────
-- contract_insurance  (+ updated_at)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contract_insurance (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_contract_id text        REFERENCES public.contracts(sub_contract_id),
  parameter       text        NOT NULL,
  value           text        NOT NULL CHECK (value IN ('Yes', 'No')),
  remark          text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE public.contract_insurance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access"        ON public.contract_insurance;
DROP POLICY IF EXISTS "Authenticated access" ON public.contract_insurance;
CREATE POLICY "Authenticated access" ON public.contract_insurance
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS update_contract_insurance_updated_at ON public.contract_insurance;
CREATE TRIGGER update_contract_insurance_updated_at
  BEFORE UPDATE ON public.contract_insurance
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ─────────────────────────────────────────────────────────────
-- contract_government_charges  (+ updated_at)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contract_government_charges (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_contract_id text        REFERENCES public.contracts(sub_contract_id),
  parameter       text        NOT NULL,
  value           numeric(10,2) NOT NULL,
  remark          text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE public.contract_government_charges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access"        ON public.contract_government_charges;
DROP POLICY IF EXISTS "Authenticated access" ON public.contract_government_charges;
CREATE POLICY "Authenticated access" ON public.contract_government_charges
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS update_contract_government_charges_updated_at ON public.contract_government_charges;
CREATE TRIGGER update_contract_government_charges_updated_at
  BEFORE UPDATE ON public.contract_government_charges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ─────────────────────────────────────────────────────────────
-- contract_fuel
-- Correction vs migration 1:
--   value  numeric(10,2) → text
--   (Excel stores "Included", "$48 per flight hour", etc.)
--   + updated_at
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contract_fuel (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_contract_id text        REFERENCES public.contracts(sub_contract_id),
  type            text        NOT NULL,
  value           text        NOT NULL,
  remark          text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE public.contract_fuel ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access"        ON public.contract_fuel;
DROP POLICY IF EXISTS "Authenticated access" ON public.contract_fuel;
CREATE POLICY "Authenticated access" ON public.contract_fuel
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS update_contract_fuel_updated_at ON public.contract_fuel;
CREATE TRIGGER update_contract_fuel_updated_at
  BEFORE UPDATE ON public.contract_fuel
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ─────────────────────────────────────────────────────────────
-- contract_payment_plan  (+ updated_at)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contract_payment_plan (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_contract_id text        REFERENCES public.contracts(sub_contract_id),
  parameter       text        NOT NULL,
  value           text        NOT NULL,
  remark          text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE public.contract_payment_plan ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access"        ON public.contract_payment_plan;
DROP POLICY IF EXISTS "Authenticated access" ON public.contract_payment_plan;
CREATE POLICY "Authenticated access" ON public.contract_payment_plan
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS update_contract_payment_plan_updated_at ON public.contract_payment_plan;
CREATE TRIGGER update_contract_payment_plan_updated_at
  BEFORE UPDATE ON public.contract_payment_plan
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ─────────────────────────────────────────────────────────────
-- contract_service_commitment  (+ updated_at)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contract_service_commitment (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_contract_id text        REFERENCES public.contracts(sub_contract_id),
  parameter       text        NOT NULL,
  value           text        NOT NULL,
  remark          text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE public.contract_service_commitment ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access"        ON public.contract_service_commitment;
DROP POLICY IF EXISTS "Authenticated access" ON public.contract_service_commitment;
CREATE POLICY "Authenticated access" ON public.contract_service_commitment
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS update_contract_service_commitment_updated_at ON public.contract_service_commitment;
CREATE TRIGGER update_contract_service_commitment_updated_at
  BEFORE UPDATE ON public.contract_service_commitment
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ─────────────────────────────────────────────────────────────
-- contract_termination  (+ updated_at)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contract_termination (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_contract_id text        REFERENCES public.contracts(sub_contract_id),
  parameter       text        NOT NULL,
  value           text        NOT NULL,
  remark          text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE public.contract_termination ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access"        ON public.contract_termination;
DROP POLICY IF EXISTS "Authenticated access" ON public.contract_termination;
CREATE POLICY "Authenticated access" ON public.contract_termination
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS update_contract_termination_updated_at ON public.contract_termination;
CREATE TRIGGER update_contract_termination_updated_at
  BEFORE UPDATE ON public.contract_termination
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ─────────────────────────────────────────────────────────────
-- contract_notes
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contract_notes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid        REFERENCES public.contracts(id) ON DELETE CASCADE,
  content     text,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE public.contract_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access"        ON public.contract_notes;
DROP POLICY IF EXISTS "Authenticated access" ON public.contract_notes;
CREATE POLICY "Authenticated access" ON public.contract_notes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS update_contract_notes_updated_at ON public.contract_notes;
CREATE TRIGGER update_contract_notes_updated_at
  BEFORE UPDATE ON public.contract_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ─────────────────────────────────────────────────────────────
-- table_settings  (per-user column/visibility config)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.table_settings (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL,
  table_name    text        NOT NULL,
  visible       boolean     NOT NULL DEFAULT true,
  column_config jsonb       NOT NULL DEFAULT '[]'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, table_name)
);

ALTER TABLE public.table_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own settings"   ON public.table_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON public.table_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.table_settings;
DROP POLICY IF EXISTS "Users can delete own settings" ON public.table_settings;
CREATE POLICY "Users can view own settings"
  ON public.table_settings FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings"
  ON public.table_settings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings"
  ON public.table_settings FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own settings"
  ON public.table_settings FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_table_settings_updated_at ON public.table_settings;
CREATE TRIGGER update_table_settings_updated_at
  BEFORE UPDATE ON public.table_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ─────────────────────────────────────────────────────────────
-- allowed_users  (auth allowlist — checked before sign-in/up)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.allowed_users (
  email    text        PRIMARY KEY,
  name     text,
  added_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.allowed_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_read_for_all" ON public.allowed_users;
CREATE POLICY "allow_read_for_all"
  ON public.allowed_users FOR SELECT
  TO anon, authenticated
  USING (true);

-- ─────────────────────────────────────────────────────────────
-- Add approved users below before running seed script.
-- INSERT INTO public.allowed_users (email, name) VALUES
--   ('ahmed@transmaldivian.com', 'Ahmed Mohamed');
-- ─────────────────────────────────────────────────────────────


-- ─────────────────────────────────────────────────────────────
-- exec_ddl / exec_query  (schema-manager edge function helpers)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.exec_ddl(sql_text TEXT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $func$
BEGIN
  IF NOT (sql_text ~* '^\s*(CREATE|ALTER|DROP)\s') THEN
    RAISE EXCEPTION 'Only DDL statements are allowed';
  END IF;
  IF sql_text ~* '\b(auth|storage|realtime|supabase_functions|vault|pg_)\b' THEN
    RAISE EXCEPTION 'Cannot modify system schemas';
  END IF;
  EXECUTE sql_text;
END;
$func$;

CREATE OR REPLACE FUNCTION public.exec_query(sql_text TEXT)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $func$
DECLARE result jsonb;
BEGIN
  IF NOT (sql_text ~* '^\s*SELECT\s') THEN
    RAISE EXCEPTION 'Only SELECT statements are allowed';
  END IF;
  EXECUTE 'SELECT jsonb_agg(row_to_json(t)) FROM (' || sql_text || ') t' INTO result;
  RETURN COALESCE(result, '[]'::jsonb);
END;
$func$;

REVOKE EXECUTE ON FUNCTION public.exec_ddl(TEXT)   FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.exec_query(TEXT)  FROM PUBLIC, authenticated;
