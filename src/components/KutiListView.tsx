import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { STATUS_CONFIG, type Kuti } from "@/hooks/use-kutis";

interface KutiListViewProps {
  kutis: Kuti[];
  onSelectKuti: (kuti: Kuti) => void;
}

export function KutiListView({ kutis, onSelectKuti }: KutiListViewProps) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">กุฏิ</TableHead>
            <TableHead>ชื่อผู้พัก</TableHead>
            <TableHead className="w-32">สถานะ</TableHead>
            <TableHead className="hidden sm:table-cell">หมายเหตุ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {kutis.map((kuti) => {
            const config = STATUS_CONFIG[kuti.status];
            return (
              <TableRow
                key={kuti.id}
                className="cursor-pointer hover:bg-accent/50"
                onClick={() => onSelectKuti(kuti)}
              >
                <TableCell className="font-semibold">{kuti.kuti_number}</TableCell>
                <TableCell>{kuti.name || "—"}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5">
                    <span className={cn("w-3 h-3 rounded-full", config.colorClass)} />
                    <span className="text-sm">{config.labelTh}</span>
                  </span>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                  {kuti.notes || "—"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
