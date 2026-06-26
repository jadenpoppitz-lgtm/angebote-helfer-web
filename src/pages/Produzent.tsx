import { Link } from "react-router-dom";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { useLanguage, type Language } from "@/lib/i18n";
import {
  ArrowRight,
  CheckCircle2,
  CircuitBoard,
  Coins,
  Factory,
  Flame,
  Globe2,
  LineChart,
  Recycle,
  ShieldCheck,
  Users,
} from "lucide-react";

const metalColors = {
  Au: "from-amber-300 to-amber-500",
  Ag: "from-slate-200 to-slate-400",
  Pd: "from-zinc-300 to-zinc-500",
  Pt: "from-neutral-200 to-neutral-400",
  Cu: "from-orange-300 to-orange-600",
};

const copy = {
  de: {
    heroBadge: "Für OEM & Produzenten",
    heroTitleA: "Edelmetalle aus Ihren Leiterplatten -",
    heroTitleB: "zurück in Ihre Produktion.",
    heroText:
      "Wir betreiben einen geschlossenen Materialkreislauf ausschließlich für Edelmetalle aus Elektronikschrott. Kein Papier, kein Mischabfall - nur das, was wirklich Wert hat: Gold, Silber, Palladium, Platin und HG-Kupfer. Direkt aus Ihrer Leiterplatte zurück an Sie oder Ihren Halbzeug-Lieferanten.",
    primaryCta: "Closed-Loop anfragen",
    secondaryCta: "So funktioniert der Kreislauf",
    stats: [
      ["Rückgewinnung", "> 98 %"],
      ["Reinheit", "999,9 ‰"],
      ["Lieferzeit", "14 Tage"],
    ],
    loopCaption: "Closed Loop · Materialhoheit beim OEM",
    loopViz: [
      ["OEM", "Produktion & Hoheit über Material"],
      ["Kunde", "Gibt Gerät / PCB zurück"],
      ["Kernbeißer", "Sammelt, sortiert, dokumentiert"],
      ["Hochofen / Refining", "Verarbeitet auf Weisung des OEM"],
    ],
    metalBack: "Edelmetall zurück an OEM",
    loopNote:
      "Der OEM bestimmt, wohin die zurückgewonnenen Edelmetalle vom Hochofen geliefert werden - die Hoheit über das Material bleibt jederzeit beim Hersteller.",
    scopeStrong: "Wir konzentrieren uns bewusst auf Edelmetalle.",
    scopeText:
      "Papier, Kunststoff und Mischschrott gehören nicht zu unserem Kreislauf - das hält die Rückgewinnungsquote hoch und Ihre Materialkosten niedrig.",
    customerMarket: "Allgemeiner Angebotsmarkt",
    flowEyebrow: "Materialfluss",
    flowTitle: "Vier Stationen. Ein geschlossener Kreislauf.",
    flowText: "Ihre Leiterplatten verlassen den Betrieb nie wirklich - sie kommen als Reinmetall zurück.",
    loopSteps: [
      ["OEM-Produktion", "Ihre elektronischen Baugruppen verlassen das Werk - mit definierter Stückliste und bekanntem Edelmetallanteil."],
      ["End-of-Life Rückführung", "Leiterplatten, Bestückungsausschuss und Retouren werden lückenlos erfasst, dokumentiert und versiegelt zurückgeführt."],
      ["Edelmetall-Aufbereitung", "Hydrometallurgische Trennung von Au, Ag, Pd, Pt und HG-Kupfer auf LBMA-Reinheit."],
      ["Rücklieferung an OEM", "Die zurückgewonnenen Edelmetalle gehen als Barren oder Halbzeug direkt an Sie oder Ihren benannten Halbzeug-Lieferanten."],
    ],
    metalsEyebrow: "Rückgewonnene Metalle",
    metalsTitle: "Nur Edelmetalle. Direkt in OEM-Qualität.",
    metalsText:
      "Typische Ausbeuten pro Tonne bestückter Leiterplatten - abhängig von Baugruppe und Bestückungsdichte.",
    metals: [
      ["Au", "Gold", "200-350 g / t PCB", "Bonddrähte, Steckverbinder, IC-Pins"],
      ["Ag", "Silber", "600-1.300 g / t PCB", "Lotpasten, Kontakte, Leitkleber"],
      ["Pd", "Palladium", "80-150 g / t PCB", "MLCC, Plattierungen, Sensorik"],
      ["Pt", "Platin", "5-25 g / t PCB", "Sensoren, HDD, Spezial-Bauteile"],
      ["Cu", "Kupfer (HG)", "160-220 kg / t PCB", "Leiterbahnen, Spulen, Trägermaterial"],
    ],
    benefits: [
      ["Versorgungssicherheit", "Unabhängig von Spot-Volatilität und geopolitischen Engpässen bei Au, Pd und Pt - Ihr Materialstrom kommt aus Ihrem eigenen Bestand zurück."],
      ["Emissionskontrolle", "Closed-Loop-Edelmetalle sparen pro kg Gold bis zu 16 t CO₂e gegenüber Primärgewinnung - auditierbar pro Charge dokumentiert."],
      ["Reporting & Berichtspflicht", "Monatliche Reports für Scope-3, Lieferkettengesetz und CSRD - Sie geben die Zahlen einfach weiter."],
    ],
    requestEyebrow: "Closed-Loop-Vereinbarung",
    requestTitle: "Ihre Leiterplatten. Ihre Edelmetalle. Zurück an Sie.",
    requestText:
      "Senden Sie uns ein typisches Mengen- und Baugruppenprofil. Wir erstellen ein individuelles Konzept inkl. Logistik, Refining-Konditionen und Rücklieferung als Barren oder Halbzeug.",
    bullets: [
      "Versiegelte Sammlung & dokumentierte Chain-of-Custody",
      "LBMA-konforme Scheidung mit Probenahme im Vier-Augen-Prinzip",
      "Rücklieferung an OEM oder benannten Halbzeug-Lieferanten",
      "Monatliches Reporting für Scope-3 & Lieferkettengesetz",
    ],
    company: "Unternehmen",
    contact: "Ansprechpartner",
    email: "E-Mail",
    volume: "Geschätztes Jahresvolumen Leiterplatten",
    volumePlaceholder: "z. B. 12 t / Jahr",
    notes: "Baugruppen / Besonderheiten",
    notesPlaceholder: "Industrie-Steuerungen, Telekom-Module, ...",
    submit: "Closed-Loop-Konzept anfordern",
    formNote: "Unverbindlich · Antwort binnen 24h · NDA auf Wunsch",
    toastTitle: "Anfrage erhalten",
    toastDescription: "Wir melden uns binnen 24h mit einem Closed-Loop-Konzept für Ihre Edelmetallströme.",
  },
  en: {
    heroBadge: "For OEMs & producers",
    heroTitleA: "Precious metals from your circuit boards -",
    heroTitleB: "back into your production.",
    heroText:
      "We operate a closed material loop focused exclusively on precious metals from electronic scrap. No paper, no mixed waste - only what truly carries value: gold, silver, palladium, platinum and high-grade copper. From your circuit board directly back to you or your appointed semi-finished goods supplier.",
    primaryCta: "Request closed loop",
    secondaryCta: "How the loop works",
    stats: [
      ["Recovery", "> 98 %"],
      ["Purity", "999.9 ‰"],
      ["Lead time", "14 days"],
    ],
    loopCaption: "Closed loop · OEM retains material control",
    loopViz: [
      ["OEM", "Production & material ownership"],
      ["Customer", "Returns device / PCB"],
      ["Kernbeißer", "Collects, sorts, documents"],
      ["Smelter / refining", "Processes on OEM instruction"],
    ],
    metalBack: "Precious metal back to OEM",
    loopNote:
      "The OEM decides where recovered precious metals are delivered from the smelter - material control remains with the manufacturer at all times.",
    scopeStrong: "We deliberately focus on precious metals.",
    scopeText:
      "Paper, plastics and mixed scrap are not part of this loop - keeping recovery rates high and material costs low.",
    customerMarket: "General customer market",
    flowEyebrow: "Material flow",
    flowTitle: "Four stations. One closed loop.",
    flowText: "Your circuit boards never truly leave your operation - they return as refined metal.",
    loopSteps: [
      ["OEM production", "Your electronic assemblies leave the factory with defined BOM data and known precious-metal content."],
      ["End-of-life return", "Circuit boards, assembly scrap and returns are captured, documented, sealed and returned without gaps."],
      ["Precious-metal refining", "Hydrometallurgical separation of Au, Ag, Pd, Pt and high-grade copper to LBMA-level purity."],
      ["Return delivery to OEM", "Recovered precious metals go directly to you or your named semi-finished goods supplier as bars or feedstock."],
    ],
    metalsEyebrow: "Recovered metals",
    metalsTitle: "Only precious metals. Directly in OEM quality.",
    metalsText: "Typical yields per ton of populated circuit boards - depending on assembly and component density.",
    metals: [
      ["Au", "Gold", "200-350 g / t PCB", "Bond wires, connectors, IC pins"],
      ["Ag", "Silver", "600-1,300 g / t PCB", "Solder pastes, contacts, conductive adhesives"],
      ["Pd", "Palladium", "80-150 g / t PCB", "MLCC, platings, sensors"],
      ["Pt", "Platinum", "5-25 g / t PCB", "Sensors, HDD, special components"],
      ["Cu", "Copper (HG)", "160-220 kg / t PCB", "Traces, coils, carrier material"],
    ],
    benefits: [
      ["Supply security", "Less exposure to spot volatility and geopolitical bottlenecks for Au, Pd and Pt - your material stream comes back from your own stock."],
      ["Emission control", "Closed-loop precious metals can save up to 16 t CO₂e per kg of gold versus primary extraction - auditable per batch."],
      ["Reporting & compliance", "Monthly reports for Scope 3, supply-chain obligations and CSRD - ready to pass on internally."],
    ],
    requestEyebrow: "Closed-loop agreement",
    requestTitle: "Your circuit boards. Your precious metals. Back to you.",
    requestText:
      "Send us a typical volume and assembly profile. We will prepare an individual concept covering logistics, refining terms and return delivery as bars or semi-finished material.",
    bullets: [
      "Sealed collection & documented chain of custody",
      "LBMA-aligned separation with four-eyes sampling",
      "Return delivery to OEM or named semi-finished goods supplier",
      "Monthly reporting for Scope 3 & supply-chain requirements",
    ],
    company: "Company",
    contact: "Contact person",
    email: "Email",
    volume: "Estimated annual PCB volume",
    volumePlaceholder: "e.g. 12 t / year",
    notes: "Assemblies / details",
    notesPlaceholder: "Industrial controllers, telecom modules, ...",
    submit: "Request closed-loop concept",
    formNote: "Non-binding · response within 24h · NDA on request",
    toastTitle: "Request received",
    toastDescription: "We will respond within 24h with a closed-loop concept for your precious-metal streams.",
  },
  zh: {
    heroBadge: "面向 OEM 与生产商",
    heroTitleA: "从您的电路板中回收贵金属 -",
    heroTitleB: "重新回到您的生产中。",
    heroText:
      "我们运营专注于电子废料贵金属的闭环材料体系。不处理纸张或混合废料，只处理真正有价值的金、银、钯、铂和高品位铜。材料从您的电路板直接回到您或您指定的半成品供应商。",
    primaryCta: "申请闭环方案",
    secondaryCta: "了解循环流程",
    stats: [
      ["回收率", "> 98 %"],
      ["纯度", "999.9 ‰"],
      ["交付周期", "14 天"],
    ],
    loopCaption: "闭环 · OEM 保持材料控制权",
    loopViz: [
      ["OEM", "生产与材料所有权"],
      ["客户", "退回设备 / PCB"],
      ["Kernbeißer", "收集、分类、记录"],
      ["冶炼 / 精炼", "按 OEM 指示处理"],
    ],
    metalBack: "贵金属回到 OEM",
    loopNote: "OEM 决定精炼后的贵金属交付方向，材料控制权始终保留在制造商手中。",
    scopeStrong: "我们有意识地专注于贵金属。",
    scopeText: "纸张、塑料和混合废料不属于此循环，因此可保持较高回收率并降低材料成本。",
    customerMarket: "通用客户入口",
    flowEyebrow: "材料流",
    flowTitle: "四个站点，一个闭环。",
    flowText: "您的电路板并不会真正离开体系，它们会以精炼金属形式回归。",
    loopSteps: [
      ["OEM 生产", "电子组件带着明确物料清单和已知贵金属含量离开工厂。"],
      ["寿命终止回收", "电路板、装配废料和退货被完整记录、封存并回收。"],
      ["贵金属精炼", "通过湿法冶金分离 Au、Ag、Pd、Pt 和高品位铜，达到 LBMA 级纯度。"],
      ["交付回 OEM", "回收贵金属以金属锭或半成品形式直接交付给您或指定供应商。"],
    ],
    metalsEyebrow: "回收金属",
    metalsTitle: "只处理贵金属，直接达到 OEM 质量。",
    metalsText: "以下为每吨装配电路板的典型产出，实际取决于组件类型和装配密度。",
    metals: [
      ["Au", "金", "200-350 g / t PCB", "键合线、连接器、IC 引脚"],
      ["Ag", "银", "600-1,300 g / t PCB", "焊膏、触点、导电胶"],
      ["Pd", "钯", "80-150 g / t PCB", "MLCC、镀层、传感器"],
      ["Pt", "铂", "5-25 g / t PCB", "传感器、硬盘、特殊元件"],
      ["Cu", "铜（高品位）", "160-220 kg / t PCB", "线路、线圈、基材"],
    ],
    benefits: [
      ["供应安全", "减少 Au、Pd 和 Pt 价格波动及地缘瓶颈影响，材料流来自您自己的库存。"],
      ["排放控制", "与原生开采相比，闭环贵金属每公斤金最多可节省 16 吨 CO₂e，并可按批次审计。"],
      ["报告与合规", "每月提供 Scope 3、供应链要求和 CSRD 报告，便于内部转交。"],
    ],
    requestEyebrow: "闭环协议",
    requestTitle: "您的电路板，您的贵金属，回到您手中。",
    requestText:
      "请发送典型数量和组件信息。我们会制定包含物流、精炼条件和金属锭或半成品回交的个性化方案。",
    bullets: [
      "密封收集并记录监管链",
      "符合 LBMA 思路的分离与双人取样",
      "交付回 OEM 或指定半成品供应商",
      "每月提供 Scope 3 与供应链要求报告",
    ],
    company: "公司",
    contact: "联系人",
    email: "电子邮箱",
    volume: "预计年度 PCB 数量",
    volumePlaceholder: "例如 12 吨 / 年",
    notes: "组件 / 备注",
    notesPlaceholder: "工业控制器、通信模块等 ...",
    submit: "申请闭环方案",
    formNote: "无约束 · 24小时内回复 · 可按需签署 NDA",
    toastTitle: "申请已收到",
    toastDescription: "我们将在24小时内为您的贵金属流提供闭环方案。",
  },
} as const;

