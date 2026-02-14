import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useContractDetail } from "@/hooks/useContracts";
import { OverviewTab } from "./tabs/OverviewTab";
import { StandardPricingTab } from "./tabs/StandardPricingTab";
import { SpecialPricingTab } from "./tabs/SpecialPricingTab";
import { ParametersTab } from "./tabs/ParametersTab";
import { NotesTab } from "./tabs/NotesTab";

interface Props {
  contractId: string | null;
  onClose: () => void;
  onEdit?: (contract: any) => void;
}

function getStatus(start: string, end: string) {
  const today = new Date();
  const e = new Date(end);
  const s = new Date(start);
  if (today > e) return "Expired";
  if (today >= s && today <= e) {
    const diff = (e.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 30 ? "Expiring" : "Active";
  }
  return "Active";
}

export function ContractDetailModal({ contractId, onClose, onEdit }: Props) {
  const { data: contract, isLoading } = useContractDetail(contractId);

  if (!contractId) return null;

  return (
    <Dialog open={!!contractId} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] w-[1400px] max-h-[90vh] overflow-y-auto animate-fade-in">
        {isLoading ? (
          <div className="space-y-4 p-6"><Skeleton className="h-8 w-1/3" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-[400px] w-full" /></div>
        ) : !contract ? (
          <div className="text-center py-12 text-muted-foreground">Contract not found.</div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-2xl">{contract.contract_code}</DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {contract.resort?.name} &bull; {contract.group?.name}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {onEdit && (
                    <Button variant="outline" size="sm" onClick={() => onEdit(contract)}>
                      <Pencil className="h-4 w-4 mr-2" /> Edit
                    </Button>
                  )}
                  <span className={`status-badge ${getStatus(contract.start_date, contract.end_date) === "Active" ? "status-active" : getStatus(contract.start_date, contract.end_date) === "Expiring" ? "status-expiring" : "status-expired"}`}>
                    {getStatus(contract.start_date, contract.end_date)}
                  </span>
                </div>
              </div>
            </DialogHeader>

            <Tabs defaultValue="overview" className="mt-4">
              <TabsList className="bg-secondary/50">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="standard">Standard Pricing</TabsTrigger>
                <TabsTrigger value="special">Special Pricing</TabsTrigger>
                <TabsTrigger value="parameters">Parameters</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>
              <TabsContent value="overview"><OverviewTab contract={contract} /></TabsContent>
              <TabsContent value="standard"><StandardPricingTab contract={contract} /></TabsContent>
              <TabsContent value="special"><SpecialPricingTab contract={contract} /></TabsContent>
              <TabsContent value="parameters"><ParametersTab contract={contract} /></TabsContent>
              <TabsContent value="notes"><NotesTab contract={contract} /></TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
