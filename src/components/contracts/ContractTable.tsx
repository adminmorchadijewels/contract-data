import { useState, useMemo } from "react";
import { Search, Plus, Eye, Trash2, Download, ChevronRight, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useContracts } from "@/hooks/useContracts";
import { useTableSettings } from "@/hooks/useTableSettings";

import { KPICards } from "./KPICards";
import { ContractForm } from "./ContractForm";
import { ContractDetailModal } from "./ContractDetailModal";
import { exportContractDataAsync } from "@/lib/excelDataService";
import { useRole } from "@/lib/RoleContext";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollReveal } from "@/components/ui/motion";
import type { ContractBase, RelatedEntity } from "@/types";

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

interface ContractGroup {
  contractId: string;
  contractCode: string;
  group: RelatedEntity | null;
  resort: RelatedEntity | null;
  subContracts: ContractBase[];
}

export function ContractTable() {
  const { data: contracts, isLoading, deleteMutation } = useContracts();
  const { getVisibleColumns } = useTableSettings();
  const { canCreate, canEdit, canDelete } = useRole();
  const columns = getVisibleColumns("contracts");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editContract, setEditContract] = useState<ContractBase | null>(null);
  const [viewContractId, setViewContractId] = useState<string | null>(null);
  const [deleteContract, setDeleteContract] = useState<ContractBase | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (contractId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(contractId)) next.delete(contractId);
      else next.add(contractId);
      return next;
    });
  };

  // Filter individual contracts, then group by contract_id
  const grouped = useMemo(() => {
    if (!contracts) return [];

    const filtered = contracts.filter((c) => {
      const matchesSearch =
        c.contract_code.toLowerCase().includes(search.toLowerCase()) ||
        (c.contract_id || "").toLowerCase().includes(search.toLowerCase()) ||
        (c.resort?.name || "").toLowerCase().includes(search.toLowerCase());
      const status = getStatus(c.start_date, c.end_date);
      const matchesStatus = statusFilter === "All" || status === statusFilter;
      const matchesType = typeFilter === "All" || c.sub_contract_type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });

    const map = new Map<string, ContractGroup>();
    for (const c of filtered) {
      const key = c.contract_id || c.id;
      if (!map.has(key)) {
        map.set(key, {
          contractId: key,
          contractCode: c.contract_code,
          group: c.group,
          resort: c.resort,
          subContracts: [],
        });
      }
      map.get(key)!.subContracts.push(c);
    }

    return Array.from(map.values()).sort((a, b) => {
      const aDate = a.subContracts[0]?.created_at || "";
      const bDate = b.subContracts[0]?.created_at || "";
      return bDate.localeCompare(aDate);
    });
  }, [contracts, search, statusFilter, typeFilter]);

  const handleEditFromModal = (contract: ContractBase) => {
    setViewContractId(null);
    setEditContract(contract);
    setShowForm(true);
  };

  const getStatusBadge = (start: string, end: string) => {
    const status = getStatus(start, end);
    return (
      <span className={`status-badge ${status === "Active" ? "status-active" : status === "Expiring" ? "status-expiring" : "status-expired"}`}>
        {status}
      </span>
    );
  };

  const getGroupStatus = (group: ContractGroup) => {
    const statuses = group.subContracts.map((c) => getStatus(c.start_date, c.end_date));
    if (statuses.includes("Active")) return "Active";
    if (statuses.includes("Expiring")) return "Expiring";
    return "Expired";
  };

  const getParentCellValue = (group: ContractGroup, key: string) => {
    const status = getGroupStatus(group);
    switch (key) {
      case "contract_code":
        return <span className="font-medium text-primary">{group.contractCode}</span>;
      case "group":
        return <span className="text-muted-foreground">{group.group?.name || "\u2014"}</span>;
      case "resort":
        return <span className="text-muted-foreground">{group.resort?.name || "\u2014"}</span>;
      case "sub_contracts":
        return <Badge variant="secondary" className="text-xs">{group.subContracts.length}</Badge>;
      case "status":
        return (
          <span className={`status-badge ${status === "Active" ? "status-active" : status === "Expiring" ? "status-expiring" : "status-expired"}`}>
            {status}
          </span>
        );
      default:
        return "\u2014";
    }
  };

  const getSubCellValue = (sub: ContractBase, key: string) => {
    switch (key) {
      case "contract_code":
        return <span className="text-sm text-muted-foreground">{sub.sub_contract_id || sub.contract_code}</span>;
      case "group":
        return <span className="text-muted-foreground text-sm">{sub.group?.name || "\u2014"}</span>;
      case "resort":
        return <span className="text-muted-foreground text-sm">{sub.resort?.name || "\u2014"}</span>;
      case "sub_contracts":
        return <Badge variant="outline" className="text-xs">{sub.sub_contract_type || "\u2014"}</Badge>;
      case "status":
        return getStatusBadge(sub.start_date, sub.end_date);
      default:
        return "\u2014";
    }
  };

  return (
    <div className="space-y-6">
      <KPICards contracts={contracts} />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
        className="flex flex-wrap gap-3 items-center"
      >
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
        <Button variant="outline" className="rounded-lg" onClick={() => exportContractDataAsync()}>
          <Download className="h-4 w-4 mr-2" /> Export
        </Button>
        {canCreate && (
          <Button className="btn-gradient-primary rounded-lg" onClick={() => { setEditContract(null); setShowForm(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Add Contract
          </Button>
        )}
      </motion.div>

      <ScrollReveal delay={0.1}>
        <div className="glass-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/30 hover:bg-transparent">
                <TableHead className="font-semibold w-10"></TableHead>
                {columns.map((col) => (
                  <TableHead key={col.key} className="font-semibold">{col.label}</TableHead>
                ))}
                {(canEdit || canDelete) && <TableHead className="font-semibold w-24">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={columns.length + 2}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                ))
              ) : grouped.length === 0 ? (
                <TableRow><TableCell colSpan={columns.length + 2} className="text-center py-12 text-muted-foreground">No contracts found.</TableCell></TableRow>
              ) : (
                grouped.map((group, idx) => {
                  const isExpanded = expandedGroups.has(group.contractId);
                  const hasSubs = group.subContracts.length > 1;

                  return (
                    <>
                      {/* Parent row */}
                      <motion.tr
                        key={group.contractId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: Math.min(idx * 0.02, 0.3), type: "spring", stiffness: 200, damping: 20 }}
                        className="data-table-row cursor-pointer hover:bg-muted/50 border-b border-border/30"
                        onClick={() => hasSubs ? toggleGroup(group.contractId) : setViewContractId(group.subContracts[0].id)}
                      >
                        <TableCell className="w-10 px-3">
                          {hasSubs ? (
                            <motion.div
                              animate={{ rotate: isExpanded ? 90 : 0 }}
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </motion.div>
                          ) : <span className="w-4 inline-block" />}
                        </TableCell>
                        {columns.map((col) => (
                          <TableCell key={col.key}>{getParentCellValue(group, col.key)}</TableCell>
                        ))}
                        {(canEdit || canDelete) && (
                          <TableCell>
                            {!hasSubs && (
                              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewContractId(group.subContracts[0].id)}><Eye className="h-4 w-4" /></Button>
                                </motion.div>
                                {canDelete && (
                                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteContract(group.subContracts[0])}><Trash2 className="h-4 w-4" /></Button>
                                  </motion.div>
                                )}
                              </div>
                            )}
                          </TableCell>
                        )}
                      </motion.tr>

                      {/* Expanded sub-contract rows */}
                      <AnimatePresence>
                        {hasSubs && isExpanded && group.subContracts.map((sub, subIdx) => (
                          <motion.tr
                            key={sub.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ delay: subIdx * 0.03, type: "spring", stiffness: 200, damping: 20 }}
                            className="data-table-row cursor-pointer bg-muted/30 hover:bg-muted/50 border-b border-border/30"
                            onClick={() => setViewContractId(sub.id)}
                          >
                            <TableCell className="w-10 px-3" />
                            {columns.map((col, colIdx) => (
                              <TableCell key={col.key} className={colIdx === 0 ? "pl-8" : ""}>
                                {getSubCellValue(sub, col.key)}
                              </TableCell>
                            ))}
                            {(canEdit || canDelete) && (
                              <TableCell>
                                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewContractId(sub.id)}><Eye className="h-4 w-4" /></Button>
                                  </motion.div>
                                  {canDelete && (
                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteContract(sub)}><Trash2 className="h-4 w-4" /></Button>
                                    </motion.div>
                                  )}
                                </div>
                              </TableCell>
                            )}
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </ScrollReveal>

      <ContractForm open={showForm} onClose={() => { setShowForm(false); setEditContract(null); }} contract={editContract} />
      <ContractDetailModal contractId={viewContractId} onClose={() => setViewContractId(null)} onEdit={canEdit ? handleEditFromModal : undefined} />

      <AlertDialog open={!!deleteContract} onOpenChange={() => setDeleteContract(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contract</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete contract <strong>{deleteContract?.contract_code}</strong>
              {deleteContract?.sub_contract_id ? ` (${deleteContract.sub_contract_id})` : ""}?
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
