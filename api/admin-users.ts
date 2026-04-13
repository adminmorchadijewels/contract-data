/**
 * Vercel Edge Function — Admin user management proxy.
 *
 * Keeps the SUPABASE_SERVICE_ROLE_KEY server-side so it is never exposed to the browser.
 * Set the environment variable in Vercel → Project Settings → Environment Variables.
 *
 * GET  /api/admin-users          → list all auth users merged with their roles
 * PATCH /api/admin-users         → update one user's role (Editor or Viewer only)
 *
 * Body (PATCH): { userId: string, role: "Editor" | "Viewer" }
 * Response:     [{ id, email, role, last_sign_in_at, created_at }]
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck — Supabase createClient generic inference causes false positives in edge function context

import { createClient } from "@supabase/supabase-js";

export const config = { runtime: "edge" };

const ALLOWED_ROLES = ["Editor", "Viewer"];

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export default async function handler(req: Request): Promise<Response> {
  const supabaseUrl = (process.env as Record<string, string | undefined>).VITE_SUPABASE_URL;
  const serviceRoleKey = (process.env as Record<string, string | undefined>).SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: "User management is not configured on this server. Set SUPABASE_SERVICE_ROLE_KEY in Vercel environment variables." }, 503);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // ── Auth: verify JWT and confirm caller is Admin ──────────────────────────
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return json({ error: "Missing or invalid Authorization header" }, 401);

  const token = authHeader.slice(7);
  const { data: userData, error: userError } = await adminClient.auth.getUser(token);
  if (userError || !userData?.user) return json({ error: "Invalid or expired token" }, 401);

  const callerId = userData.user.id;

  const { data: callerRoleRow, error: callerRoleError } = await adminClient
    .from("user_roles")
    .select("role")
    .eq("user_id", callerId)
    .maybeSingle();

  if (callerRoleError) return json({ error: `Failed to verify caller role: ${callerRoleError.message}` }, 500);
  if (callerRoleRow?.role !== "Admin") return json({ error: "Forbidden: Admin role required" }, 403);

  // ── GET: list all users ───────────────────────────────────────────────────
  if (req.method === "GET") {
    const { data: authUsers, error: listError } = await adminClient.auth.admin.listUsers();
    if (listError) return json({ error: `Failed to list users: ${listError.message}` }, 500);

    const { data: roleRows, error: rolesError } = await adminClient
      .from("user_roles")
      .select("user_id, role");
    if (rolesError) return json({ error: `Failed to fetch roles: ${rolesError.message}` }, 500);

    const roleMap = new Map((roleRows ?? []).map((r) => [r.user_id as string, r.role as string]));

    const users = authUsers.users.map((u) => ({
      id: u.id,
      email: u.email ?? "",
      role: roleMap.get(u.id) ?? "Viewer",
      last_sign_in_at: u.last_sign_in_at ?? null,
      created_at: u.created_at,
    }));

    return json(users);
  }

  // ── PATCH: update a user's role ───────────────────────────────────────────
  if (req.method === "PATCH") {
    let body: { userId?: string; role?: string };
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    const { userId, role } = body;
    if (!userId || !role) return json({ error: "userId and role are required" }, 400);
    if (!ALLOWED_ROLES.includes(role)) {
      return json({ error: `role must be one of: ${ALLOWED_ROLES.join(", ")}` }, 400);
    }
    if (userId === callerId) return json({ error: "You cannot change your own role" }, 403);

    const { error: upsertError } = await adminClient.from("user_roles").upsert(
      { user_id: userId, role, updated_at: new Date().toISOString() },
      { onConflict: "user_id" },
    );
    if (upsertError) return json({ error: `Failed to update role: ${upsertError.message}` }, 500);

    return json({ success: true });
  }

  return json({ error: "Method not allowed" }, 405);
}
