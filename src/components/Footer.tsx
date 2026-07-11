import { ArrowUp, ArrowUpRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage, type Language } from "@/lib/i18n";

type FooterProps = {
  compact?: boolean;
};

type FooterCopy = {
  accessibility: string;
  backToTop: string;
  contact: string;
  explore: string;
  imprint: string;
  location: string;
  privacy: string;
  product: string;
  problem: string;
  proof: string;
  request: string;
  rights: string;
  statement: string;
  traction: string;
  cycle: string;
};

const footerCopy: Record<Language, FooterCopy> = {
  de: {
    accessibility: "Barrierefreiheit",
    backToTop: "Nach oben",
    contact: "Zusammenarbeiten",
    explore: "Entdecken",
    imprint: "Impressum",
    location: "Dresden, Deutschland",
    privacy: "Datenschutz",
    product: "Unser Produkt",
    problem: "Das Problem",
    proof: "Proof of Progress",
    request: "Pilotprojekt",
    rights: "Alle Rechte vorbehalten.",
    statement: "Elektronik so gestalten, dass Material, Wissen und Wert im Kreislauf bleiben.",
    traction: "Erfolge",
    cycle: "Kreislauf-Demo",
  },
  en: {
    accessibility: "Accessibility",
    backToTop: "Back to top",
    contact: "Work with us",
    explore: "Explore",
    imprint: "Legal notice",
    location: "Dresden, Germany",
    privacy: "Privacy",
    product: "Our product",
    problem: "The problem",
    proof: "Proof of progress",
    request: "Pilot project",
    rights: "All rights reserved.",
    statement: "Designing electronics so material, knowledge and value remain in the loop.",
    traction: "Milestones",
    cycle: "Loop demo",
  },
  zh: {
    accessibility: "无障碍说明",
    backToTop: "返回顶部",
    contact: "与我们合作",
    explore: "探索",
    imprint: "法律声明",
    location: "德国德累斯顿",
    privacy: "隐私政策",
    product: "我们的产品",
    problem: "问题",
    proof: "进展证明",
    request: "试点项目",
    rights: "保留所有权利。",
    statement: "让材料、知识与价值在电子产品的循环中持续保留。",
    traction: "成果",
    cycle: "循环演示",
  },
};

export function Footer({ compact = false }: FooterProps) {
  const { language } = useLanguage();
  const { pathname } = useLocation();
  const copy = footerCopy[language];
  const rootHash = (hash: string) => (pathname === "/" ? hash : `/${hash}`);

  return (
    <footer id="kontakt" className="relative isolate overflow-hidden border-t border-white/10 bg-[#07100c] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.13] [background-image:linear-gradient(rgba(255,255,255,.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.14)_1px,transparent_1px)] [background-size:64px_64px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[8%] -top-10 h-24 bg-emerald-300/10 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8">
        {!compact ? (
          <div className="grid gap-12 border-b border-white/10 py-16 md:grid-cols-[minmax(0,1.15fr)_minmax(13rem,0.65fr)] md:py-20 lg:grid-cols-[minmax(0,1.35fr)_minmax(11rem,0.45fr)_minmax(13rem,0.55fr)] lg:gap-16">
            <div className="max-w-2xl md:row-span-2 lg:row-span-1">
              <Link to="/" className="inline-flex items-center gap-3" aria-label="Leaftronics Startseite">
                <span className="h-12 w-12 overflow-hidden rounded-full border border-white/12 bg-white/95">
                  <img src="/logo1-web.webp" alt="" className="h-full w-full object-cover" />
                </span>
                <span className="font-display text-lg font-semibold uppercase tracking-[0.22em]">Leaftronics</span>
              </Link>
              <p className="mt-7 max-w-xl font-display text-3xl font-semibold leading-[1.12] text-white sm:text-4xl">
                {copy.statement}
              </p>
              <p className="mt-5 text-sm font-medium uppercase tracking-[0.2em] text-emerald-200/58">{copy.location}</p>
            </div>

            <nav aria-label={copy.explore}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-300/68">{copy.explore}</p>
              <div className="mt-5 grid gap-3 text-sm text-white/62">
                <a href={rootHash("#problem-story")} className="transition-colors hover:text-white">{copy.problem}</a>
                <a href={rootHash("#product-story")} className="transition-colors hover:text-white">{copy.product}</a>
                <a href={rootHash("#proof")} className="transition-colors hover:text-white">{copy.proof}</a>
                <Link to="/erfolge" className="transition-colors hover:text-white">{copy.traction}</Link>
                <Link to="/kreislauf-demo" className="transition-colors hover:text-white">{copy.cycle}</Link>
              </div>
            </nav>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-300/68">{copy.contact}</p>
              <a
                href={rootHash("#forms")}
                className="mt-5 inline-flex h-12 items-center gap-3 rounded-md bg-[#b8ff59] px-5 text-sm font-semibold text-[#07100c] shadow-[0_14px_38px_rgba(184,255,89,.12)] transition-transform hover:-translate-y-0.5"
              >
                {copy.request}
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        ) : null}

        <div className={`flex flex-col gap-5 py-6 text-xs text-white/42 md:flex-row md:items-center md:justify-between ${compact ? "border-t border-white/10" : ""}`}>
          <p>© {new Date().getFullYear()} Leaftronics. {copy.rights}</p>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2" aria-label="Legal">
            <Link to="/impressum" className="transition-colors hover:text-white">{copy.imprint}</Link>
            <Link to="/datenschutz" className="transition-colors hover:text-white">{copy.privacy}</Link>
            <Link to="/barrierefreiheit" className="transition-colors hover:text-white">{copy.accessibility}</Link>
          </nav>
          <a
            href={pathname === "/" ? "#top" : "/"}
            aria-label={copy.backToTop}
            title={copy.backToTop}
            className="inline-grid h-9 w-9 place-items-center rounded-full border border-white/14 text-white/62 transition-colors hover:border-white/32 hover:text-white"
          >
            <ArrowUp className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
