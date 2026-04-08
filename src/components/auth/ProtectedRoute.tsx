import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "@/lib/auth";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

/**
 * Wraps any route that requires authentication.
 * Redirects to /login and preserves the intended path in ?redirect=
 * so the user lands on the right page after logging in.
 */
export default function ProtectedRoute({ children }: Props) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }

  return <>{children}</>;
}
