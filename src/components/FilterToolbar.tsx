import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { STATUS_CONFIG, type KutiStatus } from "@/hooks/use-kutis";
import { cn } from "@/lib/utils";

interface FilterToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: KutiStatus | null;
  onStatusFilterChange: (s: KutiStatus | null) => void;
}

const STATUS_PILLS: { value: KutiStatus | null; label: string }[] = [
  { value: null, label: "ทั้งหมด" },
  { value: "available", label: STATUS_CONFIG.available.labelTh },
  { value: "occupied", label: STATUS_CONFIG.occupied.labelTh },
  { value: "reserved", label: STATUS_CONFIG.reserved.labelTh },
  { value: "maintenance", label: STATUS_CONFIG.maintenance.labelTh },
];

export function FilterToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: FilterToolbarProps) {
  return (
    <div className="shrink-0 flex flex-col gap-2 px-4 pb-2">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ค้นหากุฏิหรือชื่อผู้พัก..."
          className="pl-9 pr-9 h-11 text-base"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="ล้างการค้นหา"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        {STATUS_PILLS.map(({ value, label }) => {
          const isActive = statusFilter === value;
          return (
            <button
              key={String(value)}
              onClick={() => onStatusFilterChange(value)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 min-h-[36px] text-sm font-medium border transition-all",
                isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-card-foreground border-border hover:border-muted-foreground/50"
              )}
            >
              {value && (
                <span
                  className={cn("w-2 h-2 rounded-full shrink-0", STATUS_CONFIG[value].colorClass)}
                />
              )}
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
