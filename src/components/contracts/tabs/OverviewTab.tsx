import { format } from "date-fns";
import type { ContractDetail } from "@/types";

interface Props { contract: ContractDetail; }

export function OverviewTab({ contract }: Props) {
  const fields = [
    ["Contract ID", contract.contract_id],
    ["Contract Code", contract.contract_code],
    ["Carrier ID", contract.carrier_id],
    ["Sub-Contract ID", contract.sub_contract_id || "—"],
    ["Sub-Contract Type", contract.sub_contract_type || "—"],
    ["Resort Name", contract.resort?.name || "—"],
    ["Group Name", contract.group?.name || "—"],
    ["Start Date", contract.start_date ? format(new Date(contract.start_date), "dd MMM yyyy") : "—"],
    ["End Date", contract.end_date ? format(new Date(contract.end_date), "dd MMM yyyy") : "—"],
    ["Agreement Type", contract.agreement_type || "—"],
  ];

  return (
    <div className="grid grid-cols-2 gap-6 mt-4">
      {fields.map(([label, value]) => (
        <div key={label} className="glass-card p-4">
          <p className="info-label">{label}</p>
          <p className="info-value mt-1">{value}</p>
        </div>
      ))}
    </div>
  );
}
