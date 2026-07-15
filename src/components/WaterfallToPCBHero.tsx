import { Suspense, lazy, useCallback, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useElementVisibility } from "@/components/useScrollProgress";

const InteractivePCBModelScene = lazy(() =>
  import("@/components/InteractivePCBModelScene").then((module) => ({ default: module.InteractivePCBModelScene })),
);

interface WaterfallToPCBHeroProps {
  children: ReactNode;
  loadingLabel: string;
}

function HeroSceneFallback({ label, visible }: { label: string; visible: boolean }) {
  return (
    <div
      aria-hidden={!visible}
      aria-label={label}
      className={`hero-scene-fallback ${visible ? "is-visible" : "is-ready"}`}
      role="status"
    >
      <div className="hero-loader-stack">
        <div className="hero-loader-mark" aria-hidden="true">
          <span className="hero-loader-ring hero-loader-ring-outer" />
          <span className="hero-loader-ring hero-loader-ring-inner" />
          <img src="/leaftronics-logo-color.webp" alt="" className="hero-loader-logo" />
        </div>
        <span className="hero-loader-label">{label}</span>
        <span className="hero-loader-track" aria-hidden="true">
          <span />
        </span>
      </div>
    </div>
  );
}

export function WaterfallToPCBHero({ children, loadingLabel }: WaterfallToPCBHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const sceneVisible = useElementVisibility(sectionRef, true);
  const [sceneReady, setSceneReady] = useState(false);
  const handleSceneReady = useCallback(() => setSceneReady(true), []);

  return (
    <section ref={sectionRef} className="landing-hero-shell relative isolate min-h-[96svh] overflow-hidden bg-[#f8fbf6] text-foreground">
      <div className="landing-hero-stage relative min-h-[96svh] overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(145deg,hsl(90_42%_98%)_0%,hsl(142_50%_96%)_42%,hsl(0_0%_100%)_100%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-[18vw] -top-32 z-[1] h-[38rem] w-[72vw] rotate-[-12deg] rounded-[5rem] bg-[linear-gradient(115deg,hsl(145_72%_52%/.34),hsl(91_90%_62%/.22)_48%,transparent_78%)] blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-[22vw] bottom-[-14rem] z-[1] h-[34rem] w-[74vw] rotate-[10deg] rounded-[5rem] bg-[linear-gradient(70deg,hsl(160_62%_42%/.24),hsl(126_68%_78%/.34)_58%,transparent_86%)] blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] opacity-[0.18] [background-image:linear-gradient(90deg,hsl(146_42%_28%/.36)_1px,transparent_1px),linear-gradient(0deg,hsl(146_42%_28%/.28)_1px,transparent_1px)] [background-size:68px_68px]"
        />
        <div className="pointer-events-none absolute inset-0 z-[2]">
          <HeroSceneFallback label={loadingLabel} visible={!sceneReady} />
          <div className={`hero-scene-canvas ${sceneReady ? "is-ready" : ""}`}>
            <Suspense fallback={null}>
              {sceneVisible ? <InteractivePCBModelScene onReady={handleSceneReady} /> : null}
            </Suspense>
          </div>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[3] bg-[linear-gradient(180deg,hsl(0_0%_100%/.42)_0%,transparent_28%,hsl(98_52%_96%/.34)_100%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[4] bg-[linear-gradient(118deg,transparent_0%,hsl(142_75%_48%/.14)_54%,transparent_78%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-[5] w-[min(56rem,84vw)] bg-gradient-to-r from-white/54 via-white/18 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-52 bg-gradient-to-b from-transparent via-white/58 to-white"
        />
        <div className="relative z-10 min-h-[96svh]">{children}</div>
      </div>
    </section>
  );
}
