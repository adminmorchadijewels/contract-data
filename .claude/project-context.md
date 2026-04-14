Here are the findings:

---

## 1. What This Project Does

**TMA Contract Data** is an internal web application for Trans Maldivian Airways (TMA) staff to view, query, and manage airline contract data stored in Supabase. It provides a contract management interface with rich-text notes, a natural-language-to-SQL query engine powered by OpenAI (server-side proxied), an AI assistant, and role-based access control so Admins, Editors, and Viewers each see only what they're permitted to act on.

---

## 2. Full Tech Stack

| Layer | Technology |
|---|---|
| Build tool | Vite 5 (`@vitejs/plugin-react-swc`) |
| UI framework | React 18 |
| Language | TypeScript 5.8 (`strict: false`) |
| Routing | React Router DOM v6 |
| Styling | Tailwind CSS 3.4 + `tailwindcss-animate` |
| Component library | Radix UI (full suite) + shadcn/ui patterns |
| Animations | Framer Motion 12 |
| State / data cache | TanStack Query v5 |
| Forms | React Hook Form v7 + Zod v3 |
| Rich text editor | Tiptap 3 (Link, Placeholder, TextAlign, Underline) |
| Charts | Recharts 2 |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| Auth | `@supabase/supabase-js` v2 |
| In-browser LLM | `@mlc-ai/web-llm` (WASM, models from HuggingFace CDN) |
| Local LLM | Ollama at `localhost:11434` |
| Cloud LLM | OpenAI SDK v6 (server-side, proxied via Vercel edge fn) |
| XSS prevention | DOMPurify 3 |
| Edge runtime | `@vercel/edge` v1 |
| Testing | Vitest 3 + jsdom + `@testing-library/react` |
| Linting | ESLint 9 + typescript-eslint |
| Deploy | Vercel (SPA + Edge Functions + Edge Middleware) |
| Legacy data | SheetJS (`xlsx`) — still present but no longer primary |

---

## 3. Folder Structure

```
contract-data/
├── api/
│   ├── admin-users.ts        Vercel Edge Fn — GET/PATCH user roles (service role key)
│   ├── embed.ts              Vercel Edge Fn — OpenAI text-embedding-3-small proxy (requires Bearer auth)
│   └── generate-sql.ts       Vercel Edge Fn — OpenAI NL-to-SQL proxy; accepts examples + errorContext (requires Bearer auth)
├── public/
│   ├── data/                 Legacy Excel files (.xlsx) — served statically
│   └── tma-logo.svg
├── src/
│   ├── main.tsx              React DOM entry point
│   ├── App.tsx               Root: ErrorBoundary → AuthProvider → RoleProvider → Router
│   ├── App.css / index.css
│   ├── vite-env.d.ts
│   ├── types/
│   │   └── index.ts          Central TS types (ParamRow, ContractDetail, etc.)
│   ├── context/
│   │   └── AuthContext.tsx   Supabase session state, notAuthorised flag
│   ├── pages/
│   │   ├── Login.tsx         Sign-in / Sign-up / OTP verify (3 views)
│   │   ├── Index.tsx         Dashboard / resort data table
│   │   ├── Contracts.tsx     Contract list + detail views
│   │   ├── Query.tsx         NL-to-SQL query interface
│   │   ├── Settings.tsx      Admin-only: display config, atolls, user management
│   │   ├── Assistant.tsx     AI assistant chat page
│   │   └── NotFound.tsx      404 page
│   ├── components/
│   │   ├── auth/
│   │   │   ├── ProtectedRoute.tsx   Redirects to /login if no session
│   │   │   └── UserMenu.tsx         Sidebar footer: avatar + sign-out
│   │   ├── layout/
│   │   │   ├── AppSidebar.tsx       Nav sidebar; Settings hidden for non-Admins
│   │   │   └── Header.tsx           Top header with sidebar trigger
│   │   ├── ai-assistant/
│   │   │   └── AIAssistant.tsx      Chat UI (OpenAI / WebLLM / Ollama)
│   │   ├── companies/               Company table, form, delete dialog
│   │   ├── contracts/               Contract table, form, detail modal, tab views
│   │   ├── settings/
│   │   │   ├── SchemaManager.tsx    DB schema introspection + column management
│   │   │   ├── TableSettingsModal.tsx  Column visibility/order config
│   │   │   └── UserManagementCard.tsx  In-app user role management (Admin only)
│   │   └── ui/                      Radix/shadcn primitives (50+ components)
│   ├── lib/
│   │   ├── supabase.ts          Supabase client, isAllowedEmail(), isUserAllowed()
│   │   ├── db.ts                Supabase CRUD layer (selectAll, insert, update, delete…)
│   │   ├── RoleContext.tsx      Role state — fetched from user_roles table on login
│   │   ├── auth.ts              isAuthenticated() cookie shim for middleware
│   │   ├── excelDataService.ts  Legacy: fetch+parse XLSX into in-memory Map
│   │   ├── sqlEngine.ts         Client-side SELECT/JOIN/WHERE parser
│   │   ├── nlToSql.ts           NL → SQL prompt builder
│   │   ├── openaiSqlService.ts  Legacy: calls /api/generate-sql with Bearer token (superseded by ragSqlService)
│   │   ├── ragSqlService.ts     RAG orchestrator: embed → retrieve → generate → self-heal + feedback submission
│   │   ├── ollamaService.ts     Streams from localhost Ollama
│   │   ├── webLLMService.ts     WebLLM WASM LLM interface
│   │   ├── sanitize.ts          DOMPurify wrappers
│   │   ├── csrf.ts              CSRF token helpers
│   │   ├── utils.ts             cn() Tailwind class merger
│   │   └── validations.ts       Zod schemas
│   ├── hooks/
│   │   ├── useAdminUsers.ts     TanStack Query — GET/PATCH /api/admin-users
│   │   ├── useCompanies.ts      TanStack Query — company data
│   │   ├── useContracts.ts      TanStack Query — contract data
│   │   ├── useSchemaManager.ts  DB schema introspection
│   │   ├── useTableSettings.ts  Column visibility persistence
│   │   ├── use-mobile.tsx       Responsive breakpoint
│   │   └── use-toast.ts         Toast notifications
│   └── test/
│       ├── setup.ts             Vitest + jest-dom setup
│       └── example.test.ts
├── supabase/
│   ├── migrations/
│   │   ├── 20260212113817_*.sql              Full DB schema (20 tables + RLS)
│   │   └── 20260413000001_rag_feedback_system.sql  pgvector, approved_examples, rejected_examples, match RPC, RLS
│   ├── patch-004-service-role-grants.sql   GRANT on user_roles for service role
│   └── patch-005-security-hardening.sql    Restrict allowed_users to authenticated
├── .github/
│   └── workflows/
│       └── security-audit.yml   npm audit on PRs
├── middleware.ts               Vercel Edge Middleware — cookie auth gate
├── vercel.json                 SPA rewrite + security headers
├── supabase-setup.sql          allowed_users table setup
└── .claude/
    └── project-context.md      Project reference for Claude Code sessions
```

