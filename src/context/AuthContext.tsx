import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

// ── Types ────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

// ── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Keep local state in sync with Firebase's persisted auth token.
  // Firebase automatically refreshes the ID token in the background.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      // Mirror auth state into a cookie so the edge middleware can read it
      // without needing to verify the Firebase JWT (just presence check).
      if (firebaseUser) {
        setSessionCookie();
      } else {
        clearSessionCookie();
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function signInWithGoogle() {
    await signInWithPopup(auth, googleProvider);
    // onAuthStateChanged fires automatically after this — no manual setUser needed
  }

  async function signOut() {
    await firebaseSignOut(auth);
    clearSessionCookie();
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
