import { FlaskConical, Microscope, ScanSearch } from "lucide-react";
import { useRef, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { useElementVisibility } from "@/components/useScrollProgress";
import type { Language } from "@/lib/i18n";

type ProofCopy = {
  eyebrow: string;
  imageLabel: string;
  title: string;
  intro: string;
  images: Array<{
    src: string;
    title: string;
    text: string;
    status: string;
    imagePosition?: string;
    markers: Array<{
      anchorX: number;
      anchorY: number;
      labelX: number;
      labelY: number;
      align: "left" | "right";
      label: string;
      text: string;
    }>;
  }>;
  finalEyebrow: string;
  finalTitle: string;
  finalText: string;
};

const proofCopy: Record<Language, ProofCopy> = {
  de: {
    eyebrow: "Proof of Progress",
    imageLabel: "Reale Laboraufnahme",
    title: "Vom Prototyp zur Rückgewinnung.",
    intro:
      "Drei reale Aufnahmen dokumentieren den Weg vom bestückten Leaftronics-Prototyp über den kontrollierten Trennversuch bis zu den separierten Wertstofffraktionen. Die Bildmarker ordnen ein, was im Labor tatsächlich zu sehen ist.",
    images: [
      {
        src: "/leaftronics-pcb-prototype.jpg",
        title: "Funktionsfähiger PCB-Prototyp",
        text:
          "Der bestückte Demonstrator verbindet das neu gedachte, faserbasierte Trägermaterial mit Kupferleiterbahnen und handelsüblichen elektronischen Bauteilen. Er zeigt, dass die Materialidee als funktionsfähige Leiterplatte untersucht wird.",
        status: "Realer Demonstrator",
        markers: [
          {
            anchorX: 48,
            anchorY: 63,
            labelX: 5,
            labelY: 76,
            align: "left",
            label: "Leaftronics PCB",
            text: "Faserbasiertes Trägermaterial mit realer elektronischer Funktion.",
          },
          {
            anchorX: 57,
            anchorY: 42,
            labelX: 95,
            labelY: 26,
            align: "right",
            label: "Leiterbahnen & Bauteile",
            text: "Kupferstrukturen, ICs und Kontakte folgen klassischer PCB-Logik.",
          },
        ],
      },
      {
        src: "/leaftronics-lab-beaker.jpg",
        title: "Kontrollierte Lösung",
        text:
          "Die Aufnahme zeigt den realen Trennversuch im Becherglas. Der bestückte Prototyp wird vollständig in einer definierten Prozesslösung behandelt. Untersucht wird, wie sich die lösbare Matrix kontrolliert öffnen lässt, während Bauteile und metallische Strukturen als rückgewinnbare Fraktionen erhalten bleiben.",
        status: "Laborversuch",
        imagePosition: "52% 50%",
        markers: [
          {
            anchorX: 55,
            anchorY: 43,
            labelX: 95,
            labelY: 24,
            align: "right",
            label: "PCB im Prozessbad",
            text: "Der bestückte Prototyp befindet sich vollständig in der Lösung.",
          },
          {
            anchorX: 63,
            anchorY: 67,
            labelX: 5,
            labelY: 78,
            align: "left",
            label: "Prozesslösung",
            text: "Das Medium öffnet gezielt die lösbare Matrix des Trägermaterials.",
          },
        ],
      },
      {
        src: "/leaftronics-separated-components.jpg",
        title: "Sortenreinere Rückgewinnung",
        text:
          "Nach dem Prozess liegt die Leiterplatte nicht mehr als untrennbarer Verbund vor. Steckverbinder, elektronische Bauteile und kupferhaltige Strukturen werden als erkennbare Fraktionen sichtbar. Das schafft die Voraussetzung für Prüfung, Wiederverwendung und gezieltere stoffliche Rückgewinnung.",
        status: "Reale Prozessausgabe",
        markers: [
          {
            anchorX: 30,
            anchorY: 62,
            labelX: 5,
            labelY: 78,
            align: "left",
            label: "Rückgewonnene Bauteile",
            text: "Steckverbinder und Komponenten bleiben als separate Fraktion sichtbar.",
          },
          {
            anchorX: 77,
            anchorY: 59,
            labelX: 95,
            labelY: 28,
            align: "right",
            label: "Metallische Strukturen",
            text: "Kupferhaltige Strukturen sind vom Trägermaterial getrennt.",
          },
        ],
      },
    ],
    finalEyebrow: "Eine neue Materiallogik für Elektronik",
    finalTitle: "Klassische Funktion. Kontrollierbares Ende.",
    finalText:
      "Eine klassische Leiterplatte ist schwer zu trennen, weil Substrat, Metalle und Bauteile fest verbunden bleiben. Leaftronics verändert das Trägermaterial so, dass Nutzung und Rückgewinnung zusammen gedacht werden.",
  },
  en: {
    eyebrow: "Proof of progress",
    imageLabel: "Real laboratory image",
    title: "From prototype to recovery.",
    intro:
      "Three real images document the path from the assembled Leaftronics prototype through the controlled separation trial to the separated material fractions. The image markers identify what can actually be seen in the laboratory.",
    images: [
      {
        src: "/leaftronics-pcb-prototype.jpg",
        title: "Functional PCB prototype",
        text:
          "The assembled demonstrator combines the redesigned fibre-based carrier material with copper traces and standard electronic components. It shows that the material concept is being investigated as a functional circuit board.",
        status: "Physical demonstrator",
        markers: [
          {
            anchorX: 48,
            anchorY: 63,
            labelX: 5,
            labelY: 76,
            align: "left",
            label: "Leaftronics PCB",
            text: "Fibre-based carrier material with real electronic function.",
          },
          {
            anchorX: 57,
            anchorY: 42,
            labelX: 95,
            labelY: 26,
            align: "right",
            label: "Traces & components",
            text: "Copper structures, ICs and contacts follow conventional PCB logic.",
          },
        ],
      },
      {
        src: "/leaftronics-lab-beaker.jpg",
        title: "Controlled solution",
        text:
          "This image shows the actual separation trial in a laboratory beaker. The assembled prototype is treated completely in a defined process solution. The test examines how the soluble matrix can be opened in a controlled way while components and metallic structures remain recoverable fractions.",
        status: "Laboratory trial",
        imagePosition: "52% 50%",
        markers: [
          {
            anchorX: 55,
            anchorY: 43,
            labelX: 95,
            labelY: 24,
            align: "right",
            label: "PCB in the process bath",
            text: "The assembled prototype is fully immersed in the solution.",
          },
          {
            anchorX: 63,
            anchorY: 67,
            labelX: 5,
            labelY: 78,
            align: "left",
            label: "Process solution",
            text: "The medium selectively opens the soluble matrix of the carrier material.",
          },
        ],
      },
      {
        src: "/leaftronics-separated-components.jpg",
        title: "Cleaner material recovery",
        text:
          "After the process, the circuit board no longer exists as an inseparable composite. Connectors, electronic components and copper-bearing structures become visible as distinct fractions. This creates the basis for inspection, reuse and more targeted material recovery.",
        status: "Physical process output",
        markers: [
          {
            anchorX: 30,
            anchorY: 62,
            labelX: 5,
            labelY: 78,
            align: "left",
            label: "Recovered components",
            text: "Connectors and components remain visible as a separate fraction.",
          },
          {
            anchorX: 77,
            anchorY: 59,
            labelX: 95,
            labelY: 28,
            align: "right",
            label: "Metallic structures",
            text: "Copper-bearing structures are separated from the carrier material.",
          },
        ],
      },
    ],
    finalEyebrow: "A new material logic for electronics",
    finalTitle: "Classic function. A controllable end.",
    finalText:
      "A conventional circuit board is difficult to separate because the substrate, metals and components remain permanently bonded. Leaftronics changes the carrier material so use and recovery can be designed together.",
  },
  zh: {
    eyebrow: "进展验证",
    imageLabel: "真实实验室图像",
    title: "从原型到材料回收。",
    intro:
      "三张真实照片记录了从装配完成的 Leaftronics 原型、受控分离试验，到分离后材料组分的全过程。图像标记说明实验室照片中实际可见的关键部分。",
    images: [
      {
        src: "/leaftronics-pcb-prototype.jpg",
        title: "可运行的 PCB 原型",
        text:
          "装配完成的演示板将重新设计的纤维基载体、铜线路和标准电子元件结合在一起。这表明该材料概念正在以可运行电路板的形式进行验证。",
        status: "实体演示样件",
        markers: [
          {
            anchorX: 48,
            anchorY: 63,
            labelX: 5,
            labelY: 76,
            align: "left",
            label: "Leaftronics PCB",
            text: "具有真实电子功能的纤维基载体材料。",
          },
          {
            anchorX: 57,
            anchorY: 42,
            labelX: 95,
            labelY: 26,
            align: "right",
            label: "线路与元器件",
            text: "铜结构、芯片和触点延续传统 PCB 逻辑。",
          },
        ],
      },
      {
        src: "/leaftronics-lab-beaker.jpg",
        title: "受控溶液",
        text:
          "照片展示了烧杯中的真实分离试验。装配完成的原型被完全置于规定的工艺溶液中，用于研究可溶基体如何受控打开，同时保留可回收的元器件和金属结构。",
        status: "实验室试验",
        imagePosition: "52% 50%",
        markers: [
          {
            anchorX: 55,
            anchorY: 43,
            labelX: 95,
            labelY: 24,
            align: "right",
            label: "工艺液中的 PCB",
            text: "装配完成的原型完全浸入溶液中。",
          },
          {
            anchorX: 63,
            anchorY: 67,
            labelX: 5,
            labelY: 78,
            align: "left",
            label: "工艺溶液",
            text: "该介质有针对性地打开载体材料中的可溶基体。",
          },
        ],
      },
      {
        src: "/leaftronics-separated-components.jpg",
        title: "更纯净的材料回收",
        text:
          "处理后，电路板不再是不可分离的复合体。连接器、电子元件和含铜结构以不同组分清晰呈现，为检测、再利用和更有针对性的材料回收奠定基础。",
        status: "实体处理结果",
        markers: [
          {
            anchorX: 30,
            anchorY: 62,
            labelX: 5,
            labelY: 78,
            align: "left",
            label: "回收元器件",
            text: "连接器和元器件作为独立组分清晰可见。",
          },
          {
            anchorX: 77,
            anchorY: 59,
            labelX: 95,
            labelY: 28,
            align: "right",
            label: "金属结构",
            text: "含铜结构已与载体材料分离。",
          },
        ],
      },
    ],
    finalEyebrow: "电子产品的新材料逻辑",
    finalTitle: "传统功能，可控的终点。",
    finalText:
      "传统电路板难以分离，因为基材、金属和元器件始终牢固结合。Leaftronics 改变载体材料，让使用与回收从设计阶段就被共同考虑。",
  },
};

const proofIcons = [Microscope, FlaskConical, ScanSearch];

function handleProofPointerMove(event: ReactPointerEvent<HTMLElement>) {
  if (event.pointerType === "touch") return;

  const media = event.currentTarget.querySelector<HTMLElement>(".proof-media");
  const rect = media?.getBoundingClientRect() ?? event.currentTarget.getBoundingClientRect();
  const x = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2));
  const y = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - 0.5) * 2));

  event.currentTarget.style.setProperty("--proof-shift-x", `${x * -8}px`);
  event.currentTarget.style.setProperty("--proof-shift-y", `${y * -7}px`);
  event.currentTarget.style.setProperty("--proof-rotate-x", `${y * -1.1}deg`);
  event.currentTarget.style.setProperty("--proof-rotate-y", `${x * 1.1}deg`);
  event.currentTarget.style.setProperty("--proof-light-x", `${50 + x * 24}%`);
  event.currentTarget.style.setProperty("--proof-light-y", `${42 + y * 20}%`);
}

