import { Home, UserRound, CalendarClock, Wrench, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_CONFIG, type Kuti, type KutiStatus } from "@/hooks/use-kutis";

interface DashboardProps {
  kutis: Kuti[];
  isLoading?: boolean;
}

const STATUS_ICONS: Record<KutiStatus, React.ElementType> = {
  available: Home,
  occupied: UserRound,
  reserved: CalendarClock,
  maintenance: Wrench,
};

const STATUS_BORDER: Record<KutiStatus, string> = {
  available: "border-l-status-available",
  occupied: "border-l-status-occupied",
  reserved: "border-l-status-reserved",
  maintenance: "border-l-status-maintenance",
};

const STATUS_ICON_COLOR: Record<KutiStatus, string> = {
  available: "text-status-available",
  occupied: "text-status-occupied",
  reserved: "text-status-reserved",
  maintenance: "text-status-maintenance",
};

const STATUS_ORDER: KutiStatus[] = ["available", "occupied", "reserved", "maintenance"];

export function Dashboard({ kutis, isLoading = false }: DashboardProps) {
  const counts: Record<KutiStatus, number> = {
    available: 0,
    occupied: 0,
    reserved: 0,
    maintenance: 0,
  };

  kutis.forEach((k) => {
    counts[k.status]++;
  });

  const total = kutis.length;

  return (
    <div className="space-y-4">
      {/* Total summary */}
      <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 shrink-0">
          <Building2 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">กุฏิทั้งหมด</p>
          <p className="text-3xl font-bold text-card-foreground leading-none mt-0.5">
            {isLoading ? "—" : total}
            <span className="text-base font-normal text-muted-foreground ml-1.5">หลัง</span>
          </p>
        </div>
      </div>

      {/* Status breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STATUS_ORDER.map((key) => {
          const config = STATUS_CONFIG[key];
          const Icon = STATUS_ICONS[key];
          return (
            <div
              key={key}
              className={cn(
                "rounded-xl border border-border border-l-4 bg-card p-4 flex flex-col gap-3",
                STATUS_BORDER[key]
              )}
            >
              <div className="flex items-center justify-between">
                <Icon className={cn("w-5 h-5", STATUS_ICON_COLOR[key])} />
                <span
                  className={cn(
                    "text-3xl font-bold leading-none",
                    isLoading ? "text-muted-foreground" : "text-card-foreground"
                  )}
                >
                  {isLoading ? "—" : counts[key]}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn("w-2.5 h-2.5 rounded-full shrink-0", config.colorClass)}
                />
                <span className="text-sm font-medium text-card-foreground">
                  {config.labelTh}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
