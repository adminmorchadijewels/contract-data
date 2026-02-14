import { FileText, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { useMemo } from "react";

interface KPICardsProps {
  contracts: any[] | undefined;
}

export function KPICards({ contracts }: KPICardsProps) {
  const stats = useMemo(() => {
    if (!contracts) return { total: 0, active: 0, expiring: 0, expired: 0 };
    const today = new Date();
    const thirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    let active = 0, expiring = 0, expired = 0;
    contracts.forEach((c) => {
      const end = new Date(c.end_date);
      const start = new Date(c.start_date);
      if (today > end) {
        expired++;
      } else if (today >= start && today <= end) {
        active++;
        if (end <= thirtyDays) expiring++;
      }
    });
    return { total: contracts.length, active, expiring, expired };
  }, [contracts]);

  const cards = [
    { label: "Total Contracts", value: stats.total, icon: FileText, color: "text-primary" },
    { label: "Active Contracts", value: stats.active, icon: CheckCircle, color: "text-success", badge: "status-active" },
    { label: "Expiring Soon", value: stats.expiring, icon: AlertCircle, color: "text-warning", badge: "status-expiring" },
    { label: "Expired Contracts", value: stats.expired, icon: XCircle, color: "text-destructive", badge: "status-expired" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="glass-card p-5 hover:glow-effect transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">{card.label}</span>
            <card.icon className={`h-5 w-5 ${card.color}`} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-foreground">{card.value}</span>
            {card.badge && <span className={`status-badge ${card.badge}`}>{card.badge === "status-active" ? "Active" : card.badge === "status-expiring" ? "Soon" : "Expired"}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
