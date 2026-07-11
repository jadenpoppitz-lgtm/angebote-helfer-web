import { useEffect, useState } from "react";
import type { RefObject } from "react";

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export function useScrollProgress<T extends HTMLElement>(targetRef: RefObject<T>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    let lastProgress = -1;

    const update = () => {
      frame = 0;
      const target = targetRef.current;
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const viewportHeight = Math.max(window.innerHeight, 1);
      const scrollableDistance = Math.max(rect.height - viewportHeight, 1);
      const nextProgress = clamp01(-rect.top / scrollableDistance);

      if (Math.abs(nextProgress - lastProgress) > 0.0002) {
        lastProgress = nextProgress;
        setProgress(nextProgress);
      }
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [targetRef]);

  return progress;
}

export function useElementVisibility<T extends Element>(
  targetRef: RefObject<T>,
  initialVisible = false,
  rootMargin = "0px",
) {
  const [visible, setVisible] = useState(initialVisible);

  useEffect(() => {
    const target = targetRef.current;
    if (!target || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin,
      threshold: 0.01,
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [rootMargin, targetRef]);

  return visible;
}
