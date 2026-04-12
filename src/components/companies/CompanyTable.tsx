import { useState, useMemo } from "react";
import { Search, Plus, Building2, Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Hotel, TrendingUp, TrendingDown, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanies } from "@/hooks/useCompanies";
import { useTableSettings } from "@/hooks/useTableSettings";
import { useRole } from "@/lib/RoleContext";
import type { Company } from "@/types";
import { CompanyForm } from "./CompanyForm";
import { CompanyDeleteDialog } from "./CompanyDeleteDialog";
import { exportResortDataAsync } from "@/lib/excelDataService";
import { motion } from "framer-motion";
import { AnimatedCounter, HoverCard, ScrollReveal } from "@/components/ui/motion";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 200, damping: 18 } },
};

export function CompanyTable() {
  const { data: companies, isLoading } = useCompanies();
  const { getVisibleColumns } = useTableSettings();
  const { canCreate, canEdit, canDelete } = useRole();
  const columns = getVisibleColumns("companies");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteCompany, setDeleteCompany] = useState<Company | null>(null);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (key: string) => {
    if (sortColumn === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(key);
      setSortDirection("asc");
    }
  };

  const stats = useMemo(() => {
    if (!companies) return { groups: 0, resorts: 0 };
    return {
      groups: companies.filter((c) => c.type === "Group").length,
      resorts: companies.filter((c) => c.type === "Resort").length,
    };
  }, [companies]);

  const filtered = useMemo(() => {
    if (!companies) return [];
    let result = companies.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.registration_no || "").toLowerCase().includes(search.toLowerCase()) ||
        (c.code || "").toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "All" || c.type === typeFilter;
      return matchesSearch && matchesType;
    });

    if (sortColumn) {
      result = [...result].sort((a, b) => {
        let aVal = a[sortColumn as keyof Company] ?? "";
        let bVal = b[sortColumn as keyof Company] ?? "";
        if (sortColumn === "contract_count") {
          aVal = Number(aVal) || 0;
          bVal = Number(bVal) || 0;
          return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
        }
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [companies, search, typeFilter, sortColumn, sortDirection]);

  const getCellValue = (company: Company, key: string) => {
    if (key === "type") {
      return (
        <Badge variant={company.type === "Group" ? "default" : "secondary"} className={company.type === "Group" ? "bg-primary/20 text-primary border-0" : "bg-success/20 text-success border-0"}>
          {company.type}
        </Badge>
      );
    }
    if (key === "contract_count") {
      return <span className="font-medium">{company.contract_count}</span>;
    }
    if (key === "linked_resorts") {
      return <span className="text-muted-foreground text-sm">{company.linked_resorts}</span>;
    }
    return company[key as keyof Company] || "\u2014";
  };

  const SortIcon = ({ colKey }: { colKey: string }) => {
    if (sortColumn !== colKey) return <ArrowUpDown className="h-3.5 w-3.5 ml-1 opacity-40" />;
    return sortDirection === "asc" ? <ArrowUp className="h-3.5 w-3.5 ml-1" /> : <ArrowDown className="h-3.5 w-3.5 ml-1" />;
  };

  return (
    <div className="space-y-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <motion.div variants={cardVariants}>
          <HoverCard className="rounded-xl p-5 bg-blue-50 dark:bg-blue-950/40">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Group Companies</span>
              <div className="h-9 w-9 rounded-lg flex items-center justify-center bg-blue-100 dark:bg-blue-900/50">
                <Building2 className="h-[18px] w-[18px] text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground mb-2">
              <AnimatedCounter value={stats.groups} />
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">+4%</span>
              <span className="text-xs text-muted-foreground">from last month</span>
            </div>
          </HoverCard>
        </motion.div>
        <motion.div variants={cardVariants}>
          <HoverCard className="rounded-xl p-5 bg-emerald-50 dark:bg-emerald-950/40">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Resorts</span>
              <div className="h-9 w-9 rounded-lg flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/50">
                <Hotel className="h-[18px] w-[18px] text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground mb-2">
              <AnimatedCounter value={stats.resorts} />
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">+6%</span>
              <span className="text-xs text-muted-foreground">from last month</span>
            </div>
          </HoverCard>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 20 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Resort Data</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-lg" onClick={() => exportResortDataAsync()}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
          {canCreate && (
            <Button className="btn-gradient-primary rounded-lg" onClick={() => { setEditCompany(null); setShowForm(true); }}>
              <Plus className="h-4 w-4 mr-2" /> Add Company
            </Button>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
        className="flex gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, code or registration no..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Types</SelectItem>
            <SelectItem value="Group">Group</SelectItem>
            <SelectItem value="Resort">Resort</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      <ScrollReveal delay={0.1}>
        <div className="glass-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/30 hover:bg-transparent">
                {columns.map((col) => (
                  <TableHead
                    key={col.key}
                    className="text-muted-foreground font-semibold cursor-pointer select-none hover:text-foreground transition-colors"
                    onClick={() => handleSort(col.key)}
                  >
                    <div className="flex items-center">
                      {col.label}
                      <SortIcon colKey={col.key} />
                    </div>
                  </TableHead>
                ))}
                {(canEdit || canDelete) && <TableHead className="text-muted-foreground font-semibold w-24">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={columns.length + 1}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={columns.length + 1} className="text-center py-12 text-muted-foreground">No companies found.</TableCell></TableRow>
              ) : (
                filtered.map((company, idx) => (
                  <motion.tr
                    key={company.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(idx * 0.02, 0.3), type: "spring", stiffness: 200, damping: 20 }}
                    className="data-table-row border-b border-border/30"
                  >
                    {columns.map((col) => (
                      <TableCell key={col.key} className={col.key === "name" ? "font-medium" : col.key === "address" ? "text-muted-foreground max-w-[200px] truncate" : "text-muted-foreground"}>
                        {getCellValue(company, col.key)}
                      </TableCell>
                    ))}
                    {(canEdit || canDelete) && (
                      <TableCell>
                        <div className="flex gap-1">
                          {canEdit && (
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditCompany(company); setShowForm(true); }}><Pencil className="h-4 w-4" /></Button>
                            </motion.div>
                          )}
                          {canDelete && (
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteCompany(company)}><Trash2 className="h-4 w-4" /></Button>
                            </motion.div>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </ScrollReveal>

      <CompanyForm open={showForm} onClose={() => { setShowForm(false); setEditCompany(null); }} company={editCompany} />
      <CompanyDeleteDialog company={deleteCompany} onClose={() => setDeleteCompany(null)} />
    </div>
  );
}
