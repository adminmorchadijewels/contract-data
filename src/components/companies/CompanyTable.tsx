import { useState, useMemo } from "react";
import { Search, Plus, Building2, Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Hotel } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanies } from "@/hooks/useCompanies";
import { useTableSettings } from "@/hooks/useTableSettings";
import { CompanyForm } from "./CompanyForm";
import { CompanyDeleteDialog } from "./CompanyDeleteDialog";

export function CompanyTable() {
  const { data: companies, isLoading } = useCompanies();
  const { getVisibleColumns } = useTableSettings();
  const columns = getVisibleColumns("companies");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [editCompany, setEditCompany] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteCompany, setDeleteCompany] = useState<any>(null);
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
      result = [...result].sort((a: any, b: any) => {
        let aVal = a[sortColumn] ?? "";
        let bVal = b[sortColumn] ?? "";
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

  const getCellValue = (company: any, key: string) => {
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
    return company[key] || "\u2014";
  };

  const SortIcon = ({ colKey }: { colKey: string }) => {
    if (sortColumn !== colKey) return <ArrowUpDown className="h-3.5 w-3.5 ml-1 opacity-40" />;
    return sortDirection === "asc" ? <ArrowUp className="h-3.5 w-3.5 ml-1" /> : <ArrowDown className="h-3.5 w-3.5 ml-1" />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card p-5 hover:glow-effect transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Total Group Companies</span>
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <span className="text-2xl font-bold text-foreground">{stats.groups}</span>
        </div>
        <div className="glass-card p-5 hover:glow-effect transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Total Resorts</span>
            <Hotel className="h-5 w-5 text-success" />
          </div>
          <span className="text-2xl font-bold text-foreground">{stats.resorts}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Resort Data</h2>
        </div>
        <Button className="btn-gradient-primary rounded-lg" onClick={() => { setEditCompany(null); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Add Company
        </Button>
      </div>

      <div className="flex gap-3">
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
      </div>

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
              <TableHead className="text-muted-foreground font-semibold w-24">Actions</TableHead>
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
              filtered.map((company) => (
                <TableRow key={company.id} className="data-table-row">
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.key === "name" ? "font-medium" : col.key === "address" ? "text-muted-foreground max-w-[200px] truncate" : "text-muted-foreground"}>
                      {getCellValue(company, col.key)}
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditCompany(company); setShowForm(true); }}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteCompany(company)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CompanyForm open={showForm} onClose={() => setShowForm(false)} company={editCompany} />
      <CompanyDeleteDialog company={deleteCompany} onClose={() => setDeleteCompany(null)} />
    </div>
  );
}
