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
  TrendingDown,
  Globe2,
  CheckCircle2,
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
    icon: TrendingDown,
    title: "Bis zu 18 % geringere Materialkosten",
    text: "Recycelte Edelmetalle aus Ihrem eigenen Materialstrom sind günstiger als LBMA-Spot zzgl. Aufschlägen Ihres Halbzeug-Lieferanten.",
  },
  {
    icon: ShieldCheck,
    title: "Versorgungs­sicherheit",
    text: "Unabhängig von Spot-Volatilität, Mine-to-Market-Risiken und geopolitischen Engpässen bei Pd und Pt.",
  },
  {
    icon: Globe2,
    title: "Scope-3 Reduktion",
    text: "Closed-Loop-Edelmetalle sparen pro kg Gold bis zu 16 t CO₂e gegenüber Primärgewinnung – auditierbar dokumentiert.",
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
              <div className="relative mx-auto aspect-square w-full max-w-md">
                <div className="absolute inset-0 rounded-full border border-background/20" />
                <div className="absolute inset-6 rounded-full border border-dashed border-background/30" />
                <div className="absolute inset-12 rounded-full bg-background/5 backdrop-blur" />
                <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-background px-4 py-3 text-center text-foreground shadow-elegant">
                  <Factory className="mx-auto h-5 w-5 text-primary" />
                  <p className="mt-1 text-xs font-semibold">OEM</p>
                </div>
                <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 rounded-2xl bg-background px-4 py-3 text-center text-foreground shadow-elegant">
                  <CircuitBoard className="mx-auto h-5 w-5 text-primary" />
                  <p className="mt-1 text-xs font-semibold">PCB</p>
                </div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rounded-2xl bg-background px-4 py-3 text-center text-foreground shadow-elegant">
                  <Recycle className="mx-auto h-5 w-5 text-primary" />
                  <p className="mt-1 text-xs font-semibold">Refining</p>
                </div>
                <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-background px-4 py-3 text-center text-foreground shadow-elegant">
                  <Coins className="mx-auto h-5 w-5 text-accent" />
                  <p className="mt-1 text-xs font-semibold">Au / Ag / Pd</p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full bg-[hsl(150_70%_75%)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(152_55%_14%)]">
                    Closed Loop
                  </div>
                </div>
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
        <section id="kreislauf" className="container py-20">
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
        <section className="bg-gradient-soft py-20">
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
        <section className="container py-20">
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
        <section id="anfrage" className="border-t border-border bg-secondary/40 py-20">
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
