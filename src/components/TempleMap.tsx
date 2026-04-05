import { useRef, useState, useCallback, useEffect } from "react";
import templeMapImage from "@/assets/temple-map.jpg";
import { KutiLight } from "./KutiLight";
import type { Kuti } from "@/hooks/use-kutis";
import { KUTI_POSITIONS } from "@/lib/kuti-positions";
import { cn } from "@/lib/utils";
import { Crosshair, Copy, Check } from "lucide-react";

interface TempleMapProps {
  kutis: Kuti[];
  selectedKutiId: string | null;
  onSelectKuti: (kuti: Kuti) => void;
}

export function TempleMap({ kutis, selectedKutiId, onSelectKuti }: TempleMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const translateStart = useRef({ x: 0, y: 0 });
  const lastPinchDist = useRef<number | null>(null);

  // Edit mode: drag-to-adjust kuti positions
  const [isEditMode, setIsEditMode] = useState(false);
  const dragKutiRef = useRef<string | null>(null);
  const currentDragPosRef = useRef<{ x: number; y: number } | null>(null);
  const [overridePositions, setOverridePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [movedKutis, setMovedKutis] = useState<Record<string, { x: number; y: number }>>({});
  const [copied, setCopied] = useState(false);

  const clampTranslate = useCallback(
    (tx: number, ty: number, s: number) => {
      const el = containerRef.current;
      if (!el) return { x: tx, y: ty };
      const maxX = (el.scrollWidth * (s - 1)) / 2;
      const maxY = (el.scrollHeight * (s - 1)) / 2;
      return {
        x: Math.max(-maxX, Math.min(maxX, tx)),
        y: Math.max(-maxY, Math.min(maxY, ty)),
      };
    },
    []
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const newScale = Math.max(1, Math.min(4, scale - e.deltaY * 0.002));
      setScale(newScale);
      if (newScale === 1) setTranslate({ x: 0, y: 0 });
      else setTranslate((t) => clampTranslate(t.x, t.y, newScale));
    },
    [scale, clampTranslate]
  );

  // Calculate percentage position relative to the inner (transformed) div
  const getPosOnMap = useCallback((clientX: number, clientY: number) => {
    const inner = innerRef.current;
    if (!inner) return null;
    const rect = inner.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (isEditMode) {
        const kutiEl = (e.target as HTMLElement).closest("[data-kuti]");
        if (kutiEl) {
          const kutiNumber = (kutiEl as HTMLElement).dataset.kuti!;
          dragKutiRef.current = kutiNumber;
          currentDragPosRef.current = null;
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        }
        // Don't pan in edit mode
        return;
      }
      if (scale <= 1) return;
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY };
      translateStart.current = { ...translate };
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [scale, translate, isEditMode]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (dragKutiRef.current) {
        const pos = getPosOnMap(e.clientX, e.clientY);
        if (pos) {
          currentDragPosRef.current = pos;
          setOverridePositions((prev) => ({ ...prev, [dragKutiRef.current!]: pos }));
        }
        return;
      }
      if (!isPanning) return;
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setTranslate(
        clampTranslate(translateStart.current.x + dx, translateStart.current.y + dy, scale)
      );
    },
    [isPanning, scale, clampTranslate, getPosOnMap]
  );

  const handlePointerUp = useCallback(() => {
    if (dragKutiRef.current) {
      if (currentDragPosRef.current) {
        const num = dragKutiRef.current;
        const pos = currentDragPosRef.current;
        setMovedKutis((prev) => ({ ...prev, [num]: pos }));
      }
      dragKutiRef.current = null;
      currentDragPosRef.current = null;
      return;
    }
    setIsPanning(false);
  }, []);

  // Touch pinch zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (lastPinchDist.current !== null) {
          const delta = dist - lastPinchDist.current;
          setScale((s) => {
            const newS = Math.max(1, Math.min(4, s + delta * 0.005));
            if (newS === 1) setTranslate({ x: 0, y: 0 });
            return newS;
          });
        }
        lastPinchDist.current = dist;
      }
    };

    const handleTouchEnd = () => {
      lastPinchDist.current = null;
    };

    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd);
    return () => {
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  const handleToggleEditMode = useCallback(() => {
    setIsEditMode((prev) => {
      if (prev) {
        // Exiting edit mode: clear overrides
        setOverridePositions({});
        setMovedKutis({});
        setCopied(false);
      }
      return !prev;
    });
  }, []);

  const handleCopy = useCallback(async () => {
    const lines = Object.entries(movedKutis)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([num, pos]) => `  "${num}": { x: ${pos.x}, y: ${pos.y} }`)
      .join(",\n");
    await navigator.clipboard.writeText(lines);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [movedKutis]);

  const kutiMap = new Map(kutis.map((k) => [k.kuti_number, k]));

  const getPos = (number: string) => overridePositions[number] ?? KUTI_POSITIONS[number];

  const movedEntries = Object.entries(movedKutis).sort(
    ([a], [b]) => Number(a) - Number(b)
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full overflow-hidden bg-muted rounded-lg",
        isEditMode ? "cursor-default" : "cursor-grab active:cursor-grabbing"
      )}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div
        ref={innerRef}
        className="relative w-full h-full transition-transform duration-75"
        style={{
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        <img
          src={templeMapImage}
          alt="Temple Map"
          className="w-full h-full object-contain pointer-events-none select-none"
          draggable={false}
        />
        <div className="absolute inset-0">
          {Object.entries(KUTI_POSITIONS).map(([number]) => {
            const kuti = kutiMap.get(number);
            if (!kuti) return null;
            const pos = getPos(number);
            return (
              <KutiLight
                key={number}
                kutiNumber={number}
                status={kuti.status}
                x={pos.x}
                y={pos.y}
                isSelected={!isEditMode && kuti.id === selectedKutiId}
                isDraggable={isEditMode}
                onClick={isEditMode ? undefined : () => onSelectKuti(kuti)}
              />
            );
          })}
        </div>
      </div>

      {/* Edit mode toggle button */}
      <button
        onClick={handleToggleEditMode}
        className={cn(
          "absolute top-3 left-3 z-20 rounded-lg border px-3 py-2 text-sm font-medium shadow-md flex items-center gap-1.5",
          isEditMode
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-card/90 border-border text-card-foreground"
        )}
      >
        <Crosshair className="w-4 h-4" />
        {isEditMode ? "เสร็จสิ้น" : "ปรับตำแหน่ง"}
      </button>

      {/* Coordinate readout overlay */}
      {isEditMode && movedEntries.length > 0 && (
        <div className="absolute top-3 right-3 z-20 max-w-[220px] bg-card/95 border border-border rounded-lg p-3 shadow-md">
          <div className="flex items-center justify-between mb-2 gap-2">
            <span className="text-xs font-semibold text-foreground">ตำแหน่งใหม่</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground shrink-0"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copied ? "คัดลอกแล้ว" : "คัดลอก"}
            </button>
          </div>
          <div className="overflow-auto max-h-48 space-y-0.5">
            {movedEntries.map(([num, pos]) => (
              <div key={num} className="font-mono text-[10px] text-muted-foreground">
                &quot;{num}&quot;: &#123; x: {pos.x}, y: {pos.y} &#125;
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit mode instruction */}
      {isEditMode && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-card/90 border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground shadow-md whitespace-nowrap">
          ลากไฟกุฏิเพื่อปรับตำแหน่ง
        </div>
      )}

      {scale > 1 && !isEditMode && (
        <button
          onClick={() => {
            setScale(1);
            setTranslate({ x: 0, y: 0 });
          }}
          className="absolute bottom-3 right-3 z-20 rounded-lg bg-card/90 border border-border px-3 py-2 text-sm font-medium shadow-md"
        >
          รีเซ็ตซูม
        </button>
      )}
    </div>
  );
}
