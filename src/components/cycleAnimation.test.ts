import { describe, expect, it } from "vitest";
import {
  getCycleRouteEnvelope,
  getCycleRoutePhase,
  getCycleRouteTravelProgress,
  getCycleSegmentProgress,
  getCycleWindowEnvelope,
} from "@/components/cycleAnimation";

describe("cycle route animation", () => {
  it("wraps route progress without exposing the reset", () => {
    expect(getCycleRouteEnvelope(0)).toBe(0);
    expect(getCycleRouteEnvelope(0.999)).toBe(0);
    expect(getCycleRouteEnvelope(0.5)).toBe(1);
  });

  it("keeps both sides of the loop boundary visually hidden", () => {
    expect(getCycleRouteEnvelope(0.01)).toBeLessThan(0.02);
    expect(getCycleRouteEnvelope(0.99)).toBeLessThan(0.02);
  });

  it("finishes packet travel before fading at the route handoff", () => {
    expect(getCycleRouteTravelProgress(0.04)).toBe(0);
    expect(getCycleRouteTravelProgress(0.47)).toBeCloseTo(0.5);
    expect(getCycleRouteTravelProgress(0.9)).toBe(1);
  });

  it("normalizes delayed and negative phases", () => {
    expect(getCycleRoutePhase(12, 6, 0)).toBe(0);
    expect(getCycleRoutePhase(-1, 4, 0)).toBeCloseTo(0.75);
    expect(getCycleRoutePhase(1, 4, 1)).toBeCloseTo(0.5);
  });

  it("creates eased process segments with stable holds", () => {
    expect(getCycleSegmentProgress(0.1, 0.2, 0.4)).toBe(0);
    expect(getCycleSegmentProgress(0.3, 0.2, 0.4)).toBeCloseTo(0.5);
    expect(getCycleSegmentProgress(0.7, 0.2, 0.4)).toBe(1);
  });

  it("fades process objects in and out before a timeline resets", () => {
    expect(getCycleWindowEnvelope(0, 0.05, 0.15, 0.75, 0.9)).toBe(0);
    expect(getCycleWindowEnvelope(0.5, 0.05, 0.15, 0.75, 0.9)).toBe(1);
    expect(getCycleWindowEnvelope(1, 0.05, 0.15, 0.75, 0.9)).toBe(0);
  });
});
