import { createContext, useContext, useState, type ReactNode } from "react";

export type Role = "Admin" | "Editor" | "Viewer";

interface RoleContextValue {
  role: Role;
  setRole: (role: Role) => void;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(() => {
    const stored = localStorage.getItem("tma_role");
    if (stored === "Admin" || stored === "Editor" || stored === "Viewer") return stored;
    return "Admin";
  });

  const handleSetRole = (r: Role) => {
    setRole(r);
    localStorage.setItem("tma_role", r);
  };

  const value: RoleContextValue = {
    role,
    setRole: handleSetRole,
    canCreate: role === "Admin" || role === "Editor",
    canEdit: role === "Admin" || role === "Editor",
    canDelete: role === "Admin",
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}
