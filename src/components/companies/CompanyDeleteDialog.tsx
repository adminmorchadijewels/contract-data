import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useCompanies } from "@/hooks/useCompanies";
import type { Company } from "@/types";

interface Props {
  company: Company | null;
  onClose: () => void;
}

export function CompanyDeleteDialog({ company, onClose }: Props) {
  const { deleteMutation } = useCompanies();

  const handleDelete = async () => {
    if (company) {
      await deleteMutation.mutateAsync(company.id);
      onClose();
    }
  };

  return (
    <AlertDialog open={!!company} onOpenChange={() => onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Company</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{company?.name}</strong>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
