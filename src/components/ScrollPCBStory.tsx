import { lazy, Suspense, useMemo, useRef } from "react";
import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import {
  CircuitBoard,
  Database,
  FlaskConical,
  Layers,
  PackageOpen,
  RefreshCcw,
  Route,
  Shuffle,
} from "lucide-react";
import type { Language } from "@/lib/i18n";
import { getStoryPanelPresentation, getStoryProductThemeProgress } from "@/components/storyLayout";
import { useElementVisibility, useScrollProgress } from "@/components/useScrollProgress";

const InteractivePCBModelScene = lazy(() =>
  import("@/components/InteractivePCBModelScene").then((module) => ({ default: module.InteractivePCBModelScene })),
);

type ProblemCopy = {
  eyebrow: string;
  title: string;
  text: string;
  tiles: Array<{ title: string; text: string }>;
};

type StoryStep = {
  callouts: string[];
  eyebrow: string;
  icon: LucideIcon;
  side: "left" | "right";
  text: string;
  title: string;
  type: "problem" | "product";
};

type ProductStepCopy = Omit<StoryStep, "icon" | "side" | "type">;

function StoryStepPanel({
  dominant,
  index,
  offsetRem,
  opacity,
  step,
}: {
  dominant: boolean;
  index: number;
  offsetRem: number;
  opacity: number;
  step: StoryStep;
}) {
  const Icon = step.icon;
  const isProblem = step.type === "problem";
  const displayNumber = isProblem ? index + 1 : index - 2;
  const contentSide = step.side === "left" ? "lg:col-start-1" : "lg:col-start-2";
  const style: CSSProperties = {
    gridRow: 1,
    opacity,
    transform: `translate3d(0, ${offsetRem}rem, 0)`,
    visibility: opacity <= 0.001 ? "hidden" : "visible",
    zIndex: dominant ? 2 : 1,
  };

  return (
    <div
      aria-hidden="true"
      className={`story-step-content story-step-content-${step.side} story-step-content-${
        isProblem ? "problem" : "product"
      } story-step-content-active story-step-content-scroll ${contentSide} max-w-xl ${
        isProblem ? "text-white" : "text-emerald-950"
      }`}
      data-story-index={index}
      style={style}
    >
      <div className="flex items-center gap-4">
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border ${
            isProblem
              ? "border-white/22 bg-white/8 text-emerald-200"
              : "border-emerald-900/14 bg-emerald-900/6 text-emerald-700"
          }`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <span className="font-mono text-xs font-semibold tracking-[0.22em] opacity-55">
          {String(displayNumber).padStart(2, "0")}
        </span>
      </div>
      <p
        className={`story-step-eyebrow mt-4 text-[10px] font-semibold uppercase tracking-[0.22em] sm:mt-6 sm:text-xs sm:tracking-[0.28em] ${
          isProblem ? "text-emerald-300" : "text-emerald-700"
        }`}
      >
        {step.eyebrow}
      </p>
      <h2 className="story-step-title mt-3 font-display text-[1.7rem] font-semibold leading-[1.08] sm:mt-4 sm:text-4xl lg:text-5xl">
        {step.title}
      </h2>
      <p
        className={`story-step-description mt-3 max-w-lg text-sm leading-6 sm:mt-5 sm:text-base sm:leading-8 ${
          isProblem ? "text-white/72" : "text-emerald-950/68"
        }`}
      >
        {step.text}
      </p>
      <div className="story-step-mobile-callouts mt-4 flex flex-wrap gap-2 sm:mt-5">
        {step.callouts.map((callout) => (
          <span
            key={callout}
            className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] backdrop-blur-xl ${
              isProblem
                ? "border-white/15 bg-white/8 text-white/72"
                : "border-emerald-950/12 bg-white/55 text-emerald-950/66"
            }`}
          >
            {callout}
          </span>
        ))}
      </div>
    </div>
  );
}

const productIcons: LucideIcon[] = [Layers, Layers, Route, CircuitBoard, CircuitBoard, FlaskConical, PackageOpen, RefreshCcw];