const loopIcons = [Factory, CircuitBoard, Recycle, Coins];
const vizIcons = [Factory, Users, Recycle, Flame];
const benefitIcons = [ShieldCheck, Globe2, LineChart];

const Produzent = () => {
  const { language } = useLanguage();
  const t = copy[language as Language];
  const [form, setForm] = useState({
    company: "",
    contact: "",
    email: "",
    volume: "",
    notes: "",
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    toast.success(t.toastTitle, {
      description: t.toastDescription,
    });
    setForm({ company: "", contact: "", email: "", volume: "", notes: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onRequest={() => {}} />
      <main>
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
                <Recycle className="h-3.5 w-3.5" /> {t.heroBadge}
              </span>
              <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.05] md:text-6xl">
                {t.heroTitleA}
                <span className="block text-[hsl(150_70%_75%)]">{t.heroTitleB}</span>
              </h1>
              <p className="mt-6 max-w-xl text-base text-background/85 md:text-lg">{t.heroText}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-background text-foreground hover:bg-background/90">
                  <a href="#anfrage">
                    {t.primaryCta} <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-background/40 bg-transparent text-background hover:bg-background/10 hover:text-background"
                >
                  <a href="#kreislauf">{t.secondaryCta}</a>
                </Button>
              </div>
              <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 text-background">
                {t.stats.map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs uppercase tracking-wider text-background/70">{label}</dt>
                    <dd className="mt-1 font-display text-2xl font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative">
              <div className="relative mx-auto w-full max-w-md rounded-3xl border border-background/20 bg-background/5 p-6 backdrop-blur">
                <p className="text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-background/70">
                  {t.loopCaption}
                </p>
                <ol className="mt-6 space-y-3">
                  {t.loopViz.map(([label, sub], index) => {
                    const Icon = vizIcons[index];
                    return (
                      <li key={label} className="flex items-center gap-3 rounded-xl bg-background/10 px-3 py-2.5 ring-1 ring-background/15">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background text-foreground">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold leading-tight">{label}</p>
                          <p className="truncate text-[11px] text-background/70">{sub}</p>
                        </div>
                        <span className="text-[10px] font-mono text-background/50">0{index + 1}</span>
                      </li>
                    );
                  })}
                </ol>
                <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[hsl(150_70%_75%)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[hsl(152_55%_14%)]">
                  <Coins className="h-3.5 w-3.5" />
                  {t.metalBack}
                </div>
                <p className="mt-3 text-center text-[11px] leading-relaxed text-background/70">{t.loopNote}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-secondary/50">
          <div className="container flex flex-col items-start gap-3 py-6 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-secondary-foreground">
              <strong className="font-semibold">{t.scopeStrong}</strong> {t.scopeText}
            </p>
            <Link to="/angebote" className="inline-flex items-center text-sm font-semibold text-primary hover:underline">
              {t.customerMarket} <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        <section id="kreislauf" className="container py-20 scroll-mt-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">{t.flowEyebrow}</p>
            <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">{t.flowTitle}</h2>
            <p className="mt-3 text-muted-foreground">{t.flowText}</p>
          </div>

          <ol className="mt-12 grid gap-6 md:grid-cols-4">
            {t.loopSteps.map(([title, text], index) => {
              const Icon = loopIcons[index];
              return (
                <li key={title} className="relative rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-xs font-semibold text-muted-foreground">0{index + 1}</span>
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{text}</p>
                </li>
              );
            })}
          </ol>
        </section>

        <section id="metalle" className="bg-gradient-soft py-20 scroll-mt-20">
          <div className="container">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
              <div className="max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">{t.metalsEyebrow}</p>
                <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">{t.metalsTitle}</h2>
              </div>
              <p className="max-w-md text-sm text-muted-foreground">{t.metalsText}</p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {t.metals.map(([symbol, name, yieldText, use]) => (
                <div
                  key={symbol}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-transform duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]"
                >
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${metalColors[symbol as keyof typeof metalColors]}`} />
                  <div className="flex items-baseline justify-between">
                    <span className="font-display text-3xl font-semibold">{symbol}</span>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">{name}</span>
                  </div>
                  <p className="mt-6 text-sm font-semibold text-foreground">{yieldText}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{use}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="vorteile" className="container py-20 scroll-mt-20">
          <div className="grid gap-10 md:grid-cols-3">
            {t.benefits.map(([title, text], index) => {
              const Icon = benefitIcons[index];
              return (
                <div key={title}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-semibold">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{text}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section id="anfrage" className="border-t border-border bg-secondary/40 py-20 scroll-mt-20">
          <div className="container grid gap-12 md:grid-cols-[1fr_1.1fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">{t.requestEyebrow}</p>
              <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">{t.requestTitle}</h2>
              <p className="mt-4 text-muted-foreground">{t.requestText}</p>
              <ul className="mt-6 space-y-3 text-sm">
                {t.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] md:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="company">{t.company}</Label>
                  <Input
                    id="company"
                    required
                    value={form.company}
                    onChange={(event) => setForm({ ...form, company: event.target.value })}
                    placeholder="OEM GmbH"
                  />
                </div>
                <div>
                  <Label htmlFor="contact">{t.contact}</Label>
                  <Input
                    id="contact"
                    required
                    value={form.contact}
                    onChange={(event) => setForm({ ...form, contact: event.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">{t.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="volume">{t.volume}</Label>
                  <Input
                    id="volume"
                    placeholder={t.volumePlaceholder}
                    value={form.volume}
                    onChange={(event) => setForm({ ...form, volume: event.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="notes">{t.notes}</Label>
                  <Textarea
                    id="notes"
                    rows={4}
                    placeholder={t.notesPlaceholder}
                    value={form.notes}
                    onChange={(event) => setForm({ ...form, notes: event.target.value })}
                  />
                </div>
              </div>
              <Button type="submit" size="lg" className="mt-6 w-full">
                {t.submit}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">{t.formNote}</p>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Produzent;
