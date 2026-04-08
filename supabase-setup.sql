-- ============================================================
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Table of pre-approved email addresses.
-- Add a row here for every person who should be able to access the app.
CREATE TABLE IF NOT EXISTS public.allowed_users (
  email      TEXT        PRIMARY KEY,
  name       TEXT,                          -- optional: full name for reference
  added_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.allowed_users ENABLE ROW LEVEL SECURITY;

-- Anyone (anon + authenticated) can SELECT to check if their email is on the list.
-- The list itself is not secret — it is just a gate.
-- Only service_role (Supabase dashboard / admin API) can INSERT / UPDATE / DELETE.
CREATE POLICY "allow_read_for_all"
  ON public.allowed_users
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- ── Seed: add your first approved users here ─────────────────────────────────
-- INSERT INTO public.allowed_users (email, name) VALUES
--   ('ahmed@transmaldivian.com',  'Ahmed Mohamed'),
--   ('fatima@transmaldivian.com', 'Fatima Ali');
