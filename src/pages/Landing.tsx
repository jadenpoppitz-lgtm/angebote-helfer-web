import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Leaf, QrCode } from "lucide-react";
import { Input } from "@/components/ui/input";
import { languages, useLanguage } from "@/lib/i18n";

type Side = "produzent" | "kunde" | null;

const Landing = () => {
  const [hover, setHover] = useState<Side>(null);
  const [serial, setSerial] = useState("");
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  const produzentFlex =
    hover === "produzent"
      ? "flex-[1.7]"
      : hover === "kunde"
        ? "flex-[0.3]"
        : "flex-1";
  const kundeFlex =
    hover === "kunde"
      ? "flex-[1.7]"
      : hover === "produzent"
        ? "flex-[0.3]"
        : "flex-1";
  const [headlineA, headlineB] = t.producerOrCustomer.split("\n");
  const [producerTitleA, producerTitleB] = t.producerTitle.split("\n");
  const [customerTitleA, customerTitleB] = t.customerTitle.split("\n");

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-foreground md:flex-row">
      <div className="absolute right-4 top-4 z-40 flex rounded-md border border-background/20 bg-background/10 p-1 backdrop-blur-md">
        {languages.map((item) => (
          <button
            key={item.code}
            type="button"
            onClick={() => setLanguage(item.code)}
            className={`h-8 rounded px-2 text-xs font-medium transition-colors ${
              language === item.code
                ? "bg-background text-foreground"
                : "text-background/75 hover:text-background"
            }`}
            title={item.label}
          >
            {item.short}
          </button>
        ))}
      </div>

      <div className="pointer-events-none absolute left-1/2 top-6 z-30 -translate-x-1/2 md:top-8">
        <div className="flex items-center gap-2 rounded-full bg-background/10 px-4 py-2 backdrop-blur-md ring-1 ring-background/20">
          <Leaf className="h-4 w-4 text-background" />
          <span className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-background">
            Kernbeißer
          </span>
        </div>
      </div>

      <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 px-6 text-center">
        <h1 className="font-display text-4xl font-semibold leading-tight text-background [text-shadow:0_2px_24px_hsl(0_0%_0%/0.6)] md:text-6xl">
          {headlineA}
          <br />
          {headlineB}
        </h1>
        <p className="mt-4 text-sm text-background/90 [text-shadow:0_1px_12px_hsl(0_0%_0%/0.5)] md:text-base">
          {t.landingSub}
        </p>
        <div className="mx-auto mt-6 flex max-w-xs items-center gap-3 text-background/70">
          <span className="h-px flex-1 bg-background/40" />
          <span className="text-xs uppercase tracking-[0.3em]">{t.or}</span>
          <span className="h-px flex-1 bg-background/40" />
        </div>
      </div>

      <Link
        to="/produzent"
        onMouseEnter={() => setHover("produzent")}
        onMouseLeave={() => setHover(null)}
        className={`group relative isolate flex min-h-[60vh] w-full overflow-hidden transition-[flex-grow,flex-shrink,flex-basis] duration-[2600ms] ease-[cubic-bezier(0.37,0,0.18,1)] will-change-[flex] motion-reduce:transition-none md:min-h-screen ${produzentFlex}`}
      >
        <img
          src="https://images.unsplash.com/photo-1700727448686-b314cb5f9948?w=1400&h=1600&fit=crop&auto=format"
          alt="Produktionshalle"
          className="absolute inset-0 h-full w-full object-cover grayscale-[40%] transition-transform duration-[3200ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] will-change-transform motion-reduce:transition-none group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-foreground/55 transition-colors duration-1000" />
        <div className="absolute inset-0 bg-[hsl(152_55%_14%)]/45 mix-blend-multiply transition-colors duration-1000" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />
        <div className="relative z-10 mt-auto flex w-full flex-col items-start gap-4 p-8 text-background md:p-14">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-background/80 transition-all duration-700 ease-[cubic-bezier(0.45,0.05,0.55,0.95)] group-hover:tracking-[0.35em]">
            {t.producer}
          </span>
          <h2 className="font-display text-3xl font-semibold leading-tight transition-all duration-700 ease-[cubic-bezier(0.45,0.05,0.55,0.95)] group-hover:translate-x-1 md:text-5xl">
            {producerTitleA}
            <br />
            {producerTitleB}
          </h2>
          <p className="max-w-md text-sm text-background/85 transition-all duration-700 ease-[cubic-bezier(0.45,0.05,0.55,0.95)] group-hover:translate-x-1 md:text-base">
            {t.producerText}
          </p>
          <span className="mt-2 inline-flex h-12 items-center gap-2 rounded-full bg-background px-6 font-medium text-foreground shadow-elegant transition-all duration-500 ease-[cubic-bezier(0.45,0.05,0.55,0.95)] group-hover:translate-x-2">
            {t.firstCall}
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </Link>

      <div className="hidden w-px bg-background/20 md:block" />

      <div
        onMouseEnter={() => setHover("kunde")}
        onMouseLeave={() => setHover(null)}
        className={`group relative isolate flex min-h-[60vh] w-full overflow-hidden transition-[flex-grow,flex-shrink,flex-basis] duration-[2600ms] ease-[cubic-bezier(0.37,0,0.18,1)] will-change-[flex] motion-reduce:transition-none md:min-h-screen ${kundeFlex}`}
      >
        <img
          src="https://images.unsplash.com/photo-1590635023142-73c3d34f2805?w=1400&h=1600&fit=crop&auto=format"
          alt="Kunde hält Werkzeug"
          className="absolute inset-0 h-full w-full object-cover grayscale-[40%] transition-transform duration-[3200ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] will-change-transform motion-reduce:transition-none group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-foreground/55 transition-colors duration-1000" />
        <div className="absolute inset-0 bg-[hsl(28_45%_14%)]/40 mix-blend-multiply transition-colors duration-1000" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />
        <div className="relative z-10 mt-auto flex w-full flex-col items-start gap-4 p-8 text-background md:p-14">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-background/80 transition-all duration-700 ease-[cubic-bezier(0.45,0.05,0.55,0.95)] group-hover:tracking-[0.35em]">
            {t.customer}
          </span>
          <h2 className="font-display text-3xl font-semibold leading-tight transition-all duration-700 ease-[cubic-bezier(0.45,0.05,0.55,0.95)] group-hover:translate-x-1 md:text-5xl">
            {customerTitleA}
            <br />
            {customerTitleB}
          </h2>
          <p className="max-w-md text-sm text-background/85 transition-all duration-700 ease-[cubic-bezier(0.45,0.05,0.55,0.95)] group-hover:translate-x-1 md:text-base">
            {t.customerText}
          </p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              navigate(`/angebote?role=kunde&serial=${encodeURIComponent(serial)}`);
            }}
            className="mt-2 flex w-full max-w-md flex-col gap-2 sm:flex-row"
          >
            <Input
              value={serial}
              onChange={(event) => setSerial(event.target.value)}
              placeholder={t.serialPlaceholder}
              className="h-12 flex-1 border-background/30 bg-background/10 text-background placeholder:text-background/60 focus-visible:ring-background/40"
            />
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-background px-5 font-medium text-foreground shadow-elegant transition-transform hover:-translate-y-0.5"
            >
              {t.next}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
          <button
            type="button"
            className="mt-1 inline-flex items-center gap-2 text-sm text-background/80 underline-offset-4 hover:text-background hover:underline"
          >
            <QrCode className="h-4 w-4" />
            {t.scanQr}
          </button>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-1/2 z-30 -translate-x-1/2 text-[11px] uppercase tracking-[0.3em] text-background/60">
        <Link to="/angebote" className="pointer-events-auto hover:text-background">
          {t.viewAllOffers}
        </Link>
      </div>
    </div>
  );
};

export default Landing;
