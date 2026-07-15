import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, FocusEvent, MouseEvent, PointerEvent } from "react";
import { createPortal } from "react-dom";
import type {
  CycleRouteId,
  CycleWorldRouteScreenPoints,
  CycleWorldRuntime,
} from "@/components/CyclePrototypeWorld";
import type { GraphPoint, LandingCopy, RoleId } from "@/pages/Landing";

type PrototypePosition = {
  fallback: [number, number];
  popup?: "top" | "bottom";
  popupAlign?: "left" | "center" | "right";
  sprite: [number, number];
  title?: string;
};

type PopupPosition = {
  left: number;
  top: number;
};

type FlowKey = keyof LandingCopy["solution"]["flow"];

type FlowRoute = {
  fallback: [number, number];
  flow: FlowKey;
  from: GraphPoint;
  id: CycleRouteId;
  offset: [number, number];
  to: GraphPoint;
  tone: "product" | "signal" | "material";
};

type CyclePrototypeMapProps = {
  content: LandingCopy;
  activePoint: GraphPoint;
  setActivePoint: (point: GraphPoint) => void;
  chooseRole: (role: RoleId) => void;
  jumpTo: (id: "demos" | "forms") => void;
};

const cycleOrder: GraphPoint[] = ["oem", "customer", "consulting", "disassembly", "smelter", "materials"];
const coreDashboardPoints = new Set<GraphPoint>(["oem", "customer", "smelter"]);

const cyclePositions: Record<GraphPoint, PrototypePosition> = {
  oem: { fallback: [15, 55], sprite: [0, 0], popupAlign: "left" },
  customer: { fallback: [32, 25], sprite: [1, 0], popup: "bottom" },
  consulting: { fallback: [50, 55], sprite: [2, 0], title: "Leaftronics" },
  disassembly: { fallback: [68, 25], sprite: [0, 1], popup: "bottom" },
  smelter: { fallback: [85, 55], sprite: [1, 1], popupAlign: "right" },
  materials: { fallback: [50, 83], sprite: [2, 1] },
};

const pointToRole: Partial<Record<GraphPoint, RoleId>> = {
  oem: "oem",
  customer: "customer",
  smelter: "smelter",
};

const flowRoutes: FlowRoute[] = [
  {
    id: "product-outbound",
    from: "oem",
    to: "customer",
    flow: "product",
    tone: "product",
    fallback: [23, 36],
    offset: [-6, -6],
  },
  {
    id: "customer-return",
    from: "customer",
    to: "consulting",
    flow: "productPcb",
    tone: "product",
    fallback: [43, 47],
    offset: [18, 10],
  },
  {
    id: "routing-disassembly",
    from: "consulting",
    to: "disassembly",
    flow: "productPcb",
    tone: "product",
    fallback: [57, 47],
    offset: [-18, 10],
  },
  {
    id: "pcb-to-smelter",
    from: "disassembly",
    to: "smelter",
    flow: "pcb",
    tone: "product",
    fallback: [77, 36],
    offset: [8, -6],
  },
  {
    id: "pcb-sale",
    from: "consulting",
    to: "oem",
    flow: "sellPcb",
    tone: "signal",
    fallback: [31, 54],
    offset: [0, -8],
  },
  {
    id: "direct-pcb",
    from: "consulting",
    to: "smelter",
    flow: "pcb",
    tone: "product",
    fallback: [68, 54],
    offset: [0, -8],
  },
  {
    id: "process-solution",
    from: "consulting",
    to: "smelter",
    flow: "sellSolution",
    tone: "signal",
    fallback: [68, 61],
    offset: [0, 9],
  },
  {
    id: "recovered-material",
    from: "smelter",
    to: "materials",
    flow: "material",
    tone: "material",
    fallback: [69, 76],
    offset: [8, -5],
  },
  {
    id: "material-return",
    from: "materials",
    to: "oem",
    flow: "materialReturn",
    tone: "material",
    fallback: [30, 76],
    offset: [-8, -5],
  },
];

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const flowCode = (index: number) => `F${index + 1}`;

