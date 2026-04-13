import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  last_sign_in_at: string | null;
  created_at: string;
}

export function useAdminUsers() {
  const { session } = useAuth();
  const token = session?.access_token ?? null;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useQuery<AdminUser[]>({
    queryKey: ["admin-users"],
    enabled: !!token,
    staleTime: 30_000,
    queryFn: async () => {
      const res = await fetch("/api/admin-users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? `Request failed: ${res.status}`);
      }
      return res.json() as Promise<AdminUser[]>;
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await fetch("/api/admin-users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, role }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? `Request failed: ${res.status}`);
      }
    },
    onMutate: async ({ userId, role }) => {
      await queryClient.cancelQueries({ queryKey: ["admin-users"] });
      const previous = queryClient.getQueryData<AdminUser[]>(["admin-users"]);
      queryClient.setQueryData<AdminUser[]>(["admin-users"], (old) =>
        old ? old.map((u) => (u.id === userId ? { ...u, role } : u)) : old,
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["admin-users"], context.previous);
      }
      toast({ title: "Operation failed", description: "Unable to update role. Please try again.", variant: "destructive" });
    },
    onSuccess: () => {
      toast({ title: "Role updated successfully" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  return { ...query, updateRoleMutation };
}
