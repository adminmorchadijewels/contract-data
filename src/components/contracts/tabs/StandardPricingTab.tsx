import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { insertRow, updateRow, deleteRow } from "@/lib/excelDataService";
import { useQueryClient } from "@tanstack/react-query";
import { useCompanies } from "@/hooks/useCompanies";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface Props { contract: any; }

export function StandardPricingTab({ contract }: Props) {
  const { data: companies } = useCompanies();
  const resorts = companies?.filter((c) => c.type === "Resort") || [];
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editRow, setEditRow] = useState<any>(null);
  const pricing = contract.pricing_standard || [];

  const [formData, setFormData] = useState({
    weekdays: [] as string[], point_a_id: "", point_b_id: "",
    transfer_type: "", pax_condition: "", passenger_type: "Adult",
    return_fare_usd: "", one_way_fare_usd: "", start_date: "", end_date: "",
  });

  const openAdd = () => {
    setEditRow(null);
    setFormData({ weekdays: [], point_a_id: "", point_b_id: "", transfer_type: "", pax_condition: "", passenger_type: "Adult", return_fare_usd: "", one_way_fare_usd: "", start_date: "", end_date: "" });
    setShowForm(true);
  };

  const openEdit = (row: any) => {
    setEditRow(row);
    setFormData({
      weekdays: row.weekdays || [], point_a_id: row.point_a_id || "", point_b_id: row.point_b_id || "",
      transfer_type: row.transfer_type || "", pax_condition: row.pax_condition || "",
      passenger_type: row.passenger_type || "Adult",
      return_fare_usd: row.return_fare_usd?.toString() || "", one_way_fare_usd: row.one_way_fare_usd?.toString() || "",
      start_date: row.start_date || "", end_date: row.end_date || "",
    });
    setShowForm(true);
  };

  const toggleWeekday = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      weekdays: prev.weekdays.includes(day) ? prev.weekdays.filter((d) => d !== day) : [...prev.weekdays, day],
    }));
  };

  const handleSave = async () => {
    const payload = {
      sub_contract_id: contract.sub_contract_id,
      weekdays: formData.weekdays,
      point_a_id: formData.point_a_id || null,
      point_b_id: formData.point_b_id || null,
      transfer_type: formData.transfer_type || null,
      pax_condition: formData.pax_condition || null,
      passenger_type: formData.passenger_type,
      return_fare_usd: formData.return_fare_usd ? parseFloat(formData.return_fare_usd) : null,
      one_way_fare_usd: formData.one_way_fare_usd ? parseFloat(formData.one_way_fare_usd) : null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
    };
    try {
      if (editRow) {
        updateRow("pricing_standard", editRow.id, payload);
      } else {
        insertRow("pricing_standard", payload);
      }
      toast({ title: editRow ? "Pricing updated" : "Pricing added" });
      queryClient.invalidateQueries({ queryKey: ["contract-detail", contract.id] });
      setShowForm(false);
    } catch (err) {
      console.error("Error:", err);
      toast({ title: "Operation failed", description: "Unable to save changes. Please try again.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      deleteRow("pricing_standard", id);
      toast({ title: "Pricing deleted" });
      queryClient.invalidateQueries({ queryKey: ["contract-detail", contract.id] });
    } catch (err) {
      console.error("Error:", err);
      toast({ title: "Operation failed", description: "Unable to delete. Please try again.", variant: "destructive" });
    }
  };

  const getDestName = (id: string) => resorts?.find((d: any) => d.id === id)?.name || "\u2014";

  return (
    <div className="mt-4 space-y-4">
      <div className="flex justify-end">
        <Button className="btn-gradient-primary rounded-lg" onClick={openAdd}><Plus className="h-4 w-4 mr-2" /> Add Pricing Row</Button>
      </div>
      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 hover:bg-transparent">
              <TableHead>Weekdays</TableHead>
              <TableHead>Point A</TableHead>
              <TableHead>Point B</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Pax Type</TableHead>
              <TableHead>Return (USD)</TableHead>
              <TableHead>One Way (USD)</TableHead>
              <TableHead>Period</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pricing.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No pricing data.</TableCell></TableRow>
            ) : pricing.map((row: any) => (
              <TableRow key={row.id} className="data-table-row">
                <TableCell><div className="flex gap-1 flex-wrap">{(row.weekdays || []).map((d: string) => <Badge key={d} variant="secondary" className="text-xs">{d}</Badge>)}</div></TableCell>
                <TableCell>{getDestName(row.point_a_id)}</TableCell>
                <TableCell>{getDestName(row.point_b_id)}</TableCell>
                <TableCell>{row.transfer_type || "—"}</TableCell>
                <TableCell>{row.passenger_type || "—"}</TableCell>
                <TableCell>${row.return_fare_usd?.toFixed(2) || "—"}</TableCell>
                <TableCell>${row.one_way_fare_usd?.toFixed(2) || "—"}</TableCell>
                <TableCell className="text-xs">{row.start_date && row.end_date ? `${format(new Date(row.start_date), "dd MMM")} - ${format(new Date(row.end_date), "dd MMM yyyy")}` : "—"}</TableCell>
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
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader><DialogTitle>{editRow ? "Edit Pricing" : "Add Pricing"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Weekdays</Label>
              <div className="flex gap-2 mt-1">{WEEKDAYS.map((day) => (
                <button key={day} type="button" onClick={() => toggleWeekday(day)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${formData.weekdays.includes(day) ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                  {day}
                </button>
              ))}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Point A</Label>
                <Select value={formData.point_a_id} onValueChange={(v) => setFormData((p) => ({ ...p, point_a_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{resorts?.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name} ({d.code || ""})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Point B</Label>
                <Select value={formData.point_b_id} onValueChange={(v) => setFormData((p) => ({ ...p, point_b_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{resorts?.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name} ({d.code || ""})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Transfer Type</Label>
                <Input value={formData.transfer_type} onChange={(e) => setFormData((p) => ({ ...p, transfer_type: e.target.value }))} />
              </div>
              <div>
                <Label>Passenger Type</Label>
                <Select value={formData.passenger_type} onValueChange={(v) => setFormData((p) => ({ ...p, passenger_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Adult">Adult</SelectItem><SelectItem value="Child">Child</SelectItem></SelectContent>
                </Select>
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
