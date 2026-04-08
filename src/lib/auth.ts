/**
 * auth.ts — thin re-export shim
 *
 * Auth logic now lives in src/context/AuthContext.tsx (Firebase-backed).
 * This file is kept so the edge middleware cookie helpers remain importable
 * without pulling in the full React context tree.
 */

export const SESSION_COOKIE = "tma-session";

export function isAuthenticated(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split("; ")
    .some((row) => row.startsWith(`${SESSION_COOKIE}=`));
}
