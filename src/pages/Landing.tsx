import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Leaf, QrCode } from "lucide-react";
import { Input } from "@/components/ui/input";

type Side = "produzent" | "kunde" | null;

const Landing = () => {
  const [hover, setHover] = useState<Side>(null);
  const [serial, setSerial] = useState("");
  const navigate = useNavigate();

  const produzentFlex =
    hover === "produzent" ? "flex-[1.6]" : hover === "kunde" ? "flex-[0.4]" : "flex-1";
  const kundeFlex =
    hover === "kunde" ? "flex-[1.6]" : hover === "produzent" ? "flex-[0.4]" : "flex-1";

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-foreground md:flex-row">
      {/* Center brand */}
      <div className="pointer-events-none absolute left-1/2 top-6 z-30 -translate-x-1/2 md:top-8">
        <div className="flex items-center gap-2 rounded-full bg-background/10 px-4 py-2 backdrop-blur-md ring-1 ring-background/20">
          <Leaf className="h-4 w-4 text-background" />
          <span className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-background">
            Kernbeißer
          </span>
        </div>
      </div>

      {/* Center headline */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 px-6 text-center">
        <h1 className="font-display text-4xl font-semibold leading-tight text-background drop-shadow-lg md:text-6xl">
          Bist du Produzent
          <br />
          oder Kunde?
        </h1>
        <p className="mt-4 text-sm text-background/80 md:text-base">
          Wähle deine Seite — wir kümmern uns um den Rest.
        </p>
        <div className="mx-auto mt-6 flex max-w-xs items-center gap-3 text-background/70">
          <span className="h-px flex-1 bg-background/40" />
          <span className="text-xs uppercase tracking-[0.3em]">oder</span>
          <span className="h-px flex-1 bg-background/40" />
        </div>
      </div>

      {/* Produzent */}
      <Link
        to="/angebote?role=produzent"
        onMouseEnter={() => setHover("produzent")}
        onMouseLeave={() => setHover(null)}
        className={`group relative isolate flex min-h-[60vh] w-full overflow-hidden transition-[flex-grow,flex-shrink,flex-basis] duration-[1400ms] ease-[cubic-bezier(0.4,0,0.2,1)] will-change-[flex] md:min-h-screen ${produzentFlex}`}
      >
        <img
          src="https://images.unsplash.com/photo-1700727448686-b314cb5f9948?w=1400&h=1600&fit=crop&auto=format"
          alt="Produktionshalle — Herstellung elektronischer Geräte"
          className="absolute inset-0 h-full w-full object-cover grayscale-[40%] transition-transform duration-[1800ms] ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-foreground/55 transition-colors duration-1000" />
        <div className="absolute inset-0 bg-[hsl(152_55%_14%)]/45 mix-blend-multiply transition-colors duration-1000" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />
        <div className="relative z-10 mt-auto flex w-full flex-col items-start gap-4 p-8 text-background md:p-14">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-background/80">
            Produzent
          </span>
          <h2 className="font-display text-3xl font-semibold leading-tight md:text-5xl">
            Schließen Sie
            <br />
            den Kreislauf.
          </h2>
          <p className="max-w-md text-sm text-background/85 md:text-base">
            Partnerschaft, Beratung und die Garantie, dass Ihre Materialien
            wieder zu Ihnen zurückfinden.
          </p>
          <span className="mt-2 inline-flex h-12 items-center gap-2 rounded-full bg-background px-6 font-medium text-foreground shadow-elegant transition-transform group-hover:translate-x-1">
            Erstgespräch vereinbaren
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </Link>

      {/* Divider */}
      <div className="hidden w-px bg-background/20 md:block" />

      {/* Kunde */}
      <div
        onMouseEnter={() => setHover("kunde")}
        onMouseLeave={() => setHover(null)}
        className={`group relative isolate flex min-h-[60vh] w-full overflow-hidden transition-[flex-grow,flex-shrink,flex-basis] duration-[1400ms] ease-[cubic-bezier(0.4,0,0.2,1)] will-change-[flex] md:min-h-screen ${kundeFlex}`}
      >
        <img
          src="https://images.unsplash.com/photo-1590635023142-73c3d34f2805?w=1400&h=1600&fit=crop&auto=format"
          alt="Kunde hält einen Akku-Bohrschrauber — Gerät zurückgeben"
          className="absolute inset-0 h-full w-full object-cover grayscale-[40%] transition-transform duration-[1800ms] ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-foreground/55 transition-colors duration-1000" />
        <div className="absolute inset-0 bg-[hsl(28_45%_14%)]/40 mix-blend-multiply transition-colors duration-1000" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />
        <div className="relative z-10 mt-auto flex w-full flex-col items-start gap-4 p-8 text-background md:p-14">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-background/80">
            Kunde
          </span>
          <h2 className="font-display text-3xl font-semibold leading-tight md:text-5xl">
            Gerät zurückgeben.
            <br />
            Einfach.
          </h2>
          <p className="max-w-md text-sm text-background/85 md:text-base">
            Seriennummer oder QR-Code — wir erledigen den Rest.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              navigate(`/angebote?role=kunde&serial=${encodeURIComponent(serial)}`);
            }}
            className="mt-2 flex w-full max-w-md flex-col gap-2 sm:flex-row"
          >
            <Input
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              placeholder="Seriennummer eingeben …"
              className="h-12 flex-1 border-background/30 bg-background/10 text-background placeholder:text-background/60 focus-visible:ring-background/40"
            />
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-background px-5 font-medium text-foreground shadow-elegant transition-transform hover:-translate-y-0.5"
            >
              Weiter
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
          <button
            type="button"
            className="mt-1 inline-flex items-center gap-2 text-sm text-background/80 underline-offset-4 hover:text-background hover:underline"
          >
            <QrCode className="h-4 w-4" />
            QR-Code scannen
          </button>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 z-30 -translate-x-1/2 text-[11px] uppercase tracking-[0.3em] text-background/60">
        <Link to="/angebote" className="pointer-events-auto hover:text-background">
          Alle Angebote ansehen ↓
        </Link>
      </div>
    </div>
  );
};

export default Landing;