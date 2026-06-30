import { useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight, Factory, Flame, Globe2, PackageCheck, Recycle, UserRound, Wrench } from "lucide-react";
import { languages, useLanguage } from "@/lib/i18n";

type GraphRole = "oem" | "customer" | "smelter";
type GraphPoint = GraphRole | "consulting" | "product" | "disassembly" | "asia";

const roleTarget: Record<GraphRole, string> = {
  oem: "/produzent",
  customer: "/angebote?role=kunde",
  smelter: "/angebote?role=smelter",
};

const Landing = () => {
  const [activePoint, setActivePoint] = useState<GraphPoint>("oem");
  const { language, setLanguage, t } = useLanguage();
  const graph = t.landingGraph;
  const story = t.landingStory;

  const activeInfo = story.solution.points[activePoint];

  return (
    <div className="min-h-screen bg-black text-background">
      <div className="fixed right-4 top-4 z-50 flex rounded-md border border-background/20 bg-black/35 p-1 shadow-card backdrop-blur-md">
        {languages.map((item) => (
          <button
            key={item.code}
            type="button"
            onClick={() => setLanguage(item.code)}
            className={`h-8 rounded px-2 text-xs font-medium transition-colors ${
              language === item.code ? "bg-background text-foreground" : "text-background/75 hover:text-background"
            }`}
            title={item.label}
          >
            {item.short}
          </button>
        ))}
      </div>

      <section className="relative isolate min-h-screen overflow-hidden">
        <img src="/rainforest.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/80" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-black" />

        <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-6 pr-32 sm:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-background shadow-elegant">
              <img src="/logo.png" alt="Kernbeisser Logo" className="h-full w-full object-cover" />
            </span>
            <span className="font-display text-base font-semibold uppercase tracking-[0.22em]">Kernbeisser</span>
          </Link>
          <a
            href="#problem"
            className="hidden items-center gap-2 text-sm font-semibold text-background/75 transition-colors hover:text-background md:inline-flex"
          >
            {story.hero.nav}
            <ArrowDown className="h-4 w-4" />
          </a>
        </header>

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-92px)] w-full max-w-7xl items-end px-5 pb-16 sm:px-8 lg:pb-24">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-background/75">{story.hero.eyebrow}</p>
            <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.02] text-background [text-shadow:0_2px_28px_hsl(0_0%_0%/.45)] md:text-7xl">
              {story.hero.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-background/85 [text-shadow:0_1px_18px_hsl(0_0%_0%/.35)]">
              {story.hero.text}
            </p>
          </div>
        </div>
      </section>

      <section id="problem" className="relative isolate overflow-hidden bg-black py-24 text-background md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,hsl(150_80%_35%/.18),transparent_32%),radial-gradient(circle_at_80%_80%,hsl(40_90%_45%/.14),transparent_30%)]" />
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[0.48fr_0.52fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary">{story.problem.eyebrow}</p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-6xl">{story.problem.title}</h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-background/72">{story.problem.text}</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {story.problem.stats.map((stat) => (
                <div key={stat.label} className="border-l border-background/20 pl-4">
                  <p className="font-display text-3xl font-semibold text-background">{stat.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-background/50">{stat.label}</p>
                </div>
              ))}
            </div>
            <a
              href="#solution"
              className="mt-10 inline-flex h-12 items-center gap-2 rounded-md bg-background px-5 font-semibold text-foreground shadow-elegant transition-transform hover:-translate-y-0.5"
            >
              {story.problem.cta}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="relative min-h-72 overflow-hidden rounded-lg border border-background/10 bg-background/5">
              <img
                src="https://images.unsplash.com/photo-1494412685616-a5d310fbb07d?auto=format&fit=crop&w=900&q=80"
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-70 grayscale"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              <p className="absolute bottom-5 left-5 right-5 text-sm font-semibold leading-6">{story.problem.imageA}</p>
            </div>
            <div className="relative min-h-72 overflow-hidden rounded-lg border border-background/10 bg-background/5 sm:mt-12">
              <img
                src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80"
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-65 grayscale"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />
              <p className="absolute bottom-5 left-5 right-5 text-sm font-semibold leading-6">{story.problem.imageB}</p>
            </div>
            <div className="relative min-h-56 overflow-hidden rounded-lg border border-background/10 bg-background/5">
              <img
                src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80"
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-60 grayscale"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              <p className="absolute bottom-5 left-5 right-5 text-sm font-semibold leading-6">{story.problem.imageC}</p>
            </div>
            <div className="relative min-h-56 overflow-hidden rounded-lg border border-background/10 bg-background/5 sm:mt-12">
              <img
                src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80"
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-60 grayscale"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />
              <p className="absolute bottom-5 left-5 right-5 text-sm font-semibold leading-6">{story.problem.imageD}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="solution" className="bg-[hsl(42_31%_91%)] py-16 text-foreground md:py-24">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
          <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{story.solution.eyebrow}</p>
              <h2 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-6xl">{story.solution.title}</h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">{story.solution.text}</p>
            </div>
            <div className="rounded-lg border border-primary/25 bg-background/80 p-4 shadow-card md:w-80">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">{story.solution.hoverLabel}</p>
              <h3 className="mt-3 font-display text-2xl font-semibold">{activeInfo.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{activeInfo.text}</p>
            </div>
          </div>

          <div className="relative overflow-x-auto overflow-y-hidden rounded-lg border border-foreground/10 bg-[hsl(39_45%_95%)] shadow-elegant">
            <div className="relative h-[760px] min-w-[1120px]">
              <div className="absolute inset-0 bg-[linear-gradient(120deg,hsl(44_55%_88%/.72),transparent_42%,hsl(155_35%_87%/.8))]" />
              <div className="absolute inset-x-10 top-9 z-10 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                <span>{graph.mapLabel}</span>
                <span>{graph.selectLabel}</span>
              </div>

              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1120 760" aria-hidden="true">
                <defs>
                  <marker id="arrow" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="8" markerHeight="8" orient="auto">
                    <path d="M2 2 L10 6 L2 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </marker>
                </defs>
                <g className="text-primary/75" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" markerEnd="url(#arrow)">
                  <path d="M240 370 C320 315 395 315 475 365" />
                  <path d="M625 350 C710 305 805 315 890 370" />
                  <path d="M905 430 C865 535 790 625 655 655" />
                  <path d="M310 500 C405 610 510 665 640 655" strokeDasharray="18 20" />
                  <path d="M445 200 C505 260 530 305 540 365" />
                  <path d="M755 360 C770 285 815 230 875 185" />
                  <path d="M925 200 C955 260 965 305 958 350" />
                </g>
                <g className="text-foreground/45" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" markerEnd="url(#arrow)">
                  <path d="M245 285 C250 235 270 198 305 155" />
                  <path d="M565 395 C510 395 450 395 385 395" />
                  <path d="M655 395 C720 395 790 395 890 395" />
                </g>
              </svg>

              <GraphNode
                active={activePoint === "customer"}
                className="left-[8%] top-[13%] w-56"
                href="/angebote?role=kunde"
                icon={<UserRound className="h-5 w-5 text-primary" />}
                kicker={graph.edges.customerProduct}
                title={graph.nodes.customer}
                onHover={() => setActivePoint("customer")}
              />
              <GraphNode
                active={activePoint === "oem"}
                className="left-[11%] top-[47%] w-52"
                href="/produzent"
                icon={<Factory className="h-5 w-5 text-primary" />}
                kicker={graph.edges.product}
                title={graph.nodes.oem}
                onHover={() => setActivePoint("oem")}
              />
              <GraphNode
                active={activePoint === "consulting"}
                className="left-[39%] top-[42%] w-56"
                icon={<Recycle className="h-5 w-5 text-primary" />}
                kicker={graph.edges.sellPcb}
                title={graph.nodes.consulting}
                onHover={() => setActivePoint("consulting")}
              />
              <GraphNode
                active={activePoint === "product"}
                className="left-[39%] top-[15%] w-56"
                icon={<PackageCheck className="h-5 w-5 text-primary" />}
                kicker={graph.edges.toConsulting}
                title={graph.nodes.product}
                onHover={() => setActivePoint("product")}
              />
              <GraphNode
                active={activePoint === "disassembly"}
                className="right-[15%] top-[12%] w-56"
                icon={<Wrench className="h-5 w-5 text-primary" />}
                kicker={graph.edges.productMinusPcb}
                title={graph.nodes.disassembly}
                onHover={() => setActivePoint("disassembly")}
              />
              <GraphNode
                active={activePoint === "smelter"}
                className="right-[7%] top-[43%] w-56"
                href="/angebote?role=smelter"
                icon={<Flame className="h-5 w-5 text-primary" />}
                kicker={graph.edges.pcbSolution}
                title={graph.nodes.smelter}
                onHover={() => setActivePoint("smelter")}
              />
              <button
                type="button"
                onMouseEnter={() => setActivePoint("asia")}
                onFocus={() => setActivePoint("asia")}
                className={`absolute bottom-[8%] right-[32%] flex h-40 w-40 items-center justify-center rounded-full border-2 bg-background/90 text-center shadow-card transition-all hover:-translate-y-1 ${
                  activePoint === "asia" ? "border-primary ring-2 ring-primary/20" : "border-primary/55"
                }`}
              >
                <span>
                  <Globe2 className="mx-auto mb-2 h-5 w-5 text-primary" />
                  <span className="block font-display text-3xl font-semibold">{graph.nodes.asia}</span>
                  <span className="mt-1 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{graph.edges.material}</span>
                </span>
              </button>
              <button
                type="button"
                onMouseEnter={() => setActivePoint("consulting")}
                onFocus={() => setActivePoint("consulting")}
                className="absolute bottom-[19%] left-[36%] w-56 text-center text-sm font-semibold leading-5 text-foreground/70 transition-colors hover:text-foreground"
              >
                {graph.edges.cloud}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

type GraphNodeProps = {
  active: boolean;
  className: string;
  href?: string;
  icon: ReactNode;
  kicker: string;
  title: string;
  onHover: () => void;
};

const GraphNode = ({ active, className, href, icon, kicker, title, onHover }: GraphNodeProps) => {
  const classNames = `absolute rounded-lg border bg-background/90 p-5 text-left shadow-card transition-all hover:-translate-y-1 ${
    active ? "border-primary ring-2 ring-primary/20" : "border-border"
  } ${className}`;
  const content = (
    <>
      <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">{icon}</span>
      <span className="block font-display text-2xl font-semibold">{title}</span>
      <span className="mt-1 block text-xs text-muted-foreground">{kicker}</span>
    </>
  );

  if (href) {
    return (
      <Link to={href} onMouseEnter={onHover} onFocus={onHover} className={classNames}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onMouseEnter={onHover} onFocus={onHover} className={classNames}>
      {content}
    </button>
  );
};

export default Landing;