---

## 4. Architecture Pattern

**Provider-wrapped SPA with server-side API proxies.**

The app is a pure client-side React SPA (no SSR) with this layered structure:

- **Context providers** wrap the app tree in a fixed order: `ErrorBoundary → AuthProvider (Supabase session) → RoleProvider (DB-fetched role) → QueryClientProvider → BrowserRouter`
- **Route guard**: `ProtectedRoute` + Vercel Edge Middleware provide two independent auth layers (client + server)
- **Data layer**: `src/lib/db.ts` wraps Supabase CRUD; TanStack Query hooks (`useCompanies`, `useContracts`, etc.) consume it with caching and optimistic updates
- **Server-side secrets**: Sensitive operations (OpenAI calls, user role management) run as **Vercel Edge Functions** (`api/`) — never exposing `OPENAI_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` to the browser
- **Role-based UI**: `RoleContext` reads `user_roles` from Supabase on login; `dbRole` controls what's rendered (Settings page, nav items, CRUD buttons) — Admins can also preview other roles without affecting their real permissions




Here are the findings:

---

## 1. Database Tables & Relationships

### Core Tables

| Table | Purpose | Key Columns |
|---|---|---|
| `companies` | Groups and Resorts (hotels, holding companies) | `type CHECK ('Group','Resort')`, `code` (unique short ID), `atoll_id FK→atolls` |
| `atolls` | Maldivian atolls — used as a dropdown for resort location | `name` (unique) |
| `destinations` | **Legacy** seaplane airports/resorts. Originally used for pricing routes, now superseded — `pricing_standard.point_a/b_id` was re-pointed to `companies(id)` | `code` (IATA), `coordinates` |
| `contracts` | Master contract record per resort | `contract_id` (unique text), `sub_contract_id` (unique text used as FK by all sub-tables), `sub_contract_type CHECK ('Transfer','Charter','Signed Charter')`, `group_id FK→companies`, `resort_id FK→companies` |

### Pricing Tables (both link via `sub_contract_id → contracts.sub_contract_id`)

| Table | Purpose | Key Columns / Constraints |
|---|---|---|
| `pricing_standard` | Standard fares by route, day, and passenger type | `point_a_id / point_b_id FK→companies(id)`, `passenger_type CHECK ('Adult','Child')`, `weekdays jsonb`, `return_fare_usd`, `one_way_fare_usd` |
| `pricing_special` | Discounted fares for special request types | `request_type CHECK ('Management','Staff','Service providers','FAM trips','Tour Operators','Tour Guides','Journalists','Advertisers','VIP Guest','Others')`, `discount_type CHECK ('Absolute','Percentage')` |

### Contract Parameter Tables (all link via `sub_contract_id → contracts.sub_contract_id`)

| Table | Purpose | Notable Column |
|---|---|---|
| `contract_baggage` | Baggage allowance terms | `parameter`, `value`, `remark` |
| `contract_booking` | Booking/cancellation conditions | `parameter`, `value`, `remark` |
| `contract_age` | Age bracket definitions | `type CHECK ('Infant','Child','Adult')`, `min_age`, `max_age` |
| `contract_addons` | Add-on services (meals, transfers) | `sub_category`, `type`, `value numeric`, `remark` |
| `contract_insurance` | Insurance requirement flag | `value CHECK ('Yes','No')` |
| `contract_government_charges` | Tax / government fees | `parameter`, `value numeric`, `remark` |
| `contract_fuel` | Fuel surcharge (free-form text) | `type`, `value text` *(was numeric, fixed in migration D5)* |
| `contract_payment_plan` | Payment schedule terms | `parameter`, `value`, `remark` |
| `contract_service_commitment` | SLA / minimum seat commitments | `parameter`, `value`, `remark` |
| `contract_termination` | Termination clause terms | `parameter`, `value`, `remark` |

### Notes & Content

| Table | Purpose |
|---|---|
| `contract_notes` | Rich-text (Tiptap HTML) notes per contract. `contract_id FK→contracts(id) ON DELETE CASCADE` |

### RAG Feedback Store

| Table | Purpose | Key Columns |
|---|---|---|
| `approved_examples` | Stores thumbs-up NL→SQL pairs used as few-shot examples in future prompts | `question TEXT`, `sql TEXT`, `embedding vector(1536)` (text-embedding-3-small), `thumbs_up_count INTEGER` (incremented on near-duplicate ≥0.95), `updated_at` |
| `rejected_examples` | Stores thumbs-down feedback | `question TEXT`, `bad_sql TEXT`, `corrected_sql TEXT` (nullable — set when user provides correction) |

IVFFlat index on `approved_examples.embedding` (`vector_cosine_ops`, `lists=100`) for sub-linear cosine search.

RPC: `match_approved_examples(query_embedding, match_threshold=0.78, match_count=5)` — returns rows above similarity threshold ordered by cosine distance.

### Auth & User Management

| Table | Purpose | Key Columns |
|---|---|---|
| `allowed_users` | Pre-approved email allowlist — must exist here to sign up/in | `email` (PK), `name`, `added_at`. Policy: `authenticated` only (patch-005) |
| `user_roles` | Maps Supabase auth users to app roles | `user_id` (FK→auth.users), `role ('Admin'\|'Editor'\|'Viewer')`, `updated_at` |

### Configuration

| Table | Purpose | RLS |
|---|---|---|
| `table_settings` | Per-user column visibility + order config for each data table | `auth.uid() = user_id` — users only see their own settings |

---

### Relationship Map

```
atolls ←──────────── companies (atoll_id)
                         ↑            ↑
                   group_id      resort_id
                         └──── contracts ────┐
                                    │        │ (sub_contract_id)
                               contract_id   ├── pricing_standard
                                    │        ├── pricing_special
                               contract_notes├── contract_baggage
                                             ├── contract_booking
                                             ├── contract_age
                                             ├── contract_addons
                                             ├── contract_insurance
                                             ├── contract_government_charges
                                             ├── contract_fuel
                                             ├── contract_payment_plan
                                             ├── contract_service_commitment
                                             └── contract_termination

pricing_standard.point_a_id / point_b_id → companies(id)  [route endpoints]

auth.users ←── user_roles (user_id)
auth.users ←── table_settings (user_id)
```

