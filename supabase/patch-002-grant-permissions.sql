-- ============================================================
-- Patch 002 — Grant table permissions to authenticated role
-- ============================================================
--
-- Tables created via SQL Editor do NOT automatically get
-- permissions granted to the anon / authenticated roles.
-- Without these grants, all SELECT/INSERT/UPDATE/DELETE calls
-- from the app return empty results or silently fail, even
-- when RLS policies are correctly defined.
--
-- Run this ONCE against your live Supabase database.
-- ============================================================

-- Schema access
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Full CRUD on all tables for logged-in users
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Sequence access (needed for auto-increment / serial columns)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
