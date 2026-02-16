import { Building2, FileText, Settings, Sun, Moon, Sparkles, Shield, PenLine, Eye } from "lucide-react";
import { NavLink } from "@/components/NavLink";
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

const navItems = [
  { title: "Resort Data", url: "/", icon: Building2 },
  { title: "Contracts", url: "/contracts", icon: FileText },
  { title: "AI Assistant", url: "/assistant", icon: Sparkles },
  { title: "Settings", url: "/settings", icon: Settings },
];

const roleConfig = {
  Admin: { icon: Shield, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30" },
  Editor: { icon: PenLine, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  Viewer: { icon: Eye, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
};

export function AppSidebar() {
  const toggleDark = () => document.documentElement.classList.toggle("dark");
  const { role, setRole } = useRole();
  const config = roleConfig[role];

  return (
    <Sidebar className="border-r border-sidebar-border">
      <div className="p-4 flex items-center gap-3 border-b border-sidebar-border">
        <img src="/tma-logo.svg" alt="TMA" className="h-9 w-9 rounded-lg shrink-0" />
        <div className="overflow-hidden">
          <h1 className="text-sm font-bold text-sidebar-foreground truncate">TMA Contracts</h1>
          <p className="text-xs text-muted-foreground truncate">Contract Management</p>
        </div>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3 space-y-3">
        <div className="space-y-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1">Access Role</span>
          <Select value={role} onValueChange={(v) => setRole(v as Role)}>
            <SelectTrigger className={`h-9 text-xs font-medium ${config.bg} ${config.border} border`}>
              <div className="flex items-center gap-2">
                <config.icon className={`h-3.5 w-3.5 ${config.color}`} />
                <SelectValue />
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
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={toggleDark} className="rounded-lg h-8 w-8">
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
