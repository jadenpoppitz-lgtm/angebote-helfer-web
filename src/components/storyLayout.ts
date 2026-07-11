export const STORY_PRODUCT_START = 0.3;
export const STORY_PANEL_TRANSITION_WIDTH = 0.045;
const STORY_TRANSITION_INTERVAL_RATIO = 0.45;
const STORY_PROBLEM_TRANSITION_WIDTH = STORY_PANEL_TRANSITION_WIDTH / STORY_PRODUCT_START;

export const STORY_PROBLEM_TRANSITIONS = {
  collection: [1 / 3 - STORY_PROBLEM_TRANSITION_WIDTH, 1 / 3],
  data: [2 / 3 - STORY_PROBLEM_TRANSITION_WIDTH, 2 / 3],
  product: [1 - STORY_PROBLEM_TRANSITION_WIDTH, 1],
} as const;

export const STORY_PRODUCT_KEYFRAMES = {
  pitch: [0.04, 0.44, 0.12, -0.72, 0.14, 0, 0, 0.02],
  scale: [0.82, 0.94, 1, 0.94, 1.04, 0.56, 0.78, 0.86],
  x: [2.1, -2.55, 2.5, -2.4, 2.55, -2.25, 2.5, -2.5],
  yaw: [-0.34, -0.44, -0.56, 0.05, -0.64, 0, -0.05, -0.12],
  z: [0, 0, 0, 0, 0, 0.08, -1.5, -1.4],
} as const;

const STORY_PRODUCT_STEP_PROGRESS = [0, 1 / 7, 2 / 7, 3 / 7, 4 / 7, 5 / 7, 6 / 7, 33 / 35] as const;

export function getStoryProductPresentation(progress: number) {
  const value = Math.min(1, Math.max(0, progress));
  const lastIndex = STORY_PRODUCT_STEP_PROGRESS.length - 1;

  const maximumTransitionWidth = STORY_PANEL_TRANSITION_WIDTH / (1 - STORY_PRODUCT_START);
  for (let index = 0; index < lastIndex; index += 1) {
    const boundary = STORY_PRODUCT_STEP_PROGRESS[index + 1];
    if (value < boundary) {
      const interval = boundary - STORY_PRODUCT_STEP_PROGRESS[index];
      const transitionWidth = Math.min(maximumTransitionWidth, interval * STORY_TRANSITION_INTERVAL_RATIO);
      const transitionStart = boundary - transitionWidth;
      const amount = Math.min(1, Math.max(0, (value - transitionStart) / (boundary - transitionStart)));
      const blend = amount * amount * (3 - 2 * amount);
      return { blend, currentIndex: index, nextIndex: index + 1 };
    }
  }

  return { blend: 0, currentIndex: lastIndex, nextIndex: lastIndex };
}

export function getStoryProductStepWeight(progress: number | undefined, index: number) {
  if (progress === undefined) return 0;
  const presentation = getStoryProductPresentation(progress);
  if (index === presentation.currentIndex) return 1 - presentation.blend;
  if (index === presentation.nextIndex) return presentation.blend;
  return 0;
}

export function getStoryProductCompletion(progress: number | undefined, index: number) {
  if (progress === undefined) return 0;
  const presentation = getStoryProductPresentation(progress);
  if (presentation.currentIndex >= index) return 1;
  if (presentation.nextIndex === index) return presentation.blend;
  return 0;
}

export function sampleStoryProductKeyframes(progress: number, values: readonly number[]) {
  if (values.length === 0) return 0;
  const presentation = getStoryProductPresentation(progress);
  const currentIndex = Math.min(values.length - 1, presentation.currentIndex);
  const nextIndex = Math.min(values.length - 1, presentation.nextIndex);
  return values[currentIndex] + (values[nextIndex] - values[currentIndex]) * presentation.blend;
}

export const getStoryProductThemeProgress = (progress: number) => {
  const transitionStart = STORY_PRODUCT_START - STORY_PANEL_TRANSITION_WIDTH;
  const transitionEnd = STORY_PRODUCT_START;
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
      const transitionWidth = Math.min(
        STORY_PANEL_TRANSITION_WIDTH,
        interval * STORY_TRANSITION_INTERVAL_RATIO,
      );
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
