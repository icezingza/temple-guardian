import { useState } from "react";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { STATUS_CONFIG, type Kuti } from "@/hooks/use-kutis";

interface KutiListViewProps {
  kutis: Kuti[];
  onSelectKuti: (kuti: Kuti) => void;
}

function formatUpdatedAt(ts: string): string {
  try {
    return format(new Date(ts), "d/M/yy HH:mm");
  } catch {
    return "—";
  }
}

export function KutiListView({ kutis, onSelectKuti }: KutiListViewProps) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? kutis.filter((k) => {
        const q = query.trim().toLowerCase();
        return (
          k.kuti_number.toLowerCase().includes(q) ||
          (k.name ?? "").toLowerCase().includes(q)
        );
      })
    : kutis;

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหากุฏิหรือชื่อผู้พัก..."
          className="pl-9 h-11 text-base"
        />
      </div>

      {/* Result count */}
      <p className="text-sm text-muted-foreground px-0.5">
        {query.trim()
          ? `พบ ${filtered.length} จาก ${kutis.length} กุฏิ`
          : `กุฏิทั้งหมด ${kutis.length} หลัง`}
      </p>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden flex-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">กุฏิ</TableHead>
              <TableHead>ชื่อผู้พัก</TableHead>
              <TableHead className="w-28">สถานะ</TableHead>
              <TableHead className="w-28 hidden sm:table-cell">อัปเดตล่าสุด</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground py-10"
                >
                  {query.trim()
                    ? `ไม่พบ "${query}" กรุณาลองคำค้นหาอื่น`
                    : "ยังไม่มีข้อมูลกุฏิ"}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((kuti) => {
                const config = STATUS_CONFIG[kuti.status];
                return (
                  <TableRow
                    key={kuti.id}
                    className="cursor-pointer hover:bg-accent/50 min-h-[48px]"
                    onClick={() => onSelectKuti(kuti)}
                  >
                    <TableCell className="font-semibold py-3 text-base">
                      {kuti.kuti_number}
                    </TableCell>
                    <TableCell className="py-3 text-base">
                      {kuti.name || (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className={cn("w-3 h-3 rounded-full shrink-0", config.colorClass)}
                        />
                        <span className="text-sm">{config.labelTh}</span>
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell py-3 text-sm text-muted-foreground">
                      {formatUpdatedAt(kuti.updated_at)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
