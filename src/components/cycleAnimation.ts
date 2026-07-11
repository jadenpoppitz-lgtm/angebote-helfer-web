const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const smoothStep = (value: number, start: number, end: number) => {
  const progress = clamp01((value - start) / Math.max(end - start, Number.EPSILON));
  return progress * progress * (3 - 2 * progress);
};

export const getCycleRoutePhase = (elapsed: number, duration: number, delay: number) => {
  const safeDuration = Math.max(duration, Number.EPSILON);
  const phase = elapsed / safeDuration + delay / safeDuration;
  return ((phase % 1) + 1) % 1;
};

export const getCycleRouteEnvelope = (phase: number) => {
  const normalizedPhase = ((phase % 1) + 1) % 1;
  const fadeIn = smoothStep(normalizedPhase, 0.02, 0.16);
  const fadeOut = 1 - smoothStep(normalizedPhase, 0.8, 0.98);
  return fadeIn * fadeOut;
};

export const getCycleSegmentProgress = (phase: number, start: number, end: number) => smoothStep(clamp01(phase), start, end);

export const getCycleWindowEnvelope = (
  phase: number,
  fadeInStart: number,
  fadeInEnd: number,
  fadeOutStart: number,
  fadeOutEnd: number,
) => {
  const normalizedPhase = clamp01(phase);
  return (
    smoothStep(normalizedPhase, fadeInStart, fadeInEnd) *
    (1 - smoothStep(normalizedPhase, fadeOutStart, fadeOutEnd))
  );
};