export const CyclePrototypeMap = ({ content, activePoint, setActivePoint, chooseRole, jumpTo }: CyclePrototypeMapProps) => {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const worldRef = useRef<CycleWorldRuntime | null>(null);
  const nodeRefs = useRef<Partial<Record<GraphPoint, HTMLButtonElement | null>>>({});
  const routeRefs = useRef<Partial<Record<CycleRouteId, HTMLSpanElement | null>>>({});
  const [previewPoint, setPreviewPoint] = useState<GraphPoint | null>(null);
  const [popupPosition, setPopupPosition] = useState<PopupPosition | null>(null);
  const [sceneFailed, setSceneFailed] = useState(false);
  const highlightedPoint = previewPoint ?? activePoint;
  const popupNode = previewPoint ? content.solution.nodes[previewPoint] : null;
  const popupTitle = previewPoint ? (cyclePositions[previewPoint].title ?? popupNode?.title) : "";
  const popupHasDashboard = previewPoint ? coreDashboardPoints.has(previewPoint) : false;

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let cancelled = false;

    const initializeWorld = async () => {
      try {
        const { createCyclePrototypeWorld } = await import("@/components/CyclePrototypeWorld");
        if (cancelled) return;
        worldRef.current = createCyclePrototypeWorld(canvas, stage, {
          reducedMotion,
          onFrame: (points, routes?: CycleWorldRouteScreenPoints) => {
            cycleOrder.forEach((point) => {
              const node = nodeRefs.current[point];
              if (!node) return;
              const projected = points[point];
              node.style.left = `${projected.x}px`;
              node.style.top = `${projected.y}px`;
              node.style.opacity = projected.visible ? "1" : "0";
              node.style.pointerEvents = projected.visible ? "auto" : "none";
            });
            if (!routes) return;
            flowRoutes.forEach((route) => {
              const label = routeRefs.current[route.id];
              if (!label) return;
              const projected = routes[route.id];
              label.style.left = `${projected.x}px`;
              label.style.top = `${projected.y}px`;
              label.style.opacity = projected.visible ? "1" : "0";
            });
          },
        });
      } catch (error) {
        console.error("Unable to initialize cycle prototype scene", error);
        setSceneFailed(true);
      }
    };

    void initializeWorld();

    return () => {
      cancelled = true;
      worldRef.current?.dispose();
      worldRef.current = null;
    };
  }, []);

  useEffect(() => {
    worldRef.current?.setHighlighted(highlightedPoint);
  }, [highlightedPoint]);

  useEffect(() => {
    const clearOnResize = () => {
      setPreviewPoint(null);
      setPopupPosition(null);
    };

    window.addEventListener("resize", clearOnResize);
    return () => window.removeEventListener("resize", clearOnResize);
  }, []);

  const placePopup = (point: GraphPoint, anchorRect: DOMRect) => {
    const position = cyclePositions[point];
    const popupWidth = Math.min(360, window.innerWidth - 32);
    const estimatedHeight = 238;
    const margin = 16;
    const gap = 18;

    let left = anchorRect.left + anchorRect.width / 2 - popupWidth / 2;
    if (position.popupAlign === "left") left = anchorRect.left;
    if (position.popupAlign === "right") left = anchorRect.right - popupWidth;
    left = clamp(left, margin, window.innerWidth - popupWidth - margin);

    let top = position.popup === "bottom" ? anchorRect.bottom + gap : anchorRect.top - estimatedHeight - gap;
    if (top < margin) top = anchorRect.bottom + gap;
    if (top + estimatedHeight > window.innerHeight - margin) {
      top = Math.max(margin, window.innerHeight - estimatedHeight - margin);
    }

    setPopupPosition({ left, top });
  };

  const preview = (point: GraphPoint, anchor: HTMLElement) => {
    setPreviewPoint(point);
    setActivePoint(point);
    placePopup(point, anchor.getBoundingClientRect());
  };

  const clearPreview = () => {
    setPreviewPoint(null);
    setPopupPosition(null);
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
  };

  const activatePoint = (point: GraphPoint, anchor: HTMLButtonElement) => {
    if (!coreDashboardPoints.has(point)) {
      preview(point, anchor);
      return;
    }
    const touchNavigation = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    if (touchNavigation && previewPoint !== point) {
      preview(point, anchor);
      return;
    }

    openPoint(point);
  };

  const moveStage = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    worldRef.current?.setPointer(x, y);
  };

  const popup =
    previewPoint && popupNode && popupPosition ? (
      <div
        className="cycle-prototype-popup"
        style={
          {
            "--prototype-popup-left": `${popupPosition.left}px`,
            "--prototype-popup-top": `${popupPosition.top}px`,
          } as CSSProperties
        }
      >
        <div className="flex items-center justify-between gap-4">
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-300/80">{popupNode.label}</span>
          <span className="font-mono text-[10px] text-white/30">{String(cycleOrder.indexOf(previewPoint) + 1).padStart(2, "0")}</span>
        </div>
        <span className="mt-2 block font-display text-xl font-semibold leading-tight text-white">{popupTitle}</span>
        <span className="mt-3 block text-xs font-semibold leading-5 text-[#d9a25b]">{popupNode.problem}</span>
        <span className="mt-1.5 block text-xs leading-5 text-white/70">{popupNode.solution}</span>
        <span className={`mt-4 inline-flex items-center gap-2 text-xs font-semibold ${popupHasDashboard ? "text-emerald-300" : "text-white/55"}`}>
          {popupHasDashboard ? popupNode.next : content.solution.hoverLabel}
          {popupHasDashboard ? <ArrowRight className="h-3.5 w-3.5" /> : null}
        </span>
      </div>
    ) : null;

  return (
    <>
      <div className="cycle-prototype-flow-key" aria-label={content.solution.eyebrow}>
        <span data-tone="product">
          <i aria-hidden="true" />
          {content.solution.flow.product} / {content.solution.flow.pcb}
        </span>
        <span data-tone="signal">
          <i aria-hidden="true" />
          {content.solution.flow.sellPcb} / {content.solution.flow.sellSolution}
        </span>
        <span data-tone="material">
          <i aria-hidden="true" />
          {content.solution.flow.materialReturn}
        </span>
      </div>
      <ol className="cycle-prototype-flow-list" aria-label={content.solution.eyebrow}>
        {flowRoutes.map((route, index) => {
          const fromTitle = cyclePositions[route.from].title ?? content.solution.nodes[route.from].title;
          const toTitle = cyclePositions[route.to].title ?? content.solution.nodes[route.to].title;
          return (
            <li key={route.id}>
              <span>{flowCode(index)}</span>
              <span>
                <strong>{fromTitle} → {toTitle}</strong>
                <small>{content.solution.flow[route.flow]}</small>
              </span>
            </li>
          );
        })}
      </ol>
      <div
        ref={stageRef}
        className={`cycle-prototype-world -mx-5 sm:-mx-8 ${sceneFailed ? "is-fallback" : ""}`}
        onPointerMove={moveStage}
        onPointerLeave={() => {
          worldRef.current?.setPointer(0, 0);
          clearPreview();
        }}
      >
        <canvas ref={canvasRef} className="cycle-prototype-canvas" aria-hidden="true" />
        <div className="cycle-prototype-world-vignette" aria-hidden="true" />

        {flowRoutes.map((route, index) => (
          <span
            key={route.id}
            ref={(element) => {
              routeRefs.current[route.id] = element;
            }}
            className="cycle-prototype-flow-label"
            data-route={route.id}
            data-tone={route.tone}
            style={
              {
                left: `${route.fallback[0]}%`,
                top: `${route.fallback[1]}%`,
                "--flow-offset-x": `${route.offset[0]}px`,
                "--flow-offset-y": `${route.offset[1]}px`,
              } as CSSProperties
            }
            aria-hidden="true"
          >
            <span className="cycle-prototype-flow-label-code">{flowCode(index)}</span>
            <span className="cycle-prototype-flow-label-text">{content.solution.flow[route.flow]}</span>
          </span>
        ))}

        {cycleOrder.map((point, index) => {
          const position = cyclePositions[point];
          const node = content.solution.nodes[point];
          const displayTitle = position.title ?? node.title;
          const isActive = highlightedPoint === point;
          const hasDashboard = coreDashboardPoints.has(point);

          return (
            <button
              key={point}
              ref={(element) => {
                nodeRefs.current[point] = element;
              }}
              type="button"
              data-cycle-point={point}
              className={`cycle-prototype-world-node ${isActive ? "is-active" : ""} ${hasDashboard ? "is-core" : "is-secondary"}`}
              style={{ left: `${position.fallback[0]}%`, top: `${position.fallback[1]}%` }}
              onMouseEnter={(event: MouseEvent<HTMLButtonElement>) => preview(point, event.currentTarget)}
              onMouseLeave={clearPreview}
              onFocus={(event: FocusEvent<HTMLButtonElement>) => preview(point, event.currentTarget)}
              onBlur={clearPreview}
              onClick={(event) => activatePoint(point, event.currentTarget)}
              aria-disabled={!hasDashboard}
              aria-label={`${displayTitle}: ${hasDashboard ? node.next : node.solution}`}
            >
              <span className="cycle-prototype-world-target" aria-hidden="true" />
              <span className="cycle-prototype-fallback-visual" aria-hidden="true">
                <img
                  src="/zyklus-prototype/stations-atlas.webp"
                  alt=""
                  draggable={false}
                  style={{ left: `${position.sprite[0] * -100}%`, top: `${position.sprite[1] * -100}%` }}
                />
              </span>
              <span className="cycle-prototype-world-label">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{displayTitle}</strong>
              </span>
            </button>
          );
        })}
      </div>

      {popup && typeof document !== "undefined" ? createPortal(popup, document.body) : null}
    </>
  );
};
