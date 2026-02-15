import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { insertRow, updateRow, deleteRow } from "@/lib/excelDataService";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const REQUEST_TYPES = ["Management", "Staff", "Service providers", "FAM trips", "Tour Operators", "Tour Guides", "Journalists", "Advertisers", "Others"] as const;

interface Props { contract: any; }

export function SpecialPricingTab({ contract }: Props) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editRow, setEditRow] = useState<any>(null);
  const pricing = contract.pricing_special || [];

  const [formData, setFormData] = useState({
    request_type: "Management" as string, discount_type: "Absolute" as string,
    return_fare_usd: "", one_way_fare_usd: "", pax_condition: "",
    start_date: "", end_date: "",
  });

  const openAdd = () => {
    setEditRow(null);
    setFormData({ request_type: "Management", discount_type: "Absolute", return_fare_usd: "", one_way_fare_usd: "", pax_condition: "", start_date: "", end_date: "" });
    setShowForm(true);
  };

  const openEdit = (row: any) => {
    setEditRow(row);
    setFormData({
      request_type: row.request_type || "Management", discount_type: row.discount_type || "Absolute",
      return_fare_usd: row.return_fare_usd?.toString() || "", one_way_fare_usd: row.one_way_fare_usd?.toString() || "",
      pax_condition: row.pax_condition || "", start_date: row.start_date || "", end_date: row.end_date || "",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    const payload = {
      sub_contract_id: contract.sub_contract_id,
      request_type: formData.request_type,
      discount_type: formData.discount_type,
      return_fare_usd: formData.return_fare_usd ? parseFloat(formData.return_fare_usd) : null,
      one_way_fare_usd: formData.one_way_fare_usd ? parseFloat(formData.one_way_fare_usd) : null,
      pax_condition: formData.pax_condition || null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
    };
    if (editRow) {
      updateRow("pricing_special", editRow.id, payload);
    } else {
      insertRow("pricing_special", payload);
    }
    toast({ title: editRow ? "Updated" : "Added" });
    queryClient.invalidateQueries({ queryKey: ["contract-detail", contract.id] });
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    deleteRow("pricing_special", id);
    queryClient.invalidateQueries({ queryKey: ["contract-detail", contract.id] });
    toast({ title: "Deleted" });
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="flex justify-end">
        <Button className="btn-gradient-primary rounded-lg" onClick={openAdd}><Plus className="h-4 w-4 mr-2" /> Add Special Pricing</Button>
      </div>
      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 hover:bg-transparent">
              <TableHead>Request Type</TableHead>
              <TableHead>Discount Type</TableHead>
              <TableHead>Return (USD)</TableHead>
              <TableHead>One Way (USD)</TableHead>
              <TableHead>Pax Condition</TableHead>
              <TableHead>Period</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pricing.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No special pricing data.</TableCell></TableRow>
            ) : pricing.map((row: any) => (
              <TableRow key={row.id} className="data-table-row">
                <TableCell>{row.request_type}</TableCell>
                <TableCell>{row.discount_type}</TableCell>
                <TableCell>${row.return_fare_usd?.toFixed(2) || "—"}</TableCell>
                <TableCell>${row.one_way_fare_usd?.toFixed(2) || "—"}</TableCell>
                <TableCell>{row.pax_condition || "—"}</TableCell>
                <TableCell className="text-xs">{row.start_date && row.end_date ? `${row.start_date} - ${row.end_date}` : "—"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(row)}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(row.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showForm} onOpenChange={(v) => { setShowForm(v); if (!v) setEditRow(null); }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>{editRow ? "Edit Special Pricing" : "Add Special Pricing"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Request Type</Label>
                <Select value={formData.request_type} onValueChange={(v) => setFormData((p) => ({ ...p, request_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{REQUEST_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Discount Type</Label>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`text-sm ${formData.discount_type === "Absolute" ? "text-foreground font-medium" : "text-muted-foreground"}`}>Absolute</span>
                  <Switch checked={formData.discount_type === "Percentage"} onCheckedChange={(c) => setFormData((p) => ({ ...p, discount_type: c ? "Percentage" : "Absolute" }))} />
                  <span className={`text-sm ${formData.discount_type === "Percentage" ? "text-foreground font-medium" : "text-muted-foreground"}`}>Percentage</span>
                </div>
              </div>
              <div>
                <Label>Return Fare (USD)</Label>
                <Input type="number" step="0.01" value={formData.return_fare_usd} onChange={(e) => setFormData((p) => ({ ...p, return_fare_usd: e.target.value }))} />
              </div>
              <div>
                <Label>One Way Fare (USD)</Label>
                <Input type="number" step="0.01" value={formData.one_way_fare_usd} onChange={(e) => setFormData((p) => ({ ...p, one_way_fare_usd: e.target.value }))} />
              </div>
              <div>
                <Label>Pax Condition</Label>
                <Input value={formData.pax_condition} onChange={(e) => setFormData((p) => ({ ...p, pax_condition: e.target.value }))} />
              </div>
              <div />
              <div>
                <Label>Start Date</Label>
                <Input type="date" value={formData.start_date} onChange={(e) => setFormData((p) => ({ ...p, start_date: e.target.value }))} />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" value={formData.end_date} onChange={(e) => setFormData((p) => ({ ...p, end_date: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button className="btn-gradient-primary" onClick={handleSave}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
