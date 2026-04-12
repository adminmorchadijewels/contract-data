import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase, isAllowedEmail } from "@/lib/supabase";

// ── Types ────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  /** Set when a sign-in is rejected by the allowlist (not just the domain). */
  notAuthorised: boolean;
}

// ── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
  notAuthorised: false,
});

// ── Cookie helpers ────────────────────────────────────────────────────────────

const SESSION_COOKIE = "tma-session";
function setSessionCookie()  { document.cookie = `${SESSION_COOKIE}=1; path=/; SameSite=Strict`; }
function clearSessionCookie() { document.cookie = `${SESSION_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`; }

// ── Helper: full authorisation check ─────────────────────────────────────────

function checkAuthorised(email: string): boolean {
  return isAllowedEmail(email);
}

// ── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]               = useState<User | null>(null);
  const [session, setSession]         = useState<Session | null>(null);
  const [loading, setLoading]         = useState(true);
  const [notAuthorised, setNotAuthorised] = useState(false);

  useEffect(() => {
    // ── Rehydrate persisted session on mount ────────────────────────────────
    supabase.auth.getSession().then(async ({ data }) => {
      const s = data.session;
      const u = s?.user ?? null;

      if (u?.email) {
        const ok = checkAuthorised(u.email);
        if (ok) {
          setUser(u);
          setSession(s);
          setSessionCookie();
        } else {
          // Existing session but user removed from allowlist — force sign-out
          await supabase.auth.signOut();
          clearSessionCookie();
        }
      }
      setLoading(false);
    });

    // ── Listen for auth events ──────────────────────────────────────────────
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, s) => {
        const u = s?.user ?? null;

        if (event === "SIGNED_OUT" || !u) {
          setUser(null);
          setSession(null);
          clearSessionCookie();
          return;
        }

        if (event === "SIGNED_IN" || event === "USER_UPDATED") {
          const ok = checkAuthorised(u.email ?? "");
          if (!ok) {
            // Authenticated by Supabase but not on the allowlist
            setNotAuthorised(true);
            await supabase.auth.signOut();
            clearSessionCookie();
            return;
          }
          setNotAuthorised(false);
          setUser(u);
          setSession(s);
          setSessionCookie();
          return;
        }

        // TOKEN_REFRESHED and other events — trust existing state
        if (user) setSessionCookie();
      }
    );

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, notAuthorised }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  return useContext(AuthContext);
}