---

## 2. API Routes

### RAG / NL-to-SQL (Vercel Edge Functions)

| Method | Path | What it does | Auth |
|---|---|---|---|
| `POST` | `/api/embed` | Embeds `{ text }` via OpenAI `text-embedding-3-small`. Returns `{ embedding: number[] }` (1536-dim). Max 8000 chars. | Bearer JWT. Returns 401 if missing/invalid. |
| `POST` | `/api/generate-sql` | Sends `{ userQuery, examples?, errorContext? }` to OpenAI GPT-4o-mini, returns `{ sql, explanation }`. `examples` are injected as few-shot context; `errorContext` triggers self-healing retry mode. Enforces 2000-char query limit. | Bearer JWT. Returns 401 if missing/invalid. |

### User Management (Vercel Edge Function)

| Method | Path | What it does | Auth |
|---|---|---|---|
| `GET` | `/api/admin-users` | Returns all auth users merged with their roles: `[{ id, email, role, last_sign_in_at, created_at }]` | Bearer JWT + caller must have `Admin` role in `user_roles`. Returns 401/403 otherwise. |
| `PATCH` | `/api/admin-users` | Updates one user's role. Body: `{ userId, role }`. Only `Editor` or `Viewer` accepted — `Admin` cannot be set via this endpoint. Cannot change own role (403). | Bearer JWT + `Admin` role required. |

### Supabase Data API (via `src/lib/db.ts`)

All authenticated requests to Supabase REST — enforced by RLS (`TO authenticated`):

| Operation | Tables | Notes |
|---|---|---|
| `SELECT *` | All 20 tables | `selectAll()`, `selectById()`, `selectWhere()` — all with 10s timeout |
| `INSERT` | All data tables | `insertRow()` |
| `UPDATE` | All data tables | `updateRow()` |
| `DELETE` | All data tables | `deleteRow()`, `deleteWhere()` |
| `UPSERT` | `table_settings`, `user_roles` | `upsertRow()` |

### Supabase Auth (via `@supabase/supabase-js`)

| Operation | Triggered from |
|---|---|
| `signInWithPassword()` | Login page — sign-in view |
| `signUp()` | Login page — sign-up view |
| `verifyOtp({ type: 'email' })` | Login page — OTP verify view |
| `signOut()` | UserMenu in sidebar |
| `getSession()` | `openaiSqlService.ts`, `ragSqlService.ts` — attach Bearer token |
| `rpc("match_approved_examples", {...})` | `ragSqlService.ts` — cosine similarity search for approved examples |
| `auth.getUser(token)` | `api/admin-users.ts`, `api/generate-sql.ts` — server-side JWT verification |
| `auth.admin.listUsers()` | `api/admin-users.ts` — service role only |
| `onAuthStateChange()` | `AuthContext.tsx` — session listener |

### Supabase SQL Functions (service role only, via `exec_ddl`/`exec_query`)

| Function | What it does |
|---|---|
| `exec_ddl(sql_text)` | Executes `CREATE/ALTER/DROP` statements. Blocks system schema access. Used by SchemaManager. |
| `exec_query(sql_text)` | Executes `SELECT` statements, returns JSONB. Used by SchemaManager for introspection. |

### Vercel Edge Middleware

| Scope | What it does |
|---|---|
| All non-static routes | Checks `tma-session` cookie. Redirects to `/login?redirect=<path>` if missing. Static assets (`.xlsx`, `.svg`, etc.) bypass it. |

---

## 3. Enums, Constants & Shared Types

### TypeScript Role Type (`src/lib/RoleContext.tsx`)

```typescript
type Role = "Admin" | "Editor" | "Viewer"
```

| Role | Permissions |
|---|---|
| `Admin` | Full CRUD + Settings access + can preview other roles + manage user roles |
| `Editor` | Create + Edit (no delete) |
| `Viewer` | Read only |

### `TableName` Union (`src/lib/excelDataService.ts`)

```typescript
type TableName =
  | "companies" | "contracts" | "atolls"
  | "pricing_standard" | "pricing_special"
  | "contract_baggage" | "contract_booking" | "contract_age"
  | "contract_addons" | "contract_insurance" | "contract_government_charges"
  | "contract_fuel" | "contract_payment_plan" | "contract_service_commitment"
  | "contract_termination" | "contract_notes" | "table_settings"
```

### Database CHECK Enums

| Column | Allowed values |
|---|---|
| `companies.type` | `'Group'`, `'Resort'` |
| `contracts.sub_contract_type` | `'Transfer'`, `'Charter'`, `'Signed Charter'` |
| `pricing_standard.passenger_type` | `'Adult'`, `'Child'` |
| `pricing_special.request_type` | `'Management'`, `'Staff'`, `'Service providers'`, `'FAM trips'`, `'Tour Operators'`, `'Tour Guides'`, `'Journalists'`, `'Advertisers'`, `'VIP Guest'`, `'Others'` |
| `pricing_special.discount_type` | `'Absolute'`, `'Percentage'` |
| `contract_age.type` | `'Infant'`, `'Child'`, `'Adult'` |
| `contract_insurance.value` | `'Yes'`, `'No'` |

### Constants

| Constant | Value | File |
|---|---|---|
| `ALLOWED_DOMAIN` | `"transmaldivian.com"` | `src/lib/supabase.ts` |
| `ALLOWED_ROLES` | `["Editor", "Viewer"]` | `api/admin-users.ts` (roles settable via API — Admin excluded) |
| `MAX_QUERY_LENGTH` | `2000` | `api/generate-sql.ts` |
| `MAX_TEXT_LENGTH` | `8_000` | `api/embed.ts` |
| `RAG_SIMILARITY_THRESHOLD` | `0.78` | `src/lib/ragSqlService.ts` — minimum cosine similarity to include an example |
| `RAG_DEDUP_THRESHOLD` | `0.95` | `src/lib/ragSqlService.ts` — threshold above which a new thumbs-up increments count instead of inserting |
| `QUERY_TIMEOUT_MS` | `10_000` | `src/lib/db.ts` |

### Shared TypeScript Interfaces (`src/types/index.ts`)

