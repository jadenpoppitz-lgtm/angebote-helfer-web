import { ArrowRight } from "lucide-react";
import { useState } from "react";
import type { CSSProperties, FocusEvent, MouseEvent, PointerEvent } from "react";
import { createPortal } from "react-dom";
import type { GraphPoint, LandingCopy, RoleId } from "@/pages/Landing";

type CyclePosition = {
  asset: string;
  leftPercent: number;
  topPercent: number;
  suggestedIconWidth: number;
  title?: string;
  popup?: "top" | "bottom";
  popupAlign?: "left" | "center" | "right";
};

type CycleEdge = {
  id: string;
  path: string;
  tone: "product" | "recycle" | "signal" | "material";
  duration: number;
  delay?: number;
};

type PopupPosition = {
  left: number;
  top: number;
};

type Cycle3DMapProps = {
  content: LandingCopy;
  activePoint: GraphPoint;
  setActivePoint: (point: GraphPoint) => void;
  chooseRole: (role: RoleId) => void;
  jumpTo: (id: "demos" | "forms") => void;
};

const cycleOrder: GraphPoint[] = ["oem", "customer", "consulting", "disassembly", "smelter", "materials"];

const cyclePositions: Record<GraphPoint, CyclePosition> = {
  oem: {
    asset: "/zyklus/icon-oem.png",
    leftPercent: 14.941,
    topPercent: 53.117,
    suggestedIconWidth: 250,
    popupAlign: "left",
  },
  customer: {
    asset: "/zyklus/icon-customer.png",
    leftPercent: 31.152,
    topPercent: 22.972,
    suggestedIconWidth: 250,
    popup: "bottom",
  },
  consulting: {
    asset: "/zyklus/icon-leaftronics.png",
    leftPercent: 47.168,
    topPercent: 53.117,
    suggestedIconWidth: 270,
    title: "Leaftronics",
  },
  disassembly: {
    asset: "/zyklus/icon-disassembly.png",
    leftPercent: 63.232,
    topPercent: 22.972,
    suggestedIconWidth: 250,
    popup: "bottom",
  },
  smelter: {
    asset: "/zyklus/icon-smelter.png",
    leftPercent: 79.102,
    topPercent: 53.117,
    suggestedIconWidth: 250,
    popupAlign: "right",
  },
  materials: {
    asset: "/zyklus/icon-materials.png",
    leftPercent: 47.168,
    topPercent: 83.006,
    suggestedIconWidth: 270,
  },
};

const pointToRole: Partial<Record<GraphPoint, RoleId>> = {
  oem: "oem",
  customer: "customer",
  consulting: "partner",
  disassembly: "recycler",
  smelter: "smelter",
  materials: "smelter",
};

const cycleEdges: CycleEdge[] = [
  {
    id: "oem-customer",
    path: "M414 552 C430 450 506 365 560 346",
    tone: "product",
    duration: 7.2,
  },
  {
    id: "customer-leaftronics",
    path: "M720 360 C790 456 842 518 862 560",
    tone: "product",
    duration: 7.7,
    delay: 0.3,
  },
  {
    id: "leaftronics-disassembly",
    path: "M1086 548 C1132 456 1196 375 1215 346",
    tone: "recycle",
    duration: 7.4,
    delay: 0.6,
  },
  {
    id: "disassembly-smelter",
    path: "M1380 350 C1510 392 1578 475 1540 550",
    tone: "recycle",
    duration: 7.8,
    delay: 0.8,
  },
  {
    id: "leaftronics-oem",
    path: "M840 622 C690 622 535 622 426 622",
    tone: "signal",
    duration: 8.5,
    delay: 0.2,
  },
  {
    id: "leaftronics-smelter",
    path: "M1105 622 C1248 622 1408 622 1510 622",
    tone: "product",
    duration: 7.5,
    delay: 1.1,
  },
  {
    id: "leaftronics-smelter-solution",
    path: "M1104 682 C1248 684 1406 684 1512 676",
    tone: "signal",
    duration: 8.2,
    delay: 1.6,
  },
  {
    id: "smelter-materials",
    path: "M1530 712 C1420 840 1220 902 1092 910",
    tone: "material",
    duration: 8.6,
    delay: 1.9,
  },
  {
    id: "materials-oem",
    path: "M838 908 C650 894 455 792 394 704",
    tone: "material",
    duration: 9.2,
    delay: 0.9,
  },
];

