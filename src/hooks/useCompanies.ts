import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { selectAll, insertRow, updateRow, deleteRow } from "@/lib/excelDataService";

export function useCompanies() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const companies = selectAll("companies");
      const contracts = selectAll("contracts");

      return companies
        .map((c: any) => {
          // Count contracts where this company is group_id or resort_id
          const relatedContracts = contracts.filter(
            (ct: any) => ct.group_id === c.id || ct.resort_id === c.id
          );

          // Get linked resort names from contracts
          const linkedResortIds = new Set<string>();
          relatedContracts.forEach((ct: any) => {
            if (ct.resort_id && ct.resort_id !== c.id) {
              linkedResortIds.add(ct.resort_id);
            }
          });

          // For resorts: find other resorts linked via same group contracts
          if (c.type === "Resort") {
            relatedContracts.forEach((ct: any) => {
              if (ct.group_id) {
                const groupContracts = contracts.filter((gc: any) => gc.group_id === ct.group_id);
                groupContracts.forEach((gc: any) => {
                  if (gc.resort_id && gc.resort_id !== c.id) {
                    linkedResortIds.add(gc.resort_id);
                  }
                });
              }
            });
          }

          const linkedResorts = Array.from(linkedResortIds)
            .map((id) => {
              const resort = companies.find((co: any) => co.id === id);
              return resort ? (resort as any).name : null;
            })
            .filter(Boolean)
            .join(", ");

          return {
            ...c,
            contract_count: relatedContracts.length,
            linked_resorts: linkedResorts || "—",
          };
        })
        .sort((a: any, b: any) => (b.created_at || "").localeCompare(a.created_at || ""));
    },
  });

  const createMutation = useMutation({
    mutationFn: async (company: { name: string; type: string; code?: string; atoll?: string; address?: string; registration_no?: string; coordinates?: string }) => {
      return insertRow("companies", company);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      toast({ title: "Company created successfully" });
    },
    onError: (error: Error) => {
      console.error("Error:", error);
      toast({ title: "Operation failed", description: "Unable to create company. Please try again.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...company }: { id: string; name: string; type: string; code?: string; atoll?: string; address?: string; registration_no?: string; coordinates?: string }) => {
      const result = updateRow("companies", id, company);
      if (!result) throw new Error("Company not found");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      toast({ title: "Company updated successfully" });
    },
    onError: (error: Error) => {
      console.error("Error:", error);
      toast({ title: "Operation failed", description: "Unable to update company. Please try again.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      deleteRow("companies", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast({ title: "Company deleted successfully" });
    },
    onError: (error: Error) => {
      console.error("Error:", error);
      toast({ title: "Operation failed", description: "Unable to delete company. Please try again.", variant: "destructive" });
    },
  });

  return { ...query, createMutation, updateMutation, deleteMutation };
}
