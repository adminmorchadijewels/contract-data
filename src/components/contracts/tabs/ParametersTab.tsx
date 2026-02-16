import { useState } from "react";
import { Luggage, Calendar, Users, Package, Shield, Building, Fuel, CreditCard, Clock, XCircle, Plus, Pencil, Trash2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { insertRow, updateRow, deleteRow, type TableName } from "@/lib/excelDataService";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useRole } from "@/lib/RoleContext";

interface Props { contract: any; }

type ParamTable = "contract_baggage" | "contract_booking" | "contract_fuel" | "contract_payment_plan" | "contract_service_commitment" | "contract_termination";

function ParamSection({ title, icon: Icon, tableName, data, contractId, subContractId, fields }: {
  title: string; icon: any; tableName: ParamTable; data: any[];
  contractId: string; subContractId: string;
  fields: { key: string; label: string; type?: string }[];
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { canCreate, canEdit, canDelete } = useRole();
  const [showForm, setShowForm] = useState(false);
  const [editRow, setEditRow] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const openAdd = () => {
    setEditRow(null);
    const empty: Record<string, string> = {};
    fields.forEach((f) => (empty[f.key] = ""));
    setFormData(empty);
    setShowForm(true);
  };

  const openEdit = (row: any) => {
    setEditRow(row);
    const d: Record<string, string> = {};
    fields.forEach((f) => (d[f.key] = row[f.key]?.toString() || ""));
    setFormData(d);
    setShowForm(true);
  };

  const handleSave = async () => {
    const payload: Record<string, any> = { sub_contract_id: subContractId };
    fields.forEach((f) => { payload[f.key] = formData[f.key] || null; });
    if (editRow) {
      updateRow(tableName as TableName, editRow.id, payload);
    } else {
      insertRow(tableName as TableName, payload);
    }
    toast({ title: editRow ? "Updated" : "Added" });
    queryClient.invalidateQueries({ queryKey: ["contract-detail", contractId] });
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    deleteRow(tableName as TableName, id);
    queryClient.invalidateQueries({ queryKey: ["contract-detail", contractId] });
    toast({ title: "Deleted" });
  };

  return (
    <AccordionItem value={tableName}>
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <span className="font-semibold">{title}</span>
          <span className="text-xs text-muted-foreground">({data.length})</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-3">
          {canCreate && (
            <div className="flex justify-end">
              <Button size="sm" className="btn-gradient-primary rounded-lg" onClick={openAdd}><Plus className="h-3 w-3 mr-1" /> Add Row</Button>
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow className="border-border/30 hover:bg-transparent">
                {fields.map((f) => <TableHead key={f.key}>{f.label}</TableHead>)}
                {(canEdit || canDelete) && <TableHead className="w-20">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow><TableCell colSpan={fields.length + (canEdit || canDelete ? 1 : 0)} className="text-center py-6 text-muted-foreground">No data.</TableCell></TableRow>
              ) : data.map((row: any) => (
                <TableRow key={row.id} className="data-table-row">
                  {fields.map((f) => (
                    <TableCell key={f.key}>
                      {f.key === "remark" && row[f.key] ? (
                        <Tooltip>
                          <TooltipTrigger><div className="flex items-center gap-1"><span className="truncate max-w-[150px]">{row[f.key]}</span><Info className="h-3 w-3 text-muted-foreground" /></div></TooltipTrigger>
                          <TooltipContent>{row[f.key]}</TooltipContent>
                        </Tooltip>
                      ) : (row[f.key]?.toString() || "—")}
                    </TableCell>
                  ))}
                  {(canEdit || canDelete) && (
                    <TableCell>
                      <div className="flex gap-1">
                        {canEdit && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(row)}><Pencil className="h-3 w-3" /></Button>}
                        {canDelete && <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(row.id)}><Trash2 className="h-3 w-3" /></Button>}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={showForm} onOpenChange={(v) => { setShowForm(v); if (!v) setEditRow(null); }}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editRow ? "Edit" : "Add"} {title}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              {fields.map((f) => (
                <div key={f.key}>
                  <Label>{f.label}</Label>
                  <Input value={formData[f.key] || ""} onChange={(e) => setFormData((p) => ({ ...p, [f.key]: e.target.value }))} />
                </div>
              ))}
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button className="btn-gradient-primary" onClick={handleSave}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </AccordionContent>
    </AccordionItem>
  );
}

function AgeSection({ data, contractId, subContractId }: { data: any[]; contractId: string; subContractId: string }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { canEdit } = useRole();
  const [editRow, setEditRow] = useState<any>(null);
  const [formData, setFormData] = useState({ min_age: "", max_age: "" });

  const openEdit = (row: any) => {
    setEditRow(row);
    setFormData({ min_age: row.min_age?.toString() || "", max_age: row.max_age?.toString() || "" });
  };

  const handleSave = async () => {
    if (!editRow) return;
    updateRow("contract_age", editRow.id, {
      min_age: parseInt(formData.min_age),
      max_age: formData.max_age ? parseInt(formData.max_age) : null,
    });
    toast({ title: "Updated" });
    queryClient.invalidateQueries({ queryKey: ["contract-detail", contractId] });
    setEditRow(null);
  };

  return (
    <AccordionItem value="age">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <span className="font-semibold">Age</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 hover:bg-transparent">
              <TableHead>Type</TableHead><TableHead>Min Age</TableHead><TableHead>Max Age</TableHead>
              {canEdit && <TableHead className="w-16">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow><TableCell colSpan={canEdit ? 4 : 3} className="text-center py-6 text-muted-foreground">No age data.</TableCell></TableRow>
            ) : data.map((row: any) => (
              <TableRow key={row.id} className="data-table-row">
                <TableCell>{row.type}</TableCell>
                <TableCell>{row.min_age}</TableCell>
                <TableCell>{row.max_age ?? "—"}</TableCell>
                {canEdit && <TableCell><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(row)}><Pencil className="h-3 w-3" /></Button></TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Dialog open={!!editRow} onOpenChange={() => setEditRow(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Age — {editRow?.type}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Min Age</Label><Input type="number" value={formData.min_age} onChange={(e) => setFormData((p) => ({ ...p, min_age: e.target.value }))} /></div>
              <div><Label>Max Age</Label><Input type="number" value={formData.max_age} onChange={(e) => setFormData((p) => ({ ...p, max_age: e.target.value }))} placeholder="Leave empty for no max" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" onClick={() => setEditRow(null)}>Cancel</Button>
                <Button className="btn-gradient-primary" onClick={handleSave}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </AccordionContent>
    </AccordionItem>
  );
}

function AddonsSection({ data, contractId, subContractId }: { data: any[]; contractId: string; subContractId: string }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { canCreate, canEdit, canDelete } = useRole();
  const [showForm, setShowForm] = useState(false);
  const [editRow, setEditRow] = useState<any>(null);
  const [formData, setFormData] = useState({ sub_category: "Dedicated Vehicle", type: "", value: "", remark: "" });

  const openAdd = () => { setEditRow(null); setFormData({ sub_category: "Dedicated Vehicle", type: "", value: "", remark: "" }); setShowForm(true); };
  const openEdit = (row: any) => { setEditRow(row); setFormData({ sub_category: row.sub_category || "Dedicated Vehicle", type: row.type || "", value: row.value?.toString() || "", remark: row.remark || "" }); setShowForm(true); };

  const handleSave = async () => {
    const payload = { sub_contract_id: subContractId, sub_category: formData.sub_category, type: formData.type, value: parseFloat(formData.value) || 0, remark: formData.remark || null };
    if (editRow) { updateRow("contract_addons", editRow.id, payload); }
    else { insertRow("contract_addons", payload); }
    queryClient.invalidateQueries({ queryKey: ["contract-detail", contractId] });
    setShowForm(false);
  };

  const handleDelete = async (id: string) => { deleteRow("contract_addons", id); queryClient.invalidateQueries({ queryKey: ["contract-detail", contractId] }); };

  return (
    <AccordionItem value="addons">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2"><Package className="h-4 w-4 text-primary" /><span className="font-semibold">Add-ons</span><span className="text-xs text-muted-foreground">({data.length})</span></div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-3">
          {canCreate && <div className="flex justify-end"><Button size="sm" className="btn-gradient-primary rounded-lg" onClick={openAdd}><Plus className="h-3 w-3 mr-1" /> Add Row</Button></div>}
          <Table>
            <TableHeader><TableRow className="border-border/30 hover:bg-transparent"><TableHead>Sub-Category</TableHead><TableHead>Type</TableHead><TableHead>Value (USD)</TableHead><TableHead>Remark</TableHead>{(canEdit || canDelete) && <TableHead className="w-20">Actions</TableHead>}</TableRow></TableHeader>
            <TableBody>
              {data.length === 0 ? <TableRow><TableCell colSpan={canEdit || canDelete ? 5 : 4} className="text-center py-6 text-muted-foreground">No data.</TableCell></TableRow>
              : data.map((row: any) => (
                <TableRow key={row.id} className="data-table-row">
                  <TableCell>{row.sub_category}</TableCell><TableCell>{row.type}</TableCell><TableCell>${row.value?.toFixed(2)}</TableCell>
                  <TableCell>{row.remark || "—"}</TableCell>
                  {(canEdit || canDelete) && (
                    <TableCell><div className="flex gap-1">
                      {canEdit && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(row)}><Pencil className="h-3 w-3" /></Button>}
                      {canDelete && <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(row.id)}><Trash2 className="h-3 w-3" /></Button>}
                    </div></TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Dialog open={showForm} onOpenChange={(v) => { setShowForm(v); if (!v) setEditRow(null); }}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editRow ? "Edit" : "Add"} Add-on</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Sub-Category</Label><Input value={formData.sub_category} onChange={(e) => setFormData((p) => ({ ...p, sub_category: e.target.value }))} /></div>
              <div><Label>Type</Label><Input value={formData.type} onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value }))} /></div>
              <div><Label>Value (USD)</Label><Input type="number" step="0.01" value={formData.value} onChange={(e) => setFormData((p) => ({ ...p, value: e.target.value }))} /></div>
              <div><Label>Remark</Label><Input value={formData.remark} onChange={(e) => setFormData((p) => ({ ...p, remark: e.target.value }))} /></div>
              <div className="flex justify-end gap-3 pt-2"><Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button><Button className="btn-gradient-primary" onClick={handleSave}>Save</Button></div>
            </div>
          </DialogContent>
        </Dialog>
      </AccordionContent>
    </AccordionItem>
  );
}

function InsuranceSection({ data, contractId, subContractId }: { data: any[]; contractId: string; subContractId: string }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { canEdit } = useRole();
  const insurance = data[0];
  const [included, setIncluded] = useState(insurance?.value === "Yes");
  const [remark, setRemark] = useState(insurance?.remark || "");

  const handleSave = async () => {
    const payload = { sub_contract_id: subContractId, parameter: "Insurance cover", value: included ? "Yes" : "No", remark: remark || null };
    if (insurance) { updateRow("contract_insurance", insurance.id, payload); }
    else { insertRow("contract_insurance", payload); }
    toast({ title: "Saved" });
    queryClient.invalidateQueries({ queryKey: ["contract-detail", contractId] });
  };

  return (
    <AccordionItem value="insurance">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /><span className="font-semibold">Insurance</span></div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="glass-card p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Label>Insurance cover included</Label>
            <Switch checked={included} onCheckedChange={setIncluded} disabled={!canEdit} />
            <span className="text-sm font-medium">{included ? "Yes" : "No"}</span>
          </div>
          <div><Label>Remark</Label><Input value={remark} onChange={(e) => setRemark(e.target.value)} disabled={!canEdit} /></div>
          {canEdit && <div className="flex justify-end"><Button className="btn-gradient-primary" onClick={handleSave}>Save</Button></div>}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function GovChargesSection({ data, contractId, subContractId }: { data: any[]; contractId: string; subContractId: string }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { canEdit } = useRole();
  const charge = data[0];
  const [value, setValue] = useState(charge?.value?.toString() || "3.5");
  const [remark, setRemark] = useState(charge?.remark || "Return per pax excluding GST");

  const handleSave = async () => {
    const payload = { sub_contract_id: subContractId, parameter: "Government_charges", value: parseFloat(value), remark: remark || null };
    if (charge) { updateRow("contract_government_charges", charge.id, payload); }
    else { insertRow("contract_government_charges", payload); }
    toast({ title: "Saved" });
    queryClient.invalidateQueries({ queryKey: ["contract-detail", contractId] });
  };

  return (
    <AccordionItem value="gov_charges">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2"><Building className="h-4 w-4 text-primary" /><span className="font-semibold">Government Charges</span></div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="glass-card p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Value (USD)</Label><Input type="number" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} disabled={!canEdit} /></div>
            <div><Label>Remark</Label><Input value={remark} onChange={(e) => setRemark(e.target.value)} disabled={!canEdit} /></div>
          </div>
          {canEdit && <div className="flex justify-end"><Button className="btn-gradient-primary" onClick={handleSave}>Save</Button></div>}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export function ParametersTab({ contract }: Props) {
  const subContractId = contract.sub_contract_id || "";
  const id = contract.id;

  const paramFields = [
    { key: "parameter", label: "Parameter" },
    { key: "value", label: "Value" },
    { key: "remark", label: "Remark" },
  ];

  const fuelFields = [
    { key: "type", label: "Type" },
    { key: "value", label: "Value" },
    { key: "remark", label: "Remark" },
  ];

  return (
    <div className="mt-4">
      <Accordion type="multiple" className="space-y-2">
        <ParamSection title="Baggage" icon={Luggage} tableName="contract_baggage" data={contract.contract_baggage || []} contractId={id} subContractId={subContractId} fields={paramFields} />
        <ParamSection title="Booking" icon={Calendar} tableName="contract_booking" data={contract.contract_booking || []} contractId={id} subContractId={subContractId} fields={paramFields} />
        <AgeSection data={contract.contract_age || []} contractId={id} subContractId={subContractId} />
        <AddonsSection data={contract.contract_addons || []} contractId={id} subContractId={subContractId} />
        <InsuranceSection data={contract.contract_insurance || []} contractId={id} subContractId={subContractId} />
        <GovChargesSection data={contract.contract_government_charges || []} contractId={id} subContractId={subContractId} />
        <ParamSection title="Fuel" icon={Fuel} tableName="contract_fuel" data={contract.contract_fuel || []} contractId={id} subContractId={subContractId} fields={fuelFields} />
        <ParamSection title="Payment Plan" icon={CreditCard} tableName="contract_payment_plan" data={contract.contract_payment_plan || []} contractId={id} subContractId={subContractId} fields={paramFields} />
        <ParamSection title="Service Commitment" icon={Clock} tableName="contract_service_commitment" data={contract.contract_service_commitment || []} contractId={id} subContractId={subContractId} fields={paramFields} />
        <ParamSection title="Termination" icon={XCircle} tableName="contract_termination" data={contract.contract_termination || []} contractId={id} subContractId={subContractId} fields={paramFields} />
      </Accordion>
    </div>
  );
}
