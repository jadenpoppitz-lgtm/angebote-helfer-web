import { Link } from "react-router-dom";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import {
  ArrowRight,
  CircuitBoard,
  Factory,
  Recycle,
  Coins,
  ShieldCheck,
  Globe2,
  CheckCircle2,
  Flame,
  Users,
  LineChart,
} from "lucide-react";

type Metal = {
  symbol: string;
  name: string;
  yield: string;
  use: string;
  color: string;
};

const METALS: Metal[] = [
  {
    symbol: "Au",
    name: "Gold",
    yield: "200–350 g / t PCB",
    use: "Bonddrähte, Steckverbinder, IC-Pins",
    color: "from-amber-300 to-amber-500",
  },
  {
    symbol: "Ag",
    name: "Silber",
    yield: "600–1.300 g / t PCB",
    use: "Lotpasten, Kontakte, Leitkleber",
    color: "from-slate-200 to-slate-400",
  },
  {
    symbol: "Pd",
    name: "Palladium",
    yield: "80–150 g / t PCB",
    use: "MLCC, Plattierungen, Sensorik",
    color: "from-zinc-300 to-zinc-500",
  },
  {
    symbol: "Pt",
    name: "Platin",
    yield: "5–25 g / t PCB",
    use: "Sensoren, HDD, Spezial-Bauteile",
    color: "from-neutral-200 to-neutral-400",
  },
  {
    symbol: "Cu",
    name: "Kupfer (HG)",
    yield: "160–220 kg / t PCB",
    use: "Leiterbahnen, Spulen, Trägermaterial",
    color: "from-orange-300 to-orange-600",
  },
];

const LOOP = [
  {
    icon: Factory,
    title: "OEM-Produktion",
    text: "Ihre elektronischen Baugruppen verlassen das Werk – mit definierter Stückliste und bekanntem Edelmetall­anteil.",
  },
  {
    icon: CircuitBoard,
    title: "End-of-Life Rückführung",
    text: "Leiterplatten, Bestückungs­ausschuss und Retouren werden lückenlos erfasst, dokumentiert und versiegelt zurückgeführt.",
  },
  {
    icon: Recycle,
    title: "Edelmetall-Aufbereitung",
    text: "Hydrometallurgische Trennung von Au, Ag, Pd, Pt und HG-Kupfer auf LBMA-Reinheit.",
  },
  {
    icon: Coins,
    title: "Rücklieferung an OEM",
    text: "Die zurück­gewonnenen Edelmetalle gehen als Barren oder Halbzeug direkt an Sie oder Ihren benannten Halbzeug-Lieferanten.",
  },
];

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: "Versorgungs­sicherheit",
    text: "Unabhängig von Spot-Volatilität und geopolitischen Engpässen bei Au, Pd und Pt – Ihr Materialstrom kommt aus Ihrem eigenen Bestand zurück.",
  },
  {
    icon: Globe2,
    title: "Emissions­kontrolle",
    text: "Closed-Loop-Edelmetalle sparen pro kg Gold bis zu 16 t CO₂e gegenüber Primärgewinnung – auditierbar pro Charge dokumentiert.",
  },
  {
    icon: LineChart,
    title: "Reporting & Berichts­pflicht",
    text: "Monatliche Reports für Scope-3, Lieferkettengesetz und CSRD – Sie geben die Zahlen einfach weiter.",
  },
];

