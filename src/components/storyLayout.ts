export const STORY_PRODUCT_KEYFRAMES = {
  pitch: [0.04, 0.66, 0.16, -1.42, 0.26, 0.04, 0, 0],
  scale: [0.78, 1.08, 1.12, 0.9, 1.12, 0.72, 0.78, 0.88],
  x: [2, -4.25, 3.4, -3, 3.5, -2.5, 3.4, -3.6],
  yaw: [-0.34, -0.58, -1.02, 1.45, -1.58, -0.12, -0.08, -0.18],
  z: [0, 0, 0, 0, 0, -0.2, -1.8, -1.4],
} as const;

export const getStoryProductThemeProgress = (progress: number) => {
  const transitionStart = 0.272;
  const transitionEnd = 0.3;
  const amount = Math.min(1, Math.max(0, (progress - transitionStart) / (transitionEnd - transitionStart)));
  return amount * amount * (3 - 2 * amount);
};

export const getStoryPanelPresentation = (progress: number, stepCount: number) => {
  if (stepCount <= 1) return { blend: 0, currentIndex: 0, nextIndex: 0 };

  const value = Math.min(1, Math.max(0, progress));
  const lastIndex = stepCount - 1;
  const finalStepStart = 1 - 0.4 / lastIndex;
  let previousBoundary = 0;

  for (let index = 0; index < lastIndex; index += 1) {
    const boundary = index === lastIndex - 1 ? finalStepStart : (index + 1) / lastIndex;
    if (value < boundary) {
      const interval = boundary - previousBoundary;
      const transitionWidth = Math.min(0.028, interval * 0.28);
      const amount = Math.min(1, Math.max(0, (value - (boundary - transitionWidth)) / transitionWidth));
      const blend = amount * amount * (3 - 2 * amount);
      return { blend, currentIndex: index, nextIndex: index + 1 };
    }
    previousBoundary = boundary;
  }

  return { blend: 0, currentIndex: lastIndex, nextIndex: lastIndex };
};

export const getStoryActiveIndex = (progress: number, stepCount: number) => {
  if (stepCount <= 1) return 0;

  const lastIndex = stepCount - 1;
  const finalStepStart = 1 - 0.4 / lastIndex;
  if (progress >= finalStepStart) return lastIndex;

  return Math.min(lastIndex, Math.floor(Math.max(0, progress) * lastIndex + 0.0005));
};