function resetProofPointer(event: ReactPointerEvent<HTMLElement>) {
  event.currentTarget.style.setProperty("--proof-shift-x", "0px");
  event.currentTarget.style.setProperty("--proof-shift-y", "0px");
  event.currentTarget.style.setProperty("--proof-rotate-x", "0deg");
  event.currentTarget.style.setProperty("--proof-rotate-y", "0deg");
  event.currentTarget.style.setProperty("--proof-light-x", "50%");
  event.currentTarget.style.setProperty("--proof-light-y", "42%");
}

export function ProofOfProgress({ language }: { language: Language }) {
  const sectionRef = useRef<HTMLElement>(null);
  const visible = useElementVisibility(sectionRef);
  const copy = proofCopy[language];

  return (
    <>
      <section ref={sectionRef} id="proof" className="relative overflow-hidden bg-[#08110d] py-20 text-white md:py-28">
        <div
          aria-hidden
          className="absolute inset-0 opacity-30 [background-image:linear-gradient(90deg,rgba(112,170,130,.12)_1px,transparent_1px),linear-gradient(0deg,rgba(112,170,130,.1)_1px,transparent_1px)] [background-size:72px_72px]"
        />
        <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.7fr)] lg:items-end lg:gap-16">
            <div
              className={`transition-all duration-700 ${
                visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="h-px w-10 bg-emerald-300/55" />
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">
                  {copy.eyebrow}
                </p>
              </div>
              <h2 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.08] sm:text-5xl md:text-6xl">
                {copy.title}
              </h2>
            </div>
            <p
              className={`max-w-xl text-base leading-7 text-white/66 transition-all delay-150 duration-700 lg:pb-1 ${
                visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
            >
              {copy.intro}
            </p>
          </div>

          <div className="mt-12 grid items-stretch gap-5 lg:grid-cols-3">
            {copy.images.map((item, index) => {
              const Icon = proofIcons[index];

              return (
                <figure
                  key={item.src}
                  tabIndex={0}
                  aria-label={`${item.title}. ${item.text}`}
                  onPointerMove={handleProofPointerMove}
                  onPointerLeave={resetProofPointer}
                  onPointerCancel={resetProofPointer}
                  style={{ transitionDelay: `${120 + index * 110}ms` }}
                  className={`proof-card group flex h-full flex-col overflow-hidden rounded-lg border border-white/12 bg-white/5 outline-none transition-all duration-700 focus-visible:border-emerald-300/60 focus-visible:ring-2 focus-visible:ring-emerald-300/35 ${
                    visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                  }`}
                >
                  <div className="proof-media relative aspect-[4/3] shrink-0 overflow-hidden bg-[#101c16]">
                    <div className="proof-media-frame absolute inset-0">
                      <img
                        src={item.src}
                        alt={item.title}
                        loading={visible ? "eager" : "lazy"}
                        style={{ objectPosition: item.imagePosition ?? "center" }}
                        className="proof-image h-full w-full object-cover"
                      />
                    </div>
                    <div aria-hidden className="proof-pointer-light absolute inset-0" />
                    <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/65 to-transparent px-4 pb-10 pt-4">
                      <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/76">
                        {Icon ? <Icon className="h-4 w-4 text-emerald-300" /> : null}
                        {copy.imageLabel}
                      </span>
                      <span className="rounded border border-white/18 bg-black/25 px-2 py-1 font-mono text-[10px] text-white/72 backdrop-blur-md">
                        LAB / {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div aria-hidden className="proof-hotspot-layer absolute inset-0">
                      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        {item.markers.map((marker, markerIndex) => (
                          <g key={`${marker.label}-trace`}>
                            <polyline
                              points={`${marker.anchorX},${marker.anchorY} ${marker.labelX},${marker.anchorY} ${marker.labelX},${marker.labelY}`}
                              className="proof-hotspot-trace"
                              style={{ transitionDelay: `${markerIndex * 90}ms` }}
                            />
                            <circle
                              cx={marker.anchorX}
                              cy={marker.anchorY}
                              r="2.2"
                              className="proof-hotspot-ring"
                              style={{ transitionDelay: `${markerIndex * 90}ms` }}
                            />
                            <circle cx={marker.anchorX} cy={marker.anchorY} r="0.85" className="proof-hotspot-dot" />
                          </g>
                        ))}
                      </svg>
                      {item.markers.map((marker, markerIndex) => (
                        <div
                          key={marker.label}
                          className={`proof-hotspot-panel proof-hotspot-panel-${marker.align}`}
                          style={
                            {
                              left: `${marker.labelX}%`,
                              top: `${marker.labelY}%`,
                              transitionDelay: `${markerIndex * 90}ms`,
                            } as CSSProperties
                          }
                        >
                          <span>{marker.label}</span>
                          <p>{marker.text}</p>
                        </div>
                      ))}
                    </div>
                    <ul className="sr-only">
                      {item.markers.map((marker) => (
                        <li key={`${marker.label}-accessible`}>
                          {marker.label}: {marker.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <figcaption className="flex flex-1 flex-col border-t border-white/10 px-5 py-5 md:px-6 md:py-6">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300/80">{item.status}</p>
                    <h3 className="mt-3 font-display text-2xl font-semibold leading-tight">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-white/62">{item.text}</p>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#edf4ee] py-16 text-emerald-950 md:py-24">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">{copy.finalEyebrow}</p>
            <h2 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-[1.08] sm:text-5xl">
              {copy.finalTitle}
            </h2>
          </div>
          <div>
            <p className="text-base leading-8 text-emerald-950/66">{copy.finalText}</p>
          </div>
        </div>
      </section>
    </>
  );
}
