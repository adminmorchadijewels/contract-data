/**
 * csrf.ts — CSRF Token Helpers
 *
 * WHY THIS EXISTS:
 *   Cross-Site Request Forgery (CSRF) tricks an authenticated user's browser
 *   into making unwanted requests to your API (e.g. deleting data, changing
 *   settings). CSRF tokens prevent this by requiring every state-changing
 *   request to carry a secret that only your own frontend can produce.
 *
 * CURRENT STATUS:
 *   This app is a Vite SPA with no server-side API routes yet. CSRF protection
 *   becomes necessary the moment you add POST/PUT/DELETE endpoints (Vercel
 *   Functions, an Express back-end, etc.).
 *
 * HOW THE DOUBLE-SUBMIT-COOKIE PATTERN WORKS:
 *   1. On app load, the server sets a `csrf-token` cookie (HttpOnly: false so
 *      JS can read it) with a random value.
 *   2. The client reads that cookie and sends its value in a custom request
 *      header (`X-CSRF-Token`).
 *   3. The server verifies that the header value matches the cookie value.
 *      A cross-origin attacker cannot read cookies from your domain, so they
 *      cannot forge the header.
 *
 * USAGE IN A VERCEL FUNCTION (server side):
 *   import { validateCsrfToken } from "@/lib/csrf";
 *   export default function handler(req, res) {
 *     if (!validateCsrfToken(req)) return res.status(403).json({ error: "CSRF" });
 *     // … handle request
 *   }
 *
 * USAGE IN THE CLIENT:
 *   import { getCsrfToken, csrfHeaders } from "@/lib/csrf";
 *   await fetch("/api/save", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json", ...csrfHeaders() },
 *     body: JSON.stringify(payload),
 *   });
 */

// ── Constants ────────────────────────────────────────────────────────────────

/** Cookie name where the CSRF token is stored. */
export const CSRF_COOKIE = "csrf-token";

/** Request header the client must send with every mutating request. */
export const CSRF_HEADER = "X-CSRF-Token";

// ── Client-side helpers ──────────────────────────────────────────────────────

/**
 * Reads the CSRF token from the browser cookie set by the server.
 * Returns an empty string if the cookie is absent (e.g. during SSR or first
 * load before the server has set it).
 */
export function getCsrfToken(): string {
  if (typeof document === "undefined") return ""; // SSR guard
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CSRF_COOKIE}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : "";
}

/**
 * Returns the headers object you should spread into every mutating fetch call.
 *
 * @example
 *   fetch("/api/delete", { method: "DELETE", headers: { ...csrfHeaders() } })
 */
export function csrfHeaders(): Record<string, string> {
  const token = getCsrfToken();
  return token ? { [CSRF_HEADER]: token } : {};
}

// ── Server-side helpers ──────────────────────────────────────────────────────
// These run in Vercel Functions (Node.js runtime), NOT in the browser.
// They depend on `CSRF_SECRET` from the environment.

/**
 * Generates a cryptographically random CSRF token.
 *
 * Call this once per session in your login / session-init endpoint and set it
 * as a cookie:
 *
 *   res.setHeader("Set-Cookie",
 *     `${CSRF_COOKIE}=${await generateCsrfToken()}; Path=/; SameSite=Strict`
 *   );
 *
 * NOTE: HttpOnly must be FALSE — the client JavaScript needs to read the cookie.
 */
export async function generateCsrfToken(): Promise<string> {
  // crypto.getRandomValues works in both Edge Runtime and Node ≥ 19.
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Validates an incoming request's CSRF token.
 *
 * Compares the `X-CSRF-Token` header against the `csrf-token` cookie using a
 * timing-safe comparison to prevent timing attacks.
 *
 * @param headerToken  Value from the `X-CSRF-Token` request header
 * @param cookieToken  Value from the `csrf-token` request cookie
 * @returns            true if both tokens are present and match
 */
export function validateCsrfToken(
  headerToken: string | null | undefined,
  cookieToken: string | null | undefined,
): boolean {
  if (!headerToken || !cookieToken) return false;
  if (headerToken.length !== cookieToken.length) return false;

  // Timing-safe comparison — prevents attackers from inferring the token
  // character-by-character via response timing.
  let mismatch = 0;
  for (let i = 0; i < headerToken.length; i++) {
    mismatch |= headerToken.charCodeAt(i) ^ cookieToken.charCodeAt(i);
  }
  return mismatch === 0;
}
