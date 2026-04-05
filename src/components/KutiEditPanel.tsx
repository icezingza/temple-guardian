import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useUpdateKuti, STATUS_CONFIG, type Kuti, type KutiStatus } from "@/hooks/use-kutis";
import { useInsertActivityLog } from "@/hooks/use-activity-log";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface KutiEditPanelProps {
  kuti: Kuti | null;
  open: boolean;
  onClose: () => void;
}

const ALL_STATUSES: KutiStatus[] = ["available", "occupied", "reserved", "maintenance"];

export function KutiEditPanel({ kuti, open, onClose }: KutiEditPanelProps) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<KutiStatus>("available");
  const [notes, setNotes] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const updateKuti = useUpdateKuti();
  const insertLog = useInsertActivityLog();

  // Reset form when a different kuti is selected
  useEffect(() => {
    if (kuti) {
      setName(kuti.name ?? "");
      setStatus(kuti.status);
      setNotes(kuti.notes ?? "");
      setNameError(null);
    }
  }, [kuti]);

  // Auto-transition only between available ↔ occupied.
  // Reserved and Maintenance are manual — don't override them.
  const handleNameChange = (value: string) => {
    setName(value);
    if (nameError) setNameError(null);
    if (status === "reserved" || status === "maintenance") return;
    setStatus(value.trim() ? "occupied" : "available");
  };

  // Maintenance: disable and clear name. Other status changes: just switch.
  const handleStatusChange = (newStatus: KutiStatus) => {
    setStatus(newStatus);
    if (nameError) setNameError(null);
    if (newStatus === "maintenance") {
      setName("");
    }
  };

  const handleSave = async () => {
    if (!kuti) return;
    // Rule: Occupied requires a name
    if (status === "occupied" && !name.trim()) {
      setNameError("กรุณาใส่ชื่อผู้พักสำหรับสถานะ 'มีผู้พัก'");
      return;
    }
    const oldData = { name: kuti.name ?? "", status: kuti.status, notes: kuti.notes ?? "" };
    const newData = { name, status, notes };
    try {
      await updateKuti.mutateAsync({ id: kuti.id, name, status, notes });
      toast.success(`กุฏิ ${kuti.kuti_number} บันทึกแล้ว`);
      // Fire-and-forget: log must not block the UI update
      insertLog.mutate({
        kuti_id: kuti.id,
        kuti_number: kuti.kuti_number,
        action_type: "UPDATE",
        old_data: oldData,
        new_data: newData,
      });
      onClose();
    } catch {
      toast.error("บันทึกไม่สำเร็จ กรุณาลองใหม่");
    }
  };

  // Clear All: saves immediately — resets kuti to Available with no name/notes
  const handleClearAll = async () => {
    if (!kuti) return;
    const oldData = { name: kuti.name ?? "", status: kuti.status, notes: kuti.notes ?? "" };
    const newData = { name: "", status: "available" as KutiStatus, notes: "" };
    try {
      await updateKuti.mutateAsync({ id: kuti.id, name: "", status: "available", notes: "" });
      toast.success(`กุฏิ ${kuti.kuti_number} ล้างข้อมูลแล้ว`);
      // Fire-and-forget: log must not block the UI update
      insertLog.mutate({
        kuti_id: kuti.id,
        kuti_number: kuti.kuti_number,
        action_type: "CLEAR",
        old_data: oldData,
        new_data: newData,
      });
      onClose();
    } catch {
      toast.error("ล้างข้อมูลไม่สำเร็จ กรุณาลองใหม่");
    }
  };

  if (!kuti) return null;

  const isMaintenance = status === "maintenance";
  const isLoading = updateKuti.isPending;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-[340px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="text-xl">กุฏิ {kuti.kuti_number}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          {/* Resident name */}
          <div className="space-y-1.5">
            <Label
              htmlFor="resident-name"
              className={cn("text-lg font-medium", isMaintenance && "text-muted-foreground")}
            >
              ชื่อผู้พัก
            </Label>
            <Input
              id="resident-name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder={isMaintenance ? "ปิดใช้งานระหว่างซ่อมบำรุง" : "ชื่อ-นามสกุล"}
              disabled={isMaintenance || isLoading}
              className={cn(
                "h-12 text-base",
                nameError && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {nameError && (
              <p className="text-sm font-medium text-destructive">{nameError}</p>
            )}
          </div>

          {/* Status selector */}
          <div className="space-y-2">
            <Label className="text-lg font-medium">สถานะ</Label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_STATUSES.map((key) => {
                const config = STATUS_CONFIG[key];
                return (
                  <button
                    key={key}
                    onClick={() => handleStatusChange(key)}
                    disabled={isLoading}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border-2 p-3 min-h-[52px] text-base font-medium transition-all",
                      status === key
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-muted-foreground/30",
                      isLoading && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className={cn("w-4 h-4 rounded-full shrink-0", config.colorClass)} />
                    <span>{config.labelTh}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-lg font-medium">
              หมายเหตุ
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="บันทึกเพิ่มเติม..."
              disabled={isLoading}
              className="min-h-[80px] text-base"
            />
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="w-full h-14 text-lg font-semibold"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "บันทึก"}
            </Button>

            <Button
              variant="outline"
              onClick={handleClearAll}
              disabled={isLoading}
              className="w-full h-12 text-base text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
            >
              ล้างข้อมูลทั้งหมด
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
