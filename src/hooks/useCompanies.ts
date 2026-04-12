import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { selectAll, insertRow, updateRow, deleteRow } from "@/lib/db";
import type { Company } from "@/types";

export function useCompanies() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  /** Look up an atoll UUID by name — uses React Query cache when available. */
  const resolveAtollId = async (name: string): Promise<string | null> => {
    const cached = queryClient.getQueryData<Array<{ id: string; name: string }>>(["atolls"]);
    const atolls = cached ?? (await selectAll<{ id: string; name: string }>("atolls"));
    return atolls.find((a) => a.name === name)?.id ?? null;
  };

  const query = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const [companies, contracts] = await Promise.all([
        selectAll("companies"),
        selectAll("contracts"),
      ]);

      return (companies
        .map((c) => {
          const relatedContracts = contracts.filter(
            (ct) => ct.group_id === c.id || ct.resort_id === c.id
          );

          const linkedResortIds = new Set<string>();
          relatedContracts.forEach((ct) => {
            if (ct.resort_id && ct.resort_id !== c.id) {
              linkedResortIds.add(String(ct.resort_id));
            }
          });

          if (c.type === "Resort") {
            relatedContracts.forEach((ct) => {
              if (ct.group_id) {
                const groupContracts = contracts.filter((gc) => gc.group_id === ct.group_id);
                groupContracts.forEach((gc) => {
                  if (gc.resort_id && gc.resort_id !== c.id) {
                    linkedResortIds.add(String(gc.resort_id));
                  }
                });
              }
            });
          }

          const linkedResorts = Array.from(linkedResortIds)
            .map((id) => {
              const resort = companies.find((co) => co.id === id);
              return resort ? String(resort.name ?? "") : null;
            })
            .filter(Boolean)
            .join(", ");

          return {
            ...c,
            contract_count: relatedContracts.length,
            linked_resorts: linkedResorts || "—",
          };
        }) as Company[])
        .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
    },
  });

  const createMutation = useMutation({
    mutationFn: async ({ atoll, ...company }: { name: string; type: string; code?: string; atoll?: string; address?: string; registration_no?: string; coordinates?: string }) => {
      const atoll_id = atoll ? await resolveAtollId(atoll) : null;
      return insertRow("companies", { ...company, atoll_id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      toast({ title: "Company created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Operation failed", description: "Unable to create company. Please try again.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, atoll, ...company }: { id: string; name: string; type: string; code?: string; atoll?: string; address?: string; registration_no?: string; coordinates?: string }) => {
      const atoll_id = atoll ? await resolveAtollId(atoll) : null;
      const result = await updateRow("companies", id, { ...company, atoll_id });
      if (!result) throw new Error("Company not found");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      toast({ title: "Company updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Operation failed", description: "Unable to update company. Please try again.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteRow("companies", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast({ title: "Company deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Operation failed", description: "Unable to delete company. Please try again.", variant: "destructive" });
    },
  });

  return { ...query, createMutation, updateMutation, deleteMutation };
}
