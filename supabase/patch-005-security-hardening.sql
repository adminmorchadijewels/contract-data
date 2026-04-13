-- patch-005: Security hardening — restrict allowed_users to authenticated only.
--
-- ISSUE: allowed_users table is readable by the anon (unauthenticated) role.
-- This allows anyone with the Supabase anon key to enumerate all authorised
-- staff email addresses via a direct REST call before they authenticate.
--
-- FIX: Replace the permissive anon+authenticated policy with one that
-- requires a valid session (authenticated role only).
--
-- NOTE: The login-page email check (isAllowedEmail) uses the anon Supabase
-- client. We add a server-side edge function for this check instead, or
-- simply re-check inside AuthContext after sign-in (current behaviour).
-- The client-side pre-check is a UX nicety, not a security gate; removing
-- anon read access does not break login security.
--
-- Run this once in the Supabase SQL Editor.

DROP POLICY IF EXISTS "allow_read_for_all" ON public.allowed_users;

CREATE POLICY "authenticated_read_allowed_users"
  ON public.allowed_users FOR SELECT
  TO authenticated
  USING (true);