const productStoryCopy: Record<Language, ProductStepCopy[]> = {
  de: [
    {
      eyebrow: "Vom natürlichen Gerüst zum technischen Substrat",
      title: "Das Trägermaterial neu gedacht.",
      text: "Eine faserige, organische Struktur bildet die Basis. Sie bleibt sichtbar, leicht und materialbewusst statt als anonyme schwarze Trägerplatte zu verschwinden.",
      callouts: ["Faserstruktur", "Organisches Gerüst"],
    },
    {
      eyebrow: "Vom natürlichen Gerüst zum technischen Substrat",
      title: "Ein stabiles Substrat für elektronische Anwendungen.",
      text: "Eine lösbare Polymermatrix stabilisiert das Gerüst mechanisch. Die Schicht macht aus dem Material eine belastbare Plattform für Elektronik.",
      callouts: ["Polymermatrix", "Mechanische Stabilität"],
    },
    {
      eyebrow: "Stabil genug für Elektronik",
      title: "Leiterbahnen, Lötstellen und elektrische Funktion bleiben erhalten.",
      text: "Kupferne Leiterbahnen werden präzise aufgebracht. Die elektrische Funktion bleibt klassischer PCB-Logik nahe, während das Substrat neu gedacht ist.",
      callouts: ["Kupferleiterbahn", "Lötstelle"],
    },
    {
      eyebrow: "Stabil genug für Elektronik",
      title: "Stabil während Herstellung und Nutzung.",
      text: "Chips, Widerstände, Kondensatoren und Kontakte sitzen auf der Platte. Das Modul wirkt wie echte, funktionsfähige Elektronik.",
      callouts: ["Chips & Widerstände", "Kontakte"],
    },
    {
      eyebrow: "Designed for Disassembly",
      title: "Für moderne Elektronik entwickelt.",
      text: "Im Produkt bleibt die Leiterplatte belastbar. Energie- und Datenlinien zeigen: Die neue Materiallogik ersetzt nicht Funktion, sondern ermöglicht ihren Kreislauf.",
      callouts: ["Energie & Daten", "Belastbares Modul"],
    },
    {
      eyebrow: "Designed for Disassembly",
      title: "Am Lebensende gezielt lösbar.",
      text: "In einer kontrollierten Lösung gibt das Substrat nach. Bauteile und Metalle bleiben erhalten, statt im Verbund untrennbar verloren zu gehen.",
      callouts: ["Kontrollierte Lösung", "Lösbares Substrat"],
    },
    {
      eyebrow: "Wertstoffe zurück in den Kreislauf",
      title: "Wertstoffe werden sortenreiner zurückgewonnen.",
      text: "Bauteile, Kupfer, Edelmetalle und Substrat trennen sich in erkennbare Materialströme. Genau hier entsteht der Unterschied zur klassischen Leiterplatte.",
      callouts: ["Bauteile", "Kupfer", "Substrat"],
    },
    {
      eyebrow: "Eine neue Materiallogik für Elektronik",
      title: "Elektronik für die Kreislaufwirtschaft.",
      text: "Metalle gehen zurück in die Produktion, Bauteile können geprüft werden, das Substrat wird abgebaut. Der Kreislauf wird zur Designentscheidung.",
      callouts: ["Rückführung", "Neue Produktion"],
    },
  ],
  en: [
    {
      eyebrow: "From natural structure to technical substrate",
      title: "Rethinking the carrier material.",
      text: "A fibrous organic structure forms the basis. It remains visible, lightweight and material-conscious instead of disappearing into an anonymous black board.",
      callouts: ["Fibrous structure", "Organic framework"],
    },
    {
      eyebrow: "From natural structure to technical substrate",
      title: "A stable substrate for electronic applications.",
      text: "A separable polymer matrix mechanically stabilizes the structure and turns the material into a robust platform for electronics.",
      callouts: ["Polymer matrix", "Mechanical stability"],
    },
    {
      eyebrow: "Stable enough for electronics",
      title: "Traces, solder joints and electrical function remain intact.",
      text: "Copper traces are applied precisely. Electrical function stays close to conventional PCB logic while the substrate is redesigned.",
      callouts: ["Copper trace", "Solder joint"],
    },
    {
      eyebrow: "Stable enough for electronics",
      title: "Stable through manufacturing and use.",
      text: "Chips, resistors, capacitors and contacts sit on the board. The module behaves like real, functional electronics.",
      callouts: ["Chips & resistors", "Contacts"],
    },
    {
      eyebrow: "Designed for disassembly",
      title: "Built for modern electronics.",
      text: "The circuit board remains robust inside the product. Power and data lines show that the new material logic preserves function while enabling circularity.",
      callouts: ["Power & data", "Robust module"],
    },
    {
      eyebrow: "Designed for disassembly",
      title: "Deliberately separable at end of life.",
      text: "In a controlled solution, the substrate releases. Components and metals remain intact instead of becoming inseparably trapped in the composite.",
      callouts: ["Controlled solution", "Separable substrate"],
    },
    {
      eyebrow: "Returning valuable materials to the loop",
      title: "Valuable materials are recovered in cleaner fractions.",
      text: "Components, copper, precious metals and substrate separate into recognizable material streams. This is where the design differs from a conventional circuit board.",
      callouts: ["Components", "Copper", "Substrate"],
    },
    {
      eyebrow: "A new material logic for electronics",
      title: "Electronics for the circular economy.",
      text: "Metals return to production, components can be tested and the substrate is broken down. Circularity becomes a design decision.",
      callouts: ["Return flow", "New production"],
    },
  ],
  zh: [
    {
      eyebrow: "从天然结构到技术基材",
      title: "重新思考载体材料。",
      text: "纤维状有机结构构成基础。它保持可见、轻量且体现材料属性，而不是消失在匿名的黑色基板中。",
      callouts: ["纤维结构", "有机骨架"],
    },
    {
      eyebrow: "从天然结构到技术基材",
      title: "适用于电子应用的稳定基材。",
      text: "可分离的聚合物基体在机械上稳定这一结构，使材料成为可靠的电子平台。",
      callouts: ["聚合物基体", "机械稳定性"],
    },
    {
      eyebrow: "足够稳定，可用于电子产品",
      title: "线路、焊点和电气功能保持完整。",
      text: "铜线路被精确施加。电气功能接近传统 PCB 逻辑，同时基材得到重新设计。",
      callouts: ["铜线路", "焊点"],
    },
    {
      eyebrow: "足够稳定，可用于电子产品",
      title: "在制造和使用期间保持稳定。",
      text: "芯片、电阻、电容和触点安装在板上，模块具备真实、可运行的电子功能。",
      callouts: ["芯片与电阻", "触点"],
    },
    {
      eyebrow: "为拆解而设计",
      title: "为现代电子产品而开发。",
      text: "电路板在产品内部保持可靠。电源和数据线路表明，新材料逻辑保留功能并支持循环利用。",
      callouts: ["电源与数据", "可靠模块"],
    },
    {
      eyebrow: "为拆解而设计",
      title: "在寿命终点可有针对性地分离。",
      text: "在受控溶液中，基材会释放。元器件和金属得以保留，不再不可分离地困在复合结构中。",
      callouts: ["受控溶液", "可分离基材"],
    },
    {
      eyebrow: "让高价值材料回到循环",
      title: "以更纯净的材料组分进行回收。",
      text: "元器件、铜、贵金属和基材分离成清晰可辨的材料流，这正是它与传统电路板的区别。",
      callouts: ["元器件", "铜", "基材"],
    },
    {
      eyebrow: "电子产品的新材料逻辑",
      title: "面向循环经济的电子产品。",
      text: "金属回到生产，元器件可以被检测，基材得到分解。循环利用成为设计决策。",
      callouts: ["回流", "新生产"],
    },
  ],
};

