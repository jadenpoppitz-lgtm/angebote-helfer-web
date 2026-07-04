import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Cpu,
  Gauge,
  Laptop,
  Leaf,
  Monitor,
  RefreshCw,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tablet,
  Watch,
} from "lucide-react";
import type { Language } from "@/lib/i18n";
import {
  DEVICE_CLASS_PROFILES,
  DEVICE_MODELS,
  classifyDevice,
  confidenceScore,
  findDeviceModel,
  normalizeDeviceText,
  type Confidence,
  type DeviceClass,
} from "@/data/deviceImpact";

type DetectionResult = {
  label: string;
  deviceClass: DeviceClass;
  platform: string;
  confidence: Confidence;
  source: "client-hints" | "user-agent" | "fallback";
};

type UaDataLike = {
  mobile?: boolean;
  platform?: string;
  getHighEntropyValues?: (hints: string[]) => Promise<{
    model?: string;
    platform?: string;
    formFactors?: string[];
    platformVersion?: string;
  }>;
};

const copy: Record<
  Language,
  {
    eyebrow: string;
    title: string;
    text: string;
    detected: string;
    detecting: string;
    confidence: string;
    confidenceLabels: Record<Confidence, string>;
    sourceLabels: Record<DetectionResult["source"], string>;
    manualSource: string;
    searchLabel: string;
    searchPlaceholder: string;
    useDetected: string;
    classLabel: string;
    classNames: Record<DeviceClass, string>;
    without: string;
    with: string;
    standardText: string;
    leafText: string;
    impactTitle: string;
    materialKept: string;
    co2Saved: string;
    credit: string;
    faster: string;
    compared: string;
    privacyTitle: string;
    privacyText: string;
    modelTitle: string;
    modelText: string;
    estimateTitle: string;
    estimateText: string;
    customHint: string;
    empty: string;
  }
