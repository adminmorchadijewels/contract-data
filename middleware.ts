/**
 * Vercel Edge Middleware — Route Protection
 *
 * This middleware runs on Vercel's Edge Runtime (globally distributed,
 * sub-millisecond latency) before any page is served. It intercepts
 * requests to protected paths and redirects unauthenticated users to
 * the login page.
 *
 * NOTE: This uses native Web APIs + @vercel/edge (no Next.js dependency).
 *       next/server is a Next.js-only module and must not be imported in a
 *       Vite project.
 *
 * HOW IT WORKS TODAY:
 *   - Reads a `tma-session` cookie (set by your auth provider after login).
 *   - If the cookie is missing or invalid, the user is redirected to /login.
 *   - The original URL is preserved in the `?redirect=` query param so the
 *     user lands on the right page after logging in.
 *
 * CURRENT STATUS: The app uses client-side role management (RoleContext +
 * localStorage). This middleware is wired up and ready — it will enforce
 * server-side auth as soon as you add a real auth provider and set the
 * `tma-session` cookie on login.
 *
 * HOW TO PLUG IN YOUR AUTH PROVIDER:
 *   Replace the placeholder `isValidSession()` check with a real JWT
 *   verification. Example using `jose` (npm i jose):
 *
 *     import { jwtVerify } from "jose";
 *     const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
 *     try { await jwtVerify(token, secret); return true; }
 *     catch { return false; }
 */

import { next } from "@vercel/edge";

// ── Constants ───────────────────────────────────────────────────────────────

/** Name of the session cookie set by your auth provider. */
const SESSION_COOKIE = "tma-session";

/** Path users are redirected to when unauthenticated. */
const LOGIN_PATH = "/login";

/**
 * Routes that are always public (no auth needed).
 * These are let through even if they match the `config.matcher` pattern.
 */
const PUBLIC_PATHS: string[] = [
  LOGIN_PATH,
  "/",             // Landing / splash — remove if the root is also protected
  "/_vercel",      // Vercel internals
  "/favicon.ico",
  "/tma-logo.svg",
  "/data",         // Static Excel data files fetched by initializeData()
];

// ── Cookie parser ───────────────────────────────────────────────────────────

function getCookieValue(
  cookieHeader: string | null,
  name: string,
): string | undefined {
  if (!cookieHeader) return undefined;
  const entry = cookieHeader
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : undefined;
}

// ── Session validation ──────────────────────────────────────────────────────

/**
 * Validates the session cookie value.
 *
 * ⚠️  PLACEHOLDER — replace with real JWT / auth provider verification.
 * Currently returns true whenever the cookie is non-empty.
 */
function isValidSession(token: string | undefined): boolean {
  return typeof token === "string" && token.length > 0;
}

// ── Middleware ──────────────────────────────────────────────────────────────

export default function middleware(request: Request): Response {
  const url = new URL(request.url);
  const { pathname, search } = url;

  // Always allow public paths through
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return next();
  }

  // Check for a valid session cookie
  const sessionToken = getCookieValue(
    request.headers.get("cookie"),
    SESSION_COOKIE,
  );

  if (!isValidSession(sessionToken)) {
    // Preserve the intended destination so login can redirect back afterward
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("redirect", pathname + search);
    return Response.redirect(loginUrl.toString(), 307);
  }

  // Authenticated — continue to the origin
  return next();
}

// ── Route matcher ───────────────────────────────────────────────────────────

/**
 * Runs on every path except static assets and Vercel internals.
 * Narrow this to specific routes if you prefer an allowlist approach:
 *   matcher: ["/dashboard/:path*", "/admin/:path*"]
 */
export const config = {
  matcher: [
    "/((?!_vercel|data/|.*\\.(?:xlsx|svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf|css|js|map)$).*)",
  ],
};
