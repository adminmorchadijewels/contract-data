import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "@/lib/auth";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

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
