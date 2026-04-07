import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { contractSchema, ContractFormData } from "@/lib/validations";
import { useContracts } from "@/hooks/useContracts";
import { useCompanies } from "@/hooks/useCompanies";
import type { ContractBase } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  contract?: ContractBase;
}

export function ContractForm({ open, onClose, contract }: Props) {
  const { createMutation, updateMutation } = useContracts();
  const { data: companies } = useCompanies();
  const isEdit = !!contract;

  const groups = companies?.filter((c) => c.type === "Group") || [];
  const resorts = companies?.filter((c) => c.type === "Resort") || [];

  const form = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      contract_id: "", contract_code: "", carrier_id: "TMA101",
      group_id: "", resort_id: "", sub_contract_id: "",
      sub_contract_type: "Transfer", start_date: "", end_date: "",
      agreement_type: "Exclusive Seaplane (Day time)",
    },
  });

  useEffect(() => {
    if (!open) return;
    if (contract) {
      form.reset({
        contract_id: contract.contract_id,
        contract_code: contract.contract_code,
        carrier_id: contract.carrier_id || "TMA101",
        group_id: contract.group_id || "",
        resort_id: contract.resort_id || "",
        sub_contract_id: contract.sub_contract_id || "",
        sub_contract_type: contract.sub_contract_type || "Transfer",
        start_date: contract.start_date,
        end_date: contract.end_date,
        agreement_type: contract.agreement_type || "Exclusive Seaplane (Day time)",
      });
    } else {
      form.reset({
        contract_id: "", contract_code: "", carrier_id: "TMA101",
        group_id: "", resort_id: "", sub_contract_id: "",
        sub_contract_type: "Transfer", start_date: "", end_date: "",
        agreement_type: "Exclusive Seaplane (Day time)",
      });
    }
  }, [open, contract, form]);

  // Auto-generate sub_contract_id
  const contractId = form.watch("contract_id");
  useEffect(() => {
    if (!isEdit && contractId) {
      form.setValue("sub_contract_id", `${contractId}-001`);
    }
  }, [contractId, isEdit, form]);

  const onSubmit = async (data: ContractFormData) => {
    if (isEdit) {
      await updateMutation.mutateAsync({ id: contract.id, ...data });
    } else {
      await createMutation.mutateAsync(data);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Contract" : "Add Contract"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="contract_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract ID <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input {...field} disabled={isEdit} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="contract_code" render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract Code <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="carrier_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Carrier ID</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="sub_contract_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Sub-Contract ID</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="group_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Group <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select group" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {groups.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="resort_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Resort <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select resort" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {resorts.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="sub_contract_type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Sub-Contract Type <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Transfer">Transfer</SelectItem>
                      <SelectItem value="Charter">Charter</SelectItem>
                      <SelectItem value="Signed Charter">Signed Charter</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="agreement_type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Agreement Type</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="start_date" render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="end_date" render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="btn-gradient-primary" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
