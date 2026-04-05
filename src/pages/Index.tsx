import { useState, useEffect, useMemo } from "react";
import { useKutis, useSeedKutis } from "@/hooks/use-kutis";
import type { Kuti, KutiStatus } from "@/hooks/use-kutis";
import { KUTI_POSITIONS, ALL_KUTI_NUMBERS } from "@/lib/kuti-positions";
import { TempleMap } from "@/components/TempleMap";
import { KutiEditPanel } from "@/components/KutiEditPanel";
import { KutiListView } from "@/components/KutiListView";
import { Dashboard } from "@/components/Dashboard";
import { FilterToolbar } from "@/components/FilterToolbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Map, List, LayoutDashboard, Loader2 } from "lucide-react";

const Index = () => {
  const { data: kutis, isLoading } = useKutis();
  const seedKutis = useSeedKutis();
  const [selectedKuti, setSelectedKuti] = useState<Kuti | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [seeded, setSeeded] = useState(false);

  // Global search/filter state — shared across Map and List views
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<KutiStatus | null>(null);

  // Auto-seed kutis if database is empty
  useEffect(() => {
    if (!isLoading && kutis && kutis.length === 0 && !seeded) {
      setSeeded(true);
      const seedData = ALL_KUTI_NUMBERS.map((num) => ({
        kuti_number: num,
        x_percent: KUTI_POSITIONS[num].x,
        y_percent: KUTI_POSITIONS[num].y,
      }));
      seedKutis.mutate(seedData);
    }
  }, [isLoading, kutis, seeded, seedKutis]);

  const handleSelectKuti = (kuti: Kuti) => {
    setSelectedKuti(kuti);
    setEditOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const sortedKutis = [...(kutis ?? [])].sort(
    (a, b) => Number(a.kuti_number) - Number(b.kuti_number)
  );

  // Client-side filtering used by both Map and List views
  const isFilterActive = searchQuery.trim() !== "" || statusFilter !== null;

  const filteredKutis = isFilterActive
    ? sortedKutis.filter((k) => {
        const q = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !q ||
          k.kuti_number.toLowerCase().includes(q) ||
          (k.name ?? "").toLowerCase().includes(q);
        const matchesStatus = !statusFilter || k.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
    : sortedKutis;

  // Set of matched kuti numbers for the map (null = no filter active)
  const matchedKutiNumbers: Set<string> | null = isFilterActive
    ? new Set(filteredKutis.map((k) => k.kuti_number))
    : null;

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="shrink-0 border-b border-border bg-card px-4 py-3">
        <h1 className="text-lg font-bold text-card-foreground">
          ระบบจัดการกุฏิ
        </h1>
      </header>

      {/* Main content */}
      <Tabs defaultValue="map" className="flex-1 flex flex-col min-h-0">
        <TabsList className="shrink-0 mx-4 mt-3 w-auto self-start">
          <TabsTrigger value="map" className="gap-1.5">
            <Map className="w-4 h-4" />
            แผนที่
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-1.5">
            <List className="w-4 h-4" />
            รายการ
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="gap-1.5">
            <LayoutDashboard className="w-4 h-4" />
            สรุป
          </TabsTrigger>
        </TabsList>

        {/* Shared search + filter toolbar (Map and List tabs only) */}
        <TabsContent value="map" className="contents">
          <FilterToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        </TabsContent>
        <TabsContent value="list" className="contents">
          <FilterToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        </TabsContent>

        <TabsContent value="map" className="flex-1 min-h-0 px-4 pb-4">
          <TempleMap
            kutis={sortedKutis}
            selectedKutiId={selectedKuti?.id ?? null}
            onSelectKuti={handleSelectKuti}
            matchedKutiNumbers={matchedKutiNumbers}
          />
        </TabsContent>

        <TabsContent value="list" className="flex-1 min-h-0 p-4 pt-0 overflow-auto">
          <KutiListView
            kutis={filteredKutis}
            totalCount={sortedKutis.length}
            onSelectKuti={handleSelectKuti}
          />
        </TabsContent>

        <TabsContent value="dashboard" className="flex-1 min-h-0 p-4 pt-2 overflow-auto">
          <Dashboard kutis={sortedKutis} isLoading={isLoading} />
        </TabsContent>
      </Tabs>

      {/* Edit Panel */}
      <KutiEditPanel
        kuti={selectedKuti}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </div>
  );
};

export default Index;
