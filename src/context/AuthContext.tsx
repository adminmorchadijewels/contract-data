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
}

// ── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
});

// ── Cookie helpers (keep edge middleware in sync) ─────────────────────────────

const SESSION_COOKIE = "tma-session";

function setSessionCookie() {
  document.cookie = `${SESSION_COOKIE}=1; path=/; SameSite=Strict`;
}
function clearSessionCookie() {
  document.cookie = `${SESSION_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;
}

// ── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Rehydrate persisted session on mount
    supabase.auth.getSession().then(({ data }) => {
      const s = data.session;
      const u = s?.user ?? null;
      // Enforce domain restriction even for existing sessions
      const authorised = u && isAllowedEmail(u.email ?? "");
      setSession(authorised ? s : null);
      setUser(authorised ? u : null);
      if (authorised) setSessionCookie(); else clearSessionCookie();
      setLoading(false);
    });

    // Keep state in sync with Supabase token refreshes / logouts
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      const u = s?.user ?? null;
      const authorised = u && isAllowedEmail(u.email ?? "");
      setSession(authorised ? s : null);
      setUser(authorised ? u : null);
      if (authorised) setSessionCookie(); else clearSessionCookie();
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  return useContext(AuthContext);
}
