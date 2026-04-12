import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "./supabase";

export type Role = "Admin" | "Editor" | "Viewer";

interface RoleContextValue {
  role: Role;         // active role (dbRole, or admin preview)
  dbRole: Role;       // authoritative role fetched from Supabase
  setPreviewRole: (r: Role | null) => void;  // Admin-only: preview as another role
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

const RoleContext = createContext<RoleContextValue | null>(null);

function isValidRole(r: unknown): r is Role {
  return r === "Admin" || r === "Editor" || r === "Viewer";
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [dbRole, setDbRole]           = useState<Role>("Viewer");
  const [previewRole, setPreviewRole] = useState<Role | null>(null);

  useEffect(() => {
    setPreviewRole(null);

    if (!user) {
      setDbRole("Viewer");
      return;
    }

    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setDbRole(isValidRole(data?.role) ? data!.role : "Viewer");
      });
  }, [user?.id]);

  const role = previewRole ?? dbRole;

  const value: RoleContextValue = {
    role,
    dbRole,
    setPreviewRole: (r) => {
      // Only Admins may preview other roles
      if (dbRole === "Admin") setPreviewRole(r);
    },
    canCreate: role === "Admin" || role === "Editor",
    canEdit:   role === "Admin" || role === "Editor",
    canDelete: role === "Admin",
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}