const storyLabels: Record<Language, { problem: string; product: string }> = {
  de: { problem: "Das Problem", product: "Unser Produkt" },
  en: { problem: "The problem", product: "Our product" },
  zh: { problem: "问题", product: "我们的产品" },
};

const problemIcons: LucideIcon[] = [Route, Shuffle, Database];

const problemCalloutCopy: Record<Language, string[][]> = {
  de: [
    ["PCB-Verpackung", "Übersee-Transport"],
    ["Vermischte PCB-Stapel", "Verlorene Zuordnung"],
    ["Datenstrom gestört", "Material-ID verloren"],
  ],
  en: [
    ["PCB packaging", "Overseas transport"],
    ["Mixed PCB stacks", "Lost allocation"],
    ["Data stream disrupted", "Material ID lost"],
  ],
  zh: [
    ["PCB 包装", "跨境运输"],
    ["混合 PCB 堆", "归属丢失"],
    ["数据流中断", "材料 ID 丢失"],
  ],
};

const glitchCodeColumns = [
  "MAT_ID 0x4F2A\nTRACE CU_18\nBATCH EU-0726\nLINK ACTIVE\nCHECKSUM 91AC\nROUTE DE-HH-04\nOWNER OEM_17\nVALUE 038.4",
  "STREAM LOST\nOWNER NULL\nTRACE_ERR 404\nCu 38.4% ??\nROUTE UNKNOWN\nPACKET DROP\nRETRY 07/12\nCHAIN BROKEN",
  "0xA91F CRACK\nDATA_PACKET DROP\nORIGIN REDACTED\nVALUE ----\nESG_CHAIN FAIL\nSERIAL VOID\nRECOVERY 0%\nMAP CORRUPT",
  "SERIAL 18-C7\nMATERIAL MAP\nACCESS DENIED\nHASH 7F0C\nRECOVERY 0%\nCu TRACE LOST\nAu UNKNOWN\nLOT UNBOUND",
  "NODE EU-031\nOEM TOKEN 8A2F\nPASSPORT FAIL\nMASS BALANCE ??\nSCOPE_3 VOID\nTIMESTAMP LOST\nAUTH REVOKED\nLEDGER NULL",
  "BOM 42 ITEMS\nPART_ID ?????\nRETURN PATH --\nDATA_OWNER 0\nGRADE MIXED\nQUALITY LOST\nEXPORT FLAG 1\nREGION UNKNOWN",
  "SIGNATURE BAD\nCRC 81/ERROR\nMATERIAL Cu/Au\nSOURCE UNLINKED\nESG PROOF 0\nREPAIR LOG --\nCYCLE COUNT ??\nEND_OF_DATA",
  "TRACEABILITY\nSTATUS FAILED\nDEVICE 07-4C\nPASSPORT VOID\nSORT KEY NULL\nRECOVERY LOCK\nVALUE LEAK\nSTREAM RESET",
];

