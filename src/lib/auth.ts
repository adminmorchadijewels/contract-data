/**
 * auth.ts — Client-side session helpers
 *
 * Authentication model:
 *   - A shared access password is set as VITE_APP_PASSWORD in the Vercel
 *     dashboard. It is intentionally a VITE_ variable so the browser can
 *     compare against it — suitable for internal tooling where the goal is
 *     "keep out casual visitors", not high-security access control.
 *   - On successful login a session cookie called `tma-session` is written.
 *     The Edge middleware reads this same cookie, so both layers stay in sync.
 *   - The cookie has no `expires` / `max-age`, making it a session cookie
 *     that is cleared automatically when the browser tab/window closes.
 *   - If VITE_APP_PASSWORD is not set (local dev), auth is disabled and
 *     isAuthenticated() always returns true.
 */

const SESSION_COOKIE = "tma-session";

// Populated at build time by Vite from the VITE_APP_PASSWORD env var.
const APP_PASSWORD = (import.meta.env.VITE_APP_PASSWORD as string) || "";

/** True when a password has been configured (i.e. not local dev). */
export function isAuthEnabled(): boolean {
  return APP_PASSWORD.length > 0;
}

/** Returns true if the current browser session has a valid session cookie. */
export function isAuthenticated(): boolean {
  if (!isAuthEnabled()) return true;
  return document.cookie
    .split("; ")
    .some((row) => row.startsWith(`${SESSION_COOKIE}=`));
}

/**
 * Validates the entered password and, on success, writes the session cookie.
 * Returns true on success, false on wrong password.
 */
export function login(enteredPassword: string): boolean {
  if (!isAuthEnabled()) return true;
  if (enteredPassword.trim() !== APP_PASSWORD) return false;
  // SameSite=Strict prevents the cookie being sent on cross-site requests.
  // No Secure flag needed — Vercel always serves over HTTPS.
  document.cookie = `${SESSION_COOKIE}=1; path=/; SameSite=Strict`;
  return true;
}

/** Clears the session cookie, effectively logging the user out. */
export function logout(): void {
  document.cookie = `${SESSION_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;
}
