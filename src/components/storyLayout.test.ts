import { describe, expect, it } from "vitest";
import {
  getStoryActiveIndex,
  getStoryPanelPresentation,
  getStoryProductCompletion,
  getStoryProductPresentation,
  getStoryProductStepWeight,
  getStoryProductThemeProgress,
  sampleStoryProductKeyframes,
  STORY_PROBLEM_TRANSITIONS,
  STORY_PRODUCT_KEYFRAMES,
} from "@/components/storyLayout";

describe("story layout safety", () => {
  it("keeps alternating desktop shots inside their visual side", () => {
    STORY_PRODUCT_KEYFRAMES.x.forEach((x, index) => {
      expect(Math.sign(x)).toBe(index % 2 === 0 ? 1 : -1);
      expect(Math.abs(x)).toBeGreaterThanOrEqual(index === 0 ? 2 : 2.25);
      expect(Math.abs(x)).toBeLessThanOrEqual(2.55);
    });
    expect(STORY_PRODUCT_KEYFRAMES.scale[0]).toBeLessThanOrEqual(0.84);
    expect(Math.max(...STORY_PRODUCT_KEYFRAMES.scale)).toBeLessThanOrEqual(1.04);
    expect(STORY_PRODUCT_KEYFRAMES.scale[5]).toBeLessThanOrEqual(0.56);
    expect(STORY_PRODUCT_KEYFRAMES.pitch[3]).toBeCloseTo(-0.72, 5);
  });

  it("moves separated recovery parts away from the camera", () => {
    expect(STORY_PRODUCT_KEYFRAMES.z.at(-2)).toBeLessThanOrEqual(-1.4);
    expect(STORY_PRODUCT_KEYFRAMES.z.at(-1)).toBeLessThanOrEqual(-1.4);
  });

  it("gives the final story step a visible scroll interval", () => {
    expect(getStoryActiveIndex(0.95, 11)).toBe(9);
    expect(getStoryActiveIndex(0.96, 11)).toBe(10);
    expect(getStoryActiveIndex(1, 11)).toBe(10);
  });

  it("finishes the light theme before the first product panel appears", () => {
    expect(getStoryProductThemeProgress(0.255)).toBe(0);
    expect(getStoryProductThemeProgress(0.2775)).toBeCloseTo(0.5, 5);
    expect(getStoryProductThemeProgress(0.3)).toBe(1);
  });

  it("crossfades adjacent panels directly from scroll progress", () => {
    expect(getStoryPanelPresentation(0.05, 11)).toMatchObject({ blend: 0, currentIndex: 0, nextIndex: 1 });
    expect(getStoryPanelPresentation(0.0775, 11)).toMatchObject({ currentIndex: 0, nextIndex: 1 });
    expect(getStoryPanelPresentation(0.0775, 11).blend).toBeCloseTo(0.5, 5);
    expect(getStoryPanelPresentation(0.1, 11)).toMatchObject({ blend: 0, currentIndex: 1, nextIndex: 2 });
    expect(getStoryPanelPresentation(0.2775, 11).blend).toBeCloseTo(0.5, 5);
    expect(getStoryPanelPresentation(0.96, 11)).toMatchObject({ blend: 0, currentIndex: 10, nextIndex: 10 });
  });

  it("holds product shots steady until the matching title handoff", () => {
    expect(sampleStoryProductKeyframes(0.05, STORY_PRODUCT_KEYFRAMES.x)).toBe(STORY_PRODUCT_KEYFRAMES.x[0]);
    expect(sampleStoryProductKeyframes(1 / 7, STORY_PRODUCT_KEYFRAMES.x)).toBe(STORY_PRODUCT_KEYFRAMES.x[1]);
    expect(sampleStoryProductKeyframes(0.2, STORY_PRODUCT_KEYFRAMES.x)).toBe(STORY_PRODUCT_KEYFRAMES.x[1]);
    expect(sampleStoryProductKeyframes(33 / 35, STORY_PRODUCT_KEYFRAMES.x)).toBe(
      STORY_PRODUCT_KEYFRAMES.x[7],
    );
  });

  it("uses one blend for product shots and their effects", () => {
    const midpoint = 0.11071428571428571;
    expect(getStoryProductPresentation(midpoint)).toMatchObject({ currentIndex: 0, nextIndex: 1 });
    expect(getStoryProductPresentation(midpoint).blend).toBeCloseTo(0.5, 5);
    expect(getStoryProductStepWeight(midpoint, 0)).toBeCloseTo(0.5, 5);
    expect(getStoryProductStepWeight(midpoint, 1)).toBeCloseTo(0.5, 5);
    expect(getStoryProductCompletion(midpoint, 1)).toBeCloseTo(0.5, 5);
    expect(getStoryProductCompletion(0.2, 1)).toBe(1);
    expect(getStoryProductCompletion(0.2, 2)).toBe(0);
  });

  it("keeps the shortened final title and product shot transition synchronized", () => {
    const globalMidpoint = 0.9465;
    const productMidpoint = (globalMidpoint - 0.3) / 0.7;

    expect(getStoryPanelPresentation(globalMidpoint, 11)).toMatchObject({ currentIndex: 9, nextIndex: 10 });
    expect(getStoryPanelPresentation(globalMidpoint, 11).blend).toBeCloseTo(0.5, 5);
    expect(getStoryProductPresentation(productMidpoint)).toMatchObject({ currentIndex: 6, nextIndex: 7 });
    expect(getStoryProductPresentation(productMidpoint).blend).toBeCloseTo(0.5, 5);
  });

  it("aligns problem choreography with the three panel handoffs", () => {
    expect(STORY_PROBLEM_TRANSITIONS.collection[0] * 0.3).toBeCloseTo(0.055, 5);
    expect(STORY_PROBLEM_TRANSITIONS.collection[1] * 0.3).toBeCloseTo(0.1, 5);
    expect(STORY_PROBLEM_TRANSITIONS.data[0] * 0.3).toBeCloseTo(0.155, 5);
    expect(STORY_PROBLEM_TRANSITIONS.data[1] * 0.3).toBeCloseTo(0.2, 5);
    expect(STORY_PROBLEM_TRANSITIONS.product[0] * 0.3).toBeCloseTo(0.255, 5);
  });
});
