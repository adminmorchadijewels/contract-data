import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { GripVertical, Eye, EyeOff } from "lucide-react";
import { useTableSettings, DEFAULT_COLUMNS, type ColumnConfig, type TableSetting } from "@/hooks/useTableSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function TableSettingsModal({ open, onClose }: Props) {
  const { allTableNames, getSettingsForTable, upsertSetting } = useTableSettings();
  const { toast } = useToast();
  const [localSettings, setLocalSettings] = useState<Record<string, TableSetting>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      const initial: Record<string, TableSetting> = {};
      for (const t of allTableNames) {
        initial[t] = getSettingsForTable(t);
      }
      setLocalSettings(initial);
    }
  }, [open, allTableNames]);

  const toggleTableVisible = (table: string) => {
    setLocalSettings((prev) => ({
      ...prev,
      [table]: { ...prev[table], visible: !prev[table].visible },
    }));
  };

  const toggleColumnVisible = (table: string, key: string) => {
    setLocalSettings((prev) => {
      const cols = prev[table].column_config.map((c) =>
        c.key === key ? { ...c, visible: !c.visible } : c
      );
      return { ...prev, [table]: { ...prev[table], column_config: cols } };
    });
  };

  const moveColumn = (table: string, index: number, dir: -1 | 1) => {
    setLocalSettings((prev) => {
      const cols = [...prev[table].column_config].sort((a, b) => a.order - b.order);
      const newIndex = index + dir;
      if (newIndex < 0 || newIndex >= cols.length) return prev;
      const temp = cols[index].order;
      cols[index] = { ...cols[index], order: cols[newIndex].order };
      cols[newIndex] = { ...cols[newIndex], order: temp };
      return { ...prev, [table]: { ...prev[table], column_config: cols } };
    });
  };

  const resetTable = (table: string) => {
    setLocalSettings((prev) => ({
      ...prev,
      [table]: {
        ...prev[table],
        visible: true,
        column_config: DEFAULT_COLUMNS[table] || [],
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const t of allTableNames) {
        await upsertSetting(localSettings[t]);
      }
      toast({ title: "Settings saved" });
      onClose();
    } catch {
      toast({ title: "Failed to save settings", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const tableLabels: Record<string, string> = {
    companies: "Resort Data",
    contracts: "Contracts",
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Table & Column Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={allTableNames[0]}>
          <TabsList className="w-full">
            {allTableNames.map((t) => (
              <TabsTrigger key={t} value={t} className="flex-1 text-xs">
                {tableLabels[t] || t}
              </TabsTrigger>
            ))}
          </TabsList>

          {allTableNames.map((t) => {
            const setting = localSettings[t];
            if (!setting) return null;
            const sortedCols = [...setting.column_config].sort((a, b) => a.order - b.order);

            return (
              <TabsContent key={t} value={t} className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={setting.visible}
                      onCheckedChange={() => toggleTableVisible(t)}
                    />
                    <Label className="text-sm font-medium">Show table in navigation</Label>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => resetTable(t)}>
                    Reset
                  </Button>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Columns</p>
                  {sortedCols.map((col, i) => (
                    <div
                      key={col.key}
                      className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex flex-col gap-0.5">
                        <button
                          className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                          disabled={i === 0}
                          onClick={() => moveColumn(t, i, -1)}
                        >
                          <GripVertical className="h-3 w-3 rotate-90" />
                        </button>
                        <button
                          className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                          disabled={i === sortedCols.length - 1}
                          onClick={() => moveColumn(t, i, 1)}
                        >
                          <GripVertical className="h-3 w-3 -rotate-90" />
                        </button>
                      </div>
                      <span className="flex-1 text-sm">{col.label}</span>
                      <button
                        onClick={() => toggleColumnVisible(t, col.key)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {col.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    </div>
                  ))}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="btn-gradient-primary">
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
