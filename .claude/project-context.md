# TMA Contract Data — Project Context

> Generated: 2026-04-12  
> Purpose: Reusable project reference for Claude Code sessions.

---

## 1. Project Overview

| Field       | Value |
|-------------|-------|
| **Name**    | TMA Contract Data |
| **Org**     | Trans Maldivian Airways (TMA) |
| **Purpose** | Internal web app for viewing, querying, and managing airline contract data stored in Excel files. Supports natural-language SQL queries, AI-assisted analysis, rich-text contract notes, and role-based views. |
| **Type**    | Vite + React 18 SPA — no SSR, client-side routing only |
| **Repo**    | adminmorchadijewels/contract-data |
| **Deploy**  | Vercel |

---

## 2. Tech Stack

| Layer              | Technology |
|--------------------|------------|
| Build tool         | Vite 5 (`@vitejs/plugin-react-swc`) |
| UI framework       | React 18 |
| Language           | TypeScript 5.8 (`strict: false`, `noImplicitAny: false`) |
| Routing            | React Router DOM v6 |
| Styling            | Tailwind CSS 3.4 + `tailwindcss-animate` |
| Component library  | Radix UI primitives (full suite) + shadcn/ui patterns |
| Animations         | Framer Motion 12 |
| State / data cache | TanStack Query v5 |
| Forms              | React Hook Form v7 + Zod v3 |
| Rich text editor   | Tiptap 3 (with Link, Placeholder, TextAlign, Underline) |
| Charts             | Recharts 2 |
| Data parsing       | SheetJS (`xlsx`) — reads `.xlsx` files from `public/data/` |
| Auth               | Supabase (`@supabase/supabase-js` v2) |
| In-browser LLM     | `@mlc-ai/web-llm` (WebLLM via WASM + HuggingFace CDN) |
| Local LLM          | Ollama at `localhost:11434` (HTTP streaming) |
| Cloud LLM          | OpenAI SDK v6 (key stored in `localStorage`) |
| XSS prevention     | DOMPurify 3 |
| Edge middleware    | `@vercel/edge` v1 |
| Testing            | Vitest 3 + jsdom + `@testing-library/react` + jest-dom |
| Linting            | ESLint 9 + typescript-eslint + react-hooks + react-refresh |

---

## 3. Folder / File Structure

```
contract-data/
├── public/
│   ├── data/                      # Excel source files (*.xlsx) served statically
│   └── tma-logo.svg
├── src/
│   ├── main.tsx                   # React DOM entry point
│   ├── App.tsx                    # Router, AuthProvider, RoleProvider, ProtectedRoute
│   ├── App.css / index.css
│   ├── vite-env.d.ts
│   ├── types/
│   │   └── index.ts               # Central TypeScript types (ParamRow, ContractDetail, etc.)
│   ├── context/
│   │   └── AuthContext.tsx        # Supabase session state + notAuthorised flag
│   ├── pages/
│   │   ├── Login.tsx              # Sign-in / Sign-up / OTP verification views
│   │   ├── Index.tsx              # Dashboard / home
│   │   ├── Contracts.tsx          # Contract list and detail views
│   │   ├── Query.tsx              # NL-to-SQL query interface
│   │   ├── Settings.tsx           # OpenAI key, role selection, preferences
│   │   ├── Assistant.tsx          # AI assistant chat page
│   │   └── NotFound.tsx           # 404 page
│   ├── components/
│   │   ├── auth/
│   │   │   ├── ProtectedRoute.tsx # Auth guard — redirects to /login if no session
│   │   │   └── UserMenu.tsx       # Sidebar footer: initials avatar + sign-out dropdown
│   │   ├── layout/
│   │   │   ├── AppSidebar.tsx     # Main navigation sidebar (includes UserMenu)
│   │   │   └── Header.tsx         # Top header bar
│   │   ├── ai-assistant/
│   │   │   └── AIAssistant.tsx    # AI chat component
│   │   ├── companies/             # Company-related UI components
│   │   ├── contracts/             # Contract list, detail, table components
│   │   ├── settings/              # Settings panel components
│   │   ├── ui/                    # Radix/shadcn primitives (button, dialog, etc.)
│   │   ├── NavLink.tsx
│   │   └── Assistant.tsx
│   ├── lib/
│   │   ├── supabase.ts            # Supabase client, ALLOWED_DOMAIN, isAllowedEmail(), isUserAllowed()
│   │   ├── auth.ts                # isAuthenticated() — cookie shim for middleware
│   │   ├── excelDataService.ts    # Core data layer: fetch+parse XLSX, in-memory Map store
│   │   ├── sqlEngine.ts           # Client-side SELECT/JOIN/WHERE parser on in-memory data
│   │   ├── nlToSql.ts             # NL → SQL prompt builder
│   │   ├── openaiSqlService.ts    # Calls OpenAI API to generate SQL from NL prompt
│   │   ├── ollamaService.ts       # Streams responses from local Ollama
│   │   ├── webLLMService.ts       # WebLLM (in-browser WASM LLM) interface
│   │   ├── sanitize.ts            # DOMPurify wrappers: sanitizeInput(), stripHtml()
│   │   ├── csrf.ts                # CSRF helpers: getCsrfToken(), csrfHeaders(), validate
│   │   ├── RoleContext.tsx        # Client-side role (Admin/Editor/Viewer) — NOT auth
│   │   ├── utils.ts               # cn() Tailwind class merger, misc helpers
│   │   └── validations.ts         # Zod schemas
│   ├── hooks/
│   │   ├── useCompanies.ts        # TanStack Query hook for company data
│   │   ├── useContracts.ts        # TanStack Query hook for contract data
│   │   ├── useSchemaManager.ts    # Schema introspection hook
│   │   ├── useTableSettings.ts    # Column visibility / table config persistence
│   │   ├── use-mobile.tsx         # Responsive breakpoint hook
│   │   └── use-toast.ts           # Toast notification hook
│   └── test/
│       └── setup.ts               # Vitest setup (jest-dom matchers)
├── supabase/
│   └── migrations/
│       └── 20260212113817_*.sql   # Full DB schema (17 tables + RLS policies)
├── .github/
│   └── workflows/
│       └── security-audit.yml     # npm audit CI on PRs to main/master/develop
├── middleware.ts                  # Vercel Edge Middleware — cookie-based auth gate
├── vercel.json                    # SPA rewrite + security headers
├── supabase-setup.sql             # allowed_users table + RLS — run in Supabase SQL Editor
├── .env.example                   # Documents all environment variables
├── vite.config.ts                 # Vite config (excelWriterPlugin in dev)
├── tailwind.config.ts
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── eslint.config.js
├── vitest.config.ts
└── package.json
```

