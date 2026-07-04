import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
  ArrowRight,
  BadgeCheck,
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
    leafText: string;
    loopPotential: string;
    cleanPcb: string;
    baseline: string;
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
    leafText: "Design für Rückgabe, saubere PCB-Fraktion, dokumentierter Materialpfad.",
    loopPotential: "Loop-Potenzial",
    cleanPcb: "PCB sauber rückführbar",
    baseline: "Baseline",
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
    leafText: "Return-ready design, clean PCB fraction, documented material path.",
    loopPotential: "Loop potential",
    cleanPcb: "clean PCB returnable",
    baseline: "Baseline",
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
    leafText: "为回收设计、PCB 分类更清晰、材料路径可记录。",
    loopPotential: "循环潜力",
    cleanPcb: "PCB 可清晰回流",
    baseline: "基线",
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
  const co2Saved = Math.max(0, profile.standardCo2Kg - profile.leaftronicsCo2Kg);
  const standardCredit = Math.max(1, Math.round(profile.materialCreditEur * 0.35));
  const standardReturnDays = profile.returnDays + 9;
  const loopLift = profile.leaftronicsCircularity - profile.standardCircularity;
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
    <section id="device-impact" className="relative isolate overflow-hidden bg-[hsl(42_31%_91%)] py-14 text-foreground md:py-24">
      <div aria-hidden className="absolute inset-0 impact-grid opacity-55" />
      <div aria-hidden className="absolute left-1/2 top-0 h-72 w-[640px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary">{text.eyebrow}</p>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-6xl">{text.title}</h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">{text.text}</p>
        </div>

        <div className="mt-7 grid gap-3 md:grid-cols-3">
          <TrustTile icon={ShieldCheck} title={text.privacyTitle} text={text.privacyText} />
          <TrustTile icon={Search} title={text.modelTitle} text={text.modelText} />
          <TrustTile icon={Gauge} title={text.estimateTitle} text={text.estimateText} />
        </div>

        <div className="mt-10 grid gap-7 lg:grid-cols-[0.38fr_0.62fr] lg:items-start">
          <div className="rounded-lg border border-border bg-background/88 p-4 shadow-card backdrop-blur sm:p-5 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">{text.detected}</p>
                <h3 className="mt-2 break-words font-display text-3xl font-semibold leading-tight">{displayModel}</h3>
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

            <div className="mt-5 overflow-hidden rounded-md border border-border bg-muted/45">
              <div className="flex flex-col gap-1 px-3 py-2 text-xs font-semibold uppercase tracking-[0.11em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <span>{text.confidence}</span>
                <span>{confidence}% · {isManualSelection ? text.manualSource : text.confidenceLabels[detected.confidence]}</span>
              </div>
              <div className="h-2 bg-background">
                <div className="h-full rounded-r-full bg-gradient-hero transition-all duration-700" style={{ width: `${confidence}%` }} />
              </div>
            </div>

            <div className="mt-6">
              <label className="text-sm font-semibold" htmlFor="device-model-input">
                {text.searchLabel}
              </label>
              <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
                <input
                  id="device-model-input"
                  value={query}
                  onChange={(event) => handleQuery(event.target.value)}
                  placeholder={text.searchPlaceholder}
                  className="h-12 min-w-0 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => {
                    setQuery(detected.label);
                    setSelectedClass(detected.deviceClass);
                  }}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-foreground px-4 text-sm font-semibold text-background shadow-card transition-transform hover:-translate-y-0.5"
                >
                  <RefreshCw className="h-4 w-4" />
                  {text.useDetected}
                </button>
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{text.customHint}</p>

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
              <div className="mt-3 grid grid-cols-2 gap-2 min-[480px]:grid-cols-3">
                {classOrder.map((item) => {
                  const Icon = classIcons[item];
                  const active = effectiveClass === item;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setSelectedClass(item)}
                      className={`flex min-h-11 items-center justify-center gap-2 rounded-md border px-2 py-2 text-[11px] font-semibold leading-tight transition-all hover:-translate-y-0.5 sm:text-xs ${
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
          </div>

          <div className="rounded-lg border border-border bg-background p-4 shadow-elegant sm:p-5 md:p-7">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">{text.impactTitle}</p>
                <h3 className="mt-2 break-words font-display text-3xl font-semibold leading-tight">{displayModel}</h3>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                <BadgeCheck className="h-4 w-4" />
                {text.classNames[effectiveClass]}
              </span>
            </div>

            <div className="mt-6 rounded-lg bg-gradient-hero p-4 text-primary-foreground shadow-elegant sm:p-5 md:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] opacity-75">{text.with}</p>
                  <div className="mt-2 flex items-end gap-3">
                    <p className="font-display text-6xl font-semibold leading-none sm:text-7xl md:text-8xl">
                      {profile.leaftronicsCircularity}%
                    </p>
                    <p className="pb-2 text-sm font-semibold uppercase tracking-[0.2em] opacity-80">{text.loopPotential}</p>
                  </div>
                  <p className="mt-3 text-sm font-medium opacity-80">
                    {text.baseline}: {text.without} {profile.standardCircularity}% · +{loopLift} pp
                  </p>
                </div>
                <Leaf className="hidden h-16 w-16 opacity-35 md:block" />
              </div>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-primary-foreground/20">
                <div className="h-full rounded-full bg-primary-foreground" style={{ width: `${profile.leaftronicsCircularity}%` }} />
              </div>
            </div>

            <div className="mt-5 grid overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
              <ImpactValue
                icon={Leaf}
                value={formatGrams(leafGrams, language)}
                label={text.cleanPcb}
                baseline={`${text.without}: ${formatGrams(standardGrams, language)}`}
              />
              <ImpactValue
                icon={Sparkles}
                value={formatKg(co2Saved, language)}
                label={text.co2Saved}
                baseline={`${text.without}: ${formatKg(profile.standardCo2Kg, language)} kg CO2e`}
              />
              <ImpactValue
                icon={Cpu}
                value={formatEuro(profile.materialCreditEur, language)}
                label={text.credit}
                baseline={`${text.without}: ${formatEuro(standardCredit, language)} EUR`}
              />
              <ImpactValue
                icon={ArrowRight}
                value={`${profile.returnDays}`}
                label={text.faster}
                baseline={`${text.without}: ${standardReturnDays}`}
              />
            </div>

            <div className="mt-5 rounded-md border border-primary/15 bg-primary/5 px-4 py-3">
              <p className="text-sm font-semibold text-primary">{text.leafText}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{text.compared}</p>
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

function TrustTile({ icon: Icon, title, text }: { icon: ComponentType<{ className?: string }>; title: string; text: string }) {
  return (
    <div className="flex gap-3 rounded-md border border-border bg-background/70 p-3 shadow-card backdrop-blur">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="font-display text-base font-semibold">{title}</p>
        <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

function ImpactValue({
  icon: Icon,
  value,
  label,
  baseline,
}: {
  icon: ComponentType<{ className?: string }>;
  value: string;
  label: string;
  baseline: string;
}) {
  return (
    <div className="bg-background p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="font-display text-3xl font-semibold leading-none text-primary sm:text-4xl">{value}</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-foreground">{label}</p>
          <p className="mt-1 text-[11px] leading-5 text-muted-foreground sm:text-xs">{baseline}</p>
        </div>
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
