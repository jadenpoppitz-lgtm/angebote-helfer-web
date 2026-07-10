import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, FocusEvent, MouseEvent, PointerEvent } from "react";
import { createPortal } from "react-dom";
import type { CycleWorldRuntime } from "@/components/CyclePrototypeWorld";
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

type CyclePrototypeMapProps = {
  content: LandingCopy;
  activePoint: GraphPoint;
  setActivePoint: (point: GraphPoint) => void;
  chooseRole: (role: RoleId) => void;
  jumpTo: (id: "demos" | "forms") => void;
};

const cycleOrder: GraphPoint[] = ["oem", "customer", "consulting", "disassembly", "smelter", "materials"];

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
  consulting: "partner",
  disassembly: "recycler",
  smelter: "smelter",
  materials: "smelter",
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const CyclePrototypeMap = ({ content, activePoint, setActivePoint, chooseRole, jumpTo }: CyclePrototypeMapProps) => {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const worldRef = useRef<CycleWorldRuntime | null>(null);
  const nodeRefs = useRef<Partial<Record<GraphPoint, HTMLButtonElement | null>>>({});
  const [previewPoint, setPreviewPoint] = useState<GraphPoint | null>(null);
  const [popupPosition, setPopupPosition] = useState<PopupPosition | null>(null);
  const [sceneFailed, setSceneFailed] = useState(false);
  const highlightedPoint = previewPoint ?? activePoint;
  const popupNode = previewPoint ? content.solution.nodes[previewPoint] : null;
  const popupTitle = previewPoint ? (cyclePositions[previewPoint].title ?? popupNode?.title) : "";

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
          onFrame: (points) => {
            cycleOrder.forEach((point) => {
              const node = nodeRefs.current[point];
              if (!node) return;
              const projected = points[point];
              node.style.left = `${projected.x}px`;
              node.style.top = `${projected.y}px`;
              node.style.opacity = projected.visible ? "1" : "0";
              node.style.pointerEvents = projected.visible ? "auto" : "none";
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
    jumpTo("forms");
  };

  const activatePoint = (point: GraphPoint, anchor: HTMLButtonElement) => {
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
        <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-emerald-300">
          {popupNode.next}
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    ) : null;

  return (
    <>
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

        {cycleOrder.map((point, index) => {
          const position = cyclePositions[point];
          const node = content.solution.nodes[point];
          const displayTitle = position.title ?? node.title;
          const isActive = highlightedPoint === point;

          return (
            <button
              key={point}
              ref={(element) => {
                nodeRefs.current[point] = element;
              }}
              type="button"
              data-cycle-point={point}
              className={`cycle-prototype-world-node ${isActive ? "is-active" : ""}`}
              style={{ left: `${position.fallback[0]}%`, top: `${position.fallback[1]}%` }}
              onMouseEnter={(event: MouseEvent<HTMLButtonElement>) => preview(point, event.currentTarget)}
              onMouseLeave={clearPreview}
              onFocus={(event: FocusEvent<HTMLButtonElement>) => preview(point, event.currentTarget)}
              onBlur={clearPreview}
              onClick={(event) => activatePoint(point, event.currentTarget)}
              aria-label={`${displayTitle}: ${node.next}`}
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
