import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  selectAll,
  selectById,
  selectWhere,
  insertRow,
  updateRow,
  deleteRow,
  deleteWhere,
} from "@/lib/excelDataService";

export function useContracts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["contracts"],
    queryFn: async () => {
      const contracts = selectAll("contracts");
      const companies = selectAll("companies");
      return contracts
        .map((c: any) => ({
          ...c,
          group: companies.find((co: any) => co.id === c.group_id)
            ? { name: (companies.find((co: any) => co.id === c.group_id) as any).name }
            : null,
          resort: companies.find((co: any) => co.id === c.resort_id)
            ? { name: (companies.find((co: any) => co.id === c.resort_id) as any).name }
            : null,
        }))
        .sort((a: any, b: any) => (b.created_at || "").localeCompare(a.created_at || ""));
    },
  });

  const createMutation = useMutation({
    mutationFn: async (contract: Record<string, unknown>) => {
      return insertRow("contracts", contract);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      toast({ title: "Contract created successfully" });
    },
    onError: (error: Error) => {
      console.error("Error:", error);
      toast({ title: "Operation failed", description: "Unable to create contract. Please try again.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...contract }: Record<string, unknown> & { id: string }) => {
      const result = updateRow("contracts", id, contract);
      if (!result) throw new Error("Contract not found");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      toast({ title: "Contract updated successfully" });
    },
    onError: (error: Error) => {
      console.error("Error:", error);
      toast({ title: "Operation failed", description: "Unable to update contract. Please try again.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const contract = selectById("contracts", id) as any;
      if (contract?.sub_contract_id) {
        const subId = contract.sub_contract_id;
        deleteWhere("pricing_standard", "sub_contract_id", subId);
        deleteWhere("pricing_special", "sub_contract_id", subId);
        deleteWhere("contract_baggage", "sub_contract_id", subId);
        deleteWhere("contract_booking", "sub_contract_id", subId);
        deleteWhere("contract_age", "sub_contract_id", subId);
        deleteWhere("contract_addons", "sub_contract_id", subId);
        deleteWhere("contract_insurance", "sub_contract_id", subId);
        deleteWhere("contract_government_charges", "sub_contract_id", subId);
        deleteWhere("contract_fuel", "sub_contract_id", subId);
        deleteWhere("contract_payment_plan", "sub_contract_id", subId);
        deleteWhere("contract_service_commitment", "sub_contract_id", subId);
        deleteWhere("contract_termination", "sub_contract_id", subId);
      }
      deleteWhere("contract_notes", "contract_id", id);
      deleteRow("contracts", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      toast({ title: "Contract deleted successfully" });
    },
    onError: (error: Error) => {
      console.error("Error:", error);
      toast({ title: "Operation failed", description: "Unable to delete contract. Please try again.", variant: "destructive" });
    },
  });

  return { ...query, createMutation, updateMutation, deleteMutation };
}

export function useContractDetail(contractId: string | null) {
  return useQuery({
    queryKey: ["contract-detail", contractId],
    enabled: !!contractId,
    queryFn: async () => {
      const contract = selectById("contracts", contractId!) as any;
      if (!contract) return null;

      const companies = selectAll("companies");
      const subId = contract.sub_contract_id;

      return {
        ...contract,
        group: companies.find((c: any) => c.id === contract.group_id)
          ? { name: (companies.find((c: any) => c.id === contract.group_id) as any).name }
          : null,
        resort: companies.find((c: any) => c.id === contract.resort_id)
          ? { name: (companies.find((c: any) => c.id === contract.resort_id) as any).name }
          : null,
        pricing_standard: subId ? selectWhere("pricing_standard", "sub_contract_id", subId) : [],
        pricing_special: subId ? selectWhere("pricing_special", "sub_contract_id", subId) : [],
        contract_baggage: subId ? selectWhere("contract_baggage", "sub_contract_id", subId) : [],
        contract_booking: subId ? selectWhere("contract_booking", "sub_contract_id", subId) : [],
        contract_age: subId ? selectWhere("contract_age", "sub_contract_id", subId) : [],
        contract_addons: subId ? selectWhere("contract_addons", "sub_contract_id", subId) : [],
        contract_insurance: subId ? selectWhere("contract_insurance", "sub_contract_id", subId) : [],
        contract_government_charges: subId ? selectWhere("contract_government_charges", "sub_contract_id", subId) : [],
        contract_fuel: subId ? selectWhere("contract_fuel", "sub_contract_id", subId) : [],
        contract_payment_plan: subId ? selectWhere("contract_payment_plan", "sub_contract_id", subId) : [],
        contract_service_commitment: subId ? selectWhere("contract_service_commitment", "sub_contract_id", subId) : [],
        contract_termination: subId ? selectWhere("contract_termination", "sub_contract_id", subId) : [],
        contract_notes: selectWhere("contract_notes", "contract_id", contractId!),
      };
    },
  });
}

export function useDestinations() {
  return useQuery({
    queryKey: ["destinations"],
    queryFn: async () => {
      return selectAll("destinations").sort((a: any, b: any) =>
        (a.name || "").localeCompare(b.name || "")
      );
    },
  });
}
