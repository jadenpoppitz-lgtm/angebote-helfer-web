import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Clock,
  Cloud,
  Leaf,
  MapPin,
  QrCode,
  Search,
  Tag,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { languages, useLanguage, type Language } from "@/lib/i18n";
import { SERIAL_DB, DEMO_SERIAL, type Partner, type SerialLookup } from "@/data/partners";

const pageText = {
  de: {
    back: "Zurück",
    eyebrow: "Rückgabe",
    title: "Seriennummer prüfen",
    intro:
      "Scannen Sie den QR-Code auf Ihrer Leiterplatte oder Baugruppe oder geben Sie die Seriennummer ein. Wir zeigen Ihnen Rückgabestellen in Ihrer Stadt.",
    placeholder: "z. B. KB-DD-0001",
    submit: "Prüfen",
    demo: (serial: string) => `Test-Seriennummer verwenden (${serial})`,
    benefits: [
      {
        icon: Cloud,
        title: "CO₂ senken",
        text: "Jede zurückgegebene Baugruppe spart Primärgewinnung - Ihr persönlicher Beitrag wird dokumentiert.",
      },
      {
        icon: Award,
        title: "Zertifikate",
        text: "Sie erhalten ein digitales Rückgabezertifikat als Nachweis für Ihre Nachhaltigkeitsbilanz.",
      },
      {
        icon: Tag,
        title: "Rabattaktionen",
        text: "Künftig profitieren Sie bei Partner-Herstellern von Vergünstigungen auf Folgeprodukte.",
      },
    ],
    notFoundTitle: "Seriennummer nicht erkannt",
    notFoundText: "Bitte prüfen Sie Ihre Eingabe oder verwenden Sie die Test-Seriennummer.",
    recognized: "Erkannt",
    zip: "PLZ",
    returnPoints: (city: string) => `Rückgabestellen in ${city}`,
    partnerCount: (count: number) =>
      `${count} Partner in Ihrer Nähe nehmen Baugruppen und Leiterplatten an und leiten sie sortenrein an unsere Recyclinganlagen weiter.`,
    away: "entfernt",
    nextTitle: "So geht es weiter",
    process: [
      "Baugruppe bei einem Partner abgeben - kostenfrei, ohne Termin.",
      "Partner sortiert Leiterplatten und übergibt sie sortenrein an die Recyclinganlage.",
      "Edelmetalle fließen über uns zurück an den ursprünglichen Hersteller.",
    ],
    prototype: "Prototyp",
  },
  en: {
    back: "Back",
    eyebrow: "Return",
    title: "Check serial number",
    intro:
      "Scan the QR code on your circuit board or assembly, or enter the serial number. We will show return points in your city.",
    placeholder: "e.g. KB-DD-0001",
    submit: "Check",
    demo: (serial: string) => `Use demo serial number (${serial})`,
    benefits: [
      {
        icon: Cloud,
        title: "Reduce CO₂",
        text: "Every returned assembly avoids primary extraction - your personal contribution is documented.",
      },
      {
        icon: Award,
        title: "Certificates",
        text: "You receive a digital return certificate as proof for your sustainability balance.",
      },
      {
        icon: Tag,
        title: "Partner discounts",
        text: "In future, partner manufacturers can offer discounts on follow-up products.",
      },
    ],
    notFoundTitle: "Serial number not recognized",
    notFoundText: "Please check your entry or use the demo serial number.",
    recognized: "Recognized",
    zip: "ZIP",
    returnPoints: (city: string) => `Return points in ${city}`,
    partnerCount: (count: number) =>
      `${count} nearby partners accept assemblies and circuit boards and forward them sorted by material to our recycling plants.`,
    away: "away",
    nextTitle: "What happens next",
    process: [
      "Drop off the assembly with a partner - free of charge, no appointment needed.",
      "The partner sorts circuit boards and transfers them cleanly to the recycling plant.",
      "Precious metals flow back through us to the original manufacturer.",
    ],
    prototype: "Prototype",
  },
  zh: {
    back: "返回",
    eyebrow: "退回",
    title: "检查序列号",
    intro: "扫描电路板或组件上的二维码，或输入序列号。我们会显示您所在城市的退回网点。",
    placeholder: "例如 KB-DD-0001",
    submit: "检查",
    demo: (serial: string) => `使用测试序列号（${serial}）`,
    benefits: [
      {
        icon: Cloud,
        title: "减少二氧化碳",
        text: "每个退回的组件都能减少原生资源开采，并记录您的个人贡献。",
      },
      {
        icon: Award,
        title: "证书",
        text: "您会获得数字退回证书，用于证明可持续发展贡献。",
      },
      {
        icon: Tag,
        title: "合作优惠",
        text: "未来您可在合作制造商处享受后续产品优惠。",
      },
    ],
    notFoundTitle: "未识别序列号",
    notFoundText: "请检查输入，或使用测试序列号。",
    recognized: "已识别",
    zip: "邮编",
    returnPoints: (city: string) => `${city} 的退回网点`,
    partnerCount: (count: number) => `${count} 个附近合作伙伴接收组件和电路板，并分类送往我们的回收设施。`,
    away: "距离",
    nextTitle: "接下来如何处理",
    process: [
      "将组件交给合作伙伴 - 免费，无需预约。",
      "合作伙伴对电路板进行分类，并送至回收设施。",
      "贵金属通过我们回流给原始制造商。",
    ],
    prototype: "原型",
  },
} as const;

