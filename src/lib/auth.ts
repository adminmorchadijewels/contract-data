/**
 * auth.ts — Self-contained email + password authentication
 *
 * No third-party service required. Works entirely in the browser.
 *
 * HOW IT WORKS:
 *   - VITE_APP_PASSWORD holds the shared access password (set in Vercel dashboard).
 *   - Users enter their own email (any format) + that shared password.
 *   - Email is stored in localStorage purely for display (name/avatar in the UI).
 *   - A `tma-session` cookie is written on login so the Vercel Edge Middleware
 *     can also gate direct URL requests before the SPA loads.
 *   - If VITE_APP_PASSWORD is not set (local dev), auth is bypassed entirely.
 *
 * SECURITY NOTE:
 *   VITE_ variables are embedded in the compiled JS bundle and visible to anyone
 *   who inspects the source. This is suitable for internal tooling where the goal
 *   is preventing casual access, not protecting highly sensitive data.
 *   For stronger security, add a real backend (Supabase, Clerk, etc.) later.
 */

const STORAGE_KEY   = "tma-auth-user";
const SESSION_COOKIE = "tma-session";
const APP_PASSWORD  = (import.meta.env.VITE_APP_PASSWORD as string) || "";

// ── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  email: string;
  /** Display name derived from the email local part, e.g. "jane.doe" → "Jane Doe" */
  displayName: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function toDisplayName(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function setSessionCookie() {
  document.cookie = `${SESSION_COOKIE}=1; path=/; SameSite=Strict`;
}

function clearSessionCookie() {
  document.cookie = `${SESSION_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;
}

// ── Public API ────────────────────────────────────────────────────────────────

/** True when a password is configured (production). False in local dev. */
export function isAuthEnabled(): boolean {
  return APP_PASSWORD.length > 0;
}

/** Returns the currently logged-in user, or null. */
export function getUser(): AuthUser | null {
  if (!isAuthEnabled()) {
    return { email: "dev@local", displayName: "Dev User" };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

/** Returns true if there is an active session. */
export function isAuthenticated(): boolean {
  return !isAuthEnabled() || getUser() !== null;
}

/**
 * Validates credentials and starts a session.
 * @returns `true` on success, `false` on wrong password.
 */
export function login(email: string, password: string): boolean {
  if (!isAuthEnabled()) return true;
  if (password.trim() !== APP_PASSWORD) return false;

  const user: AuthUser = { email: email.trim().toLowerCase(), displayName: toDisplayName(email) };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  setSessionCookie();
  return true;
}

/** Ends the current session. */
export function logout(): void {
  localStorage.removeItem(STORAGE_KEY);
  clearSessionCookie();
}
