export type CycleRenderProfileInput = {
  compactScreen: boolean;
  deviceMemory: number;
  devicePixelRatio: number;
  hardwareConcurrency: number;
  reducedMotion: boolean;
};

export type CycleRenderProfile = {
  antialias: boolean;
  efficient: boolean;
  pixelRatioCap: number;
  shadows: boolean;
  targetFps: number;
};

export const selectCycleRenderProfile = ({
  compactScreen,
  deviceMemory,
  devicePixelRatio,
  hardwareConcurrency,
  reducedMotion,
}: CycleRenderProfileInput): CycleRenderProfile => {
  const efficient =
    reducedMotion || deviceMemory <= 4 || hardwareConcurrency <= 4 || (compactScreen && devicePixelRatio > 2);

  return {
    antialias: !efficient,
    efficient,
    pixelRatioCap: efficient ? 1.15 : 1.65,
    shadows: !efficient,
    targetFps: reducedMotion ? 12 : efficient ? 30 : 60,
  };
};
