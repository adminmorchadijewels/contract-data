import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { login, isAuthEnabled } from "@/lib/auth";
import { motion } from "framer-motion";

const inputClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors";

export default function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [busy, setBusy]         = useState(false);

  // Auth disabled in local dev — skip straight to app
  if (!isAuthEnabled()) {
    navigate(params.get("redirect") || "/", { replace: true });
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);

    // Tiny artificial delay so the spinner is visible (avoids jarring flash)
    await new Promise((r) => setTimeout(r, 300));

    const ok = login(email, password);
    if (ok) {
      navigate(params.get("redirect") || "/", { replace: true });
    } else {
      setError("Incorrect password. Please try again.");
      setPassword("");
      setBusy(false);
    }
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
              Sign in to access the platform
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </label>
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

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </label>
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

          {/* Error */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-destructive"
            >
              {error}
            </motion.p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={busy}
            className="h-10 w-full rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {busy ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                className="inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full"
              />
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Access is restricted to authorised users only.
        </p>
      </motion.div>
    </div>
  );
}
