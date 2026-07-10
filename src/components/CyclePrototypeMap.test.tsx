import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CyclePrototypeMap } from "@/components/CyclePrototypeMap";
import type { CycleWorldScreenPoints } from "@/components/CyclePrototypeWorld";
import type { GraphPoint, LandingCopy } from "@/pages/Landing";

const points: GraphPoint[] = ["oem", "customer", "consulting", "disassembly", "smelter", "materials"];

vi.mock("@/components/CyclePrototypeWorld", () => ({
  createCyclePrototypeWorld: (
    _canvas: HTMLCanvasElement,
    _container: HTMLElement,
    options: { onFrame: (screenPoints: CycleWorldScreenPoints) => void },
  ) => {
    const screenPoints = Object.fromEntries(
      points.map((point, index) => [point, { x: 80 + index * 100, y: 180, visible: true }]),
    ) as CycleWorldScreenPoints;
    options.onFrame(screenPoints);
    return {
      dispose: vi.fn(),
      setHighlighted: vi.fn(),
      setPointer: vi.fn(),
    };
  },
}));

const content = {
  solution: {
    nodes: Object.fromEntries(
      points.map((point) => [
        point,
        {
          title: point === "consulting" ? "Leaftronics" : point,
          label: point,
          problem: `${point} problem`,
          solution: `${point} solution`,
          next: point === "consulting" ? "Routing prüfen" : `${point} öffnen`,
        },
      ]),
    ),
  },
} as unknown as LandingCopy;

const matchMedia = (touch: boolean) =>
  vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
    matches: touch && (query.includes("hover: none") || query.includes("pointer: coarse")),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

const setup = () => {
  const setActivePoint = vi.fn();
  const chooseRole = vi.fn();
  const jumpTo = vi.fn();

  render(
    <CyclePrototypeMap
      content={content}
      activePoint="oem"
      setActivePoint={setActivePoint}
      chooseRole={chooseRole}
      jumpTo={jumpTo}
    />,
  );

  return { chooseRole, jumpTo, setActivePoint };
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("CyclePrototypeMap", () => {
  it("shows station information on hover", () => {
    matchMedia(false);
    setup();

    fireEvent.mouseEnter(screen.getByRole("button", { name: "Leaftronics: Routing prüfen" }));

    expect(screen.getByText("consulting problem")).toBeInTheDocument();
    expect(screen.getByText("consulting solution")).toBeInTheDocument();
  });

  it("opens the matching dashboard on pointer devices", () => {
    matchMedia(false);
    const { chooseRole, jumpTo } = setup();

    fireEvent.click(screen.getByRole("button", { name: "Leaftronics: Routing prüfen" }));

    expect(chooseRole).toHaveBeenCalledWith("partner");
    expect(jumpTo).toHaveBeenCalledWith("demos");
  });

  it("shows information before opening a dashboard on touch devices", () => {
    matchMedia(true);
    const { chooseRole, jumpTo } = setup();
    const station = screen.getByRole("button", { name: "Leaftronics: Routing prüfen" });

    fireEvent.click(station);
    expect(screen.getByText("consulting problem")).toBeInTheDocument();
    expect(chooseRole).not.toHaveBeenCalled();

    fireEvent.click(station);
    expect(chooseRole).toHaveBeenCalledWith("partner");
    expect(jumpTo).toHaveBeenCalledWith("demos");
  });
});