---

## 4. Entry Points

| File | Role |
|------|------|
| `src/main.tsx` | Mounts `<App />` into `#root`, wraps with `QueryClientProvider` |
| `src/App.tsx` | Top-level: `AuthProvider → RoleProvider → BrowserRouter → Routes` |
| `middleware.ts` | Vercel Edge — runs before every non-static request |
| `src/lib/excelDataService.ts` | `initializeData()` called on app startup to load all XLSX |

---

## 5. Authentication

### Flow
1. **Sign Up** — Email + password submitted on `/login` (sign-up view)
2. **Domain check** — Must end with `@transmaldivian.com` (client-side, instant)
3. **Allowlist check** — Must exist in Supabase `allowed_users` table (async DB query)
4. **Supabase `signUp()`** — Creates auth account; sends OTP email
5. **OTP Verify** — 6-digit code entered in custom digit-box component; `verifyOtp()` called
6. **Sign In** — `signInWithPassword()`; same domain + allowlist checks run first
7. **Session** — Supabase persists JWT in localStorage; `onAuthStateChange` fires
8. **Cookie** — `tma-session=1` cookie set for Edge Middleware to detect

### Access Control Layers
| Layer | Where | What |
|-------|-------|------|
| Domain check | Client (`supabase.ts`) | `email.endsWith("@transmaldivian.com")` |
| Allowlist check | Client + Supabase RLS | `SELECT` from `allowed_users` table |
| `ProtectedRoute` | Client (`App.tsx`) | Redirects to `/login` if no Supabase session |
| Edge Middleware | Server (`middleware.ts`) | Checks `tma-session` cookie; redirects to `/login` |

### Key Files
- `src/lib/supabase.ts` — client, `isAllowedEmail()`, `isUserAllowed()`
- `src/context/AuthContext.tsx` — session state, `notAuthorised` flag, forced sign-out
- `src/pages/Login.tsx` — all three views (sign-in, sign-up, verify-otp)
- `src/components/auth/ProtectedRoute.tsx` — client-side guard
- `src/components/auth/UserMenu.tsx` — sign-out UI in sidebar
- `middleware.ts` — Edge Middleware guard

### Role System (NOT authentication)
- `src/lib/RoleContext.tsx` — `Admin | Editor | Viewer` stored in `localStorage("tma_role")`
- Default: `Admin`. Changed in Settings page.
- Controls UI permissions only; not a security boundary.

