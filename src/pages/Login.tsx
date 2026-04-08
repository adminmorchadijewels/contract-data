import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [error, setError] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  // Already authenticated — go straight to the app
  useEffect(() => {
    if (!loading && user) {
      const redirect = params.get("redirect") || "/";
      navigate(redirect, { replace: true });
    }
  }, [user, loading, navigate, params]);

  async function handleGoogleSignIn() {
    setError("");
    setSigningIn(true);
    try {
      await signInWithGoogle();
      // navigation handled by the useEffect above after onAuthStateChanged fires
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/popup-closed-by-user") {
        setError("Sign-in cancelled. Please try again.");
      } else if (code === "auth/popup-blocked") {
        setError("Pop-up blocked by your browser. Please allow pop-ups for this site.");
      } else {
        setError("Sign-in failed. Please try again.");
      }
      setSigningIn(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-10 gap-3">
          <motion.img
            src="/tma-logo.svg"
            alt="TMA"
            className="h-14 w-14 rounded-2xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
          />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              TMA Contract Data
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in to access the platform
            </p>
          </div>
        </div>

        {/* Google sign-in button */}
        <motion.button
          onClick={handleGoogleSignIn}
          disabled={signingIn}
          whileHover={{ scale: signingIn ? 1 : 1.02 }}
          whileTap={{ scale: signingIn ? 1 : 0.98 }}
          className="w-full flex items-center justify-center gap-3 h-11 px-4 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-accent transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
        >
          {signingIn ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
            />
          ) : (
            /* Google "G" logo SVG */
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.8 2.5 30.3 0 24 0 14.8 0 6.9 5.4 3 13.3l7.9 6.1C12.7 13.2 17.9 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17z"/>
              <path fill="#FBBC05" d="M10.9 28.6A14.8 14.8 0 0 1 9.5 24c0-1.6.3-3.2.8-4.6L2.4 13.3A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.7l8.3-6.1z"/>
              <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.1 0-11.3-4.1-13.1-9.6l-8.1 6.2C6.7 42.5 14.8 48 24 48z"/>
            </svg>
          )}
          <span>{signingIn ? "Signing in…" : "Continue with Google"}</span>
        </motion.button>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-sm text-destructive text-center"
          >
            {error}
          </motion.p>
        )}

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Access is restricted to authorised accounts only.
        </p>
      </motion.div>
    </div>
  );
}
