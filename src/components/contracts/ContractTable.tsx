import { useState, useMemo } from "react";
import { Search, Plus, Eye, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useContracts } from "@/hooks/useContracts";
import { useTableSettings } from "@/hooks/useTableSettings";
import { format } from "date-fns";
import { KPICards } from "./KPICards";
import { ContractForm } from "./ContractForm";
import { ContractDetailModal } from "./ContractDetailModal";

function getStatus(start: string, end: string) {
  const today = new Date();
  const s = new Date(start);
  const e = new Date(end);
  if (today > e) return "Expired";
  if (today >= s && today <= e) {
    const diff = (e.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    if (diff <= 30) return "Expiring";
    return "Active";
  }
  return "Active";
}

export function ContractTable() {
  const { data: contracts, isLoading, deleteMutation } = useContracts();
  const { getVisibleColumns } = useTableSettings();
  const columns = getVisibleColumns("contracts");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editContract, setEditContract] = useState<any>(null);
  const [viewContractId, setViewContractId] = useState<string | null>(null);
  const [deleteContract, setDeleteContract] = useState<any>(null);

  const filtered = useMemo(() => {
    if (!contracts) return [];
    return contracts.filter((c) => {
      const matchesSearch =
        c.contract_code.toLowerCase().includes(search.toLowerCase()) ||
        (c.resort?.name || "").toLowerCase().includes(search.toLowerCase());
      const status = getStatus(c.start_date, c.end_date);
      const matchesStatus = statusFilter === "All" || status === statusFilter;
      const matchesType = typeFilter === "All" || c.sub_contract_type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [contracts, search, statusFilter, typeFilter]);

  const handleEditFromModal = (contract: any) => {
    setViewContractId(null);
    setEditContract(contract);
    setShowForm(true);
  };

  const getCellValue = (contract: any, key: string) => {
    switch (key) {
      case "contract_code":
        return <span className="font-medium text-primary">{contract.contract_code}</span>;
      case "resort":
        return contract.resort?.name || "\u2014";
      case "group":
        return contract.group?.name || "\u2014";
      case "sub_contract_type":
        return <Badge variant="secondary">{contract.sub_contract_type || "\u2014"}</Badge>;
      case "start_date":
        return format(new Date(contract.start_date), "dd MMM yyyy");
      case "end_date":
        return format(new Date(contract.end_date), "dd MMM yyyy");
      case "status": {
        const status = getStatus(contract.start_date, contract.end_date);
        return (
          <span className={`status-badge ${status === "Active" ? "status-active" : status === "Expiring" ? "status-expiring" : "status-expired"}`}>
            {status}
          </span>
        );
      }
      default:
        return contract[key] || "\u2014";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <KPICards contracts={contracts} />

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search contracts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Expiring">Expiring</SelectItem>
            <SelectItem value="Expired">Expired</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Types</SelectItem>
            <SelectItem value="Transfer">Transfer</SelectItem>
            <SelectItem value="Charter">Charter</SelectItem>
            <SelectItem value="Signed Charter">Signed Charter</SelectItem>
          </SelectContent>
        </Select>
        <Button className="btn-gradient-primary rounded-lg" onClick={() => { setEditContract(null); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Add Contract
        </Button>
      </div>

      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 hover:bg-transparent">
              {columns.map((col) => (
                <TableHead key={col.key} className="font-semibold">{col.label}</TableHead>
              ))}
              <TableHead className="font-semibold w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={columns.length + 1}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={columns.length + 1} className="text-center py-12 text-muted-foreground">No contracts found.</TableCell></TableRow>
            ) : (
              filtered.map((contract) => (
                <TableRow key={contract.id} className="data-table-row cursor-pointer" onClick={() => setViewContractId(contract.id)}>
                  {columns.map((col) => (
                    <TableCell key={col.key} className="text-muted-foreground">
                      {getCellValue(contract, col.key)}
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewContractId(contract.id)}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteContract(contract)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ContractForm open={showForm} onClose={() => { setShowForm(false); setEditContract(null); }} contract={editContract} />
      <ContractDetailModal contractId={viewContractId} onClose={() => setViewContractId(null)} onEdit={handleEditFromModal} />

      <AlertDialog open={!!deleteContract} onOpenChange={() => setDeleteContract(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contract</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete contract <strong>{deleteContract?.contract_code}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={async () => { await deleteMutation.mutateAsync(deleteContract.id); setDeleteContract(null); }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
