import { useState } from "react";
import { Settings as SettingsIcon, Plus, X, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableSettingsModal } from "@/components/settings/TableSettingsModal";
import { selectAll, insertRow, deleteRow } from "@/lib/excelDataService";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useRole } from "@/lib/RoleContext";

export default function SettingsPage() {
  const [showTableSettings, setShowTableSettings] = useState(false);
  const [newAtoll, setNewAtoll] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { role, canCreate, canDelete } = useRole();

  const { data: atolls } = useQuery({
    queryKey: ["atolls"],
    queryFn: () => selectAll("atolls").sort((a: any, b: any) => (a.name || "").localeCompare(b.name || "")),
  });

  const handleAddAtoll = () => {
    const name = newAtoll.trim();
    if (!name) return;
    const exists = atolls?.some((a: any) => a.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      toast({ title: "Atoll already exists", variant: "destructive" });
      return;
    }
    insertRow("atolls", { name });
    queryClient.invalidateQueries({ queryKey: ["atolls"] });
    setNewAtoll("");
    toast({ title: `"${name}" added` });
  };

  const handleDeleteAtoll = (id: string, name: string) => {
    deleteRow("atolls", id);
    queryClient.invalidateQueries({ queryKey: ["atolls"] });
    toast({ title: `"${name}" removed` });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <SettingsIcon className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
      </div>

      <div className="glass-card p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Display Configuration</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Control which tables appear in the navigation and configure column visibility and order for each table.
          </p>
        </div>
        <Button onClick={() => setShowTableSettings(true)} className="btn-gradient-primary">
          Configure Display
        </Button>
      </div>

      <div className="glass-card p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Atoll Management</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {role === "Viewer" ? "View the list of atolls available in the Resort Data dropdown." : "Manage the list of atolls available in the Resort Data dropdown."}
          </p>
        </div>
        {canCreate && (
          <div className="flex gap-2">
            <Input
              placeholder="Enter atoll name..."
              value={newAtoll}
              onChange={(e) => setNewAtoll(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddAtoll()}
              className="max-w-xs"
            />
            <Button onClick={handleAddAtoll} className="btn-gradient-primary" disabled={!newAtoll.trim()}>
              <Plus className="h-4 w-4 mr-2" /> Add
            </Button>
          </div>
        )}
        <div className="flex flex-wrap gap-2 mt-2">
          {atolls?.map((atoll: any) => (
            <span key={atoll.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-sm text-foreground">
              {atoll.name}
              {canDelete && (
                <button
                  onClick={() => handleDeleteAtoll(atoll.id, atoll.name)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </span>
          ))}
          {(!atolls || atolls.length === 0) && (
            <span className="text-sm text-muted-foreground">No atolls configured yet.</span>
          )}
        </div>
      </div>

      <TableSettingsModal open={showTableSettings} onClose={() => setShowTableSettings(false)} />
    </div>
  );
}