| Interface | Purpose |
|---|---|
| `Atoll` | `{ id, name, created_at?, updated_at? }` |
| `Company` | `{ id, name, type, code?, atoll?, address?, ... }` |
| `ContractBase` | Base contract fields: dates, IDs, resort/group FK refs |
| `ContractDetail extends ContractBase` | Full contract with all nested sub-table arrays |
| `ParamRow` | Generic `{ id, sub_contract_id, [key]: string\|number\|boolean\|null }` — used for most parameter tables |
| `AgeRow` | `{ id, sub_contract_id, type, min_age, max_age }` |
| `AddonRow` | `{ id, sub_contract_id, sub_category, type, value, remark }` |
| `PricingStandardRow` | `{ id, sub_contract_id, weekdays, point_a_id, point_b_id, ... fares }` |
| `PricingSpecialRow` | `{ id, sub_contract_id, request_type, discount_type, ... fares }` |
| `NoteRow` | `{ id, contract_id, content }` |
| `AdminUser` | `{ id, email, role, last_sign_in_at, created_at }` — returned by `/api/admin-users` |

### `roleConfig` (visual constants, `src/components/layout/AppSidebar.tsx` & `UserManagementCard.tsx`)

```typescript
const roleConfig = {
  Admin:  { icon: Shield,  color: "text-red-500",     bg: "bg-red-500/10",     border: "border-red-500/30"   },
  Editor: { icon: PenLine, color: "text-blue-500",    bg: "bg-blue-500/10",    border: "border-blue-500/30"  },
  Viewer: { icon: Eye,     color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30"},
}
```

















Here are the findings:

---

## 1. Authentication Method & How It Works

**Provider: Supabase Auth** (email + password with OTP email verification)

### Sign-Up Flow
1. User enters email + password on `/login` (sign-up view)
2. **Domain check** (client-side, instant): `isAllowedEmail()` — rejects anything that isn't `@transmaldivian.com`
3. `supabase.auth.signUp({ email, password })` called — Supabase creates the account and sends a 6-digit OTP email
4. User enters OTP in a custom 6-box digit input; `verifyOtp({ email, token, type: 'email' })` called
5. On success, `onAuthStateChange` fires → domain re-checked → `tma-session=1` cookie set → user redirected to intended destination

### Sign-In Flow
1. Domain check runs first (same as sign-up)
2. `signInWithPassword({ email, password })` called
3. On success, `onAuthStateChange(SIGNED_IN)` fires → domain re-checked → cookie set → redirect

### Password Reset Flow
1. `resetPasswordForEmail(email, { redirectTo: origin + '/login' })` sends a link
2. User clicks link → Supabase fires `PASSWORD_RECOVERY` auth event in the app
3. Login page switches to `reset-password` view automatically
4. `updateUser({ password })` sets the new password

### Session Persistence & Invalidation
- Supabase stores the JWT in `localStorage` automatically and refreshes it silently
- On every app load, `AuthContext` calls `getSession()` to rehydrate
- On every `SIGNED_IN` / `USER_UPDATED` event, the domain check runs again — if the user was removed from the allowlist, `signOut()` is forced and the cookie is cleared
- `tma-session=1` cookie is `SameSite=Strict`, set/cleared client-side (not HttpOnly)

### Allowlist (`allowed_users` table)
- **Note**: The current `AuthContext` only enforces `isAllowedEmail()` (domain check), not a DB allowlist lookup post-login. The `allowed_users` table exists and its RLS was hardened (patch-005 restricts to `authenticated` only), but the active runtime check in `AuthContext.checkAuthorised()` currently only calls `isAllowedEmail()`.

### Server-Side Verification (Edge Functions)
Both `api/admin-users.ts` and `api/generate-sql.ts` independently verify the JWT on every request:
```
Authorization: Bearer <supabase_access_token>
  → adminClient.auth.getUser(token)  [server-side, not trusting the client]
  → 401 if invalid/expired
```

### Auth Layers Summary

| Layer | Where | Mechanism |
|---|---|---|
| Domain check | Client — Login page + AuthContext | `email.endsWith("@transmaldivian.com")` |
| Client route guard | `ProtectedRoute.tsx` | Redirects to `/login?redirect=<path>` if `user === null` |
| Edge Middleware | `middleware.ts` (Vercel) | Checks `tma-session` cookie; redirects to `/login` if absent |
| API route JWT verify | `api/admin-users.ts`, `api/generate-sql.ts` | `auth.getUser(token)` on every request |
| RLS | Supabase | All 20 tables require `authenticated` role |

---

## 2. Role / Permission System

**Three roles**: `Admin`, `Editor`, `Viewer`

Roles are stored in the `user_roles` Supabase table and fetched on login via `RoleContext.tsx`.

### How It Works
1. After login, `RoleContext` queries `user_roles` where `user_id = current_user.id`
2. If no row found → defaults to `Viewer`
3. `dbRole` = authoritative DB value. `role` = active display value (may differ if Admin is previewing)
4. Admins can preview other roles via the sidebar selector — this changes `role` locally without affecting `dbRole`
5. Non-admins see a static read-only role badge with tooltip "Your role is assigned by an administrator"

### Permission Matrix

| Action | Admin | Editor | Viewer |
|---|---|---|---|
| View all data | Yes | Yes | Yes |
| Create/Insert rows | Yes | Yes | No |
| Edit/Update rows | Yes | Yes | No |
| Delete rows | Yes | No | No |
| Access Settings page | Yes | No | No |
| Settings nav link visible | Yes | No | No |
| Manage user roles | Yes (via UI) | No | No |
| Preview other roles | Yes | No | No |

### Role Assignment Rules
- **Admin** → can only be assigned via direct SQL (not via API by design)
- **Editor / Viewer** → Admin can change via the User Management card in Settings (calls `PATCH /api/admin-users`)
- **Self-change blocked** → API returns 403 if an Admin tries to change their own role

### Permission Flags (`useRole()` hook)
```typescript
canCreate = role === "Admin" || role === "Editor"
canEdit   = role === "Admin" || role === "Editor"
canDelete = role === "Admin"
```

---

## 3. Security Middleware

### A — Vercel Edge Middleware (`middleware.ts`)
- Runs globally on Vercel's edge network before any page is served
- Checks for `tma-session` cookie; redirects to `/login?redirect=<original-path>` if absent
- **Bypass list**: `/login`, `/_vercel`, `/favicon.ico`, `/tma-logo.svg`, `/data/` (static files)
- **Current status**: Cookie check is a presence/non-empty check (not JWT verification) — it's a UX gate, not a cryptographic one. Real JWT verification is done at the API route level.

