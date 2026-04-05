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

export function KutiEditPanel({ kuti, open, onClose }: KutiEditPanelProps) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<KutiStatus>("available");
  const [notes, setNotes] = useState("");
  const updateKuti = useUpdateKuti();

  useEffect(() => {
    if (kuti) {
      setName(kuti.name ?? "");
      setStatus(kuti.status);
      setNotes(kuti.notes ?? "");
    }
  }, [kuti]);

  const handleSave = async () => {
    if (!kuti) return;
    try {
      await updateKuti.mutateAsync({
        id: kuti.id,
        name,
        status,
        notes,
      });
      toast.success(`กุฏิ ${kuti.kuti_number} บันทึกแล้ว`);
      onClose();
    } catch {
      toast.error("บันทึกไม่สำเร็จ");
    }
  };

  if (!kuti) return null;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-[340px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="text-xl">
            กุฏิ {kuti.kuti_number}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="resident-name" className="text-base">
              ชื่อผู้พัก
            </Label>
            <Input
              id="resident-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ชื่อ-นามสกุล"
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base">สถานะ</Label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(STATUS_CONFIG) as [KutiStatus, typeof STATUS_CONFIG[KutiStatus]][]).map(
                ([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setStatus(key)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-all",
                      status === key
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-muted-foreground/30"
                    )}
                  >
                    <div className={cn("w-4 h-4 rounded-full", config.colorClass)} />
                    <span>{config.labelTh}</span>
                  </button>
                )
              )}
            </div>
          </div>

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
        </div>
      </SheetContent>
    </Sheet>
  );
}
