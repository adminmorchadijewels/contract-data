/**
 * Vercel Edge Middleware — Route Protection
 *
 * This middleware runs on Vercel's Edge Runtime (globally distributed,
 * sub-millisecond latency) before any page is served. It intercepts
 * requests to protected paths and redirects unauthenticated users to
 * the login page.
 *
 * HOW IT WORKS TODAY:
 *   - Reads a `tma-session` cookie (set by your auth provider after login).
 *   - If the cookie is missing or invalid, the user is redirected to /login.
 *   - The original URL is preserved in the `?redirect=` query param so the
 *     user lands on the right page after logging in.
 *
 * HOW TO PLUG IN YOUR AUTH PROVIDER:
 *   Replace the placeholder `isValidSession()` check with a real JWT
 *   verification call. Examples:
 *     - Clerk:   import { getAuth } from "@clerk/nextjs/server"
 *     - NextAuth: check the session cookie with `getToken()`
 *     - Custom JWT: verify with `jose` or `jsonwebtoken`
 *
 * NOTE: This file is intentionally INACTIVE on public routes (see `config`
 * matcher below). Add routes to the matcher to protect them.
 *
 * CURRENT STATUS: The app uses client-side role management (RoleContext +
 * localStorage). This middleware is wired up and ready — it will enforce
 * server-side auth as soon as you add a real auth provider and set the
 * `tma-session` cookie on login.
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// ── Constants ───────────────────────────────────────────────────────────────

/** Name of the session cookie set by your auth provider. */
const SESSION_COOKIE = "tma-session";

/** Path users are redirected to when unauthenticated. */
const LOGIN_PATH = "/login";

/**
 * Routes that are always public (no auth needed).
 * These are excluded even if they match the `config.matcher` pattern.
 */
const PUBLIC_PATHS: string[] = [
  LOGIN_PATH,
  "/",             // Landing / splash page — remove if root is also protected
  "/_vercel",      // Vercel internals
  "/favicon.ico",
  "/tma-logo.svg",
];

// ── Session validation ──────────────────────────────────────────────────────

/**
 * Validates the session cookie value.
 *
 * REPLACE THIS with a real JWT verification or a call to your auth
 * provider's session endpoint. The function must return a boolean.
 *
 * Examples:
 *
 *   // Jose JWT verification (install: npm i jose)
 *   import { jwtVerify } from "jose";
 *   const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
 *   try {
 *     await jwtVerify(token, secret);
 *     return true;
 *   } catch { return false; }
 *
 *   // Clerk (install: npm i @clerk/nextjs)
 *   const { userId } = getAuth(request);
 *   return !!userId;
 */
function isValidSession(token: string | undefined): boolean {
  // ⚠️ PLACEHOLDER: replace with real JWT / auth provider check.
  // Currently returns true when the cookie exists (any non-empty value).
  // This is intentionally permissive until a real auth system is added.
  return typeof token === "string" && token.length > 0;
}

// ── Middleware ──────────────────────────────────────────────────────────────

export function middleware(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;

  // Skip public paths
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // Check session cookie
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;

  if (!isValidSession(sessionToken)) {
    // Preserve the intended destination so the login page can redirect back
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("redirect", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  // ── Security response headers added by middleware ────────────────────────
  // Headers in vercel.json cover static assets; these cover edge responses.
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

// ── Route matcher ───────────────────────────────────────────────────────────

/**
 * The `config.matcher` controls WHICH paths this middleware runs on.
 *
 * Current setup: all routes except static files and Vercel internals.
 * Tighten this list to match only your protected routes if you prefer
 * an allowlist approach:
 *
 *   matcher: ["/dashboard/:path*", "/admin/:path*", "/profile/:path*"]
 */
export const config = {
  matcher: [
    /*
     * Match every path EXCEPT:
     *  - Next.js internals (_next/static, _next/image, favicon)
     *  - Public static assets in /public (svg, png, etc.)
     *  - Vercel internals (_vercel)
     */
    "/((?!_next/static|_next/image|_vercel|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf|css|js|map)$).*)",
  ],
};
