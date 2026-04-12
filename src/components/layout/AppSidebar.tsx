import { Building2, FileText, Settings, Sun, Moon, Sparkles, Shield, PenLine, Eye, Database } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useRole, type Role } from "@/lib/RoleContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { UserMenu } from "@/components/auth/UserMenu";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Resort Data", url: "/", icon: Building2 },
  { title: "Contracts", url: "/contracts", icon: FileText },
  { title: "AI Assistant", url: "/assistant", icon: Sparkles },
  { title: "Query", url: "/query", icon: Database },
  { title: "Settings", url: "/settings", icon: Settings },
];

const roleConfig = {
  Admin: { icon: Shield, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30" },
  Editor: { icon: PenLine, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  Viewer: { icon: Eye, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
};

const navStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const navItemVariant = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 200, damping: 18 } },
};

export function AppSidebar() {
  const toggleDark = () => document.documentElement.classList.toggle("dark");
  const { role, dbRole, setPreviewRole } = useRole();
  const config = roleConfig[role];
  const location = useLocation();

  const isActive = (url: string) =>
    url === "/" ? location.pathname === "/" : location.pathname.startsWith(url);

  return (
    <Sidebar className="border-r border-sidebar-border">
      <div className="p-4 flex items-center gap-3 border-b border-sidebar-border">
        <motion.img
          src="/tma-logo.svg"
          alt="TMA"
          className="h-9 w-9 rounded-lg shrink-0"
          whileHover={{ scale: 1.08, rotate: 3 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        />
        <div className="overflow-hidden">
          <h1 className="text-sm font-bold text-sidebar-foreground truncate">TMA Contracts</h1>
          <p className="text-xs text-muted-foreground truncate">Contract Management</p>
        </div>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <motion.div
              variants={navStagger}
              initial="hidden"
              animate="visible"
            >
              <SidebarMenu>
                {navItems.map((item) => {
                  const active = isActive(item.url);
                  return (
                    <motion.div key={item.title} variants={navItemVariant}>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.url}
                            end={item.url === "/" ? true : undefined}
                            className={cn(
                              "relative flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                              active
                                ? "text-sidebar-accent-foreground font-medium"
                                : "text-sidebar-foreground hover:bg-sidebar-accent"
                            )}
                          >
                            {active && (
                              <motion.div
                                layoutId="sidebar-active-pill"
                                className="absolute inset-0 bg-sidebar-accent rounded-md"
                                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                style={{ zIndex: -1 }}
                              />
                            )}
                            <motion.div
                              whileHover={{ scale: 1.15 }}
                              transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            >
                              <item.icon className="h-4 w-4 shrink-0" />
                            </motion.div>
                            <span>{item.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </motion.div>
                  );
                })}
              </SidebarMenu>
            </motion.div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3 space-y-3">
        <div className="space-y-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1">Access Role</span>
          {dbRole === "Admin" ? (
            // Admins can preview as other roles to test the UI
            <Select value={role} onValueChange={(v) => setPreviewRole(v === dbRole ? null : v as Role)}>
              <SelectTrigger className={`h-9 text-xs font-medium ${config.bg} ${config.border} border`}>
                <div className="flex items-center gap-2">
                  <config.icon className={`h-3.5 w-3.5 shrink-0 ${config.color}`} />
                  <span>{role}{role !== dbRole && <span className="ml-1 opacity-60">(preview)</span>}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">
                  <div className="flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5 text-red-500" />
                    <span>Admin</span>
                    <span className="text-[10px] text-muted-foreground ml-1">Full access</span>
                  </div>
                </SelectItem>
                <SelectItem value="Editor">
                  <div className="flex items-center gap-2">
                    <PenLine className="h-3.5 w-3.5 text-blue-500" />
                    <span>Editor</span>
                    <span className="text-[10px] text-muted-foreground ml-1">No delete</span>
                  </div>
                </SelectItem>
                <SelectItem value="Viewer">
                  <div className="flex items-center gap-2">
                    <Eye className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Viewer</span>
                    <span className="text-[10px] text-muted-foreground ml-1">Read only</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          ) : (
            // Non-admins: read-only role badge
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`h-9 px-3 flex items-center gap-2 rounded-md text-xs font-medium ${config.bg} ${config.border} border cursor-default`}>
                  <config.icon className={`h-3.5 w-3.5 shrink-0 ${config.color}`} />
                  <span>{role}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>Your role is assigned by an administrator</TooltipContent>
            </Tooltip>
          )}
        </div>
        <div className="flex items-center gap-1">
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button variant="ghost" size="icon" onClick={toggleDark} className="rounded-lg h-8 w-8 relative overflow-hidden">
              <motion.div
                initial={false}
                animate={{ rotate: 0, scale: 1 }}
                className="absolute"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute inset-0 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </motion.div>
            </Button>
          </motion.div>
        </div>

        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  );
}