> = {
  de: {
    eyebrow: "Device Impact",
    title: "Was dein Gerät mit Leaftronics im Kreislauf halten könnte.",
    text:
      "Wir erkennen dein Gerät nur so weit, wie der Browser es freiwillig preisgibt. Wenn das exakte Modell fehlt, rechnet der Simulator sauber mit der Geräteklasse weiter.",
    detected: "Aktuelles Gerät",
    detecting: "Gerät wird erkannt ...",
    confidence: "Erkennungsqualität",
    confidenceLabels: { high: "hoch", medium: "mittel", low: "niedrig" },
    sourceLabels: {
      "client-hints": "Browser Client Hints",
      "user-agent": "User-Agent",
      fallback: "Klassen-Fallback",
    },
    manualSource: "Manuell bestätigt",
    searchLabel: "Modell bestätigen oder ändern",
    searchPlaceholder: "z. B. iPhone 15, Galaxy S24, MacBook Air ...",
    useDetected: "Erkanntes Gerät verwenden",
    classLabel: "Geräteklasse",
    classNames: {
      smartphone: "Smartphone",
      tablet: "Tablet",
      laptop: "Laptop",
      desktop: "Desktop",
      wearable: "Wearable",
      device: "Elektronikgerät",
    },
    without: "Ohne Leaftronics",
    with: "Mit Leaftronics PCB",
    standardText: "Mischstrom, weniger Produktdaten, niedrigerer Rückführungsgrad.",
    leafText: "Design für Rückgabe, saubere PCB-Fraktion, dokumentierter Materialpfad.",
    impactTitle: "Dein modellierter Vorteil",
    materialKept: "mehr PCB im Kreislauf",
    co2Saved: "kg CO2e sparbar",
    credit: "EUR Gutschrift-Potenzial",
    faster: "Tage bis zur Rückführung",
    compared: "Vergleich basiert auf Prototyp-Annahmen pro Geräteklasse.",
    privacyTitle: "Privacy first",
    privacyText: "Keine IMEI, keine Seriennummer und keine Tracking-Cookies. Du entscheidest, welches Modell stimmt.",
    modelTitle: "Alle Modelle nutzbar",
    modelText: "Bekannte Geräte werden vorgeschlagen. Jedes andere Modell funktioniert über Freitext plus Klasse.",
    estimateTitle: "Kundenverständlich",
    estimateText: "Die Zahlen zeigen Potenzial, nicht ein offizielles Recycling-Zertifikat.",
    customHint: "Kein Treffer? Einfach Modell stehen lassen und unten die Klasse wählen.",
    empty: "Noch kein Modell ausgewählt",
  },
  en: {
    eyebrow: "Device impact",
    title: "What your device could keep in the loop with Leaftronics.",
    text:
      "We only detect what the browser voluntarily exposes. If the exact model is missing, the simulator continues with a clean device-class estimate.",
    detected: "Current device",
    detecting: "Detecting device ...",
    confidence: "Detection confidence",
    confidenceLabels: { high: "high", medium: "medium", low: "low" },
    sourceLabels: {
      "client-hints": "Browser Client Hints",
      "user-agent": "User-Agent",
      fallback: "Class fallback",
    },
    manualSource: "Manually confirmed",
    searchLabel: "Confirm or change model",
    searchPlaceholder: "e.g. iPhone 15, Galaxy S24, MacBook Air ...",
    useDetected: "Use detected device",
    classLabel: "Device class",
    classNames: {
      smartphone: "Smartphone",
      tablet: "Tablet",
      laptop: "Laptop",
      desktop: "Desktop",
      wearable: "Wearable",
      device: "Electronic device",
    },
    without: "Without Leaftronics",
    with: "With Leaftronics PCB",
    standardText: "Mixed stream, fewer product records, lower return rate.",
    leafText: "Return-ready design, clean PCB fraction, documented material path.",
    impactTitle: "Your modeled advantage",
    materialKept: "more PCB kept in a clean loop",
    co2Saved: "kg CO2e process effort avoidable",
    credit: "EUR material credit potential",
    faster: "days to material return",
    compared: "Comparison uses prototype assumptions per device class.",
    privacyTitle: "Privacy first",
    privacyText: "No IMEI, no serial number and no tracking cookies. You decide which model is correct.",
    modelTitle: "All models work",
    modelText: "Known devices are suggested. Any other model works through free text plus class.",
    estimateTitle: "Customer friendly",
    estimateText: "The values show potential, not an official recycling certificate.",
    customHint: "No match? Keep the model name and choose the class below.",
    empty: "No model selected yet",
  },
  zh: {
    eyebrow: "设备影响",
    title: "如果使用 Leaftronics，你的设备能留在循环中的价值。",
    text: "我们只读取浏览器主动提供的信息。没有精确型号时，模拟器会使用设备类别继续计算。",
    detected: "当前设备",
    detecting: "正在识别设备 ...",
    confidence: "识别可信度",
    confidenceLabels: { high: "高", medium: "中", low: "低" },
    sourceLabels: {
      "client-hints": "浏览器 Client Hints",
      "user-agent": "User-Agent",
      fallback: "类别回退",
    },
    manualSource: "手动确认",
    searchLabel: "确认或更改型号",
    searchPlaceholder: "例如 iPhone 15, Galaxy S24, MacBook Air ...",
    useDetected: "使用识别结果",
    classLabel: "设备类别",
    classNames: {
      smartphone: "智能手机",
      tablet: "平板",
      laptop: "笔记本",
      desktop: "台式设备",
      wearable: "可穿戴设备",
      device: "电子设备",
    },
    without: "没有 Leaftronics",
    with: "使用 Leaftronics PCB",
    standardText: "混合回收流、产品数据较少、回流比例较低。",
    leafText: "为回收设计、PCB 分类更清晰、材料路径可记录。",
    impactTitle: "模拟优势",
    materialKept: "更多 PCB 留在清晰循环中",
    co2Saved: "kg CO2e 流程负担可避免",
    credit: "EUR 材料积分潜力",
    faster: "天内回流材料",
    compared: "比较基于每个设备类别的原型假设。",
    privacyTitle: "隐私优先",
    privacyText: "不读取 IMEI、序列号或跟踪 Cookie。由你确认型号是否正确。",
    modelTitle: "所有型号可用",
    modelText: "已知设备会被推荐，其他型号可通过自由输入和类别计算。",
    estimateTitle: "面向客户",
    estimateText: "数值展示潜力，不是官方回收证书。",
    customHint: "没有匹配？保留型号名称并在下方选择类别。",
    empty: "尚未选择型号",
  },
};

