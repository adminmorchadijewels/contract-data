import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { selectAll, insertRow, updateRow, deleteRow } from "@/lib/excelDataService";

export function useCompanies() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      return selectAll("companies").sort(
        (a: any, b: any) => (b.created_at || "").localeCompare(a.created_at || "")
      );
    },
  });

  const createMutation = useMutation({
    mutationFn: async (company: { name: string; type: string; address?: string; registration_no?: string; coordinates?: string }) => {
      return insertRow("companies", company);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast({ title: "Company created successfully" });
    },
    onError: (error: Error) => {
      console.error("Error:", error);
      toast({ title: "Operation failed", description: "Unable to create company. Please try again.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...company }: { id: string; name: string; type: string; address?: string; registration_no?: string; coordinates?: string }) => {
      const result = updateRow("companies", id, company);
      if (!result) throw new Error("Company not found");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
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
