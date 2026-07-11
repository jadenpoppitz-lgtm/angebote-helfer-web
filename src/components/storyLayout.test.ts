import { describe, expect, it } from "vitest";
import {
  getStoryActiveIndex,
  getStoryPanelPresentation,
  getStoryProductThemeProgress,
  STORY_PRODUCT_KEYFRAMES,
} from "@/components/storyLayout";

describe("story layout safety", () => {
  it("keeps alternating desktop shots inside their visual side", () => {
    STORY_PRODUCT_KEYFRAMES.x.forEach((x, index) => {
      expect(Math.sign(x)).toBe(index % 2 === 0 ? 1 : -1);
      expect(Math.abs(x)).toBeGreaterThanOrEqual(index === 0 ? 1.8 : 2.5);
    });
    expect(STORY_PRODUCT_KEYFRAMES.scale[0]).toBeLessThanOrEqual(0.8);
    expect(Math.max(...STORY_PRODUCT_KEYFRAMES.scale)).toBeLessThanOrEqual(1.12);
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
    expect(getStoryProductThemeProgress(0.272)).toBe(0);
    expect(getStoryProductThemeProgress(0.286)).toBeCloseTo(0.5, 5);
    expect(getStoryProductThemeProgress(0.3)).toBe(1);
  });

  it("crossfades adjacent panels directly from scroll progress", () => {
    expect(getStoryPanelPresentation(0.05, 11)).toMatchObject({ blend: 0, currentIndex: 0, nextIndex: 1 });
    expect(getStoryPanelPresentation(0.086, 11)).toMatchObject({ currentIndex: 0, nextIndex: 1 });
    expect(getStoryPanelPresentation(0.086, 11).blend).toBeCloseTo(0.5, 5);
    expect(getStoryPanelPresentation(0.1, 11)).toMatchObject({ blend: 0, currentIndex: 1, nextIndex: 2 });
    expect(getStoryPanelPresentation(0.286, 11).blend).toBeCloseTo(0.5, 5);
    expect(getStoryPanelPresentation(0.96, 11)).toMatchObject({ blend: 0, currentIndex: 10, nextIndex: 10 });
  });
});