const partnerTypeLabels: Record<Language, Record<Partner["type"], string>> = {
  de: {
    Sammelstelle: "Sammelstelle",
    Fachhändler: "Fachhändler",
    Servicepartner: "Servicepartner",
  },
  en: {
    Sammelstelle: "Collection point",
    Fachhändler: "Specialist retailer",
    Servicepartner: "Service partner",
  },
  zh: {
    Sammelstelle: "收集点",
    Fachhändler: "专业经销商",
    Servicepartner: "服务伙伴",
  },
};

function deviceLabel(result: SerialLookup, language: Language) {
  const normalized = result.device.replace(/Â·/g, "·");
  if (language === "en") {
    return normalized
      .replace("Steuerungsmodul · Leiterplatte Rev. C", "Control module · circuit board Rev. C")
      .replace("Leiterplatte · Sensorboard", "Circuit board · sensor board")
      .replace("Hauptplatine · Industriesteuerung", "Mainboard · industrial controller");
  }
  if (language === "zh") {
    return normalized
      .replace("Steuerungsmodul · Leiterplatte Rev. C", "控制模块 · 电路板 Rev. C")
      .replace("Leiterplatte · Sensorboard", "电路板 · 传感器板")
      .replace("Hauptplatine · Industriesteuerung", "主板 · 工业控制器");
  }
  return normalized;
}

const Index = () => {
  const [params, setParams] = useSearchParams();
  const initial = params.get("serial") ?? "";
  const [input, setInput] = useState(initial);
  const [result, setResult] = useState<SerialLookup | null>(null);
  const [notFound, setNotFound] = useState(false);
  const { language, setLanguage, cityLabel } = useLanguage();
  const copy = pageText[language];

  const lookup = (raw: string) => {
    const key = raw.trim().toUpperCase();
    const hit = SERIAL_DB[key];
    if (hit) {
      setResult(hit);
      setNotFound(false);
      setParams({ role: "kunde", serial: key }, { replace: true });
    } else {
      setResult(null);
      setNotFound(key.length > 0);
    }
  };

  useEffect(() => {
    if (initial) lookup(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    lookup(input);
  };

  const useDemo = () => {
    setInput(DEMO_SERIAL);
    lookup(DEMO_SERIAL);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60">
        <div className="container flex h-16 items-center justify-between gap-2 sm:gap-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-background">
              <Leaf className="h-4 w-4" />
            </span>
            <span className="font-display text-sm font-semibold uppercase tracking-[0.16em] sm:text-base sm:tracking-[0.2em]">
              Kernbeißer
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="flex rounded-md border border-border bg-muted/40 p-1" aria-label="Language">
              {languages.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setLanguage(item.code)}
                  aria-label={item.label}
                  className={`h-8 rounded px-2 text-xs font-medium ${
                    language === item.code ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  {item.short}
                </button>
              ))}
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground sm:text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              {copy.back}
            </Link>
          </div>
        </div>
      </header>

      <main className="container max-w-3xl py-16 md:py-24">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            {copy.eyebrow}
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold md:text-5xl">
            {copy.title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground md:text-base">
            {copy.intro}
          </p>
        </div>

        <form onSubmit={onSubmit} className="mx-auto mt-10 flex max-w-xl flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <QrCode className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-12 pl-10 text-base tracking-wider"
              placeholder={copy.placeholder}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              autoFocus
            />
          </div>
          <Button type="submit" size="lg" className="h-12 px-6">
            <Search className="mr-2 h-4 w-4" />
            {copy.submit}
          </Button>
        </form>
        <div className="mx-auto mt-3 max-w-xl text-center">
          <button
            onClick={useDemo}
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {copy.demo(DEMO_SERIAL)}
          </button>
        </div>

        <section className="mx-auto mt-14 grid max-w-3xl gap-4 sm:grid-cols-3">
          {copy.benefits.map((benefit) => (
            <div key={benefit.title} className="rounded-xl border border-border bg-card p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <benefit.icon className="h-4 w-4" />
              </div>
              <p className="mt-3 font-display text-sm font-semibold">{benefit.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{benefit.text}</p>
            </div>
          ))}
        </section>

        {notFound && (
          <div className="mx-auto mt-10 max-w-xl rounded-lg border border-border bg-card p-6 text-center">
            <p className="font-medium">{copy.notFoundTitle}</p>
            <p className="mt-1 text-sm text-muted-foreground">{copy.notFoundText}</p>
          </div>
        )}

        {result && (
          <section className="mt-14">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {copy.recognized}
                  </div>
                  <p className="mt-2 font-display text-xl font-semibold">{deviceLabel(result, language)}</p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">{result.serial}</p>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-1.5 text-sm font-medium">
                    <MapPin className="h-4 w-4 text-primary" />
                    {cityLabel(result.city)}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {copy.zip} {result.postalCode}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <h2 className="font-display text-xl font-semibold">
                {copy.returnPoints(cityLabel(result.city))}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {copy.partnerCount(result.partners.length)}
              </p>

              <ul className="mt-6 divide-y divide-border rounded-xl border border-border bg-card">
                {result.partners.map((partner) => (
                  <li
                    key={partner.id}
                    className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{partner.name}</span>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          {partnerTypeLabels[language][partner.type]}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{partner.street}</p>
                      <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {partner.hours}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground sm:text-right">
                      <span className="font-medium text-foreground">{partner.distanceKm.toFixed(1)} km</span>{" "}
                      {copy.away}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-12 rounded-xl border border-border bg-muted/30 p-6">
              <h3 className="font-display text-base font-semibold">{copy.nextTitle}</h3>
              <ol className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
                {copy.process.map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
                      {index + 1}
                    </span>
                    <span className="text-muted-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-border/60 py-8">
        <div className="container text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Kernbeißer · {copy.prototype}
        </div>
      </footer>
    </div>
  );
};

export default Index;
