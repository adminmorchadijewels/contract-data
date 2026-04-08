import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { login, isAuthEnabled } from "@/lib/auth";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // If auth is disabled (no VITE_APP_PASSWORD set), go straight to the app.
  if (!isAuthEnabled()) {
    navigate("/", { replace: true });
    return null;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const ok = login(password);
    if (ok) {
      const redirect = params.get("redirect") || "/";
      navigate(redirect, { replace: true });
    } else {
      setError("Incorrect password. Please try again.");
      setPassword("");
      setLoading(false);
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
        {/* Logo / title */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <img src="/tma-logo.svg" alt="TMA" className="h-10 w-10" />
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            TMA Contract Data
          </h1>
          <p className="text-sm text-muted-foreground text-center">
            Enter the access password to continue
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-foreground"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter access password"
              autoComplete="current-password"
              autoFocus
              required
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-destructive"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="h-10 w-full rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Checking…" : "Sign in"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
