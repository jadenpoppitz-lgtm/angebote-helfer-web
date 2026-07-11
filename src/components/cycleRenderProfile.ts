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
  const constrainedHardware = deviceMemory <= 4 || hardwareConcurrency <= 4;
  const efficient = reducedMotion || constrainedHardware || compactScreen;

  return {
    antialias: !efficient,
    efficient,
    pixelRatioCap: efficient ? (compactScreen && devicePixelRatio <= 2 ? 1.2 : 1.15) : 1.65,
    shadows: !efficient,
    targetFps: reducedMotion ? 12 : constrainedHardware ? 30 : compactScreen ? 45 : 60,
  };
};
