import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Factory, Flame, Globe2, PackageCheck, QrCode, Recycle, UserRound, Wrench } from "lucide-react";
import { Input } from "@/components/ui/input";
import { languages, useLanguage } from "@/lib/i18n";

type GraphRole = "oem" | "customer" | "smelter";

const roleTarget: Record<GraphRole, string> = {
  oem: "/produzent",
  customer: "/angebote?role=kunde",
  smelter: "/angebote?role=smelter",
};

const Landing = () => {
  const [activeRole, setActiveRole] = useState<GraphRole>("oem");
  const [serial, setSerial] = useState("");
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const graph = t.landingGraph;

  const roleCards: Array<{
    id: GraphRole;
    icon: typeof Factory;
    title: string;
    text: string;
    cta: string;
  }> = [
    { id: "oem", icon: Factory, title: graph.roles.oem.title, text: graph.roles.oem.text, cta: graph.roles.oem.cta },
    {
      id: "customer",
      icon: UserRound,
      title: graph.roles.customer.title,
      text: graph.roles.customer.text,
      cta: graph.roles.customer.cta,
    },
    {
      id: "smelter",
      icon: Flame,
      title: graph.roles.smelter.title,
      text: graph.roles.smelter.text,
      cta: graph.roles.smelter.cta,
    },
  ];

  return (
    <div className="min-h-screen bg-[hsl(42_31%_91%)] text-foreground">
      <div className="absolute right-4 top-4 z-40 flex rounded-md border border-foreground/10 bg-background/85 p-1 shadow-card backdrop-blur-md">
        {languages.map((item) => (
          <button
            key={item.code}
            type="button"
            onClick={() => setLanguage(item.code)}
            className={`h-8 rounded px-2 text-xs font-medium transition-colors ${
              language === item.code ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
            }`}
            title={item.label}
          >
            {item.short}
          </button>
        ))}
      </div>

      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between pr-28">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-background shadow-elegant">
              <img src="/logo.png" alt="Kernbeisser Logo" className="h-full w-full object-cover" />
            </span>
            <span className="font-display text-base font-semibold uppercase tracking-[0.22em]">Kernbeisser</span>
          </Link>
          <Link
            to="/angebote"
            className="hidden items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground md:inline-flex"
          >
            {t.viewAllOffers}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[0.38fr_0.62fr] lg:py-6">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{graph.eyebrow}</p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-6xl">{graph.title}</h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">{graph.text}</p>

            <div className="mt-7 grid gap-3">
              {roleCards.map((role) => {
                const Icon = role.icon;
                const isActive = activeRole === role.id;

                return (
                  <Link
                    key={role.id}
                    to={roleTarget[role.id]}
                    onMouseEnter={() => setActiveRole(role.id)}
                    onFocus={() => setActiveRole(role.id)}
                    className={`group flex items-start gap-4 rounded-lg border bg-background/80 p-4 text-left shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/50 ${
                      isActive ? "border-primary/60 ring-2 ring-primary/15" : "border-border/80"
                    }`}
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-lg font-semibold">{role.title}</span>
                      <span className="mt-1 block text-sm leading-6 text-muted-foreground">{role.text}</span>
                      <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                        {role.cta}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                navigate(`/angebote?role=kunde&serial=${encodeURIComponent(serial)}`);
              }}
              className="mt-5 flex w-full max-w-md flex-col gap-2 sm:flex-row"
            >
              <Input
                value={serial}
                onChange={(event) => setSerial(event.target.value)}
                placeholder={t.serialPlaceholder}
                className="h-12 flex-1 bg-background/90"
              />
              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-foreground px-5 font-medium text-background shadow-elegant transition-transform hover:-translate-y-0.5"
              >
                {t.next}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
            <button
              type="button"
              className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              <QrCode className="h-4 w-4" />
              {t.scanQr}
            </button>
          </div>

          <div className="relative overflow-x-auto overflow-y-hidden rounded-lg border border-foreground/10 bg-[hsl(39_45%_95%)] shadow-elegant">
            <div className="relative h-[620px] min-w-[820px]">
            <div className="absolute inset-0 bg-[linear-gradient(120deg,hsl(44_55%_88%/.65),transparent_42%,hsl(155_35%_87%/.7))]" />
            <div className="absolute inset-x-8 top-8 z-10 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              <span>{graph.mapLabel}</span>
              <span>{graph.selectLabel}</span>
            </div>

            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 900 620" aria-hidden="true">
              <defs>
                <marker id="arrow" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="8" markerHeight="8" orient="auto">
                  <path d="M2 2 L10 6 L2 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </marker>
                <marker id="arrow-soft" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="8" markerHeight="8" orient="auto">
                  <path d="M2 2 L10 6 L2 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </marker>
              </defs>

              <g className="text-primary/70" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" markerEnd="url(#arrow)">
                <path d="M210 300 C275 260 320 260 385 300" />
                <path d="M500 285 C580 250 640 255 710 300" />
                <path d="M725 350 C700 430 645 495 535 520" />
                <path d="M255 420 C325 500 410 535 515 520" strokeDasharray="16 18" />
                <path d="M345 165 C395 210 420 245 430 300" />
                <path d="M600 300 C610 235 645 190 690 150" />
                <path d="M730 160 C755 205 765 245 760 285" />
              </g>
              <g className="text-foreground/45" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" markerEnd="url(#arrow-soft)">
                <path d="M205 220 C210 185 215 158 235 130" />
                <path d="M460 330 C430 330 390 330 330 330" />
                <path d="M540 330 C590 330 650 330 715 330" />
              </g>
            </svg>

            <Link
              to="/angebote?role=kunde"
              onMouseEnter={() => setActiveRole("customer")}
              onFocus={() => setActiveRole("customer")}
              className={`absolute left-[9%] top-[13%] w-44 rounded-lg border bg-background/90 p-4 shadow-card transition-all hover:-translate-y-1 ${
                activeRole === "customer" ? "border-primary ring-2 ring-primary/20" : "border-border"
              }`}
            >
              <UserRound className="mb-3 h-5 w-5 text-primary" />
              <p className="font-display text-xl font-semibold">{graph.nodes.customer}</p>
              <p className="mt-1 text-xs text-muted-foreground">{graph.edges.customerProduct}</p>
            </Link>

            <Link
              to="/produzent"
              onMouseEnter={() => setActiveRole("oem")}
              onFocus={() => setActiveRole("oem")}
              className={`absolute left-[13%] top-[48%] w-40 rounded-lg border bg-background/90 p-4 shadow-card transition-all hover:-translate-y-1 ${
                activeRole === "oem" ? "border-primary ring-2 ring-primary/20" : "border-border"
              }`}
            >
              <Factory className="mb-3 h-5 w-5 text-primary" />
              <p className="font-display text-2xl font-semibold">{graph.nodes.oem}</p>
              <p className="mt-1 text-xs text-muted-foreground">{graph.edges.product}</p>
            </Link>

            <div className="absolute left-[38%] top-[43%] w-44 rounded-lg border border-primary/35 bg-background/95 p-4 shadow-elegant">
              <Recycle className="mb-3 h-5 w-5 text-primary" />
              <p className="font-display text-xl font-semibold">{graph.nodes.consulting}</p>
              <p className="mt-1 text-xs text-muted-foreground">{graph.edges.sellPcb}</p>
            </div>

            <div className="absolute left-[40%] top-[15%] w-44 rounded-lg border border-border bg-background/80 p-4 shadow-card">
              <PackageCheck className="mb-3 h-5 w-5 text-primary" />
              <p className="font-display text-lg font-semibold">{graph.nodes.product}</p>
              <p className="mt-1 text-xs text-muted-foreground">{graph.edges.toConsulting}</p>
            </div>

            <div className="absolute right-[17%] top-[12%] w-44 rounded-lg border border-border bg-background/80 p-4 shadow-card">
              <Wrench className="mb-3 h-5 w-5 text-primary" />
              <p className="font-display text-lg font-semibold">{graph.nodes.disassembly}</p>
              <p className="mt-1 text-xs text-muted-foreground">{graph.edges.productMinusPcb}</p>
            </div>

            <Link
              to="/angebote?role=smelter"
              onMouseEnter={() => setActiveRole("smelter")}
              onFocus={() => setActiveRole("smelter")}
              className={`absolute right-[8%] top-[43%] w-44 rounded-lg border bg-background/90 p-4 shadow-card transition-all hover:-translate-y-1 ${
                activeRole === "smelter" ? "border-primary ring-2 ring-primary/20" : "border-border"
              }`}
            >
              <Flame className="mb-3 h-5 w-5 text-primary" />
              <p className="font-display text-2xl font-semibold">{graph.nodes.smelter}</p>
              <p className="mt-1 text-xs text-muted-foreground">{graph.edges.pcbSolution}</p>
            </Link>

            <div className="absolute bottom-[9%] right-[31%] flex h-32 w-32 items-center justify-center rounded-full border-2 border-primary/55 bg-background/90 text-center shadow-card">
              <div>
                <Globe2 className="mx-auto mb-2 h-5 w-5 text-primary" />
                <p className="font-display text-2xl font-semibold">{graph.nodes.asia}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{graph.edges.material}</p>
              </div>
            </div>

            <div className="absolute bottom-[18%] left-[36%] w-40 text-center text-sm font-semibold leading-5 text-foreground/70">
              {graph.edges.cloud}
            </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landing;