const Produzent = () => {
  const [form, setForm] = useState({
    company: "",
    contact: "",
    email: "",
    volume: "",
    notes: "",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Anfrage erhalten", {
      description: "Wir melden uns binnen 24h mit einem Closed-Loop-Konzept für Ihre Edelmetallströme.",
    });
    setForm({ company: "", contact: "", email: "", volume: "", notes: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onRequest={() => {}} />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-[hsl(152_55%_14%)] via-[hsl(152_45%_22%)] to-[hsl(150_60%_28%)] text-background">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, hsl(60 30% 98%) 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="container relative grid gap-10 py-20 md:grid-cols-[1.1fr_0.9fr] md:py-28">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-background/25 bg-background/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] backdrop-blur">
                <Recycle className="h-3.5 w-3.5" /> Für OEM &amp; Produzenten
              </span>
              <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.05] md:text-6xl">
                Edelmetalle aus Ihren Leiterplatten —
                <span className="block text-[hsl(150_70%_75%)]">zurück in Ihre Produktion.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base text-background/85 md:text-lg">
                Wir betreiben einen geschlossenen Materialkreislauf ausschließlich für Edelmetalle aus
                Elektronikschrott. Kein Papier, kein Mischabfall – nur das, was wirklich Wert hat: Gold, Silber,
                Palladium, Platin und HG-Kupfer. Direkt aus Ihrer Leiterplatte zurück an Sie oder Ihren
                Halbzeug-Lieferanten.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-background text-foreground hover:bg-background/90">
                  <a href="#anfrage">
                    Closed-Loop anfragen <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-background/40 bg-transparent text-background hover:bg-background/10 hover:text-background"
                >
                  <a href="#kreislauf">So funktioniert der Kreislauf</a>
                </Button>
              </div>
              <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 text-background">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-background/70">Rückgewinnung</dt>
                  <dd className="mt-1 font-display text-2xl font-semibold">&gt; 98 %</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-background/70">Reinheit</dt>
                  <dd className="mt-1 font-display text-2xl font-semibold">999,9 ‰</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-background/70">Lieferzeit</dt>
                  <dd className="mt-1 font-display text-2xl font-semibold">14 Tage</dd>
                </div>
              </dl>
            </div>

            {/* Loop visualization */}
            <div className="relative">
              <div className="relative mx-auto w-full max-w-md rounded-3xl border border-background/20 bg-background/5 p-6 backdrop-blur">
                <p className="text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-background/70">
                  Closed Loop · Materialhoheit beim OEM
                </p>
                <ol className="mt-6 space-y-3">
                  {[
                    { icon: Factory, label: "OEM", sub: "Produktion & Hoheit über Material" },
                    { icon: Users, label: "Kunde", sub: "Gibt Gerät / PCB zurück" },
                    { icon: Recycle, label: "Kernbeißer", sub: "Sammelt, sortiert, dokumentiert" },
                    { icon: Flame, label: "Hochofen / Refining", sub: "Verarbeitet auf Weisung des OEM" },
                  ].map((s, i) => (
                    <li key={s.label} className="flex items-center gap-3 rounded-xl bg-background/10 px-3 py-2.5 ring-1 ring-background/15">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background text-foreground">
                        <s.icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold leading-tight">{s.label}</p>
                        <p className="truncate text-[11px] text-background/70">{s.sub}</p>
                      </div>
                      <span className="text-[10px] font-mono text-background/50">0{i + 1}</span>
                    </li>
                  ))}
                </ol>
                <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[hsl(150_70%_75%)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[hsl(152_55%_14%)]">
                  <Coins className="h-3.5 w-3.5" />
                  Edelmetall zurück an OEM
                </div>
                <p className="mt-3 text-center text-[11px] leading-relaxed text-background/70">
                  Der OEM bestimmt, wohin die zurück­gewonnenen Edelmetalle vom Hochofen geliefert werden – die Hoheit über das Material bleibt jederzeit beim Hersteller.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Scope notice */}
        <section className="border-b border-border bg-secondary/50">
          <div className="container flex flex-col items-start gap-3 py-6 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-secondary-foreground">
              <strong className="font-semibold">Wir konzentrieren uns bewusst auf Edelmetalle.</strong> Papier,
              Kunststoff und Mischschrott gehören nicht zu unserem Kreislauf – das hält die Rückgewinnungsquote hoch und
              Ihre Materialkosten niedrig.
            </p>
            <Link
              to="/angebote"
              className="inline-flex items-center text-sm font-semibold text-primary hover:underline"
            >
              Allgemeiner Angebotsmarkt <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        {/* Loop */}
        <section id="kreislauf" className="container py-20 scroll-mt-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Materialfluss</p>
            <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
              Vier Stationen. Ein geschlossener Kreislauf.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Ihre Leiterplatten verlassen den Betrieb nie wirklich – sie kommen als Reinmetall zurück.
            </p>
          </div>

          <ol className="mt-12 grid gap-6 md:grid-cols-4">
            {LOOP.map((step, i) => (
              <li
                key={step.title}
                className="relative rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-xs font-semibold text-muted-foreground">0{i + 1}</span>
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Metals */}
        <section id="metalle" className="bg-gradient-soft py-20 scroll-mt-20">
          <div className="container">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
              <div className="max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Rückgewonnene Metalle</p>
                <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
                  Nur Edelmetalle. Direkt in OEM-Qualität.
                </h2>
              </div>
              <p className="max-w-md text-sm text-muted-foreground">
                Typische Ausbeuten pro Tonne bestückter Leiterplatten — abhängig von Baugruppe und Bestückungs­dichte.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {METALS.map((m) => (
                <div
                  key={m.symbol}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-transform duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]"
                >
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${m.color}`} />
                  <div className="flex items-baseline justify-between">
                    <span className="font-display text-3xl font-semibold">{m.symbol}</span>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">{m.name}</span>
                  </div>
                  <p className="mt-6 text-sm font-semibold text-foreground">{m.yield}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{m.use}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section id="vorteile" className="container py-20 scroll-mt-20">
          <div className="grid gap-10 md:grid-cols-3">
            {BENEFITS.map((b) => (
              <div key={b.title}>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <b.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold">{b.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{b.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Anfrage */}
        <section id="anfrage" className="border-t border-border bg-secondary/40 py-20 scroll-mt-20">
          <div className="container grid gap-12 md:grid-cols-[1fr_1.1fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Closed-Loop-Vereinbarung</p>
              <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
                Ihre Leiterplatten. Ihre Edelmetalle. Zurück an Sie.
              </h2>
              <p className="mt-4 text-muted-foreground">
                Senden Sie uns ein typisches Mengen- und Baugruppenprofil. Wir erstellen ein individuelles Konzept inkl.
                Logistik, Refining- Konditionen und Rücklieferung als Barren oder Halbzeug.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "Versiegelte Sammlung & dokumentierte Chain-of-Custody",
                  "LBMA-konforme Scheidung mit Probenahme im Vier-Augen-Prinzip",
                  "Rücklieferung an OEM oder benannten Halbzeug-Lieferanten",
                  "Monatliches Reporting für Scope-3 & Lieferketten­gesetz",
                ].map((t) => (
                  <li key={t} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <form
              onSubmit={submit}
              className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] md:p-8"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="company">Unternehmen</Label>
                  <Input
                    id="company"
                    required
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    placeholder="OEM GmbH"
                  />
                </div>
                <div>
                  <Label htmlFor="contact">Ansprechpartner</Label>
                  <Input
                    id="contact"
                    required
                    value={form.contact}
                    onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-Mail</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="volume">Geschätztes Jahresvolumen Leiterplatten</Label>
                  <Input
                    id="volume"
                    placeholder="z. B. 12 t / Jahr"
                    value={form.volume}
                    onChange={(e) => setForm({ ...form, volume: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="notes">Baugruppen / Besonderheiten</Label>
                  <Textarea
                    id="notes"
                    rows={4}
                    placeholder="Industrie-Steuerungen, Telekom-Module, …"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>
              </div>
              <Button type="submit" size="lg" className="mt-6 w-full">
                Closed-Loop-Konzept anfordern
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Unverbindlich · Antwort binnen 24h · NDA auf Wunsch
              </p>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Produzent;