### B — HTTP Security Headers (`vercel.json`)
Applied to every response:

| Header | Value | Purpose |
|---|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` (2 years) | Forces HTTPS permanently |
| `Content-Security-Policy` | See below | Controls what resources can load |
| `X-Frame-Options` | `DENY` | Prevents clickjacking in iframes |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limits referrer leakage |
| `Permissions-Policy` | Blocks camera, mic, geolocation, payment, USB, bluetooth, serial, battery, sensors | Disables all device APIs |
| `X-DNS-Prefetch-Control` | `off` | Prevents DNS prefetch leakage |
| `Cross-Origin-Opener-Policy` | `same-origin-allow-popups` | Prevents cross-origin window access |
| `Cross-Origin-Resource-Policy` | `same-origin` | Blocks cross-origin resource reads |

**CSP `connect-src`** allows: `self`, `*.huggingface.co`, `cdn-lfs.huggingface.co`, `cdn-lfs-us-1.huggingface.co`, `raw.githubusercontent.com`, `*.supabase.co`  
**Note**: `https://api.openai.com` is **not** in `connect-src` — OpenAI is called server-side only (edge function), never from the browser.

### C — Row Level Security (Supabase)
All 20 tables have RLS enabled. Current policies:
- **16 data tables** (`companies`, `contracts`, all sub-tables): `TO authenticated` — any logged-in user can read/write
- **`table_settings`**: `auth.uid() = user_id` — users only see their own settings
- **`atolls`**: `TO authenticated` — any logged-in user
- **`allowed_users`**: `TO authenticated` SELECT only (patch-005 — previously `anon` could read)
- **`user_roles`**: service role bypasses RLS; authenticated users can read their own row

### D — XSS Prevention (`src/lib/sanitize.ts`)
DOMPurify wrappers used for Tiptap rich-text content:
- `sanitizeInput(html)` — strips dangerous HTML before storing
- `stripHtml(html)` — removes all tags, returns plain text

### E — CSRF Helpers (`src/lib/csrf.ts`)
Double-submit-cookie pattern — implemented but **not yet actively wired** to the edge functions (which use JWT Bearer auth instead):
- `getCsrfToken()` — reads `csrf-token` cookie client-side
- `csrfHeaders()` — spreads `X-CSRF-Token` header into fetch calls
- `validateCsrfToken(header, cookie)` — timing-safe comparison server-side
- `generateCsrfToken()` — `crypto.getRandomValues(32 bytes)` → hex string

### F — CI Dependency Audit (`.github/workflows/security-audit.yml`)
- Runs `npm audit --audit-level=high --omit=dev` on every PR to `main`/`master`/`develop`
- Fails the job on any HIGH or CRITICAL vulnerability in production deps
- Saves full JSON report as a 30-day artifact

---

## 4. Third-Party Integrations

### Supabase
- **What**: Backend-as-a-Service — PostgreSQL database, Auth, Row Level Security, realtime
- **How used**:
  - Auth: sign-up, sign-in, OTP verify, password reset, session management, JWT verification
  - Database: all 20 tables via `src/lib/db.ts` (CRUD with 10s timeouts)
  - Admin API (`auth.admin.listUsers()`): called server-side in `api/admin-users.ts` using service role key
  - SQL functions: `exec_ddl()` and `exec_query()` for schema management
- **Keys**: `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (client-side, public), `SUPABASE_SERVICE_ROLE_KEY` (server-side only, Vercel env)

### OpenAI
- **What**: Two models — `text-embedding-3-small` (embeddings) and `gpt-4o-mini` (SQL generation)
- **How used**: Called exclusively from Vercel Edge Functions. The browser never contacts `api.openai.com` directly — the CSP blocks it.
  - **Embedding flow** (`api/embed.ts`): `ragSqlService` POSTs `{ text }` → edge fn calls `text-embedding-3-small` → returns 1536-dim vector. Used before generation (retrieve similar examples) and after feedback (store new examples).
  - **Generation flow** (`api/generate-sql.ts`): `ragSqlService` POSTs `{ userQuery, examples?, errorContext? }` → edge fn injects schema + few-shot examples + optional error context into system/user messages → calls `gpt-4o-mini` → returns `{ sql, explanation }`. `errorContext` is set on self-healing retries.
- **RAG pipeline** (`src/lib/ragSqlService.ts`): embed question → cosine search `approved_examples` (threshold 0.78, top 5) → generate SQL → test via `executeQuery()` → if error, retry with error context (`selfHealed: true`) → surface result with 👍/👎 feedback UI
- **Models**: `text-embedding-3-small` (1536 dims), `gpt-4o-mini` (`temperature: 0`, `max_tokens: 1024`)
- **Key**: `OPENAI_API_KEY` — Vercel server-side env var only, never in client bundle

### HuggingFace CDN
- **What**: CDN for WebLLM model weights (`.bin` / `.safetensors` files)
- **How used**: `@mlc-ai/web-llm` downloads model weights at runtime when a user selects a WebLLM model in the AI Assistant. No API key required.
- **Domains allowed in CSP**: `*.huggingface.co`, `cdn-lfs.huggingface.co`, `cdn-lfs-us-1.huggingface.co`
- **Available models**:
  - `Llama-3.2-1B-Instruct-q4f16_1-MLC` (~600MB)
  - `SmolLM2-1.7B-Instruct-q4f16_1-MLC` (~1GB)
  - `Phi-3.5-mini-instruct-q4f16_1-MLC` (~2GB)

### Ollama (local)
- **What**: Local LLM inference server running on the user's own machine
- **How used**: `src/lib/ollamaService.ts` polls `http://localhost:11434/api/tags` (3s timeout) to check connection, then streams completions from `http://localhost:11434/api/chat`. Default model: `llama3.2`.
- **No API key** — runs entirely locally, no network calls
- **Not in CSP** — `localhost` is allowed by default under `connect-src 'self'`... actually it's not — `'self'` does not include localhost on a deployed Vercel app. This integration only works in local dev.

### Vercel
- **What**: Deployment platform
- **How used**: Hosts the SPA (static), Edge Functions (`api/`), Edge Middleware (`middleware.ts`), and environment variable management
- **Features used**: Edge Runtime (`export const config = { runtime: "edge" }`), global response headers via `vercel.json`, SPA rewrite rules

