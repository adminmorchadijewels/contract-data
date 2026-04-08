import {
  useState,
  useEffect,
  useRef,
  type FormEvent,
  type KeyboardEvent,
  type ClipboardEvent,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase, isAllowedEmail, ALLOWED_DOMAIN } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

// ── Helpers ───────────────────────────────────────────────────────────────────

function friendlyError(msg: string): string {
  if (msg.includes("Invalid login credentials"))  return "Incorrect email or password.";
  if (msg.includes("Email not confirmed"))         return "Please verify your email first.";
  if (msg.includes("User already registered"))     return "An account with this email already exists.";
  if (msg.includes("Password should be"))          return "Password must be at least 6 characters.";
  if (msg.includes("rate limit") || msg.includes("too many")) return "Too many attempts. Please wait and try again.";
  if (msg.includes("Network"))                     return "Network error. Check your connection.";
  return msg || "Something went wrong. Please try again.";
}

const inputClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors";

const btnPrimary =
  "h-10 w-full rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2";

type View = "sign-in" | "sign-up" | "verify-otp";

// ── Component ────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const { user, loading } = useAuth();
  const navigate          = useNavigate();
  const [params]          = useSearchParams();

  const [view, setView]         = useState<View>("sign-in");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [otp, setOtp]           = useState(["", "", "", "", "", ""]);
  const [busy, setBusy]         = useState(false);
  const [error, setError]       = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Redirect once authenticated
  useEffect(() => {
    if (!loading && user) navigate(params.get("redirect") || "/", { replace: true });
  }, [user, loading, navigate, params]);

  // Cooldown timer for "Resend OTP"
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  function resetError() { setError(""); }

  function switchView(next: View) {
    resetError();
    setPassword("");
    setConfirm("");
    setOtp(["", "", "", "", "", ""]);
    setView(next);
  }

  // ── Sign In ──────────────────────────────────────────────────────────────
  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    resetError();

    if (!isAllowedEmail(email)) {
      setError(`Only @${ALLOWED_DOMAIN} accounts are allowed.`);
      return;
    }

    setBusy(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(friendlyError(err.message));
      setBusy(false);
    }
    // on success → onAuthStateChange fires → useEffect redirects
  }

  // ── Sign Up ──────────────────────────────────────────────────────────────
  async function handleSignUp(e: FormEvent) {
    e.preventDefault();
    resetError();

    if (!isAllowedEmail(email)) {
      setError(`Only @${ALLOWED_DOMAIN} email addresses may sign up.`);
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    const { error: err } = await supabase.auth.signUp({ email, password });
    if (err) {
      setError(friendlyError(err.message));
      setBusy(false);
    } else {
      setResendCooldown(60);
      switchView("verify-otp");
      setBusy(false);
    }
  }

  // ── Verify OTP ────────────────────────────────────────────────────────────
  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault();
    resetError();

    const token = otp.join("");
    if (token.length < 6) {
      setError("Please enter all 6 digits.");
      return;
    }

    setBusy(true);
    const { error: err } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    if (err) {
      setError(friendlyError(err.message));
      setBusy(false);
    }
    // on success → onAuthStateChange fires → useEffect redirects
  }

  // ── Resend OTP ────────────────────────────────────────────────────────────
  async function handleResend() {
    if (resendCooldown > 0) return;
    resetError();
    setResendCooldown(60);
    const { error: err } = await supabase.auth.resend({ type: "signup", email });
    if (err) setError(friendlyError(err.message));
  }

  if (loading) return <Spinner fullscreen />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
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
            <h1 className="text-xl font-bold text-foreground tracking-tight">TMA Contract Data</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {view === "sign-in"    && "Sign in to your account"}
              {view === "sign-up"    && "Create your account"}
              {view === "verify-otp" && "Verify your email"}
            </p>
          </div>
        </div>

        {/* Animated views */}
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -14 }}
            transition={{ duration: 0.17 }}
          >

            {/* ── Sign In ───────────────────────────────────────────────── */}
            {view === "sign-in" && (
              <form onSubmit={handleSignIn} className="flex flex-col gap-3">
                <Field label="Email" htmlFor="si-email">
                  <input id="si-email" type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={`you@${ALLOWED_DOMAIN}`}
                    autoComplete="email" autoFocus required className={inputClass} />
                </Field>

                <Field label="Password" htmlFor="si-pw">
                  <input id="si-pw" type="password" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password" required className={inputClass} />
                </Field>

                {error && <Err msg={error} />}

                <button type="submit" disabled={busy} className={btnPrimary}>
                  {busy ? <BtnSpinner /> : "Sign in"}
                </button>

                <p className="text-center text-sm text-muted-foreground pt-1">
                  No account?{" "}
                  <button type="button" onClick={() => switchView("sign-up")}
                    className="text-primary hover:underline font-medium">
                    Create one
                  </button>
                </p>
              </form>
            )}

            {/* ── Sign Up ───────────────────────────────────────────────── */}
            {view === "sign-up" && (
              <form onSubmit={handleSignUp} className="flex flex-col gap-3">
                <Field label="Work email" htmlFor="su-email">
                  <input id="su-email" type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={`you@${ALLOWED_DOMAIN}`}
                    autoComplete="email" autoFocus required className={inputClass} />
                </Field>
                <p className="text-[11px] text-muted-foreground -mt-1.5 px-0.5">
                  Must be a <span className="font-medium">@{ALLOWED_DOMAIN}</span> address.
                </p>

                <Field label="Password" htmlFor="su-pw">
                  <input id="su-pw" type="password" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    autoComplete="new-password" required minLength={6} className={inputClass} />
                </Field>

                <Field label="Confirm password" htmlFor="su-confirm">
                  <input id="su-confirm" type="password" value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password" required className={inputClass} />
                </Field>

                {error && <Err msg={error} />}

                <button type="submit" disabled={busy} className={btnPrimary}>
                  {busy ? <BtnSpinner /> : "Create account"}
                </button>

                <p className="text-center text-sm text-muted-foreground pt-1">
                  Already have an account?{" "}
                  <button type="button" onClick={() => switchView("sign-in")}
                    className="text-primary hover:underline font-medium">
                    Sign in
                  </button>
                </p>
              </form>
            )}

            {/* ── Verify OTP ────────────────────────────────────────────── */}
            {view === "verify-otp" && (
              <div className="flex flex-col gap-4">
                <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-center text-muted-foreground">
                  We sent a 6-digit code to{" "}
                  <span className="font-medium text-foreground">{email}</span>.
                  Enter it below to activate your account.
                </div>

                <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                  <OtpInput value={otp} onChange={setOtp} />

                  {error && <Err msg={error} />}

                  <button type="submit" disabled={busy} className={btnPrimary}>
                    {busy ? <BtnSpinner /> : "Verify & sign in"}
                  </button>
                </form>

                {/* Resend */}
                <div className="text-center text-sm text-muted-foreground">
                  Didn't receive it?{" "}
                  {resendCooldown > 0 ? (
                    <span className="text-muted-foreground">Resend in {resendCooldown}s</span>
                  ) : (
                    <button onClick={handleResend}
                      className="text-primary hover:underline font-medium">
                      Resend code
                    </button>
                  )}
                </div>

                <button type="button" onClick={() => switchView("sign-up")}
                  className="text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                  ← Back
                </button>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}

function Err({ msg }: { msg: string }) {
  return (
    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
      className="text-sm text-destructive">
      {msg}
    </motion.p>
  );
}

function BtnSpinner() {
  return (
    <motion.span animate={{ rotate: 360 }}
      transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
      className="inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
  );
}

function Spinner({ fullscreen }: { fullscreen?: boolean }) {
  const el = (
    <motion.div animate={{ rotate: 360 }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
      className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
  );
  if (!fullscreen) return el;
  return <div className="min-h-screen flex items-center justify-center bg-background">{el}</div>;
}

// ── OTP 6-digit input ─────────────────────────────────────────────────────────

function OtpInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const refs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));

  function handleChange(i: number, char: string) {
    const digit = char.replace(/\D/g, "").slice(-1);
    const next = [...value];
    next[i] = digit;
    onChange(next);
    if (digit && i < 5) refs[i + 1].current?.focus();
  }

  function handleKeyDown(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !value[i] && i > 0) {
      refs[i - 1].current?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!digits) return;
    const next = [...value];
    digits.split("").forEach((d, idx) => { next[idx] = d; });
    onChange(next);
    const focusIdx = Math.min(digits.length, 5);
    refs[focusIdx].current?.focus();
  }

  return (
    <div className="flex gap-2 justify-center">
      {value.map((digit, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="h-12 w-10 rounded-md border border-input bg-background text-center text-lg font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
        />
      ))}
    </div>
  );
}
