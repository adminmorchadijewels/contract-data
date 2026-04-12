-- ============================================================
-- Patch 001 — Drop incorrect UNIQUE constraint on contracts.contract_id
-- ============================================================
--
-- contract_id is a parent-level code shared by multiple sub-contracts
-- (e.g. CTR-001 has sub-contracts CTR-001-001, CTR-001-002).
-- The unique constraint should only be on sub_contract_id, not contract_id.
--
-- Run this ONCE against your live Supabase database, then run seed-data.sql.
-- ============================================================

ALTER TABLE public.contracts
  DROP CONSTRAINT IF EXISTS contracts_contract_id_key;
