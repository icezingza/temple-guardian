import { format } from "date-fns";
import { Loader2, History } from "lucide-react";
import { useActivityLogs, type ActivityLog, type LogPayload } from "@/hooks/use-activity-log";
import { cn } from "@/lib/utils";

const STATUS_TH: Record<string, string> = {
  available: "ว่าง",
  occupied: "มีผู้พัก",
  reserved: "จองแล้ว",
  maintenance: "ซ่อมบำรุง",
};

const STATUS_COLOR: Record<string, string> = {
  available: "text-status-available",
  occupied: "text-status-occupied",
  reserved: "text-status-reserved",
  maintenance: "text-status-maintenance",
};

function describeChange(log: ActivityLog): string {
  const old = log.old_data as unknown as LogPayload;
  const next = log.new_data as unknown as LogPayload;

  if (log.action_type === "CLEAR") return "ล้างข้อมูลทั้งหมด";

  const parts: string[] = [];

  const oldName = old.name?.trim() ?? "";
  const newName = next.name?.trim() ?? "";
  if (oldName !== newName) {
    const from = oldName ? `"${oldName}"` : "ไม่มีชื่อ";
    const to = newName ? `"${newName}"` : "ไม่มีชื่อ";
    parts.push(`ชื่อ: ${from} → ${to}`);
  }

  if (old.status !== next.status) {
    const from = STATUS_TH[old.status] ?? old.status;
    const to = STATUS_TH[next.status] ?? next.status;
    parts.push(`สถานะ: ${from} → ${to}`);
  }

  const oldNotes = old.notes?.trim() ?? "";
  const newNotes = next.notes?.trim() ?? "";
  if (oldNotes !== newNotes) {
    parts.push("แก้ไขหมายเหตุ");
  }

  return parts.length > 0 ? parts.join("  •  ") : "อัปเดตข้อมูล (ไม่มีการเปลี่ยนแปลง)";
}

function LogItem({ log }: { log: ActivityLog }) {
  const next = log.new_data as unknown as LogPayload;
  const isClear = log.action_type === "CLEAR";

  return (
    <div className="flex gap-3 py-3 border-b border-border last:border-0">
      {/* Status dot of the resulting state */}
      <div className="mt-1 shrink-0">
        <span
          className={cn(
            "block w-2.5 h-2.5 rounded-full",
            isClear
              ? "bg-status-available"
              : `bg-status-${next.status}` // relies on Tailwind safelist via STATUS_CONFIG usage elsewhere
          )}
          style={
            !isClear
              ? { backgroundColor: `hsl(var(--status-${next.status}))` }
              : { backgroundColor: `hsl(var(--status-available))` }
          }
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-semibold text-foreground">
            กุฏิ #{log.kuti_number}
          </span>
          <span className="text-xs text-muted-foreground shrink-0">
            {format(new Date(log.created_at), "d/M/yy HH:mm")}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5 break-words">
          {describeChange(log)}
        </p>
      </div>
    </div>
  );
}

export function ActivityLogList() {
  const { data: logs, isLoading, isError } = useActivityLogs();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center px-4">
        <History className="w-8 h-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          ไม่พบตาราง activity_logs
        </p>
        <p className="text-xs text-muted-foreground/70">
          กรุณารัน migration SQL ใน Supabase ก่อนใช้งานฟีเจอร์นี้
        </p>
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <History className="w-8 h-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">ยังไม่มีประวัติการเปลี่ยนแปลง</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <p className="text-xs text-muted-foreground mb-2">
        แสดง {logs.length} รายการล่าสุด
      </p>
      <div className="overflow-y-auto">
        {logs.map((log) => (
          <LogItem key={log.id} log={log} />
        ))}
      </div>
    </div>
  );
}
