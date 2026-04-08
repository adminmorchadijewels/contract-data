import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, ChevronUp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export function UserMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const displayName = user.displayName ?? user.email ?? "User";
  const email = user.email ?? "";
  const photo = user.photoURL;
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleSignOut() {
    setOpen(false);
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <div className="relative">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 340, damping: 24 }}
            className="absolute bottom-full left-0 right-0 mb-2 rounded-lg border border-border bg-card shadow-lg overflow-hidden z-50"
          >
            {/* User info */}
            <div className="px-3 py-2.5 border-b border-border/60">
              <p className="text-xs font-semibold text-foreground truncate">{displayName}</p>
              <p className="text-[11px] text-muted-foreground truncate">{email}</p>
            </div>

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5 shrink-0" />
              <span>Sign out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-sidebar-accent transition-colors text-left"
      >
        {/* Avatar */}
        <div className="h-7 w-7 rounded-full overflow-hidden shrink-0 bg-primary/20 flex items-center justify-center text-[11px] font-bold text-primary">
          {photo ? (
            <img src={photo} alt={displayName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-sidebar-foreground truncate">{displayName}</p>
          <p className="text-[10px] text-muted-foreground truncate">{email}</p>
        </div>

        <ChevronUp
          className={`h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform duration-200 ${open ? "" : "rotate-180"}`}
        />
      </button>
    </div>
  );
}
