import { Building2, FileText, Settings, Plane, Sun, Moon, Download, Upload } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { exportToExcel, importFromExcel } from "@/lib/excelDataService";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useRef } from "react";
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

const navItems = [
  { title: "Resort Data", url: "/", icon: Building2 },
  { title: "Contracts", url: "/contracts", icon: FileText },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toggleDark = () => document.documentElement.classList.toggle("dark");

  const handleExport = () => {
    exportToExcel();
    toast({ title: "Data exported to Excel" });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importFromExcel(file);
      queryClient.invalidateQueries();
      toast({ title: "Data imported from Excel" });
    } catch {
      toast({ title: "Import failed", description: "Please check the file format.", variant: "destructive" });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Sidebar className="border-r border-sidebar-border">
      <div className="p-4 flex items-center gap-3 border-b border-sidebar-border">
        <div className="h-9 w-9 rounded-lg btn-gradient-primary flex items-center justify-center shrink-0">
          <Plane className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="overflow-hidden">
          <h1 className="text-sm font-bold text-sidebar-foreground truncate">AeroContracts</h1>
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

        <SidebarGroup>
          <SidebarGroupLabel>Data</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleExport} className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors cursor-pointer">
                  <Download className="h-4 w-4 shrink-0" />
                  <span>Export to Excel</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors cursor-pointer">
                  <Upload className="h-4 w-4 shrink-0" />
                  <span>Import from Excel</span>
                </SidebarMenuButton>
                <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
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
