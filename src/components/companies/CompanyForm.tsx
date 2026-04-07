import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { companySchema, CompanyFormData } from "@/lib/validations";
import { useCompanies } from "@/hooks/useCompanies";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { selectAll } from "@/lib/excelDataService";
import type { Company, Atoll } from "@/types";

interface CompanyFormProps {
  open: boolean;
  onClose: () => void;
  company?: Company;
}

export function CompanyForm({ open, onClose, company }: CompanyFormProps) {
  const { createMutation, updateMutation } = useCompanies();
  const isEdit = !!company;

  const { data: atolls } = useQuery({
    queryKey: ["atolls"],
    queryFn: () => (selectAll("atolls") as Atoll[]).sort((a, b) => (a.name || "").localeCompare(b.name || "")),
  });

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: { name: "", type: "Resort", code: "", atoll: "", address: "", registration_no: "", coordinates: "" },
  });

  useEffect(() => {
    if (!open) return;
    if (company) {
      form.reset({
        name: company.name,
        type: company.type,
        code: company.code || "",
        atoll: company.atoll || "",
        address: company.address || "",
        registration_no: company.registration_no || "",
        coordinates: company.coordinates || "",
      });
    } else {
      form.reset({ name: "", type: "Resort", code: "", atoll: "", address: "", registration_no: "", coordinates: "" });
    }
  }, [open, company, form]);

  const onSubmit = async (data: CompanyFormData) => {
    if (isEdit) {
      await updateMutation.mutateAsync({ id: company.id, ...data });
    } else {
      await createMutation.mutateAsync(data);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Company" : "Add Company"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Name <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Type <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Group">Group</SelectItem>
                      <SelectItem value="Resort">Resort</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="code" render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl><Input {...field} placeholder="e.g. SF, WAI" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="atoll" render={({ field }) => (
                <FormItem>
                  <FormLabel>Atoll</FormLabel>
                  <Select onValueChange={(val) => field.onChange(val === "__none__" ? "" : val)} value={field.value || "__none__"}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select atoll" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {atolls?.map((a) => (
                        <SelectItem key={a.id} value={a.name}>{a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl><Textarea {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="registration_no" render={({ field }) => (
                <FormItem>
                  <FormLabel>Registration No.</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="coordinates" render={({ field }) => (
                <FormItem>
                  <FormLabel>Coordinates</FormLabel>
                  <FormControl><Input {...field} placeholder="Lat, Long" /></FormControl>
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
