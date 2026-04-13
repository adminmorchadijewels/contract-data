-- patch-004: Grant table-level permissions to service_role for admin edge functions.
--
-- The service_role PostgREST role bypasses RLS but still requires explicit GRANT
-- on user-created tables. Without this, calls from the admin edge function
-- (using the service role key) return "permission denied for table user_roles".
--
-- Run this once in the Supabase SQL Editor.

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO service_role;
