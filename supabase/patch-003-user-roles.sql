-- ============================================================
-- Patch 003 — Server-side role enforcement
-- ============================================================
--
-- Creates a user_roles table that maps each Supabase Auth user
-- to one of: Admin | Editor | Viewer.
--
-- Without a row in this table the app defaults to "Viewer".
-- Only the service role / Supabase Dashboard can INSERT or UPDATE
-- roles — authenticated users can only SELECT their own row.
--
-- Run this ONCE against your live Supabase database.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id    UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT        NOT NULL DEFAULT 'Viewer'
               CHECK (role IN ('Admin', 'Editor', 'Viewer')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Each authenticated user may read their own role only
CREATE POLICY "users_read_own_role" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- No INSERT / UPDATE / DELETE policy for authenticated users
-- → all role changes must be made by a DB admin or service role

GRANT SELECT ON public.user_roles TO authenticated;

-- ── How to assign roles ──────────────────────────────────────
-- Run in Supabase SQL Editor (uses service role automatically):
--
--   INSERT INTO public.user_roles (user_id, role)
--   VALUES ('<paste-user-uuid-here>', 'Admin')
--   ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role, updated_at = now();
--
-- Find a user's UUID in: Supabase Dashboard → Authentication → Users
-- ────────────────────────────────────────────────────────────
