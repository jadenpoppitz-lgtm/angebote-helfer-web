import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface HeroProps {
  onRequest: () => void;
}

export function Hero({ onRequest }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-soft">
      <div
        aria-hidden
        className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-accent/10 blur-3xl"
      />
      <div className="container relative grid gap-12 py-16 md:py-24 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Geprüfte Recyclingbetriebe in ganz Deutschland
          </div>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            Faire Angebote für{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Ihre Wertstoffe.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Vergleichen Sie Vergütungen, Konditionen und Abholzeiten für
            Elektroschrott, Metall, Papier, Kunststoff und mehr – transparent
            und unverbindlich.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" onClick={onRequest} className="shadow-elegant">
              Angebot anfragen
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#angebote">Angebote ansehen</a>
            </Button>
          </div>
          <ul className="mt-8 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            {[
              "Kostenfreier Preisvergleich",
              "Abholung oder Anlieferung",
              "Zertifizierte Entsorger",
              "Antwort innerhalb von 24 h",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-elegant">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Tagesaktuelle Vergütung
                </p>
                <p className="font-display text-2xl font-semibold">
                  Altmetall · gemischt
                </p>
              </div>
              <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                +3,2 % ggü. Vorwoche
              </span>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4">
              {[
                { label: "Kupfer", val: "6.420 €/t" },
                { label: "Aluminium", val: "1.180 €/t" },
                { label: "Stahl", val: "285 €/t" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-lg border border-border bg-muted/40 p-3"
                >
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="mt-1 font-semibold">{s.val}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 h-32 rounded-lg bg-gradient-hero/90 p-4 text-primary-foreground">
              <p className="text-xs opacity-90">Heute angefragt</p>
              <p className="font-display text-3xl font-semibold">128 Tonnen</p>
              <p className="mt-1 text-xs opacity-90">
                Über 40 Anbieter aktiv vermittelt
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}