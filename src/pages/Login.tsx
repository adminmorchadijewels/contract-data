import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

// ── Firebase error code → human-readable message ─────────────────────────────
function friendlyError(code: string | undefined): string {
  switch (code) {
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

// ── Shared input styles ───────────────────────────────────────────────────────
const inputClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors";

const btnPrimary =
  "h-10 w-full rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

// ── View types ────────────────────────────────────────────────────────────────
type View = "sign-in" | "sign-up" | "forgot";

export default function LoginPage() {
  const { user, loading, signInWithEmail, signUpWithEmail, sendPasswordReset } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [view, setView] = useState<View>("sign-in");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // Already authenticated — go straight to the app
  useEffect(() => {
    if (!loading && user) {
      navigate(params.get("redirect") || "/", { replace: true });
    }
  }, [user, loading, navigate, params]);

  function switchView(next: View) {
    setError("");
    setResetSent(false);
    setPassword("");
    setConfirm("");
    setView(next);
  }

  // ── Sign In ───────────────────────────────────────────────────────────────
  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signInWithEmail(email, password);
    } catch (err: unknown) {
      setError(friendlyError((err as { code?: string }).code));
      setBusy(false);
    }
  }

  // ── Sign Up ───────────────────────────────────────────────────────────────
  async function handleSignUp(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await signUpWithEmail(name.trim(), email, password);
    } catch (err: unknown) {
      setError(friendlyError((err as { code?: string }).code));
      setBusy(false);
    }
  }

  // ── Forgot Password ───────────────────────────────────────────────────────
  async function handleForgotPassword(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await sendPasswordReset(email);
      setResetSent(true);
    } catch (err: unknown) {
      setError(friendlyError((err as { code?: string }).code));
    } finally {
      setBusy(false);
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
        {/* Logo / title */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <motion.img
            src="/tma-logo.svg"
            alt="TMA"
            className="h-12 w-12 rounded-2xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.08, type: "spring", stiffness: 260, damping: 20 }}
          />
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              TMA Contract Data
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {view === "sign-in" && "Sign in to your account"}
              {view === "sign-up" && "Create a new account"}
              {view === "forgot" && "Reset your password"}
            </p>
          </div>
        </div>

        {/* ── Animated view switcher ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.18 }}
          >

            {/* ──── Sign In ──────────────────────────────────────────────── */}
            {view === "sign-in" && (
              <form onSubmit={handleSignIn} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    autoFocus
                    required
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
                    <button
                      type="button"
                      onClick={() => switchView("forgot")}
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className={inputClass}
                  />
                </div>

                {error && <ErrorMsg message={error} />}

                <button type="submit" disabled={busy} className={btnPrimary}>
                  {busy ? <Spinner /> : "Sign in"}
                </button>

                <p className="text-center text-sm text-muted-foreground pt-1">
                  Don't have an account?{" "}
                  <button type="button" onClick={() => switchView("sign-up")} className="text-primary hover:underline font-medium">
                    Create one
                  </button>
                </p>
              </form>
            )}

            {/* ──── Sign Up ──────────────────────────────────────────────── */}
            {view === "sign-up" && (
              <form onSubmit={handleSignUp} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="text-sm font-medium text-foreground">Full name</label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Smith"
                    autoComplete="name"
                    autoFocus
                    required
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email-up" className="text-sm font-medium text-foreground">Email</label>
                  <input
                    id="email-up"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="password-up" className="text-sm font-medium text-foreground">Password</label>
                  <input
                    id="password-up"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="confirm" className="text-sm font-medium text-foreground">Confirm password</label>
                  <input
                    id="confirm"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    className={inputClass}
                  />
                </div>

                {error && <ErrorMsg message={error} />}

                <button type="submit" disabled={busy} className={btnPrimary}>
                  {busy ? <Spinner /> : "Create account"}
                </button>

                <p className="text-center text-sm text-muted-foreground pt-1">
                  Already have an account?{" "}
                  <button type="button" onClick={() => switchView("sign-in")} className="text-primary hover:underline font-medium">
                    Sign in
                  </button>
                </p>
              </form>
            )}

            {/* ──── Forgot Password ───────────────────────────────────────── */}
            {view === "forgot" && (
              <div className="flex flex-col gap-4">
                {resetSent ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-lg border border-border bg-card p-4 text-center flex flex-col gap-2"
                  >
                    <p className="text-sm font-medium text-foreground">Check your inbox</p>
                    <p className="text-xs text-muted-foreground">
                      A password reset link was sent to <span className="font-medium">{email}</span>.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="email-reset" className="text-sm font-medium text-foreground">Email</label>
                      <input
                        id="email-reset"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        autoFocus
                        required
                        className={inputClass}
                      />
                    </div>

                    {error && <ErrorMsg message={error} />}

                    <button type="submit" disabled={busy} className={btnPrimary}>
                      {busy ? <Spinner /> : "Send reset link"}
                    </button>
                  </form>
                )}

                <button
                  type="button"
                  onClick={() => switchView("sign-in")}
                  className="text-center text-sm text-primary hover:underline"
                >
                  ← Back to sign in
                </button>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function ErrorMsg({ message }: { message: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-sm text-destructive"
    >
      {message}
    </motion.p>
  );
}

function Spinner() {
  return (
    <span className="flex items-center justify-center">
      <motion.span
        animate={{ rotate: 360 }}
        transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
        className="inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full"
      />
    </span>
  );
}
