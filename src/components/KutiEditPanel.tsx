import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useUpdateKuti, STATUS_CONFIG, type Kuti, type KutiStatus } from "@/hooks/use-kutis";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface KutiEditPanelProps {
  kuti: Kuti | null;
  open: boolean;
  onClose: () => void;
}

// Statuses the user can select manually regardless of name
const MANUAL_STATUSES: KutiStatus[] = ["available", "occupied", "reserved", "maintenance"];

export function KutiEditPanel({ kuti, open, onClose }: KutiEditPanelProps) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<KutiStatus>("available");
  const [notes, setNotes] = useState("");
  const updateKuti = useUpdateKuti();

  // Populate form when a different kuti is selected
  useEffect(() => {
    if (kuti) {
      setName(kuti.name ?? "");
      setStatus(kuti.status);
      setNotes(kuti.notes ?? "");
    }
  }, [kuti]);

  // Auto-status: name entered → occupied, name cleared → available
  const handleNameChange = (value: string) => {
    setName(value);
    if (value.trim()) {
      setStatus("occupied");
    } else {
      setStatus("available");
    }
  };

  const handleClear = () => {
    setName("");
    setStatus("available");
    setNotes("");
  };

  const handleSave = async () => {
    if (!kuti) return;
    try {
      await updateKuti.mutateAsync({ id: kuti.id, name, status, notes });
      toast.success(`กุฏิ ${kuti.kuti_number} บันทึกแล้ว`);
      onClose();
    } catch {
      toast.error("บันทึกไม่สำเร็จ กรุณาลองใหม่");
    }
  };

  if (!kuti) return null;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-[340px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="text-xl">กุฏิ {kuti.kuti_number}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          {/* Resident name */}
          <div className="space-y-2">
            <Label htmlFor="resident-name" className="text-base">
              ชื่อผู้พัก
            </Label>
            <Input
              id="resident-name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="ชื่อ-นามสกุล"
              className="h-12 text-base"
            />
          </div>

          {/* Status selector */}
          <div className="space-y-2">
            <Label className="text-base">สถานะ</Label>
            <div className="grid grid-cols-2 gap-2">
              {(MANUAL_STATUSES).map((key) => {
                const config = STATUS_CONFIG[key];
                return (
                  <button
                    key={key}
                    onClick={() => setStatus(key)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border-2 p-3 min-h-[44px] text-sm font-medium transition-all",
                      status === key
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-muted-foreground/30"
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
            <Label htmlFor="notes" className="text-base">
              หมายเหตุ
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="บันทึกเพิ่มเติม..."
              className="min-h-[80px] text-base"
            />
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button
              onClick={handleSave}
              disabled={updateKuti.isPending}
              className="w-full h-14 text-lg font-semibold"
            >
              {updateKuti.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "บันทึก"
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleClear}
              disabled={updateKuti.isPending}
              className="w-full h-12 text-base"
            >
              ล้างข้อมูล
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