export function ScrollPCBStory({ language, problem }: { language: Language; problem: ProblemCopy }) {
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useScrollProgress(sectionRef);
  const sceneVisible = useElementVisibility(sectionRef, false, "75% 0px");
  const labels = storyLabels[language];
  const steps = useMemo<StoryStep[]>(() => {
    const problemSteps = problem.tiles.slice(0, 3).map((tile, index) => ({
      callouts: problemCalloutCopy[language][index] ?? [tile.title],
      eyebrow: index === 0 ? problem.eyebrow : problem.title,
      icon: problemIcons[index] ?? Database,
      side: (index % 2 === 0 ? "left" : "right") as "left" | "right",
      text: tile.text,
      title: tile.title,
      type: "problem" as const,
    }));
    const productSteps = productStoryCopy[language].map((step, index) => ({
      ...step,
      icon: productIcons[index] ?? CircuitBoard,
      side: (index % 2 === 0 ? "left" : "right") as "left" | "right",
      type: "product" as const,
    }));

    return [...problemSteps, ...productSteps];
  }, [language, problem]);
  const panelPresentation = getStoryPanelPresentation(progress, steps.length);
  const productThemeProgress = getStoryProductThemeProgress(progress);
  const problemActive = productThemeProgress < 0.5;
  const outgoingProgress = Math.min(1, panelPresentation.blend / 0.4);
  const incomingProgress = Math.min(1, Math.max(0, (panelPresentation.blend - 0.25) / 0.5));
  const outgoingContentOpacity = 1 - outgoingProgress * outgoingProgress * (3 - 2 * outgoingProgress);
  const incomingContentOpacity = incomingProgress * incomingProgress * (3 - 2 * incomingProgress);
  const panelEntries =
    panelPresentation.currentIndex === panelPresentation.nextIndex
      ? [{ contentOpacity: 1, dominant: true, index: panelPresentation.currentIndex, offsetRem: 0, opacity: 1 }]
      : [
          {
            contentOpacity: outgoingContentOpacity,
            dominant: panelPresentation.blend < 0.5,
            index: panelPresentation.currentIndex,
            offsetRem: panelPresentation.blend * -0.8,
            opacity: 1 - panelPresentation.blend,
          },
          {
            contentOpacity: incomingContentOpacity,
            dominant: panelPresentation.blend >= 0.5,
            index: panelPresentation.nextIndex,
            offsetRem: (1 - panelPresentation.blend) * 0.8,
            opacity: panelPresentation.blend,
          },
        ];
  const panelWeight = (index: number) => panelEntries.find((entry) => entry.index === index)?.opacity ?? 0;
  const storyRailProgress =
    steps.length <= 1
      ? 0
      : Math.min(
          1,
          Math.max(
            0,
            (panelPresentation.currentIndex +
              (panelPresentation.nextIndex - panelPresentation.currentIndex) * panelPresentation.blend) /
              (steps.length - 1),
          ),
        );
  const dataFieldOpacity = panelWeight(2) * (1 - productThemeProgress);
  const transitionSaturation =
    23 + productThemeProgress * 6 - 64 * productThemeProgress * (1 - productThemeProgress);
  const problemLabelOpacity = 1 - Math.min(1, productThemeProgress / 0.42);
  const productLabelOpacity = Math.min(1, Math.max(0, (productThemeProgress - 0.32) / 0.55));
  const storyBackgroundColor = `hsl(${150 - productThemeProgress * 45} ${transitionSaturation}% ${
    6 + productThemeProgress * 91
  }%)`;

  return (
    <section
      id="problem-story"
      ref={sectionRef}
      className="relative isolate"
      style={{ backgroundColor: storyBackgroundColor }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden" style={{ backgroundColor: storyBackgroundColor }}>
        <div
          aria-hidden
          className="absolute inset-0 [background-image:linear-gradient(90deg,rgba(78,128,95,.12)_1px,transparent_1px),linear-gradient(0deg,rgba(78,128,95,.1)_1px,transparent_1px)] [background-size:72px_72px]"
          style={{ opacity: 0.35 + productThemeProgress * 0.2 }}
        />
        <div
          aria-hidden
          className="absolute -right-[18vw] top-[8vh] h-[58vh] w-[66vw] rounded-full bg-emerald-400/15 blur-3xl"
          style={{ opacity: 0.3 + productThemeProgress * 0.5 }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 z-[2] h-[54%] lg:hidden"
          style={{
            background: problemActive
              ? "linear-gradient(to bottom, transparent 0%, rgba(12, 19, 16, 0.42) 42%, rgba(12, 19, 16, 0.86) 72%, #0c1310 100%)"
              : "linear-gradient(to bottom, transparent 0%, rgba(247, 250, 246, 0.28) 42%, rgba(247, 250, 246, 0.78) 72%, #f7faf6 100%)",
          }}
        />

        {panelEntries.map((entry) => {
          const step = steps[entry.index];
          return (
            <div
              key={`backdrop-${entry.index}`}
              aria-hidden
              className={`story-scene-backdrop story-scene-backdrop-${step.side} story-scene-backdrop-${step.type}`}
              style={{ opacity: entry.opacity, visibility: entry.opacity <= 0.001 ? "hidden" : "visible" }}
            />
          );
        })}

        <div className="pointer-events-none absolute inset-0 z-[1]">
          <Suspense fallback={<div className="h-full w-full" />}>
            {sceneVisible ? <InteractivePCBModelScene scrollProgress={progress} /> : null}
          </Suspense>
        </div>

        <div
          aria-hidden
          className="material-data-field pointer-events-none absolute left-0 right-0 top-[5%] z-[3] h-[38%] overflow-hidden sm:left-[35%] sm:right-[3%] sm:top-[7%] sm:h-[44%] lg:h-[70%]"
          style={{ opacity: dataFieldOpacity }}
        >
          {glitchCodeColumns.map((column, index) => (
            <span
              key={column}
              className="material-data-column"
              style={{
                animationDelay: `${index * -0.47}s`,
                animationDuration: `${3.05 + (index % 3) * 0.42}s`,
                left: `${3 + index * 13.2}%`,
              }}
            >
              {column}
            </span>
          ))}
        </div>

        <div className="story-stage-label pointer-events-none absolute left-5 top-5 z-20 flex items-center gap-3 sm:left-8 md:top-8">
          <span
            className="h-px w-10"
            style={{
              backgroundColor: `hsl(155 55% ${72 - productThemeProgress * 44}% / ${
                0.6 - productThemeProgress * 0.2
              })`,
            }}
          />
          <span className="grid font-display text-xl font-semibold leading-none sm:text-2xl">
            <span
              className="col-start-1 row-start-1 text-white"
              style={{ opacity: problemLabelOpacity, transform: `translateY(${-productThemeProgress * 0.25}rem)` }}
            >
              {labels.problem}
            </span>
            <span
              className="col-start-1 row-start-1 text-emerald-950"
              style={{ opacity: productLabelOpacity, transform: `translateY(${(1 - productThemeProgress) * 0.25}rem)` }}
            >
              {labels.product}
            </span>
          </span>
        </div>

        <div
          aria-hidden
          className={`pointer-events-none absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 gap-1.5 rounded-full border px-2 py-2.5 shadow-sm backdrop-blur-md md:grid lg:right-6 ${
            problemActive
              ? "border-white/18 bg-emerald-950/48 shadow-black/20"
              : "border-emerald-950/14 bg-white/78 shadow-emerald-950/10"
          }`}
        >
          <span
            className={`absolute bottom-3 left-1/2 top-3 w-px -translate-x-1/2 overflow-hidden rounded-full ${
              problemActive ? "bg-white/22" : "bg-emerald-950/18"
            }`}
          >
            <span
              className={`block w-full rounded-full ${problemActive ? "bg-white/72" : "bg-emerald-700/70"}`}
              style={{ height: `${storyRailProgress * 100}%` }}
            />
          </span>
          {steps.map((step, index) => {
            const weight = panelWeight(index);
            return (
              <span
                key={`${step.type}-${step.title}`}
                className="relative z-10 grid h-3.5 w-3.5 place-items-center"
              >
                <span
                  className={`block h-1.5 w-1.5 rounded-full ${
                    weight >= 0.5
                      ? problemActive
                        ? "bg-white ring-2 ring-emerald-950/45 shadow-[0_0_10px_rgba(255,255,255,0.45)]"
                        : "bg-emerald-700 ring-2 ring-white shadow-[0_0_10px_rgba(4,120,87,0.28)]"
                      : problemActive
                        ? "bg-white/48 ring-1 ring-white/12"
                        : "bg-emerald-950/46 ring-1 ring-emerald-950/12"
                  }`}
                  style={{ transform: `scale(${1 + weight * 0.55})` }}
                />
              </span>
            );
          })}
        </div>

        <div className="story-active-stage pointer-events-none absolute inset-0 z-10 grid w-full grid-cols-1 items-end px-5 pb-10 pt-[42svh] sm:px-8 sm:pb-16 sm:pt-[50svh] lg:grid-cols-2 lg:items-center lg:px-[7vw] lg:py-24">
          {panelEntries.map((entry) => (
            <StoryStepPanel
              key={`${steps[entry.index].type}-${entry.index}`}
              dominant={entry.dominant}
              index={entry.index}
              offsetRem={entry.offsetRem}
              opacity={entry.contentOpacity}
              step={steps[entry.index]}
            />
          ))}
        </div>
      </div>

      <div className="pointer-events-none relative z-10 -mt-[100svh]" aria-hidden="true">
        {steps.map((step, index) => {
          return (
            <article
              id={index === 3 ? "product-story" : undefined}
              key={`${step.type}-${step.title}`}
              className="story-step min-h-[100svh] w-full"
            />
          );
        })}
      </div>

      <div className="sr-only">
        {steps.map((step) => (
          <section key={`${step.type}-${step.title}-accessible`}>
            <h2>{step.title}</h2>
            <p>{step.text}</p>
          </section>
        ))}
      </div>
    </section>
  );
}
