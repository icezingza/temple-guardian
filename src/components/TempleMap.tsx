import { useRef, useState, useCallback, useEffect } from "react";
import templeMapImage from "@/assets/temple-map.jpg";
import { KutiLight } from "./KutiLight";
import type { Kuti } from "@/hooks/use-kutis";
import { KUTI_POSITIONS } from "@/lib/kuti-positions";

interface TempleMapProps {
  kutis: Kuti[];
  selectedKutiId: string | null;
  onSelectKuti: (kuti: Kuti) => void;
}

export function TempleMap({ kutis, selectedKutiId, onSelectKuti }: TempleMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const translateStart = useRef({ x: 0, y: 0 });
  const lastPinchDist = useRef<number | null>(null);

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

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (scale <= 1) return;
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY };
      translateStart.current = { ...translate };
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [scale, translate]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isPanning) return;
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setTranslate(
        clampTranslate(translateStart.current.x + dx, translateStart.current.y + dy, scale)
      );
    },
    [isPanning, scale, clampTranslate]
  );

  const handlePointerUp = useCallback(() => {
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

  const kutiMap = new Map(kutis.map((k) => [k.kuti_number, k]));

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-muted rounded-lg cursor-grab active:cursor-grabbing"
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div
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
          {Object.entries(KUTI_POSITIONS).map(([number, pos]) => {
            const kuti = kutiMap.get(number);
            if (!kuti) return null;
            return (
              <KutiLight
                key={number}
                kutiNumber={number}
                status={kuti.status}
                x={pos.x}
                y={pos.y}
                isSelected={kuti.id === selectedKutiId}
                onClick={() => onSelectKuti(kuti)}
              />
            );
          })}
        </div>
      </div>

      {scale > 1 && (
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
