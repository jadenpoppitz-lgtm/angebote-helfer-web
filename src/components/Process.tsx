import { Search, FileText, Truck, Wallet } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "Angebote vergleichen",
    desc: "Filtern Sie nach Material, Region und Konditionen.",
  },
  {
    icon: FileText,
    title: "Anfrage senden",
    desc: "In zwei Minuten unverbindlich anfragen – kostenfrei.",
  },
  {
    icon: Truck,
    title: "Abholung oder Anlieferung",
    desc: "Termin nach Absprache, deutschlandweit organisiert.",
  },
  {
    icon: Wallet,
    title: "Vergütung erhalten",
    desc: "Transparente Abrechnung und schnelle Auszahlung.",
  },
];

export function Process() {
  return (
    <section id="ablauf" className="bg-muted/40 py-16">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Ablauf
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">
            In vier Schritten zum besten Angebot
          </h2>
        </div>
        <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              className="relative rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              <span className="absolute -top-3 left-6 rounded-full bg-gradient-hero px-3 py-1 text-xs font-semibold text-primary-foreground">
                Schritt {i + 1}
              </span>
              <s.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 font-display text-lg font-semibold">
                {s.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}