### GitHub Actions
- **What**: CI pipeline
- **How used**: `.github/workflows/security-audit.yml` — runs `npm audit` on PRs and pushes to main branches; uploads JSON report as artifact












Here are the findings:

---

## 1. Core Business Rules & Important Validations

### Auth & Access
- **Domain enforcement** — only `@transmaldivian.com` email addresses may sign up or sign in. Checked client-side before the Supabase call and again in `AuthContext` on every auth state change.
- **OTP required on sign-up** — accounts aren't active until the 6-digit email code is verified.
- **Resend cooldown** — OTP resend button locked for 60 seconds after send to prevent abuse.
- **Existing session re-validated** — on app load, if the user's email fails `isAllowedEmail()` (e.g. domain changed), they are force-signed-out immediately.

### Contracts
- **`end_date` must be after `start_date`** — `contractSchema.refine()` enforces this; error shown on the `end_date` field specifically.
- **`sub_contract_id` auto-generated** — when creating a contract, `sub_contract_id` is automatically set to `${contract_id}-001` (watched via `form.watch("contract_id")`). Disabled on edit.
- **`carrier_id` defaults to `"TMA101"`** — TMA's own carrier code; not user-editable via the form.
- **`agreement_type` defaults to `"Exclusive Seaplane (Day time)"`** — the standard TMA contract type.
- **Cascade delete** — deleting a contract first deletes all 12 sub-tables using `deleteWhere("...", "sub_contract_id", subId)` in parallel, then deletes `contract_notes` by `contract_id`, then the contract row itself. This is done in the hook, not by DB cascade (except `contract_notes` which has `ON DELETE CASCADE` in the DB — but the hook deletes it explicitly anyway).
- **`group_id` and `resort_id` must be valid UUIDs** — Zod `.uuid("Select a group")` / `uuid("Select a resort")` ensures they come from the actual companies table.

### Companies
- **Atoll name → ID resolution** — the form accepts atoll as a display name (string), but `useCompanies` resolves it to a UUID by checking the TanStack Query cache first before hitting the DB.
- **`type` locked to `"Group"` or `"Resort"`** — Zod `z.enum(["Group", "Resort"])`. The DB also enforces a CHECK constraint.
- **`code` optional but unique (partial index)** — allows multiple `NULL` values, rejects duplicate non-null codes.
- **`linked_resorts` computed field** — for Group companies: all resorts linked via contracts. For Resort companies: all other resorts sharing the same group's contracts. This is a client-side join (not in DB).
- **`contract_count` computed field** — count of contracts where `group_id = id OR resort_id = id`.

### Pricing
- **`return_fare_usd` and `one_way_fare_usd` must be ≥ 0** — `z.number().min(0)`.
- **`weekdays` must have at least one day** — `z.array(z.string()).min(1, "Select at least one day")`.
- **`pricing_special` request types are an exact enum** — Zod enforces the set; note the DB CHECK was expanded post-initial-migration to include `'VIP Guest'` (migration D6), but the Zod schema in `validations.ts` still omits it (slight drift).

### Table Settings
- **Upsert on conflict `user_id,table_name`** — settings are per-user per-table; updating always upserts.
- **`column_config` JSON parsing guard** — if stored as a string (from Supabase), it's `JSON.parse()`d before use; if already an object, used as-is.

### SQL Engine
- **SELECT only** — if first token is not `SELECT`, throws `"Only SELECT queries are supported"`.
- **Table whitelist** — unknown table throws `Unknown table: "<name>"` (deliberately omits the list of valid tables to prevent enumeration).
- **Default LIMIT 50** — if no LIMIT is specified in a non-count query, `nlToSql.ts` automatically adds `LIMIT 50`.
- **"Expiring soon"** — defined as within 60 days: `end_date >= today AND end_date <= today+60d`.
- **"Active"** — defined as `end_date >= today` (not `start_date <= today`; doesn't check if it's started yet).

### User Roles
- **Admin role cannot be set via API** — `ALLOWED_ROLES = ["Editor", "Viewer"]`; attempting to set `Admin` returns 400.
- **Admin cannot change their own role** — `userId === callerId` check returns 403.
- **Default role is Viewer** — if no `user_roles` row exists, `RoleContext` defaults to `"Viewer"`.

---

## 2. Intentional Edge Cases & Special Handling

| Case | How it's handled |
|---|---|
| **No `sub_contract_id`** | `useContractDetail` guards every sub-table fetch with `subId ? selectWhere(...) : Promise.resolve([])` — all sub-tables return empty arrays instead of erroring |
| **`column_config` stored as string vs object** | `getSettingsForTable()` defensively JSON.parses if it's a string |
| **`contract_notes` uses `contract_id` (UUID), not `sub_contract_id`** | Only `contract_notes` uses the UUID FK; all other sub-tables use the text `sub_contract_id`. This is an intentional split: notes are per-contract, pricing is per-sub-contract |
| **Atoll cache-first lookup** | `resolveAtollId()` checks `queryClient.getQueryData(["atolls"])` before making a DB call — avoids a round-trip if the atoll list is already cached |
| **`contract_fuel.value` is `text`, not `numeric`** | Fixed in migration D5; freeform values like `"Included"`, `"Bundled into fare"` couldn't fit a `numeric` column |
| **`pricing_standard.weekdays` is `jsonb`** | Originally `text[]`, changed in migration D7 because Excel stores JSON arrays |
| **`pricing_standard.point_a/b_id` FK → `companies`** | Originally pointed at `destinations(id)`, re-pointed in migration D8 because actual Excel UUIDs matched companies, not destinations |
| **Token refresh events** | `onAuthStateChange` handles `TOKEN_REFRESHED` by refreshing the session cookie without re-running the domain check (trusts existing state) |
| **`PASSWORD_RECOVERY` event** | Login page subscribes to auth events on mount specifically to catch this and switch to the `reset-password` view — even if the user lands on `/login` directly from the email link |
| **NL-to-SQL fallback detection** | If no table keyword matches, falls back to partial-word matching (≥4 characters) before giving up with an explanation message |
| **`useSchemaManager` is a stub** | Returns empty data and no-op mutations. It was designed for Excel-based storage management and is now a placeholder |
| **`destinations` table is legacy** | Marked with a SQL `COMMENT` noting it's legacy; `point_a/b_id` constraints were moved to `companies`. The table still exists but is effectively unused |

---

## 3. Naming Conventions

