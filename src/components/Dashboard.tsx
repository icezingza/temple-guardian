import { cn } from "@/lib/utils";
import { STATUS_CONFIG, type Kuti, type KutiStatus } from "@/hooks/use-kutis";

interface DashboardProps {
  kutis: Kuti[];
}

export function Dashboard({ kutis }: DashboardProps) {
  const counts: Record<KutiStatus, number> = {
    available: 0,
    occupied: 0,
    reserved: 0,
    maintenance: 0,
  };

  kutis.forEach((k) => {
    counts[k.status]++;
  });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {(Object.entries(STATUS_CONFIG) as [KutiStatus, typeof STATUS_CONFIG[KutiStatus]][]).map(
        ([key, config]) => (
          <div
            key={key}
            className="rounded-xl border border-border bg-card p-4 flex flex-col items-center gap-1"
          >
            <div className={cn("w-5 h-5 rounded-full", config.colorClass)} />
            <span className="text-2xl font-bold text-card-foreground">
              {counts[key]}
            </span>
            <span className="text-sm text-muted-foreground">{config.labelTh}</span>
          </div>
        )
      )}
    </div>
  );
}