---

## 6. Database

### Provider
Supabase (PostgreSQL) — hosted, with Row Level Security (RLS) enabled on all tables.

### Tables (from migration `20260212113817`)

| Table | Purpose |
|-------|---------|
| `companies` | Airline companies |
| `destinations` | Route destinations |
| `contracts` | Master contract records |
| `pricing_standard` | Standard fare pricing |
| `pricing_special` | Special/promotional pricing |
| `contract_baggage` | Baggage allowance terms |
| `contract_booking` | Booking conditions |
| `contract_age` | Age-based fare rules |
| `contract_addons` | Add-on services |
| `contract_insurance` | Insurance terms |
| `contract_government_charges` | Tax/government charge rules |
| `contract_fuel` | Fuel surcharge rules |
| `contract_payment_plan` | Payment schedule terms |
| `contract_service_commitment` | Service level commitments |
| `contract_termination` | Termination clauses |
| `contract_notes` | Rich-text notes (Tiptap HTML) |
| `allowed_users` | Auth allowlist (`email` PK, `name`, `added_at`) |

### RLS Policies
- All 17 tables: RLS enabled
- Contracts/data tables: "Public access" — `USING(true)` for SELECT (app is internal)
- `allowed_users`: anon + authenticated can SELECT; only service_role can write

### Setup
Run `supabase-setup.sql` in Supabase SQL Editor to create `allowed_users` table.  
Full schema in `supabase/migrations/20260212113817_*.sql`.

---

## 7. Data Layer (Excel)

The app reads contract data from Excel files, NOT from Supabase tables (except auth/notes).

### Flow
1. `initializeData()` in `src/lib/excelDataService.ts` fetches `public/data/*.xlsx` via `fetch()`
2. SheetJS parses each workbook → rows converted to `Record<string, unknown>[]`
3. Data stored in in-memory `Map<TableName, Record[]>`
4. TanStack Query hooks (`useContracts`, `useCompanies`) expose data to components
5. Client-side SQL engine (`sqlEngine.ts`) runs SELECT/JOIN/WHERE against the Map

### Dev Write-back
In development, `vite.config.ts` registers `excelWriterPlugin` — a middleware that handles `POST /__api/save-table` to write mutations back to `.xlsx` files on disk.

### Tables loaded from Excel
`companies`, `destinations`, `contracts`, `pricing_standard`, `pricing_special`, `contract_baggage`, `contract_booking`, `contract_age`, `contract_addons`, `contract_insurance`, `contract_government_charges`, `contract_fuel`, `contract_payment_plan`, `contract_service_commitment`, `contract_termination`

---

## 8. AI / LLM Features

### Natural Language to SQL
- `src/lib/nlToSql.ts` — builds prompt with schema context
- `src/lib/openaiSqlService.ts` — sends to OpenAI API (key from `localStorage("tma_openai_api_key")`)
- Result SQL runs against in-memory data via `sqlEngine.ts`

### AI Assistant Chat
Three backends (user selects in Settings):
1. **OpenAI** — `openaiSqlService.ts`, uses stored API key
2. **WebLLM** — `src/lib/webLLMService.ts` — runs LLM in-browser via WASM (`@mlc-ai/web-llm`), models served from HuggingFace CDN
3. **Ollama** — `src/lib/ollamaService.ts` — streams from `http://localhost:11434`

---

## 9. External APIs / Services