### Files & Folders
| Pattern | Examples |
|---|---|
| React components: `PascalCase.tsx` | `ContractForm.tsx`, `UserManagementCard.tsx`, `AppSidebar.tsx` |
| Hooks: `use` prefix, `camelCase.ts` | `useContracts.ts`, `useAdminUsers.ts`, `useTableSettings.ts` |
| Lib utilities: `camelCase.ts` | `sqlEngine.ts`, `openaiSqlService.ts`, `sanitize.ts` |
| Context files: `PascalCase.tsx` | `AuthContext.tsx`, `RoleContext.tsx` (lives in `src/lib/`, not `src/context/`) |
| Pages: `PascalCase.tsx` | `Login.tsx`, `Settings.tsx`, `NotFound.tsx` |
| API edge functions: `kebab-case.ts` | `admin-users.ts`, `generate-sql.ts` |
| SQL patches: `kebab-case.sql` | `patch-004-service-role-grants.sql` |

### TypeScript
| Pattern | Examples |
|---|---|
| Interfaces: `PascalCase` | `ContractDetail`, `AdminUser`, `ColumnConfig` |
| Type aliases: `PascalCase` | `Role`, `TableName`, `View` (in Login.tsx) |
| Constants: `SCREAMING_SNAKE_CASE` | `ALLOWED_DOMAIN`, `ALLOWED_ROLES`, `MAX_QUERY_LENGTH`, `QUERY_TIMEOUT_MS` |
| Props interfaces: `Props` (inline) | `interface Props { open: boolean; onClose: () => void }` |
| Zod schemas: `camelCase` + `Schema` suffix | `companySchema`, `contractSchema`, `pricingStandardSchema` |
| Inferred types: `camelCase` + `FormData` | `CompanyFormData`, `ContractFormData` |
| Query keys: string arrays matching resource | `["contracts"]`, `["contract-detail", id]`, `["admin-users"]` |

### Database
| Pattern | Examples |
|---|---|
| Tables: `snake_case` | `pricing_standard`, `contract_government_charges` |
| Columns: `snake_case` | `sub_contract_id`, `one_way_fare_usd` |
| Sub-tables follow the pattern `contract_<category>` | `contract_baggage`, `contract_fuel`, `contract_termination` |
| Foreign keys: `<referenced_table_singular>_id` | `resort_id`, `group_id`, `atoll_id`, `sub_contract_id` |

### CSS/Tailwind
- Utility-first Tailwind throughout; no custom CSS classes in component files
- Custom classes only in `App.css`/`index.css`: `glass-card`, `btn-gradient-primary`, `bg-grid-pattern`

---

## 4. Code Patterns

### Hook-Centric Architecture
Every data entity has a dedicated hook that owns all server state for that entity:

```
useContracts()   →  query + createMutation + updateMutation + deleteMutation
useCompanies()   →  query + createMutation + updateMutation + deleteMutation
useAdminUsers()  →  query + updateRoleMutation (with optimistic update)
useTableSettings() → query + upsertSetting
```

- Hooks import from `src/lib/db.ts` (the CRUD layer), never from `supabase` directly
- All mutations follow: `mutationFn` → `onSuccess` (invalidate + toast) → `onError` (toast with generic message)
- `useAdminUsers` is the only hook with **optimistic updates**: `onMutate` saves previous cache, updates immediately, `onError` rolls back, `onSettled` invalidates

### Service / Lib Split
```
src/lib/db.ts           — raw Supabase CRUD (no business logic)
src/lib/supabase.ts     — Supabase client + domain helpers
src/lib/sqlEngine.ts    — SQL parser (pure, no state)
src/lib/nlToSql.ts      — NL→SQL intent detection (pure)
src/lib/openaiSqlService.ts — HTTP client for /api/generate-sql
src/lib/sanitize.ts     — DOMPurify wrappers (pure)
src/lib/csrf.ts         — CSRF helpers (pure)
src/hooks/use*.ts       — TanStack Query wrappers (stateful, React-coupled)
api/*.ts                — Vercel Edge Functions (server-side, no React)
```

### Form Pattern
- All forms: `react-hook-form` + `zodResolver` + `shadcn Form` components
- `defaultValues` always fully specified (no partial objects)
- Edit mode: `useEffect` on `[open, contract]` calls `form.reset(contract values)`
- Create mode: `useEffect` on `[open]` calls `form.reset(empty defaults)`
- Auto-derivation: `form.watch()` drives side-effect values (e.g. `sub_contract_id`)

### Context Provider Chain
```tsx
ErrorBoundary
  └── AuthProvider        (Supabase session)
        └── RoleProvider  (DB role, depends on AuthProvider's user)
              └── QueryClientProvider
                    └── BrowserRouter
                          └── ProtectedRoute (uses AuthContext)
```

### TanStack Query Key Conventions
| Resource | Key |
|---|---|
| All companies | `["companies"]` |
| All contracts | `["contracts"]` |
| One contract detail | `["contract-detail", contractId]` |
| All atolls | `["atolls"]` |
| Admin users | `["admin-users"]` |
| Table settings | `["table_settings", userId]` |
| DB schema | `["db_schema"]` |

Mutations always invalidate the parent list key (e.g. creating a contract invalidates both `["contracts"]` and `["companies"]` since `contract_count` is computed on the companies query).

### Error Handling Pattern
- All mutation `onError` handlers show a **generic toast** — no raw error messages leak to UI
- `catch (err: unknown)` with `err instanceof Error` narrowing — `unknown` not `any`
- `void err` used where the error is intentionally swallowed (replaces `console.error`)
- `ErrorBoundary` class component at the root catches React render errors

### Edge Function Pattern
Both edge functions follow an identical structure:
```
1. Read env vars inside handler (not module-level constants)
2. Early return 503 if env vars missing
3. Extract + validate Authorization: Bearer header
4. auth.getUser(token) → 401 if invalid
5. [admin-users only] Check caller role → 403 if not Admin
6. Route by req.method → business logic
7. Return json() helper with appropriate status
```

---

## 5. Key Scripts from `package.json`

| Script | Command | What it does |
|---|---|---|
| `dev` | `vite` | Starts the Vite dev server with HMR. Also activates `excelWriterPlugin` (the `POST /__api/save-table` middleware for writing back to `.xlsx` files in dev) |
| `build` | `vite build` | Production build — outputs to `dist/`. TypeScript compiled, assets hashed, tree-shaken |
| `build:dev` | `vite build --mode development` | Production-sized build with development mode flags (no minification of error messages, source maps) — useful for debugging deployed builds |
| `lint` | `eslint .` | Runs ESLint 9 with typescript-eslint, react-hooks, and react-refresh plugins |
| `preview` | `vite preview` | Serves the `dist/` folder locally to preview the production build before deploying |
| `test` | `vitest run` | Runs the test suite once (non-watch mode) |
| `test:watch` | `vitest` | Runs tests in watch mode, re-running on file changes |
| `generate:data` | `node scripts/generateSeedData.mjs` | Runs a Node script to generate seed data (likely populates `public/data/*.xlsx` or Supabase with sample contract data) |