const edgeToneClasses: Record<CycleEdge["tone"], { stroke: string; marker: string; glow: string }> = {
  product: { stroke: "hsl(var(--primary))", marker: "cycle-arrow-product", glow: "hsl(var(--primary-glow))" },
  recycle: { stroke: "hsl(168 56% 34%)", marker: "cycle-arrow-recycle", glow: "hsl(168 65% 52%)" },
  signal: { stroke: "hsl(38 88% 44%)", marker: "cycle-arrow-signal", glow: "hsl(38 94% 58%)" },
  material: { stroke: "hsl(142 28% 34%)", marker: "cycle-arrow-material", glow: "hsl(142 45% 48%)" },
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const Cycle3DMap = ({ content, activePoint, setActivePoint, chooseRole, jumpTo }: Cycle3DMapProps) => {
  const [hoveredPoint, setHoveredPoint] = useState<GraphPoint | null>(null);
  const [popupPosition, setPopupPosition] = useState<PopupPosition | null>(null);
  const [tilt, setTilt] = useState({ x: 4, y: -3 });
  const highlightedPoint = hoveredPoint ?? activePoint;
  const popupPoint = hoveredPoint;
  const popupNode = popupPoint ? content.solution.nodes[popupPoint] : null;
  const popupTitle = popupPoint ? (cyclePositions[popupPoint].title ?? popupNode?.title) : "";

  const placePopup = (point: GraphPoint, anchorRect: DOMRect) => {
    const position = cyclePositions[point];
    const popupWidth = Math.min(320, window.innerWidth - 32);
    const estimatedPopupHeight = 230;
    const margin = 16;
    const gap = 18;

    let left = anchorRect.left + anchorRect.width / 2 - popupWidth / 2;
    if (position.popupAlign === "left") {
      left = anchorRect.left;
    } else if (position.popupAlign === "right") {
      left = anchorRect.right - popupWidth;
    }
    left = clamp(left, margin, window.innerWidth - popupWidth - margin);

    const wantsBottom = position.popup === "bottom";
    let top = wantsBottom ? anchorRect.bottom + gap + 22 : anchorRect.top - estimatedPopupHeight - gap;
    if (top < margin) {
      top = anchorRect.bottom + gap + 10;
    }
    if (top + estimatedPopupHeight > window.innerHeight - margin) {
      top = Math.max(margin, window.innerHeight - estimatedPopupHeight - margin);
    }

    setPopupPosition({ left, top });
  };

  const showPoint = (point: GraphPoint, anchor: HTMLElement) => {
    setHoveredPoint(point);
    setActivePoint(point);
    placePopup(point, anchor.getBoundingClientRect());
  };

  const openPoint = (point: GraphPoint) => {
    setActivePoint(point);
    const role = pointToRole[point];
    if (role) {
      chooseRole(role);
      setActivePoint(point);
      jumpTo("demos");
      return;
    }
    jumpTo("forms");
  };

  const moveStage = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    setTilt({ x: 4 - y * 4, y: -3 + x * 6 });

    const plane = event.currentTarget.querySelector<HTMLElement>(".cycle-map-plane");
    if (!plane) return;

    const planeBounds = plane.getBoundingClientRect();
    const mapX = ((event.clientX - planeBounds.left) / planeBounds.width) * 100;
    const mapY = ((event.clientY - planeBounds.top) / planeBounds.height) * 100;
    let closestPoint: GraphPoint | null = null;
    let closestDistance = Number.POSITIVE_INFINITY;

    cycleOrder.forEach((point) => {
      const position = cyclePositions[point];
      const distance = Math.hypot((position.leftPercent - mapX) * 1.75, position.topPercent - mapY);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestPoint = point;
      }
    });

    if (closestPoint && closestDistance < 9.5) {
      setHoveredPoint(closestPoint);
      setActivePoint(closestPoint);
      const node = plane.querySelector<HTMLElement>(`[data-cycle-point="${closestPoint}"]`);
      if (node) {
        placePopup(closestPoint, node.getBoundingClientRect());
      }
    } else {
      setHoveredPoint(null);
      setPopupPosition(null);
    }
  };

  const resetStage = () => {
    setTilt({ x: 4, y: -3 });
    setHoveredPoint(null);
    setPopupPosition(null);
  };

  const popup =
    popupPoint && popupNode && popupPosition ? (
      <div
        className="cycle-map-popup"
        style={
          {
            "--cycle-popup-left": `${popupPosition.left}px`,
            "--cycle-popup-top": `${popupPosition.top}px`,
          } as CSSProperties
        }
      >
        <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
          {popupNode.label}
        </span>
        <span className="mt-1 block font-display text-lg font-semibold leading-tight text-foreground">{popupTitle}</span>
        <span className="mt-2 block text-xs font-semibold leading-5 text-primary/80">{popupNode.problem}</span>
        <span className="mt-1.5 block text-xs leading-5 text-muted-foreground">{popupNode.solution}</span>
        <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
          {popupNode.next}
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    ) : null;

  return (
    <>
      <div
        className="cycle-map-stage relative -mx-2 overflow-x-auto px-2 pb-8 pt-2 sm:mx-0 sm:px-0 md:pb-10 md:pt-3"
        onPointerMove={moveStage}
        onPointerLeave={resetStage}
        style={
          {
            "--cycle-tilt-x": `${tilt.x}deg`,
            "--cycle-tilt-y": `${tilt.y}deg`,
          } as CSSProperties
        }
      >
        <div className="cycle-map-plane relative aspect-[2048/1171] min-w-[820px] md:min-w-[900px] lg:min-w-0">
          <img
            src="/zyklus/flow-map.png"
            alt=""
            draggable={false}
            className="pointer-events-none absolute inset-0 z-10 h-full w-full select-none object-contain opacity-90"
          />

          <svg className="pointer-events-none absolute inset-0 z-30 h-full w-full" viewBox="0 0 2048 1171" aria-hidden="true">
            <defs>
              {Object.entries(edgeToneClasses).map(([tone, colors]) => (
                <marker
                  key={tone}
                  id={colors.marker}
                  viewBox="0 0 16 16"
                  refX="13"
                  refY="8"
                  markerWidth="12"
                  markerHeight="12"
                  orient="auto"
                >
                  <path d="M2 2 L14 8 L2 14" fill="none" stroke={colors.stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </marker>
              ))}
            </defs>
            {cycleEdges.map((edge) => {
              const colors = edgeToneClasses[edge.tone];
              const isActive =
                edge.id.includes(highlightedPoint) ||
                (highlightedPoint === "consulting" && edge.id.includes("leaftronics")) ||
                (highlightedPoint === "oem" && edge.id.includes("oem"));
              const style = {
                "--cycle-flow-duration": `${edge.duration}s`,
                "--cycle-flow-delay": `${edge.delay ?? 0}s`,
                "--cycle-flow-glow": colors.glow,
              } as CSSProperties;

              return (
                <g key={edge.id}>
                  <path
                    d={edge.path}
                    fill="none"
                    stroke="hsl(60 30% 98% / 0.92)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={isActive ? 14 : 11}
                  />
                  <path
                    d={edge.path}
                    fill="none"
                    stroke={colors.stroke}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeOpacity={isActive ? 0.9 : 0.64}
                    strokeWidth={isActive ? 6.5 : 4.8}
                    markerEnd={`url(#${colors.marker})`}
                  />
                  <path
                    d={edge.path}
                    className="cycle-flow-beam"
                    fill="none"
                    stroke={colors.stroke}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={isActive ? 10 : 8}
                    style={style}
                  />
                </g>
              );
            })}
          </svg>

          {cycleOrder.map((point) => {
            const position = cyclePositions[point];
            const node = content.solution.nodes[point];
            const isHovered = hoveredPoint === point;
            const iconWidth = `${(position.suggestedIconWidth / 2048) * 100}%`;
            const displayTitle = position.title ?? node.title;

            return (
              <button
                key={point}
                type="button"
                data-cycle-point={point}
                className={`cycle-map-node group absolute z-40 aspect-square text-center outline-none ${
                  isHovered ? "cycle-map-node-active" : ""
                }`}
                style={{
                  left: `${position.leftPercent}%`,
                  top: `${position.topPercent}%`,
                  width: iconWidth,
                }}
                onMouseEnter={(event: MouseEvent<HTMLButtonElement>) => showPoint(point, event.currentTarget)}
                onMouseLeave={() => {
                  setHoveredPoint(null);
                  setPopupPosition(null);
                }}
                onFocus={(event: FocusEvent<HTMLButtonElement>) => showPoint(point, event.currentTarget)}
                onBlur={() => {
                  setHoveredPoint(null);
                  setPopupPosition(null);
                }}
                onClick={() => openPoint(point)}
                aria-label={`${displayTitle}: ${node.next}`}
              >
                <span className="cycle-map-lens absolute inset-0 rounded-full" aria-hidden="true" />
                <img
                  src={position.asset}
                  alt=""
                  draggable={false}
                  className="cycle-map-icon h-full w-full select-none object-contain"
                  loading="eager"
                />
                <span className="cycle-map-title absolute left-1/2 top-[86%] w-max max-w-[9.5rem] -translate-x-1/2 rounded-md bg-background/92 px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-[0_10px_24px_hsl(151_31%_34%/.14)] backdrop-blur md:text-xs">
                  {displayTitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {popup && typeof document !== "undefined" ? createPortal(popup, document.body) : null}
    </>
  );
};