const classOrder: DeviceClass[] = ["smartphone", "tablet", "laptop", "desktop", "wearable", "device"];

const classIcons: Record<DeviceClass, typeof Smartphone> = {
  smartphone: Smartphone,
  tablet: Tablet,
  laptop: Laptop,
  desktop: Monitor,
  wearable: Watch,
  device: Cpu,
};

export function DeviceImpact({ language }: { language: Language }) {
  const text = copy[language];
  const [detected, setDetected] = useState<DetectionResult>({
    label: text.detecting,
    deviceClass: "device",
    platform: "",
    confidence: "low",
    source: "fallback",
  });
  const [query, setQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<DeviceClass>("device");

  useEffect(() => {
    let mounted = true;

    detectCurrentDevice().then((result) => {
      if (!mounted) return;
      setDetected(result);
      setQuery(result.label);
      setSelectedClass(result.deviceClass);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const matchedModel = useMemo(() => findDeviceModel(query), [query]);
  const effectiveClass = matchedModel?.class ?? classifyDevice(query, selectedClass);
  const profile = DEVICE_CLASS_PROFILES[effectiveClass];
  const standardGrams = Math.round((profile.pcbMassG * profile.standardCircularity) / 100);
  const leafGrams = Math.round((profile.pcbMassG * profile.leaftronicsCircularity) / 100);
  const extraGrams = Math.max(0, leafGrams - standardGrams);
  const co2Saved = Math.max(0, profile.standardCo2Kg - profile.leaftronicsCo2Kg);
  const isManualSelection = query.trim().length > 0 && normalizeDeviceText(query) !== normalizeDeviceText(detected.label);
  const confidence = isManualSelection ? 100 : confidenceScore(detected.confidence);

  const suggestions = useMemo(() => {
    const normalized = normalizeDeviceText(query);
    const pool = normalized.length > 1
      ? DEVICE_MODELS.filter((model) => {
          const haystack = normalizeDeviceText(`${model.label} ${model.aliases.join(" ")}`);
          return haystack.includes(normalized) || normalized.includes(haystack);
        })
      : DEVICE_MODELS.filter((model) => model.class === effectiveClass);

    return pool.slice(0, 6);
  }, [effectiveClass, query]);

  const handleQuery = (value: string) => {
    setQuery(value);
    setSelectedClass(classifyDevice(value, selectedClass));
  };

  const displayModel = query.trim() || text.empty;
  const ActiveIcon = classIcons[effectiveClass];

  return (
    <section id="device-impact" className="relative isolate overflow-hidden bg-[hsl(42_31%_91%)] py-20 text-foreground md:py-28">
      <div aria-hidden className="absolute inset-0 impact-grid opacity-70" />
      <div aria-hidden className="absolute left-1/2 top-0 h-80 w-[720px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.38fr_0.62fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary">{text.eyebrow}</p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-6xl">{text.title}</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">{text.text}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <TrustTile icon={ShieldCheck} title={text.privacyTitle} text={text.privacyText} />
            <TrustTile icon={Search} title={text.modelTitle} text={text.modelText} />
            <TrustTile icon={Gauge} title={text.estimateTitle} text={text.estimateText} />
          </div>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-[0.43fr_0.57fr]">
          <div className="rounded-lg border border-border bg-background/85 p-5 shadow-elegant backdrop-blur md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">{text.detected}</p>
                <h3 className="mt-2 font-display text-3xl font-semibold leading-tight">{displayModel}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {isManualSelection
                    ? text.manualSource
                    : `${detected.platform || text.sourceLabels[detected.source]} · ${text.sourceLabels[detected.source]}`}
                </p>
              </div>
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <ActiveIcon className="h-5 w-5" />
              </span>
            </div>

            <div className="mt-5 overflow-hidden rounded-md border border-border bg-muted/50">
              <div className="flex flex-col gap-1 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:tracking-[0.18em]">
                <span>{text.confidence}</span>
                <span className="tracking-[0.08em] sm:tracking-[0.18em]">
                  {confidence}% · {isManualSelection ? text.manualSource : text.confidenceLabels[detected.confidence]}
                </span>
              </div>
              <div className="h-2 bg-background">
                <div className="h-full rounded-r-full bg-gradient-hero transition-all duration-700" style={{ width: `${confidence}%` }} />
              </div>
            </div>

            <div className="mt-6">
              <label className="text-sm font-semibold" htmlFor="device-model-input">
                {text.searchLabel}
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="device-model-input"
                  value={query}
                  onChange={(event) => handleQuery(event.target.value)}
                  placeholder={text.searchPlaceholder}
                  className="h-12 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => {
                    setQuery(detected.label);
                    setSelectedClass(detected.deviceClass);
                  }}
                  className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-md bg-foreground px-4 text-sm font-semibold text-background shadow-card transition-transform hover:-translate-y-0.5"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="hidden sm:inline">{text.useDetected}</span>
                </button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{text.customHint}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {suggestions.map((model) => (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => {
                      setQuery(model.label);
                      setSelectedClass(model.class);
                    }}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      matchedModel?.id === model.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:border-primary/50"
                    }`}
                  >
                    {model.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold">{text.classLabel}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {classOrder.map((item) => {
                  const Icon = classIcons[item];
                  const active = effectiveClass === item;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setSelectedClass(item)}
                      className={`flex h-11 items-center justify-center gap-2 rounded-md border px-2 text-xs font-semibold transition-all hover:-translate-y-0.5 ${
                        active ? "border-primary bg-primary text-primary-foreground shadow-card" : "border-border bg-background text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {text.classNames[item]}
                    </button>
                  );
                })}
              </div>
            </div>

            <DeviceVisual deviceClass={effectiveClass} />
          </div>

          <div className="rounded-lg border border-border bg-background p-5 shadow-elegant md:p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <ComparisonCard
                title={text.without}
                text={text.standardText}
                percentage={profile.standardCircularity}
                grams={standardGrams}
                tone="standard"
              />
              <ComparisonCard
                title={text.with}
                text={text.leafText}
                percentage={profile.leaftronicsCircularity}
                grams={leafGrams}
                tone="leaf"
              />
            </div>

            <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-5">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">{text.impactTitle}</p>
                  <h3 className="mt-2 font-display text-3xl font-semibold">{displayModel}</h3>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background px-3 py-1 text-xs font-semibold text-primary">
                  <BadgeCheck className="h-4 w-4" />
                  {text.classNames[effectiveClass]}
                </span>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard value={`+${formatGrams(extraGrams, language)}`} label={text.materialKept} icon={Leaf} />
                <MetricCard value={formatKg(co2Saved, language)} label={text.co2Saved} icon={Sparkles} />
                <MetricCard value={formatEuro(profile.materialCreditEur, language)} label={text.credit} icon={Cpu} />
                <MetricCard value={`${profile.returnDays}`} label={text.faster} icon={ArrowRight} />
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
                <FlowStep label={text.without} value={`${profile.standardCircularity}%`} />
                <div className="hidden h-px bg-primary/30 md:block" />
                <FlowStep label={text.with} value={`${profile.leaftronicsCircularity}%`} active />
              </div>

              <p className="mt-5 text-xs leading-5 text-muted-foreground">{text.compared}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

async function detectCurrentDevice(): Promise<DetectionResult> {
  const nav = navigator as Navigator & { userAgentData?: UaDataLike };
  const ua = navigator.userAgent;

  try {
    const data = nav.userAgentData;
    if (data?.getHighEntropyValues) {
      const values = await data.getHighEntropyValues(["model", "platform", "formFactors", "platformVersion"]);
      const model = values.model?.trim();
      const platform = values.platform || data.platform || "";
      const formFactors = values.formFactors?.join(" ") ?? "";

      if (model) {
        return {
          label: cleanupModel(model),
          deviceClass: classifyDevice(`${model} ${platform} ${formFactors}`, data.mobile ? "smartphone" : "device"),
          platform,
          confidence: "high",
          source: "client-hints",
        };
      }

      if (platform) {
        const classFromHints = classifyDevice(`${platform} ${formFactors}`, data.mobile ? "smartphone" : "desktop");
        return {
          label: classFromHints === "smartphone" ? "Smartphone" : platformDeviceLabel(platform, classFromHints),
          deviceClass: classFromHints,
          platform,
          confidence: "medium",
          source: "client-hints",
        };
      }
    }
  } catch {
    // Continue with User-Agent parsing when Client Hints are unavailable or blocked.
  }

  return detectFromUserAgent(ua);
}

function detectFromUserAgent(ua: string): DetectionResult {
  const androidModel = ua.match(/Android\s+[\d.]+;\s*([^;)]+?)(?:\s+Build|\)|;)/i)?.[1];
  if (androidModel && !/wv|mobile|chrome|safari/i.test(androidModel)) {
    return {
      label: cleanupModel(androidModel),
      deviceClass: classifyDevice(androidModel, /mobile/i.test(ua) ? "smartphone" : "tablet"),
      platform: "Android",
      confidence: "medium",
      source: "user-agent",
    };
  }

  if (/iPad/i.test(ua)) {
    return { label: "Apple iPad", deviceClass: "tablet", platform: "iPadOS", confidence: "low", source: "user-agent" };
  }

  if (/iPhone/i.test(ua)) {
    return { label: "Apple iPhone", deviceClass: "smartphone", platform: "iOS", confidence: "low", source: "user-agent" };
  }

  if (/Macintosh|Mac OS X/i.test(ua)) {
    return { label: "Apple Mac", deviceClass: "desktop", platform: "macOS", confidence: "low", source: "user-agent" };
  }

  if (/Windows/i.test(ua)) {
    return { label: "Windows PC", deviceClass: "desktop", platform: "Windows", confidence: "low", source: "user-agent" };
  }

  if (/Linux/i.test(ua)) {
    return { label: "Linux Computer", deviceClass: "desktop", platform: "Linux", confidence: "low", source: "user-agent" };
  }

  return { label: "Electronic device", deviceClass: "device", platform: "Browser", confidence: "low", source: "fallback" };
}

function cleanupModel(value: string) {
  return value.replace(/_/g, " ").replace(/\s+/g, " ").trim();
}

function platformDeviceLabel(platform: string, deviceClass: DeviceClass) {
  if (deviceClass === "smartphone") return `${platform} Smartphone`;
  if (deviceClass === "tablet") return `${platform} Tablet`;
  if (deviceClass === "laptop") return `${platform} Laptop`;
  if (deviceClass === "desktop") return `${platform} Computer`;
  return platform;
}

function TrustTile({ icon: Icon, title, text }: { icon: typeof ShieldCheck; title: string; text: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/70 p-4 shadow-card backdrop-blur">
      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-3 font-display text-lg font-semibold">{title}</p>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}

function ComparisonCard({
  title,
  text,
  percentage,
  grams,
  tone,
}: {
  title: string;
  text: string;
  percentage: number;
  grams: number;
  tone: "standard" | "leaf";
}) {
  const active = tone === "leaf";

  return (
    <div className={`rounded-lg border p-5 ${active ? "border-primary/25 bg-primary/5" : "border-border bg-muted/40"}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-2xl font-semibold">{title}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
        </div>
        {active ? <CheckCircle2 className="h-6 w-6 text-primary" /> : <Cpu className="h-6 w-6 text-muted-foreground" />}
      </div>
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <span>Loop</span>
          <span>{percentage}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-background">
          <div
            className={`h-full rounded-full transition-all duration-700 ${active ? "bg-gradient-hero" : "bg-muted-foreground/35"}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="mt-3 text-sm font-semibold">{grams} g PCB</p>
      </div>
    </div>
  );
}

function MetricCard({ value, label, icon: Icon }: { value: string; label: string; icon: typeof Leaf }) {
  return (
    <div className="rounded-md border border-primary/15 bg-background p-4 shadow-card">
      <Icon className="h-5 w-5 text-primary" />
      <p className="mt-3 font-display text-3xl font-semibold">{value}</p>
      <p className="mt-1 break-words text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
    </div>
  );
}

function FlowStep({ label, value, active = false }: { label: string; value: string; active?: boolean }) {
  return (
    <div className={`rounded-md border px-4 py-3 ${active ? "border-primary/25 bg-background" : "border-border bg-background/70"}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className={`mt-1 font-display text-3xl font-semibold ${active ? "text-primary" : ""}`}>{value}</p>
    </div>
  );
}

function DeviceVisual({ deviceClass }: { deviceClass: DeviceClass }) {
  const isWide = deviceClass === "laptop" || deviceClass === "desktop";
  const isWearable = deviceClass === "wearable";

  return (
    <div className="relative mt-8 flex min-h-72 items-center justify-center overflow-hidden rounded-lg border border-border bg-[radial-gradient(circle_at_50%_35%,hsl(152_55%_28%/.13),transparent_42%),linear-gradient(135deg,hsl(155_30%_12%/.04),hsl(38_70%_92%/.55))]">
      <div className="absolute h-44 w-44 rounded-full border border-primary/20 impact-orbit" />
      <div className="absolute h-64 w-64 rounded-full border border-accent/20 impact-orbit-reverse" />
      <div className={`relative z-10 shadow-elegant ${isWide ? "w-72" : isWearable ? "w-32" : "w-36"}`}>
        <div
          className={`relative overflow-hidden border border-foreground/15 bg-foreground text-background ${
            isWide
              ? "h-44 rounded-lg"
              : isWearable
                ? "mx-auto h-32 w-24 rounded-[2rem]"
                : "mx-auto h-56 w-32 rounded-[2rem]"
          }`}
        >
          <div className="absolute inset-3 rounded-[1.35rem] border border-background/10 bg-[linear-gradient(145deg,hsl(152_55%_28%/.35),hsl(155_30%_12%))]" />
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 240 320" aria-hidden="true">
            <path className="impact-circuit" d="M30 88 H86 C112 88 112 134 138 134 H210" />
            <path className="impact-circuit impact-circuit-delay" d="M32 208 H80 C104 208 112 172 142 172 H206" />
            <path className="impact-circuit impact-circuit-slow" d="M120 36 V88 M120 172 V284" />
            <circle cx="120" cy="160" r="42" className="fill-background/8 stroke-primary/80" strokeWidth="3" />
            <path d="M120 132 C140 146 144 176 120 194 C96 176 100 146 120 132Z" className="fill-primary" />
          </svg>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-background/10 bg-background/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]">
            <Leaf className="h-3 w-3 text-primary" />
            Loop ready
          </div>
        </div>
        {isWide ? <div className="mx-auto h-3 w-56 rounded-b-xl bg-foreground/80" /> : null}
        {isWearable ? <div className="mx-auto h-16 w-12 rounded-b-3xl border-x border-b border-foreground/20 bg-foreground/15" /> : null}
      </div>
    </div>
  );
}

function formatGrams(value: number, language: Language) {
  return new Intl.NumberFormat(localeFor(language), { maximumFractionDigits: 0 }).format(value) + " g";
}

function formatKg(value: number, language: Language) {
  return new Intl.NumberFormat(localeFor(language), { maximumFractionDigits: 1 }).format(value);
}

function formatEuro(value: number, language: Language) {
  return new Intl.NumberFormat(localeFor(language), { maximumFractionDigits: 0 }).format(value);
}

function localeFor(language: Language) {
  if (language === "en") return "en-US";
  if (language === "zh") return "zh-CN";
  return "de-DE";
}
