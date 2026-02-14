import { useState, useMemo } from "react";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useDestinations } from "@/hooks/useContracts";
import { useTableSettings } from "@/hooks/useTableSettings";

export default function Destinations() {
  const { data: destinations, isLoading } = useDestinations();

  const { getVisibleColumns } = useTableSettings();
  const columns = getVisibleColumns("destinations");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!destinations) return [];
    return destinations.filter((d: any) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.code || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [destinations, search]);

  const getCellValue = (row: any, key: string) => {
    return row[key] || "—";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <MapPin className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Destinations</h2>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search destinations..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 hover:bg-transparent">
              {columns.map((col) => (
                <TableHead key={col.key} className="text-muted-foreground font-semibold">{col.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={columns.length}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={columns.length} className="text-center py-12 text-muted-foreground">No destinations found.</TableCell></TableRow>
            ) : (
              filtered.map((dest: any) => (
                <TableRow key={dest.id} className="data-table-row">
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.key === "name" ? "font-medium" : "text-muted-foreground"}>
                      {getCellValue(dest, col.key)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
