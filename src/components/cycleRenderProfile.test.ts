import { describe, expect, it } from "vitest";
import { selectCycleRenderProfile } from "@/components/cycleRenderProfile";

describe("selectCycleRenderProfile", () => {
  it("uses the efficient profile on low-memory devices", () => {
    expect(
      selectCycleRenderProfile({
        compactScreen: false,
        deviceMemory: 4,
        devicePixelRatio: 1,
        hardwareConcurrency: 8,
        reducedMotion: false,
      }),
    ).toEqual({ antialias: false, efficient: true, pixelRatioCap: 1.15, shadows: false, targetFps: 30 });
  });

  it("uses a stable efficient profile on compact screens", () => {
    expect(
      selectCycleRenderProfile({
        compactScreen: true,
        deviceMemory: 8,
        devicePixelRatio: 1,
        hardwareConcurrency: 8,
        reducedMotion: false,
      }),
    ).toEqual({ antialias: false, efficient: true, pixelRatioCap: 1.2, shadows: false, targetFps: 45 });
  });

  it("limits reduced motion to a static-friendly refresh rate", () => {
    expect(
      selectCycleRenderProfile({
        compactScreen: false,
        deviceMemory: 8,
        devicePixelRatio: 1,
        hardwareConcurrency: 8,
        reducedMotion: true,
      }).targetFps,
    ).toBe(12);
  });

  it("keeps the quality profile on capable devices", () => {
    expect(
      selectCycleRenderProfile({
        compactScreen: false,
        deviceMemory: 8,
        devicePixelRatio: 2,
        hardwareConcurrency: 8,
        reducedMotion: false,
      }),
    ).toEqual({ antialias: true, efficient: false, pixelRatioCap: 1.65, shadows: true, targetFps: 60 });
  });
});
