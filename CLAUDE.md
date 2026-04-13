# CLAUDE.md — TMA Contract Data

> Claude Code session guide. Keep this up to date after every code change.  
> Last updated: 2026-04-13

---

## What This Project Does

Internal web app for Trans Maldivian Airways (TMA) staff to view, query, and manage airline contract data stored in Supabase. Supports natural-language SQL queries via OpenAI, AI assistant chat, rich-text contract notes, and role-based access control.

---

## Local Dev Setup

```bash
npm install
npm run dev        # Vite dev server at http://localhost:5173
npm run build      # Production build → dist/
npm run lint       # ESLint check
npm run test       # Vitest
npm run preview    # Serve the dist/ build locally
```

### Required Environment Variables

Create a `.env.local` from `.env.example`:

| Variable | Where set | Purpose |
|----------|-----------|---------|
| `VITE_SUPABASE_URL` | Vercel + local | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Vercel + local | Supabase anonymous key (safe to expose) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Vercel only** | Service role key — never in client bundle |
| `OPENAI_API_KEY` | **Vercel only** | OpenAI key — never in client bundle |

> `VITE_*` vars are embedded at build time and visible in the browser bundle. Never put secrets in them.

---

## Architecture

- **SPA** — Vite + React 18, client-side routing (React Router v6), no SSR
- **Data layer** — All contract data in Supabase (PostgreSQL). CRUD via `src/lib/db.ts`
- **Auth** — Supabase Email+Password. Domain-restricted to `@transmaldivian.com` + allowlist table
- **Roles** — `Admin | Editor | Viewer` fetched from `user_roles` DB table on login (`src/lib/RoleContext.tsx`)
- **Edge Functions** — `api/admin-users.ts`, `api/generate-sql.ts` (Vercel Edge, secrets stay server-side)
- **AI** — OpenAI `gpt-4o-mini` via `/api/generate-sql`; also WebLLM (in-browser WASM) and Ollama (local dev)

---

## Role System

Roles are **database-backed**, not localStorage.

| Role | Permissions |
|------|-------------|
| `Admin` | Full CRUD + delete + user management + Settings page |
| `Editor` | Create + edit; no delete, no Settings |
| `Viewer` | Read-only |

- `dbRole` = authoritative role from `user_roles` table
- `role` = active role (may differ if Admin is previewing another role)
- Settings page and Settings nav link are **hidden for non-Admins** — check `dbRole`, not `role`
- **Never use `role` for security checks** — use `dbRole`. A preview could otherwise be exploited.

Key files: `src/lib/RoleContext.tsx`, `src/components/layout/AppSidebar.tsx`, `src/pages/Settings.tsx`

---

## Adding a New Database Table

1. Create a new migration file in `supabase/migrations/` (filename: `YYYYMMDDHHMMSS_description.sql`)
2. Add the table name to the `TableName` union type in `src/lib/excelDataService.ts`
3. Add RLS policies (enable RLS + at minimum `authenticated` SELECT policy)
4. Add the table's columns to `TABLE_COLUMNS` in **both** `src/lib/sqlEngine.ts` and `api/generate-sql.ts` (these are separate static maps — keep them in sync)
5. Run the migration in Supabase SQL Editor (migrations are not auto-applied)

---

## Adding a New API Route

1. Create `api/<route-name>.ts` with `export const config = { runtime: "edge" }`
2. Always verify the JWT: `adminClient.auth.getUser(token)` — never trust the caller without this
3. Add the route exclusion to `vercel.json` if needed (the SPA catch-all must not catch `/api/*`)
4. Never use `VITE_*` env vars in edge functions — use `process.env.VAR_NAME` directly

---

## Security Rules

**Never do these:**
- Log user data, SQL queries, or error stack traces with `console.log/error` in components
- Show raw DB error messages in toasts — use a generic message and log server-side
- Put `SUPABASE_SERVICE_ROLE_KEY` or `OPENAI_API_KEY` in any `VITE_*` variable
- Trust client-sent role values — always re-check role from DB in edge functions
- Skip JWT verification in edge functions — both `api/*.ts` files call `auth.getUser(token)` on every request

**Security measures already in place:**
- HTTP headers: HSTS (2yr), CSP, X-Frame-Options DENY, XCTO nosniff (`vercel.json`)
- XSS: DOMPurify in `src/lib/sanitize.ts` — use `sanitizeInput()` for all Tiptap HTML
- CSRF: helpers in `src/lib/csrf.ts` — **not yet wired to edge functions** (preparatory only)
- RLS: enabled on all 20 Supabase tables
- Query timeout: `AbortSignal.timeout(10_000)` on all Supabase queries in `src/lib/db.ts`
- Auth: `allowed_users` table restricted to `authenticated` role only (patch-005)

---

## Do Not Touch Without Care

| What | Why |
|------|-----|
| `vercel.json` rewrite ordering | SPA catch-all must exclude `/api/` — changing this breaks all edge functions silently |
| `RoleContext.tsx` `setPreviewRole` guard | Uses `dbRole`, not `role` — changing to `role` enables privilege escalation |
| `api/admin-users.ts` `ALLOWED_ROLES` | Intentionally excludes `"Admin"` — prevents API-based Admin promotion |
| `useContracts` cascade delete | Deletes 12 sub-tables in `Promise.all` (not DB CASCADE) — not transactional; partial deletes possible if one fails |
| `supabase/migrations/` files | Immutable once applied to production — editing has no effect on the live DB |
| `middleware.ts` | Cookie presence check only — not JWT. Don't rely on it as a security boundary |

---

## Known Technical Debt

| Item | File | Notes |
|------|------|-------|
| Dead Excel layer | `src/lib/excelDataService.ts`, `public/data/*.xlsx`, SheetJS dep | Safe to delete; nothing calls it since Supabase migration |
| Stub schema manager | `src/hooks/useSchemaManager.ts` | Returns `[]` and no-ops; never implemented |
| Legacy NL→SQL | `src/lib/nlToSql.ts` | Superseded by OpenAI proxy; `hasOpenAIKey()` always returns `true` |
| CSRF not wired | `src/lib/csrf.ts` | Helpers exist but not used in any edge function |
| `@ts-nocheck` in edge functions | `api/admin-users.ts`, `api/generate-sql.ts` | Blanket-disables TS in security-critical files |
| Zod schema drift | `src/lib/validations.ts` `pricingSpecialSchema` | Missing `'VIP Guest'` — added in migration D6 but not in Zod enum |
| `TABLE_COLUMNS` drift | `src/lib/sqlEngine.ts`, `api/generate-sql.ts` | Two separate static maps, both diverge from actual DB schema |
| Middleware is cookie-only | `middleware.ts` | `isValidSession()` just checks string length — not real JWT verification |

---

## Project Context

Full architecture details, database schema, API routes, and security measures are documented in `.claude/project-context.md`.

**Always update `.claude/project-context.md` after making code changes.** This file is the primary reference for future Claude Code sessions.