| Service | Usage | Key Storage |
|---------|-------|-------------|
| Supabase | Auth + `allowed_users` table | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` env vars |
| OpenAI API | NL-to-SQL, AI chat | `localStorage("tma_openai_api_key")` — user-entered |
| HuggingFace CDN | WebLLM model weights (`*.huggingface.co`) | No key (public CDN) |
| Ollama | Local LLM inference | No key (`localhost:11434`) |

---

## 10. Environment Variables

Defined in `.env.example`:

| Variable | Type | Purpose |
|----------|------|---------|
| `VITE_SUPABASE_URL` | Required | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Required | Supabase anonymous key |
| `VITE_APP_URL` | Optional | Canonical app URL (e.g. for redirects) |
| `VITE_APP_ENV` | Optional | `development` / `production` |
| `VITE_APP_PASSWORD` | Legacy | Shared-password auth (replaced by Supabase) |
| `OPENAI_API_KEY` | Server-only | NOT used client-side; OpenAI key is user-entered |
| `VITE_SENTRY_DSN` | Optional | Sentry error tracking |
| `SENTRY_AUTH_TOKEN` | Optional | Sentry source maps upload |
| `CSRF_SECRET` | Server-only | CSRF token signing |
| `JWT_SECRET` | Server-only | JWT signing (future use) |

> **Note**: `VITE_*` vars are embedded at build time and visible in browser bundles.

---

## 11. Deployment

| Aspect | Detail |
|--------|--------|
| Platform | Vercel |
| Build command | `npm run build` (Vite) |
| Output dir | `dist/` |
| SPA fallback | `vercel.json` rewrites all paths → `index.html` (except `/data/*`) |
| Edge Middleware | `middleware.ts` — cookie auth gate, runs before HTML responses |
| Static data | `public/data/*.xlsx` served at `/data/*.xlsx` — excluded from middleware |
| CI | `.github/workflows/security-audit.yml` — `npm audit` on PRs |

### `vercel.json` Summary
- **Rewrite**: `/((?!data/).*)` → `/index.html` (SPA routing)
- **Headers** (all routes): HSTS, CSP, X-Frame-Options (DENY), X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-DNS-Prefetch-Control, COOP, CORP

### CSP `connect-src` includes
`'self'`, `https://api.openai.com`, `https://*.huggingface.co`, `https://cdn-lfs.huggingface.co`, `https://cdn-lfs-us-1.huggingface.co`, `https://raw.githubusercontent.com`, `https://*.supabase.co`

---

## 12. Security Measures

| Measure | File | Detail |
|---------|------|--------|
| Auth domain restriction | `src/lib/supabase.ts` | `isAllowedEmail()` — `@transmaldivian.com` only |
| Auth allowlist | `src/lib/supabase.ts` + Supabase | `allowed_users` table; checked before sign-in AND sign-up |
| Client auth guard | `src/components/auth/ProtectedRoute.tsx` | Redirects unauthenticated users to `/login` |
| Edge auth gate | `middleware.ts` | Checks `tma-session` cookie; redirects on miss |
| Session cookie | `AuthContext.tsx` | `tma-session=1; SameSite=Strict` — HttpOnly not available client-side |
| HTTP security headers | `vercel.json` | HSTS (2yr), CSP, X-Frame-Options DENY, XCTO nosniff |
| XSS prevention | `src/lib/sanitize.ts` | DOMPurify `sanitizeInput()` / `stripHtml()` for Tiptap content |
| CSRF helpers | `src/lib/csrf.ts` | `getCsrfToken()`, `csrfHeaders()`, `validateCsrfToken()` (timing-safe) |
| Dependency audit | `.github/workflows/security-audit.yml` | `npm audit --audit-level=high` on every PR |
| RLS | Supabase | All tables have Row Level Security enabled |

---

## 13. Type System

Central types in `src/types/index.ts`:

```typescript
// Index-signature type for dynamic contract sub-table rows
export interface ParamRow {
  id: string;
  sub_contract_id?: string;
  [key: string]: string | number | boolean | null | undefined;
}

// Full contract with all nested sub-tables
export interface ContractDetail extends ContractBase {
  pricing_standard?: PricingStandardRow[];
  contract_baggage?: ParamRow[];
  contract_booking?: ParamRow[];
  // ... all sub-table arrays
}
```

Key patterns used throughout:
- `T extends Record<string, unknown>` generic constraints (not `any`)
- `catch (err: unknown)` with `err instanceof Error` narrowing
- `ParamRow` for any row that needs dynamic key access in JSX

---

## 14. Test Coverage

| Tool | Config |
|------|--------|
| Runner | Vitest 3 |
| Environment | jsdom |
| Globals | Enabled (describe, it, expect without imports) |
| Setup file | `src/test/setup.ts` (jest-dom matchers) |
| File pattern | `src/**/*.{test,spec}.{ts,tsx}` |

> Current test coverage is minimal — setup infrastructure exists but test files are sparse.

---

## 15. Key Patterns & Conventions

- **No SSR** — Pure SPA; all data loading is client-side
- **in-memory data** — Excel files loaded at startup into a `Map`; no live DB writes for contract data
- **OpenAI key = user-entered** — Never server-side; lives in `localStorage`
- **RoleContext ≠ Auth** — Role is a UI convenience; Supabase session is the security boundary
- **Supabase anon key in client** — Normal for Supabase; RLS policies are the server-side gate
- **`VITE_*` vars are public** — Only put non-sensitive config in `VITE_*` vars
- **No shadcn CLI** — Components are manually maintained in `src/components/ui/`
- **framer-motion** — Used for page transitions, animated form views, spinner components
