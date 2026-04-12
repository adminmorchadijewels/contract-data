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
} from "@/lib/db";
import type { ContractBase, ContractDetail } from "@/types";

export function useContracts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["contracts"],
    queryFn: async () => {
      const [contracts, companies] = await Promise.all([
        selectAll("contracts"),
        selectAll("companies"),
      ]);
      return (contracts
        .map((c) => {
          const groupCompany = companies.find((co) => co.id === c.group_id);
          const resortCompany = companies.find((co) => co.id === c.resort_id);
          return {
            ...c,
            group: groupCompany ? { name: String(groupCompany.name ?? "") } : null,
            resort: resortCompany ? { name: String(resortCompany.name ?? "") } : null,
          };
        }) as ContractBase[])
        .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
    },
  });

  const createMutation = useMutation({
    mutationFn: async (contract: Record<string, unknown>) => {
      return insertRow("contracts", contract);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast({ title: "Contract created successfully" });
    },
    onError: (error: Error) => {
      console.error("Error:", error);
      toast({ title: "Operation failed", description: "Unable to create contract. Please try again.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...contract }: Record<string, unknown> & { id: string }) => {
      const result = await updateRow("contracts", id, contract);
      if (!result) throw new Error("Contract not found");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast({ title: "Contract updated successfully" });
    },
    onError: (error: Error) => {
      console.error("Error:", error);
      toast({ title: "Operation failed", description: "Unable to update contract. Please try again.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const contract = await selectById("contracts", id);
      const subId = contract?.sub_contract_id;
      if (subId) {
        await Promise.all([
          deleteWhere("pricing_standard", "sub_contract_id", subId),
          deleteWhere("pricing_special", "sub_contract_id", subId),
          deleteWhere("contract_baggage", "sub_contract_id", subId),
          deleteWhere("contract_booking", "sub_contract_id", subId),
          deleteWhere("contract_age", "sub_contract_id", subId),
          deleteWhere("contract_addons", "sub_contract_id", subId),
          deleteWhere("contract_insurance", "sub_contract_id", subId),
          deleteWhere("contract_government_charges", "sub_contract_id", subId),
          deleteWhere("contract_fuel", "sub_contract_id", subId),
          deleteWhere("contract_payment_plan", "sub_contract_id", subId),
          deleteWhere("contract_service_commitment", "sub_contract_id", subId),
          deleteWhere("contract_termination", "sub_contract_id", subId),
        ]);
      }
      await deleteWhere("contract_notes", "contract_id", id);
      await deleteRow("contracts", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      queryClient.invalidateQueries({ queryKey: ["companies"] });
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
      const contract = await selectById("contracts", contractId!);
      if (!contract) return null;

      const companies = await selectAll("companies");
      const subId = contract.sub_contract_id;
      const groupCompany = companies.find((c) => c.id === contract.group_id);
      const resortCompany = companies.find((c) => c.id === contract.resort_id);

      const [
        pricing_standard,
        pricing_special,
        contract_baggage,
        contract_booking,
        contract_age,
        contract_addons,
        contract_insurance,
        contract_government_charges,
        contract_fuel,
        contract_payment_plan,
        contract_service_commitment,
        contract_termination,
        contract_notes,
      ] = await Promise.all([
        subId ? selectWhere("pricing_standard", "sub_contract_id", subId) : Promise.resolve([]),
        subId ? selectWhere("pricing_special", "sub_contract_id", subId) : Promise.resolve([]),
        subId ? selectWhere("contract_baggage", "sub_contract_id", subId) : Promise.resolve([]),
        subId ? selectWhere("contract_booking", "sub_contract_id", subId) : Promise.resolve([]),
        subId ? selectWhere("contract_age", "sub_contract_id", subId) : Promise.resolve([]),
        subId ? selectWhere("contract_addons", "sub_contract_id", subId) : Promise.resolve([]),
        subId ? selectWhere("contract_insurance", "sub_contract_id", subId) : Promise.resolve([]),
        subId ? selectWhere("contract_government_charges", "sub_contract_id", subId) : Promise.resolve([]),
        subId ? selectWhere("contract_fuel", "sub_contract_id", subId) : Promise.resolve([]),
        subId ? selectWhere("contract_payment_plan", "sub_contract_id", subId) : Promise.resolve([]),
        subId ? selectWhere("contract_service_commitment", "sub_contract_id", subId) : Promise.resolve([]),
        subId ? selectWhere("contract_termination", "sub_contract_id", subId) : Promise.resolve([]),
        selectWhere("contract_notes", "contract_id", contractId!),
      ]);

      return {
        ...contract,
        group: groupCompany ? { name: String(groupCompany.name ?? "") } : null,
        resort: resortCompany ? { name: String(resortCompany.name ?? "") } : null,
        pricing_standard,
        pricing_special,
        contract_baggage,
        contract_booking,
        contract_age,
        contract_addons,
        contract_insurance,
        contract_government_charges,
        contract_fuel,
        contract_payment_plan,
        contract_service_commitment,
        contract_termination,
        contract_notes,
      } as ContractDetail;
    },
  });
}
