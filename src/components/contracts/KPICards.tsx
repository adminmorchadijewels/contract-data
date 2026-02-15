import { FileText, CheckCircle, AlertTriangle, Clock, TrendingUp, TrendingDown } from "lucide-react";
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
    {
      label: "Total Contracts",
      value: stats.total,
      icon: FileText,
      trend: { value: 12, up: true },
      bg: "bg-blue-50 dark:bg-blue-950/40",
      iconBg: "bg-blue-100 dark:bg-blue-900/50",
      iconColor: "text-blue-600 dark:text-blue-400",
      trendColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Active Contracts",
      value: stats.active,
      icon: CheckCircle,
      trend: { value: 8, up: true },
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      trendColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Expiring Soon",
      value: stats.expiring,
      icon: AlertTriangle,
      trend: { value: 5, up: true },
      bg: "bg-orange-50 dark:bg-orange-950/40",
      iconBg: "bg-orange-100 dark:bg-orange-900/50",
      iconColor: "text-orange-600 dark:text-orange-400",
      trendColor: "text-rose-600 dark:text-rose-400",
    },
    {
      label: "Expired Contracts",
      value: stats.expired,
      icon: Clock,
      trend: { value: 3, up: false },
      bg: "bg-sky-50 dark:bg-sky-950/40",
      iconBg: "bg-sky-100 dark:bg-sky-900/50",
      iconColor: "text-sky-600 dark:text-sky-400",
      trendColor: "text-emerald-600 dark:text-emerald-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-xl p-5 transition-all duration-200 hover:shadow-md ${card.bg}`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {card.label}
            </span>
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${card.iconBg}`}>
              <card.icon className={`h-[18px] w-[18px] ${card.iconColor}`} />
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground mb-2">
            {card.value}
          </div>
          <div className="flex items-center gap-1.5">
            {card.trend.up ? (
              <TrendingUp className={`h-3.5 w-3.5 ${card.trendColor}`} />
            ) : (
              <TrendingDown className={`h-3.5 w-3.5 ${card.trendColor}`} />
            )}
            <span className={`text-xs font-medium ${card.trendColor}`}>
              {card.trend.up ? "+" : "-"}{card.trend.value}%
            </span>
            <span className="text-xs text-muted-foreground">from last month</span>
          </div>
        </div>
      ))}
    </div>
  );
}