## Analysis #5: Recent Changes, Technical Debt, Known Issues, CLAUDE.md

---

### 1. Recent Significant Changes (git log)

**30 commits total. All recent work is by `Claude <noreply@anthropic.com>`.**

| Commit | Summary |
|--------|---------|
| `680196b` | Security audit fixes — removed `console.error` leakage, generic error messages in toasts/ErrorBoundary, SQL table enumeration blocked |
| `22ad656` | Security hardening — HTTP headers in `vercel.json`, DOMPurify XSS sanitisation, CSRF helpers, `patch-005` restricting `allowed_users` to `authenticated` only |
| `96f71e1` | User Management UI — `UserManagementCard.tsx`, `useAdminUsers.ts`, Settings page gated to Admin only, Settings nav link hidden for non-Admins |
| `3562b60` | UAT fixes — DB-backed roles (`RoleContext` reads from `user_roles` Supabase table), role preview for Admins, `useAdminUsers` optimistic updates |
| `a353d49` | **Major**: Route all data through Supabase — `src/lib/db.ts` CRUD layer introduced; all hooks migrated from in-memory Excel data to Supabase queries |
| Earlier | Firebase Google OAuth → Firebase Email Auth → Supabase Email+Password (3 auth migrations) |
| Earlier | OpenAI key moved from `localStorage` to server-side Vercel env var; `/api/generate-sql` edge function added |

---

### 2. Hacky Code / Technical Debt

**Dead code:**
- `src/lib/excelDataService.ts` + `SheetJS` dependency + `public/data/*.xlsx` files — still in the repo; nothing calls them anymore since `a353d49`. Safe to delete but never cleaned up.
- `src/hooks/useSchemaManager.ts` — **stub that returns `[]` and all no-op mutations**. Was designed for an Excel-backed schema editor that was never built. Imported in `Settings.tsx` but the feature it powered was silently removed.
- `src/lib/nlToSql.ts` — client-side keyword-based NL→SQL. Predates the OpenAI integration. Still imported but the OpenAI path is always taken (`hasOpenAIKey()` always returns `true`).

**Security gaps (preparatory code, not yet wired):**
- `src/lib/csrf.ts` — CSRF double-submit helpers exist but are **not connected to either edge function** (`api/generate-sql.ts` or `api/admin-users.ts`). The code is infrastructure, not protection.
- `middleware.ts` — cookie presence check only. `isValidSession(token)` just checks `typeof token === "string" && token.length > 0`. Not JWT verification. A non-empty cookie string passes.

**Schema drift:**
- `src/lib/validations.ts` `pricingSpecialSchema` — lists 9 `request_type` values. Migration `20260412000001` added `'VIP Guest'` to the DB CHECK constraint. The Zod schema was never updated. Form validation would reject a 'VIP Guest' entry even though the DB allows it.
- `src/lib/sqlEngine.ts` `TABLE_COLUMNS` — static column map used for the OpenAI system prompt; written before the final DB schema settled. Several tables list wrong column names (e.g. `contract_baggage` has `baggage_allowance_kg, excess_charge_usd` in this file but the actual DB columns are `parameter, value, remark`). This degrades AI SQL generation quality.

**Edge function type suppression:**
- Both `api/admin-users.ts` and `api/generate-sql.ts` have `// @ts-nocheck` at the top. The comment says it's because Supabase generic inference causes false positives in edge context — but it blanket-disables all type checking in security-critical files.

---

### 3. Known Issues / Things to Not Touch Without Care

**Do not touch:**
- `vercel.json` rewrite rules — the SPA catch-all (`"source": "/(.*)"`) explicitly excludes `/api/` routes. If this ordering changes or the exclusion is removed, all edge functions break silently (they get served the frontend HTML instead).
- `RoleContext.tsx` `setPreviewRole` — only callable when `dbRole === "Admin"`. If you change this check to use `role` instead of `dbRole`, a non-Admin could escalate privileges by getting into a state where `role` is already "Admin".
- `api/admin-users.ts` `ALLOWED_ROLES` — intentionally excludes `"Admin"`. Removing Admin from this list (or making it settable) would let one Admin demote/promote any other Admin, including taking over the account.
- `useContracts` cascade delete — deletes 12 sub-tables in `Promise.all(...)` in application code, not via DB CASCADE. If any one `deleteWhere` call throws, the parent contract row is not deleted but some sub-tables may be. The delete is not transactional.
- `supabase/migrations/` — files are immutable once applied. If a migration has already run on the production DB, editing the file has no effect and creates a false sense of change.

**Handle with care:**
- `src/lib/supabase.ts` `onAuthStateChange` — handles sign-out, token refresh, and initial session. Modifying the callback order or conditions can break the entire auth flow.
- `TABLE_COLUMNS` in `sqlEngine.ts` / `api/generate-sql.ts` — two separate static definitions. They are not kept in sync and both diverge from actual DB schema. Changing one doesn't change the other.

---

### 4. CLAUDE.md — Missing / Incomplete

**No CLAUDE.md exists.** The only markdown at the repo root is `README.md`, which is an unmodified Lovable.dev template containing:
- Generic "Welcome to your Lovable project" text
- A `REPLACE_WITH_PROJECT_ID` placeholder that was never filled in
- Zero project-specific information

**What's missing:**

| Category | Status |
|----------|--------|
| Project purpose | Missing |
| Local dev setup (`npm run dev`, env vars needed) | Missing |
| Required env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`) | Missing |
| Architecture decisions (why Supabase, why Vercel Edge) | Missing |
| Role system explanation | Missing |
| Where to add new DB tables (migration files + `TableName` type + `sqlEngine.ts`) | Missing |
| Security rules (what not to log, how to handle errors) | Missing |
| "Always update `project-context.md` after each code change" instruction | Missing — meaning future Claude sessions won't know to do this |
| Deployment notes (Vercel project, env var setup) | Missing |
| Known technical debt / do-not-touch list | Missing |

---

Now writing `.claude/project-context.md` — the approved task that's been pending.
