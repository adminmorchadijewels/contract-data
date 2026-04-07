import { useState } from "react";
import { useSchemaManager, type TableInfo, type ColumnInfo } from "@/hooks/useSchemaManager";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Plus, Trash2, Pencil, Database, Columns3, Link2, RefreshCw, AlertTriangle, ChevronDown, ChevronRight,
} from "lucide-react";

const COLUMN_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number (Decimal)" },
  { value: "integer", label: "Integer" },
  { value: "boolean", label: "Yes/No (Boolean)" },
  { value: "date", label: "Date" },
  { value: "timestamp", label: "Date & Time" },
  { value: "select", label: "Select (Dropdown)" },
];

const SYSTEM_COLUMNS = ["id", "created_at", "updated_at", "user_id"];

function friendlyType(col: ColumnInfo): string {
  const map: Record<string, string> = {
    text: "Text",
    varchar: "Text",
    numeric: "Number",
    int4: "Integer",
    int8: "Integer",
    bool: "Boolean",
    date: "Date",
    timestamptz: "Timestamp",
    uuid: "UUID",
    jsonb: "JSON",
  };
  return map[col.udt_name] || col.data_type;
}

export function SchemaManager() {
  const { schema, isLoading, refetch, addColumn, deleteColumn, renameColumn, createTable, isAddingColumn, isDeletingColumn, isRenamingColumn, isCreatingTable } = useSchemaManager();
  const { toast } = useToast();

  const [expandedTable, setExpandedTable] = useState<string | null>(null);
  const [showAddColumn, setShowAddColumn] = useState<string | null>(null);
  const [showRenameColumn, setShowRenameColumn] = useState<{ table: string; column: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ table: string; column: string } | null>(null);
  const [showCreateTable, setShowCreateTable] = useState(false);

  // Add column form state
  const [newColName, setNewColName] = useState("");
  const [newColType, setNewColType] = useState("text");
  const [newColNullable, setNewColNullable] = useState(true);
  const [newColDefault, setNewColDefault] = useState("");

  // Rename column state
  const [renameValue, setRenameValue] = useState("");

  // Create table state
  const [newTableName, setNewTableName] = useState("");
  const [newTableColumns, setNewTableColumns] = useState<{ name: string; type: string; is_nullable: boolean; default_value: string }[]>([]);
  const [newTableFKs, setNewTableFKs] = useState<{ column_name: string; ref_table: string; on_delete: "cascade" | "set_null" }[]>([]);

  const resetAddColumn = () => {
    setNewColName("");
    setNewColType("text");
    setNewColNullable(true);
    setNewColDefault("");
    setShowAddColumn(null);
  };

  const handleAddColumn = async () => {
    if (!showAddColumn || !newColName.trim()) return;
    try {
      await addColumn({
        table_name: showAddColumn,
        column_name: newColName.trim().toLowerCase().replace(/\s+/g, "_"),
        column_type: newColType,
        is_nullable: newColNullable,
        default_value: newColDefault || undefined,
      });
      toast({ title: "Column added successfully" });
      resetAddColumn();
    } catch (err: unknown) {
      toast({ title: "Failed to add column", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    }
  };

  const handleRenameColumn = async () => {
    if (!showRenameColumn || !renameValue.trim()) return;
    try {
      await renameColumn({
        table_name: showRenameColumn.table,
        old_name: showRenameColumn.column,
        new_name: renameValue.trim().toLowerCase().replace(/\s+/g, "_"),
      });
      toast({ title: "Column renamed successfully" });
      setShowRenameColumn(null);
      setRenameValue("");
    } catch (err: unknown) {
      toast({ title: "Failed to rename column", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    }
  };

  const handleDeleteColumn = async () => {
    if (!showDeleteConfirm) return;
    try {
      await deleteColumn({
        table_name: showDeleteConfirm.table,
        column_name: showDeleteConfirm.column,
      });
      toast({ title: "Column deleted successfully" });
      setShowDeleteConfirm(null);
    } catch (err: unknown) {
      toast({ title: "Failed to delete column", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    }
  };

  const handleCreateTable = async () => {
    if (!newTableName.trim()) return;
    try {
      await createTable({
        table_name: newTableName.trim().toLowerCase().replace(/\s+/g, "_"),
        columns: newTableColumns,
        foreign_keys: newTableFKs,
      });
      toast({ title: "Table created successfully" });
      setShowCreateTable(false);
      setNewTableName("");
      setNewTableColumns([]);
      setNewTableFKs([]);
    } catch (err: unknown) {
      toast({ title: "Failed to create table", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    }
  };

  const addNewTableColumn = () => {
    setNewTableColumns((prev) => [...prev, { name: "", type: "text", is_nullable: true, default_value: "" }]);
  };

  const updateNewTableColumn = (index: number, field: string, value: string | boolean) => {
    setNewTableColumns((prev) => prev.map((col, i) => (i === index ? { ...col, [field]: value } : col)));
  };

  const removeNewTableColumn = (index: number) => {
    setNewTableColumns((prev) => prev.filter((_, i) => i !== index));
  };

  const addNewTableFK = () => {
    setNewTableFKs((prev) => [...prev, { column_name: "", ref_table: "", on_delete: "set_null" }]);
  };

  const updateNewTableFK = (index: number, field: string, value: string) => {
    setNewTableFKs((prev) => prev.map((fk, i) => (i === index ? { ...fk, [field]: value } : fk)));
  };

  const removeNewTableFK = (index: number) => {
    setNewTableFKs((prev) => prev.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Database Schema Manager</h3>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
          <Button size="sm" className="btn-gradient-primary" onClick={() => setShowCreateTable(true)}>
            <Plus className="h-4 w-4 mr-1" /> New Table
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {schema.map((table) => (
          <div key={table.table_name} className="glass-card overflow-hidden">
            <button
              className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors text-left"
              onClick={() => setExpandedTable(expandedTable === table.table_name ? null : table.table_name)}
            >
              <div className="flex items-center gap-3">
                {expandedTable === table.table_name ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium text-foreground">{table.table_name}</span>
                <Badge variant="secondary" className="text-xs">
                  {table.columns.length} columns
                </Badge>
              </div>
            </button>

            {expandedTable === table.table_name && (
              <div className="px-4 pb-4 space-y-3">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/30 hover:bg-transparent">
                      <TableHead className="text-muted-foreground font-semibold">Column</TableHead>
                      <TableHead className="text-muted-foreground font-semibold">Type</TableHead>
                      <TableHead className="text-muted-foreground font-semibold">Nullable</TableHead>
                      <TableHead className="text-muted-foreground font-semibold">Default</TableHead>
                      <TableHead className="text-muted-foreground font-semibold">Reference</TableHead>
                      <TableHead className="text-muted-foreground font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {table.columns.map((col) => {
                      const isSystem = SYSTEM_COLUMNS.includes(col.column_name) || col.is_primary;
                      return (
                        <TableRow key={col.column_name} className="data-table-row">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {col.column_name}
                              {col.is_primary && <Badge variant="outline" className="text-xs">PK</Badge>}
                              {col.is_foreign_key && (
                                <Badge variant="secondary" className="text-xs">
                                  <Link2 className="h-3 w-3 mr-1" /> FK
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{friendlyType(col)}</TableCell>
                          <TableCell className="text-muted-foreground">{col.is_nullable === "YES" ? "Yes" : "No"}</TableCell>
                          <TableCell className="text-muted-foreground text-xs max-w-[120px] truncate">
                            {col.column_default || "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs">
                            {col.is_foreign_key ? `${col.fk_table}.${col.fk_column}` : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            {!isSystem && (
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setShowRenameColumn({ table: table.table_name, column: col.column_name });
                                    setRenameValue(col.column_name);
                                  }}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => setShowDeleteConfirm({ table: table.table_name, column: col.column_name })}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                <Button variant="outline" size="sm" onClick={() => setShowAddColumn(table.table_name)}>
                  <Plus className="h-4 w-4 mr-1" /> Add Column
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Column Dialog */}
      <Dialog open={!!showAddColumn} onOpenChange={() => resetAddColumn()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Column to "{showAddColumn}"</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Column Name</Label>
              <Input
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                placeholder="e.g. phone_number"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">Lowercase, underscores, no spaces</p>
            </div>
            <div>
              <Label>Column Type</Label>
              <Select value={newColType} onValueChange={setNewColType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COLUMN_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Allow empty (nullable)</Label>
              <Switch checked={newColNullable} onCheckedChange={setNewColNullable} />
            </div>
            <div>
              <Label>Default Value (optional)</Label>
              <Input
                value={newColDefault}
                onChange={(e) => setNewColDefault(e.target.value)}
                placeholder="Leave empty for no default"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => resetAddColumn()}>Cancel</Button>
            <Button onClick={handleAddColumn} disabled={isAddingColumn || !newColName.trim()} className="btn-gradient-primary">
              {isAddingColumn ? "Adding..." : "Add Column"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Column Dialog */}
      <Dialog open={!!showRenameColumn} onOpenChange={() => { setShowRenameColumn(null); setRenameValue(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Column</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Renaming "{showRenameColumn?.column}" in table "{showRenameColumn?.table}"
            </p>
            <div>
              <Label>New Column Name</Label>
              <Input
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                placeholder="new_column_name"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">Lowercase, underscores, no spaces</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowRenameColumn(null); setRenameValue(""); }}>Cancel</Button>
            <Button onClick={handleRenameColumn} disabled={isRenamingColumn || !renameValue.trim()} className="btn-gradient-primary">
              {isRenamingColumn ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Column Confirm Dialog */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" /> Delete Column
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete column "{showDeleteConfirm?.column}" from table "{showDeleteConfirm?.table}"?
            This can only succeed if the column contains no data.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteColumn} disabled={isDeletingColumn}>
              {isDeletingColumn ? "Deleting..." : "Delete Column"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Table Dialog */}
      <Dialog open={showCreateTable} onOpenChange={setShowCreateTable}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Table</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label>Table Name</Label>
              <Input
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
                placeholder="e.g. invoices"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">Lowercase, underscores, no spaces. "id" and "created_at" are added automatically.</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Columns3 className="h-4 w-4" /> Columns
                </Label>
                <Button variant="outline" size="sm" onClick={addNewTableColumn}>
                  <Plus className="h-4 w-4 mr-1" /> Add Column
                </Button>
              </div>

              {newTableColumns.map((col, i) => (
                <div key={i} className="flex gap-2 items-start p-3 rounded-lg bg-secondary/20">
                  <div className="flex-1 space-y-2">
                    <Input
                      value={col.name}
                      onChange={(e) => updateNewTableColumn(i, "name", e.target.value)}
                      placeholder="column_name"
                    />
                    <div className="flex gap-2">
                      <Select value={col.type} onValueChange={(v) => updateNewTableColumn(i, "type", v)}>
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COLUMN_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-1">
                        <Switch
                          checked={col.is_nullable}
                          onCheckedChange={(v) => updateNewTableColumn(i, "is_nullable", v)}
                        />
                        <span className="text-xs text-muted-foreground">Nullable</span>
                      </div>
                    </div>
                    <Input
                      value={col.default_value}
                      onChange={(e) => updateNewTableColumn(i, "default_value", e.target.value)}
                      placeholder="Default value (optional)"
                    />
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive mt-1" onClick={() => removeNewTableColumn(i)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Link2 className="h-4 w-4" /> Foreign Key Connections
                </Label>
                <Button variant="outline" size="sm" onClick={addNewTableFK}>
                  <Plus className="h-4 w-4 mr-1" /> Add Connection
                </Button>
              </div>

              {newTableFKs.map((fk, i) => (
                <div key={i} className="flex gap-2 items-start p-3 rounded-lg bg-secondary/20">
                  <div className="flex-1 space-y-2">
                    <Input
                      value={fk.column_name}
                      onChange={(e) => updateNewTableFK(i, "column_name", e.target.value)}
                      placeholder="Column name (e.g. company_id)"
                    />
                    <div className="flex gap-2">
                      <Select value={fk.ref_table} onValueChange={(v) => updateNewTableFK(i, "ref_table", v)}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Reference table" />
                        </SelectTrigger>
                        <SelectContent>
                          {schema.map((t) => (
                            <SelectItem key={t.table_name} value={t.table_name}>{t.table_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={fk.on_delete} onValueChange={(v) => updateNewTableFK(i, "on_delete", v)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="set_null">Set Null</SelectItem>
                          <SelectItem value="cascade">Cascade</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive mt-1" onClick={() => removeNewTableFK(i)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateTable(false)}>Cancel</Button>
            <Button onClick={handleCreateTable} disabled={isCreatingTable || !newTableName.trim()} className="btn-gradient-primary">
              {isCreatingTable ? "Creating..." : "Create Table"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
