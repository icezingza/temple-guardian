import { cn } from "@/lib/utils";
import type { KutiStatus } from "@/hooks/use-kutis";

interface KutiLightProps {
  kutiNumber: string;
  status: KutiStatus;
  x: number;
  y: number;
  isSelected: boolean;
  isDraggable?: boolean;
  isDimmed?: boolean;
  onClick?: () => void;
}

const statusColorMap: Record<KutiStatus, string> = {
  available: "bg-status-available",
  occupied: "bg-status-occupied",
  reserved: "bg-status-reserved",
  maintenance: "bg-status-maintenance",
};

export function KutiLight({
  kutiNumber,
  status,
  x,
  y,
  isSelected,
  isDraggable = false,
  isDimmed = false,
  onClick,
}: KutiLightProps) {
  return (
    <button
      data-kuti={kutiNumber}
      onClick={onClick}
      className={cn(
        "absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2 group z-10",
        "transition-opacity duration-200",
        isDraggable ? "cursor-move touch-none" : "cursor-pointer",
        isDimmed && "opacity-20 pointer-events-none"
      )}
      style={{ left: `${x}%`, top: `${y}%` }}
      aria-label={`Kuti ${kutiNumber} - ${status}`}
    >
      <div
        className={cn(
          "w-5 h-5 rounded-full border-2 border-card shadow-md transition-all",
          statusColorMap[status],
          isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background scale-125",
          !isSelected && !isDraggable && !isDimmed && "group-hover:scale-110",
          isDraggable && "group-hover:scale-125 group-hover:ring-2 group-hover:ring-primary/50 group-hover:ring-offset-1"
        )}
      />
      <span
        className={cn(
          "text-[9px] font-bold mt-0.5 leading-none px-1 rounded",
          "bg-card/80 text-foreground"
        )}
      >
        {kutiNumber}
      </span>
    </button>
  );
}
