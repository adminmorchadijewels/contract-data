import { Shield, PenLine, Eye, Users } from "lucide-react";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { useAuth } from "@/context/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const roleConfig = {
  Admin:  { icon: Shield,  color: "text-red-500",     bg: "bg-red-500/10",     border: "border-red-500/30" },
  Editor: { icon: PenLine, color: "text-blue-500",    bg: "bg-blue-500/10",    border: "border-blue-500/30" },
  Viewer: { icon: Eye,     color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
};

type RoleKey = keyof typeof roleConfig;

function formatDate(iso: string | null): string {
  if (!iso) return "Never";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function RoleBadge({ role }: { role: string }) {
  const cfg = roleConfig[role as RoleKey] ?? roleConfig.Viewer;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
      <Icon className="h-3 w-3 shrink-0" />
      {role}
    </span>
  );
}

export function UserManagementCard() {
  const { user } = useAuth();
  const { data: users, isLoading, error, updateRoleMutation } = useAdminUsers();

  return (
    <div className="glass-card p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          User Management
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Manage user access roles. Admin role can only be assigned via SQL.
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Last Sign-in</TableHead>
            <TableHead>Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <>
              {[0, 1, 2].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                </TableRow>
              ))}
            </>
          )}

          {error && (
            <TableRow>
              <TableCell colSpan={3} className="text-destructive text-sm text-center py-6">
                {(error as Error).message}
              </TableCell>
            </TableRow>
          )}

          {!isLoading && !error && users?.map((u) => {
            const isOwnRow = u.id === user?.id;
            const isAdmin = u.role === "Admin";
            const canEdit = !isAdmin && !isOwnRow;

            return (
              <TableRow key={u.id}>
                <TableCell className="font-medium text-sm">{u.email}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(u.last_sign_in_at)}</TableCell>
                <TableCell>
                  {isAdmin ? (
                    // Admin rows: static badge only, no dropdown
                    <RoleBadge role={u.role} />
                  ) : isOwnRow ? (
                    // Own row: disabled badge with tooltip
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-not-allowed opacity-60">
                          <RoleBadge role={u.role} />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>You cannot change your own role</TooltipContent>
                    </Tooltip>
                  ) : (
                    // Editor/Viewer rows: badge-styled select trigger
                    <Select
                      value={u.role}
                      onValueChange={(role) => updateRoleMutation.mutate({ userId: u.id, role })}
                      disabled={!canEdit || updateRoleMutation.isPending}
                    >
                      <SelectTrigger
                        className={`h-auto w-auto px-2.5 py-1 rounded-full text-xs font-medium border gap-1.5 focus:ring-0 focus:ring-offset-0 ${
                          roleConfig[u.role as RoleKey]?.bg ?? "bg-secondary"
                        } ${roleConfig[u.role as RoleKey]?.border ?? "border-border"} ${
                          roleConfig[u.role as RoleKey]?.color ?? ""
                        }`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Editor">
                          <div className="flex items-center gap-2">
                            <PenLine className="h-3.5 w-3.5 text-blue-500" />
                            <span>Editor</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Viewer">
                          <div className="flex items-center gap-2">
                            <Eye className="h-3.5 w-3.5 text-emerald-500" />
                            <span>Viewer</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
