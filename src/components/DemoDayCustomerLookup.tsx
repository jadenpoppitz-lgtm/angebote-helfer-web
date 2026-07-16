import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  BatteryCharging,
  Check,
  CheckCircle2,
  Cpu,
  ExternalLink,
  Gamepad2,
  Gem,
  Headphones,
  History,
  Laptop,
  Leaf,
  Monitor,
  MapPin,
  Navigation,
  PackageCheck,
  Recycle,
  Router,
  ScanLine,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tablet,
  TicketCheck,
  Trophy,
  Watch,
  Weight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  DEMO_DAY_EXAMPLE_SERIAL,
  lookupDemoDayDevice,
  type DemoDayDeviceRecord,
  type DemoDayMetalEvidence,
  type DemoDayMetalKey,
  type DemoDeviceKind,
} from "@/data/demoDayDevices";
import { trackDemoDayLookup } from "@/lib/demoDayTracking";

const DemoDayDeviceModel = lazy(() => import("@/components/DemoDayDeviceModel"));
const DemoDayDresdenMap = lazy(() => import("@/components/DemoDayDresdenMap"));

const supportsWebGl = () =>
  typeof window !== "undefined" && typeof window.WebGLRenderingContext !== "undefined";

const compactDeviceVisualQuery = "(max-width: 640px)";

const useDeviceVisual = () => {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return true;
    return !window.matchMedia(compactDeviceVisualQuery).matches;
  });

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const query = window.matchMedia(compactDeviceVisualQuery);
    const update = () => setVisible(!query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return visible;
};

import type { Language } from "@/lib/i18n";

type DemoDayCustomerLookupProps = {
  language: Language;
};

type LookupCopy = {
  eventLabel: string;
  serialLabel: string;
  serialPlaceholder: string;
  serialHint: string;
  check: string;
  useExample: string;
  emptyTitle: string;
  emptyText: string;
  emptySteps: [string, string, string];
  notFoundTitle: string;
  notFoundText: string;
  retry: string;
  passport: string;
  demoRecord: string;
  manufactured: string;
  weight: string;
  impactEyebrow: string;
  impactTitle: string;
  impactText: string;
  recyclable: string;
  recyclableText: string;
  recoverable: string;
  recoverableText: string;
  avoidedCo2: string;
  avoidedCo2Text: string;
  metalInventory: string;
  metalInventoryText: string;
  metalSummaryTitle: string;
  capturedMetalMass: string;
  capturedMetalMassNote: string;
  metalShare: string;
  metalGroups: Record<"circular" | "battery" | "precious" | "technology", string>;
  notPublished: string;
  sourceList: string;
  sourceSummary: string;
  precisionNote: string;
  disclosures: Record<"precious-metals-minimum" | "rare-earths-minimum", string>;
  evidence: Record<DemoDayMetalEvidence, string>;
  circularHistory: string;
  firstCycle: string;
  previousCycles: (count: number) => string;
  firstCycleText: string;
  previousCyclesText: string;
  reserve: string;
  reserved: string;
  reserveText: string;
  reservationBenefitTitle: string;
  discountBenefit: string;
  discountBenefitText: (discount: string) => string;
  certificateBenefit: string;
  certificateBenefitText: (remaining: number, co2: string) => string;
  devices: string;
  nonWinnerEyebrow: string;
  nonWinnerTitle: string;
  nonWinnerText: string;
  winnerEyebrow: string;
  winnerTitle: string;
  winnerText: string;
  winnerInstruction: string;
  prize: string;
  syntheticNote: string;
  returnMapEyebrow: string;
  returnMapTitle: string;
  returnMapText: string;
  currentLocation: string;
  nearestLocation: string;
  otherLocation: string;
  acceptsDevices: string;
  openRoute: string;
  officialSource: string;
  mapAriaLabel: string;
  mapZoomIn: string;
  mapZoomOut: string;
  metals: Record<DemoDayMetalKey, string>;
};

const lookupCopy: Record<Language, LookupCopy> = {
  de: {
    eventLabel: "Seriennummer prüfen",
    serialLabel: "Seriennummer deiner Demo-Karte",
    serialPlaceholder: "LT26-XXXX-XXXX",
    serialHint: "Tippe LT26 und die zwei vierstelligen Blöcke. Die Bindestriche erscheinen automatisch.",
    check: "Gerät prüfen",
    useExample: "Beispiel ohne Gewinn laden",
    emptyTitle: "Was steckt in deinem Gerät?",
    emptyText: "Eine Nummer öffnet den digitalen Gerätepass und zeigt verwertbare Materialien, Kreislaufstatus und Gewinnchance.",
    emptySteps: ["Seriennummer eingeben", "Gerätepass ansehen", "Goldticket entdecken"],
    notFoundTitle: "Diese Nummer kennen wir noch nicht",
    notFoundText: "Prüfe die Zeichen auf deiner Demo-Karte. O und 0 sowie I und 1 lassen sich leicht verwechseln.",
    retry: "Eingabe korrigieren",
    passport: "Digitaler Gerätepass",
    demoRecord: "Verifizierter Demo-Datensatz",
    manufactured: "Baujahr",
    weight: "Gerätegewicht",
    impactEyebrow: "Deine Rückgabe",
    impactTitle: "So bleibt dein Gerät im Kreislauf",
    impactText: "Statt im Restmüll zu enden, werden nutzbare Materialien gezielt zurückgewonnen.",
    recyclable: "des Gerätegewichts bleiben nutzbar",
    recyclableText: "Der Anteil, der bei fachgerechter Rückgabe weiterverwendet oder recycelt werden kann.",
    recoverable: "Materialien erneut nutzbar",
    recoverableText: "Diese Menge kann aus deinem Gerät zurück in den Kreislauf geführt werden.",
    avoidedCo2: "CO₂-Emissionen vermeidbar",
    avoidedCo2Text: "Mögliche Wirkung gegenüber der Gewinnung neuer Rohstoffe.",
    metalInventory: "Materialien",
    metalInventoryText: "Vier klar beschriftete Gruppen zeigen dir Mengen, Anteile und die wichtigsten enthaltenen Metalle.",
    metalSummaryTitle: "Diese Metalle stecken in deinem Gerät",
    capturedMetalMass: "Erfasste Metalle",
    capturedMetalMassNote: "Die dargestellten Anteile beziehen sich auf die erfasste Metallmenge.",
    metalShare: "der erfassten Metalle",
    metalGroups: {
      circular: "Basis- & Kreislaufmetalle",
      battery: "Batterie & Speicher",
      precious: "Edelmetalle",
      technology: "Technologiemetalle",
    },
    notPublished: "Menge nicht veröffentlicht",
    sourceList: "Quellen und Methodik",
    sourceSummary: "Gewicht, Metallwerte und Demo-Annahmen transparent erklärt.",
    precisionNote: "Eine vollständige, modellgenaue Elementbilanz ist nur mit Hersteller-Stückliste oder Laboranalyse möglich. Deshalb werden unveröffentlichte Werte nicht als exakt ausgegeben.",
    disclosures: {
      "precious-metals-minimum": "Edelmetalle gesamt",
      "rare-earths-minimum": "Seltene Erden gesamt",
    },
    evidence: {
      manufacturer: "Herstellerwert",
      "manufacturer-minimum": "Hersteller-Mindestwert",
      "research-estimate": "Forschungsschätzung",
      declared: "Vom Hersteller belegt",
    },
    circularHistory: "Kreislaufhistorie",
    firstCycle: "Erster Rücklauf",
    previousCycles: (count) => `${count} Kreisläufe dokumentiert`,
    firstCycleText: "Dieses Demo-Gerät wurde bisher noch nicht zurückgeführt.",
    previousCyclesText: "Der Gerätepass enthält bereits einen dokumentierten Rücklauf.",
    reserve: "Rückgabestelle auswählen",
    reserved: "Friedrichstadt ausgewählt",
    reserveText: "Wertstoffhof Friedrichstadt · Altonaer Straße 15",
    reservationBenefitTitle: "Dein Rückgabevorteil",
    discountBenefit: "Rückgabe-Rabatt",
    discountBenefitText: (discount) => `${discount} Rabatt wird nach bestätigter Rückgabe freigeschaltet.`,
    certificateBenefit: "Leaftronics Certified",
    certificateBenefitText: (remaining, co2) => `Noch ${remaining} Rückgaben, dann kannst du ${co2} CO2-Einsparung zertifiziert ausweisen.`,
    devices: "Geräte",
    nonWinnerEyebrow: "Seriennummer gültig",
    nonWinnerTitle: "Diesmal leider nicht gewonnen",
    nonWinnerText: "Dein Gerätepass ist trotzdem freigeschaltet. Entdecke, welche Materialien aus deinem Gerät zurückgewonnen werden können.",
    winnerEyebrow: "Goldticket bestätigt",
    winnerTitle: "Du hast gewonnen!",
    winnerText: "Deine Seriennummer gehört zu den fünf Gewinnern des Demo-Days.",
    winnerInstruction: "Zeige diesen Gerätepass am Leaftronics-Stand und hole deinen Demo-Goldbarren ab.",
    prize: "Demo Gold Bar 2026",
    syntheticNote: "Seriennummer, Kreislaufhistorie, Gewinnstatus, CO₂-Wert und Rückgewinnungspotenzial sind Demo-Daten. Modellgewicht und Metallangaben sind separat quellen- und evidenzbasiert gekennzeichnet.",
    returnMapEyebrow: "Rückgabe in Dresden",
    returnMapTitle: "Altgerät richtig abgeben",
    returnMapText: "Die nächsten städtischen Annahmestellen für Elektroaltgeräte rund um deinen Standort.",
    currentLocation: "Aktueller Standort · HTW Dresden, Friedrich-List-Platz 1",
    nearestLocation: "Nächste Anlaufstelle",
    otherLocation: "Weitere Anlaufstelle",
    acceptsDevices: "Elektroaltgeräte · gebührenfreie Abgabe",
    openRoute: "Route öffnen",
    officialSource: "Angaben der Landeshauptstadt Dresden",
    mapAriaLabel: "Karte mit HTW Dresden und den Wertstoffhöfen Friedrichstadt, Plauen und Johannstadt",
    mapZoomIn: "Karte vergrößern",
    mapZoomOut: "Karte verkleinern",
    metals: {
      aluminum: "Aluminium",
      ironSteel: "Eisen / Stahl",
      copper: "Kupfer",
      cobalt: "Kobalt",
      lithium: "Lithium",
      nickel: "Nickel",
      tin: "Zinn",
      zinc: "Zink",
      magnesium: "Magnesium",
      chromium: "Chrom",
      manganese: "Mangan",
      tungsten: "Wolfram",
      gold: "Gold",
      silver: "Silber",
      palladium: "Palladium",
      platinum: "Platin",
      tantalum: "Tantal",
      indium: "Indium",
      antimony: "Antimon",
      rareEarths: "Seltene Erden",
      lead: "Blei",
    },
  },
  en: {
    eventLabel: "Check serial number",
    serialLabel: "Serial number on your demo card",
    serialPlaceholder: "LT26-XXXX-XXXX",
    serialHint: "Type LT26 and the two four-character blocks. Hyphens are added automatically.",
    check: "Check device",
    useExample: "Load a non-winning example",
    emptyTitle: "What is inside your device?",
    emptyText: "One code opens the digital device passport and reveals recoverable materials, circular history and your chance to win.",
    emptySteps: ["Enter serial number", "Explore device passport", "Discover golden ticket"],
    notFoundTitle: "We do not recognise this number yet",
    notFoundText: "Check the characters on your demo card. O and 0 or I and 1 can look similar.",
    retry: "Correct entry",
    passport: "Digital device passport",
    demoRecord: "Verified demo record",
    manufactured: "Model year",
    weight: "Device weight",
    impactEyebrow: "Your return",
    impactTitle: "How your device stays in the loop",
    impactText: "Instead of becoming residual waste, useful materials are recovered for another use.",
    recyclable: "of the device weight remains useful",
    recyclableText: "The share that can be reused or recycled through a proper return process.",
    recoverable: "of materials can be reused",
    recoverableText: "This amount can be recovered from your device and returned to the loop.",
    avoidedCo2: "of CO₂ emissions potentially avoided",
    avoidedCo2Text: "Possible impact compared with extracting new raw materials.",
    metalInventory: "Materials",
    metalInventoryText: "Four directly labelled groups show the quantities, shares and most important metals in your device.",
    metalSummaryTitle: "These metals are inside your device",
    capturedMetalMass: "Recorded metals",
    capturedMetalMassNote: "The displayed shares refer to the recorded metal mass.",
    metalShare: "of recorded metals",
    metalGroups: {
      circular: "Base & circular metals",
      battery: "Battery & storage",
      precious: "Precious metals",
      technology: "Technology metals",
    },
    notPublished: "Amount not published",
    sourceList: "Sources and method",
    sourceSummary: "A transparent explanation of weight, metal values and demo assumptions.",
    precisionNote: "A complete model-specific elemental balance requires a manufacturer bill of materials or laboratory analysis. Unpublished quantities are therefore never presented as exact.",
    disclosures: {
      "precious-metals-minimum": "Total precious metals",
      "rare-earths-minimum": "Total rare earths",
    },
    evidence: {
      manufacturer: "Manufacturer value",
      "manufacturer-minimum": "Manufacturer minimum",
      "research-estimate": "Research estimate",
      declared: "Manufacturer declared",
    },
    circularHistory: "Circular history",
    firstCycle: "First return",
    previousCycles: (count) => `${count} cycles documented`,
    firstCycleText: "This demo device has not entered a return loop before.",
    previousCyclesText: "The device passport already contains a documented return.",
    reserve: "Choose a return point",
    reserved: "Friedrichstadt selected",
    reserveText: "Friedrichstadt recycling centre · Altonaer Strasse 15",
    reservationBenefitTitle: "Your return benefit",
    discountBenefit: "Return discount",
    discountBenefitText: (discount) => `${discount} is unlocked after the return is confirmed.`,
    certificateBenefit: "Leaftronics Certified",
    certificateBenefitText: (remaining, co2) => `${remaining} more returns unlock certified reporting of ${co2} CO2 savings.`,
    devices: "devices",
    nonWinnerEyebrow: "Valid serial number",
    nonWinnerTitle: "No win this time",
    nonWinnerText: "Your device passport is still unlocked. Explore which materials can be recovered from your device.",
    winnerEyebrow: "Golden ticket confirmed",
    winnerTitle: "You won!",
    winnerText: "Your serial number is one of the five demo-day winners.",
    winnerInstruction: "Show this device passport at the Leaftronics booth to collect your demo gold bar.",
    prize: "Demo Gold Bar 2026",
    syntheticNote: "Serial number, circular history, winner status, CO₂ value and recovery potential are demo data. Model weight and metal information are separately labelled by source and evidence level.",
    returnMapEyebrow: "Return in Dresden",
    returnMapTitle: "Return your old device correctly",
    returnMapText: "The nearest municipal collection points for electronic waste around your location.",
    currentLocation: "Current location · HTW Dresden, Friedrich-List-Platz 1",
    nearestLocation: "Nearest collection point",
    otherLocation: "Other collection point",
    acceptsDevices: "Electronic waste · free household drop-off",
    openRoute: "Open route",
    officialSource: "Information from the City of Dresden",
    mapAriaLabel: "Map showing HTW Dresden and the Friedrichstadt, Plauen and Johannstadt recycling centres",
    mapZoomIn: "Zoom in",
    mapZoomOut: "Zoom out",
    metals: {
      aluminum: "Aluminium",
      ironSteel: "Iron / steel",
      copper: "Copper",
      cobalt: "Cobalt",
      lithium: "Lithium",
      nickel: "Nickel",
      tin: "Tin",
      zinc: "Zinc",
      magnesium: "Magnesium",
      chromium: "Chromium",
      manganese: "Manganese",
      tungsten: "Tungsten",
      gold: "Gold",
      silver: "Silver",
      palladium: "Palladium",
      platinum: "Platinum",
      tantalum: "Tantalum",
      indium: "Indium",
      antimony: "Antimony",
      rareEarths: "Rare earths",
      lead: "Lead",
    },
  },
  zh: {
    eventLabel: "检查序列号",
    serialLabel: "演示卡上的序列号",
    serialPlaceholder: "LT26-XXXX-XXXX",
    serialHint: "输入 LT26 和后面的两组四位字符，连字符会自动添加。",
    check: "检查设备",
    useExample: "载入非中奖示例",
    emptyTitle: "你的设备里有什么？",
    emptyText: "输入编号即可查看数字设备护照、可回收材料、循环记录和中奖结果。",
    emptySteps: ["输入序列号", "查看设备护照", "发现金色奖券"],
    notFoundTitle: "暂未识别此编号",
    notFoundText: "请检查演示卡上的字符，O 与 0、I 与 1 容易混淆。",
    retry: "修改输入",
    passport: "数字设备护照",
    demoRecord: "已验证演示数据",
    manufactured: "生产年份",
    weight: "设备重量",
    impactEyebrow: "你的回收行动",
    impactTitle: "让设备材料继续循环",
    impactText: "通过正确回收，可用材料不会成为残余垃圾，而是被重新利用。",
    recyclable: "的设备重量可继续利用",
    recyclableText: "通过正确回收可被再使用或再循环的重量比例。",
    recoverable: "材料可重新利用",
    recoverableText: "这些材料可从设备中回收并重新进入循环。",
    avoidedCo2: "可避免的 CO₂ 排放",
    avoidedCo2Text: "与开采新原材料相比可能产生的环境效益。",
    metalInventory: "材料",
    metalInventoryText: "四个直接标注的材料组展示设备中的数量、比例和主要金属。",
    metalSummaryTitle: "你的设备中含有这些金属",
    capturedMetalMass: "已记录金属",
    capturedMetalMassNote: "图中比例以已记录的金属总量为基准。",
    metalShare: "占已记录金属",
    metalGroups: {
      circular: "基础与循环金属",
      battery: "电池与储能金属",
      precious: "贵金属",
      technology: "技术金属",
    },
    notPublished: "制造商未公布含量",
    sourceList: "来源与方法",
    sourceSummary: "透明说明重量、金属数据和演示假设。",
    precisionNote: "完整且针对具体型号的元素平衡需要制造商物料清单或实验室分析，因此未公开的数值不会被标为精确值。",
    disclosures: {
      "precious-metals-minimum": "贵金属总量",
      "rare-earths-minimum": "稀土总量",
    },
    evidence: {
      manufacturer: "制造商数据",
      "manufacturer-minimum": "制造商最低值",
      "research-estimate": "科研估算",
      declared: "制造商已确认",
    },
    circularHistory: "循环记录",
    firstCycle: "首次回收",
    previousCycles: (count) => `已记录 ${count} 次循环`,
    firstCycleText: "此演示设备此前尚未进入回收循环。",
    previousCyclesText: "设备护照中已有一次回收记录。",
    reserve: "选择回收点",
    reserved: "已选择 Friedrichstadt",
    reserveText: "Friedrichstadt 回收中心 · Altonaer Straße 15",
    reservationBenefitTitle: "你的回收权益",
    discountBenefit: "回收折扣",
    discountBenefitText: (discount) => `确认回收后即可获得 ${discount}。`,
    certificateBenefit: "Leaftronics Certified",
    certificateBenefitText: (remaining, co2) => `再完成 ${remaining} 次回收，即可认证展示 ${co2} CO2 减排。`,
    devices: "台设备",
    nonWinnerEyebrow: "序列号有效",
    nonWinnerTitle: "很遗憾，这次没有中奖",
    nonWinnerText: "你的设备护照仍已解锁。继续查看设备中可回收的材料。",
    winnerEyebrow: "金色奖券已确认",
    winnerTitle: "你中奖了！",
    winnerText: "你的序列号属于演示日的五位中奖者之一。",
    winnerInstruction: "请在 Leaftronics 展台出示此设备护照，领取演示金条。",
    prize: "2026 演示金条",
    syntheticNote: "序列号、循环记录、中奖状态、CO₂ 数值和回收潜力为演示数据；型号重量和金属信息均单独标注来源与证据等级。",
    returnMapEyebrow: "德累斯顿回收点",
    returnMapTitle: "正确交回旧设备",
    returnMapText: "当前位置附近可接收电子废弃物的市政回收点。",
    currentLocation: "当前位置 · HTW Dresden, Friedrich-List-Platz 1",
    nearestLocation: "最近回收点",
    otherLocation: "其他回收点",
    acceptsDevices: "电子废弃物 · 家庭免费交回",
    openRoute: "打开路线",
    officialSource: "德累斯顿市政府信息",
    mapAriaLabel: "显示 HTW Dresden 与 Friedrichstadt、Plauen 和 Johannstadt 回收中心的地图",
    mapZoomIn: "放大地图",
    mapZoomOut: "缩小地图",
    metals: {
      aluminum: "铝",
      ironSteel: "铁 / 钢",
      copper: "铜",
      cobalt: "钴",
      lithium: "锂",
      nickel: "镍",
      tin: "锡",
      zinc: "锌",
      magnesium: "镁",
      chromium: "铬",
      manganese: "锰",
      tungsten: "钨",
      gold: "金",
      silver: "银",
      palladium: "钯",
      platinum: "铂",
      tantalum: "钽",
      indium: "铟",
      antimony: "锑",
      rareEarths: "稀土",
      lead: "铅",
    },
  },
};

const deviceIcons: Record<DemoDeviceKind, LucideIcon> = {
  desktop: Monitor,
  headphones: Headphones,
  laptop: Laptop,
  network: Router,
  phone: Smartphone,
  tablet: Tablet,
  watch: Watch,
  console: Gamepad2,
};

type MetalSummaryGroupKey = keyof LookupCopy["metalGroups"];

const metalSummaryGroups: Array<{
  key: MetalSummaryGroupKey;
  metals: readonly DemoDayMetalKey[];
  icon: LucideIcon;
  color: string;
}> = [
  {
    key: "circular",
    metals: ["aluminum", "ironSteel", "copper", "tin", "zinc", "magnesium", "lead"],
    icon: Recycle,
    color: "#2b7d5a",
  },
  {
    key: "battery",
    metals: ["cobalt", "lithium", "nickel", "manganese"],
    icon: BatteryCharging,
    color: "#c27a32",
  },
  {
    key: "precious",
    metals: ["gold", "silver", "palladium", "platinum"],
    icon: Gem,
    color: "#b79530",
  },
  {
    key: "technology",
    metals: ["chromium", "tungsten", "tantalum", "indium", "antimony", "rareEarths"],
    icon: Cpu,
    color: "#577069",
  },
];

const confettiPieces = Array.from({ length: 112 }, (_, index) => ({
  x: `${2 + ((index * 47) % 97)}%`,
  delay: index < 56 ? `${-((index * 0.13) % 1.85)}s` : `${((index - 56) % 28) * 0.035}s`,
  duration: `${3.35 + (index % 8) * 0.18}s`,
  drift: `${-14 + ((index * 31) % 29)}vw`,
  rotation: `${(index * 47) % 360}deg`,
  size: `${0.44 + (index % 5) * 0.09}rem`,
  color: ["#e5b73d", "#f5d77f", "#227a55", "#f7f2de", "#b4683d", "#f0c95b"][index % 6],
}));

const localeFor = (language: Language) => (language === "de" ? "de-DE" : language === "zh" ? "zh-CN" : "en-GB");

const formatMass = (grams: number, language: Language) => {
  const locale = localeFor(language);
  if (grams >= 1000) {
    return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(grams / 1000)} kg`;
  }
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: grams < 1 ? 3 : 1 }).format(grams)} g`;
};

const formatMetalMass = (grams: number, language: Language) => {
  const locale = localeFor(language);
  if (grams >= 1000) {
    return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 3 }).format(grams / 1000)} kg`;
  }
  if (grams >= 1) {
    return `${new Intl.NumberFormat(locale, { maximumFractionDigits: grams >= 100 ? 1 : grams >= 10 ? 2 : 3 }).format(grams)} g`;
  }
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 3 }).format(grams * 1000)} mg`;
};

const formatNumber = (value: number, language: Language, maximumFractionDigits = 1) =>
  new Intl.NumberFormat(localeFor(language), { maximumFractionDigits }).format(value);

const returnLocations = [
  {
    id: "friedrichstadt",
    name: "Wertstoffhof Friedrichstadt",
    address: "Altonaer Straße 15, 01159 Dresden",
    coordinates: [51.0489214, 13.7083368] as const,
    routeUrl: "https://www.openstreetmap.org/search?query=Altonaer%20Stra%C3%9Fe%2015%2C%20Dresden",
  },
  {
    id: "plauen",
    name: "Wertstoffhof Plauen",
    address: "Pforzheimer Straße 1, 01189 Dresden",
    coordinates: [51.0112792, 13.706831] as const,
    routeUrl: "https://www.openstreetmap.org/search?query=Pforzheimer%20Stra%C3%9Fe%201%2C%20Dresden",
  },
  {
    id: "johannstadt",
    name: "Wertstoffhof Johannstadt",
    address: "Hertelstraße 3, 01307 Dresden",
    coordinates: [51.0563462, 13.7722831] as const,
    routeUrl: "https://www.openstreetmap.org/search?query=Hertelstra%C3%9Fe%203%2C%20Dresden",
  },
] as const;

const ReturnLocationMap = ({ copy }: { copy: LookupCopy }) => (
  <section className="demo-day-return-map" id="demo-day-return-map" aria-labelledby="demo-day-return-map-title">
    <div className="demo-day-return-map-heading">
      <div>
        <p className="demo-day-kicker">{copy.returnMapEyebrow}</p>
        <h4 id="demo-day-return-map-title">{copy.returnMapTitle}</h4>
      </div>
      <p>{copy.returnMapText}</p>
    </div>

    <div className="demo-day-return-map-layout">
      <div className="demo-day-return-map-canvas">
        <Suspense
          fallback={(
            <div className="demo-day-map-loading" aria-busy="true" aria-label={copy.mapAriaLabel}>
              <MapPin aria-hidden="true" />
            </div>
          )}
        >
          <DemoDayDresdenMap
            ariaLabel={copy.mapAriaLabel}
            currentLocation={copy.currentLocation}
            locations={returnLocations}
            nearestLabel={copy.nearestLocation}
            otherLabel={copy.otherLocation}
            openRoute={copy.openRoute}
            zoomInTitle={copy.mapZoomIn}
            zoomOutTitle={copy.mapZoomOut}
          />
        </Suspense>
        <span className="demo-day-map-location-banner">
          <Navigation aria-hidden="true" />
          <strong>{copy.currentLocation}</strong>
        </span>
      </div>

      <ol className="demo-day-return-points">
        {returnLocations.map((location, index) => (
          <li key={location.id} className={index === 0 ? "is-nearest" : undefined}>
            <span className="demo-day-return-point-index">{index + 1}</span>
            <span className="demo-day-return-point-copy">
              <small>{index === 0 ? copy.nearestLocation : copy.otherLocation}</small>
              <strong>{location.name}</strong>
              <span>{location.address}</span>
              <em>{copy.acceptsDevices}</em>
            </span>
            <a href={location.routeUrl} target="_blank" rel="noreferrer" aria-label={`${copy.openRoute}: ${location.name}`}>
              <Navigation aria-hidden="true" />
              <span>{copy.openRoute}</span>
            </a>
          </li>
        ))}
      </ol>
    </div>

    <a
      className="demo-day-return-source"
      href="https://www.dresden.de/de/stadtraum/umwelt/abfall-stadtreinigung/abfallberatung/trennung/Elektroaltgeraet.php"
      target="_blank"
      rel="noreferrer"
    >
      {copy.officialSource}<ExternalLink aria-hidden="true" />
    </a>
  </section>
);

const MetalProfile = ({ record, language, copy }: { record: DemoDayDeviceRecord; language: Language; copy: LookupCopy }) => {
  const groups = metalSummaryGroups.map((group) => {
    const metals = record.metalProfile.filter((metal) => group.metals.includes(metal.key));
    const knownMass = metals.reduce((total, metal) => total + (metal.grams ?? 0), 0);
    const dominantMetals = [...metals].sort((left, right) => (right.grams ?? -1) - (left.grams ?? -1));

    return {
      ...group,
      knownMass,
      examples: dominantMetals.slice(0, 2).map((metal) => copy.metals[metal.key]),
    };
  }).sort((left, right) => right.knownMass - left.knownMass);
  const capturedMass = groups.reduce((total, group) => total + group.knownMass, 0);
  let accumulatedShare = 0;
  const chartSegments = groups.map((group) => {
    const start = accumulatedShare;
    accumulatedShare += capturedMass > 0 ? (group.knownMass / capturedMass) * 100 : 0;
    return `${group.color} ${start}% ${accumulatedShare}%`;
  });
  const chartBackground = capturedMass > 0
    ? `conic-gradient(from -90deg, ${chartSegments.join(", ")})`
    : "#dce6e0";

  return (
    <section className="demo-day-metals" aria-labelledby="demo-day-metal-title">
      <div className="demo-day-section-heading">
        <div>
          <p className="demo-day-kicker">{copy.metalInventory}</p>
          <h5 id="demo-day-metal-title">{copy.metalSummaryTitle}</h5>
        </div>
        <p>{copy.metalInventoryText}</p>
      </div>

      <div className="demo-day-metal-overview">
        <div
          className="demo-day-metal-chart"
          role="img"
          aria-label={`${copy.metalSummaryTitle}. ${copy.capturedMetalMass}: ${formatMetalMass(capturedMass, language)}`}
        >
          <div className="demo-day-metal-donut" style={{ background: chartBackground }} aria-hidden="true">
            <span>
              <strong>{formatMetalMass(capturedMass, language)}</strong>
              <small>{copy.capturedMetalMass}</small>
            </span>
          </div>
          <p>{copy.capturedMetalMassNote}</p>
        </div>

        <div className="demo-day-metal-groups">
          {groups.map((group) => {
            const GroupIcon = group.icon;
            const share = capturedMass > 0 ? (group.knownMass / capturedMass) * 100 : 0;
            return (
              <div
                className="demo-day-metal-group"
                data-group={group.key}
                data-testid="metal-summary-group"
                key={group.key}
                style={{
                  "--metal-group-color": group.color,
                  "--metal-group-share": `${share}%`,
                } as CSSProperties}
              >
                <span className="demo-day-metal-group-icon" aria-hidden="true"><GroupIcon /></span>
                <span className="demo-day-metal-group-copy">
                  <strong>{copy.metalGroups[group.key]}</strong>
                  <small>{group.examples.join(" · ")}</small>
                </span>
                <span className="demo-day-metal-group-value">
                  <strong>{group.knownMass > 0 ? formatMetalMass(group.knownMass, language) : copy.notPublished}</strong>
                  <small>{formatNumber(share, language, share < 1 ? 2 : 0)}% {copy.metalShare}</small>
                </span>
                <span className="demo-day-metal-group-track" aria-hidden="true"><i /></span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const SourcesAndMethod = ({ record, language, copy }: { record: DemoDayDeviceRecord; language: Language; copy: LookupCopy }) => (
  <details className="demo-day-sources">
    <summary>
      <span>{copy.sourceList}</span>
      <small>{copy.sourceSummary}</small>
    </summary>
    <div className="demo-day-sources-content">
      {record.disclosures.length > 0 ? (
        <dl className="demo-day-disclosures">
          {record.disclosures.map((disclosure) => (
            <div key={disclosure.kind}>
              <dt>{copy.disclosures[disclosure.kind]}</dt>
              <dd>
                <strong>≥ {formatMetalMass(disclosure.grams, language)}</strong>
                <a href={disclosure.sourceUrl} target="_blank" rel="noreferrer" aria-label={`${copy.disclosures[disclosure.kind]} · ${copy.evidence["manufacturer-minimum"]}`}>
                  {copy.evidence["manufacturer-minimum"]}<ExternalLink aria-hidden="true" />
                </a>
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
      <ul>
        {record.sources.map((source) => (
          <li key={source.url}>
            <a href={source.url} target="_blank" rel="noreferrer">{source.title}<ExternalLink aria-hidden="true" /></a>
          </li>
        ))}
      </ul>
      <p>{copy.precisionNote}</p>
      <p>{copy.syntheticNote}</p>
    </div>
  </details>
);

const FullscreenConfetti = ({ celebrationKey }: { celebrationKey: number }) => {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div key={celebrationKey} className="demo-day-confetti-screen" data-testid="winner-confetti" aria-hidden="true">
      {confettiPieces.map((piece, index) => (
        <i
          key={index}
          style={
            {
              "--confetti-x": piece.x,
              "--confetti-delay": piece.delay,
              "--confetti-duration": piece.duration,
              "--confetti-drift": piece.drift,
              "--confetti-rotation": piece.rotation,
              "--confetti-size": piece.size,
              "--confetti-color": piece.color,
            } as CSSProperties
          }
        />
      ))}
    </div>,
    document.body,
  );
};

const WinnerCelebration = ({ copy, celebrationKey }: { copy: LookupCopy; celebrationKey: number }) => (
  <>
    <FullscreenConfetti celebrationKey={celebrationKey} />
    <section key={celebrationKey} className="demo-day-winner" data-testid="winner-celebration" aria-labelledby="demo-day-winner-title">

      <div className="demo-day-winner-copy" role="status" aria-live="polite">
        <p className="demo-day-winner-eyebrow"><Sparkles aria-hidden="true" />{copy.winnerEyebrow}</p>
        <h4 id="demo-day-winner-title">{copy.winnerTitle}</h4>
        <p>{copy.winnerText}</p>
        <strong>{copy.winnerInstruction}</strong>
      </div>

      <div className="demo-day-gold-prize" aria-label={copy.prize}>
        <div className="demo-day-gold-bar" aria-hidden="true">
          <Trophy />
          <span>LT</span>
          <small>999.9</small>
        </div>
        <p>{copy.prize}</p>
      </div>
    </section>
  </>
);

const formatDemoDaySerialInput = (value: string) => {
  const compact = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
  return compact.match(/.{1,4}/g)?.join("-") ?? "";
};

export function DemoDayCustomerLookup({ language }: DemoDayCustomerLookupProps) {
  const copy = lookupCopy[language];
  const showDeviceVisual = useDeviceVisual();
  const [serial, setSerial] = useState("");
  const [record, setRecord] = useState<DemoDayDeviceRecord | null>(null);
  const [searched, setSearched] = useState(false);
  const [reserved, setReserved] = useState(false);
  const [celebrationKey, setCelebrationKey] = useState(0);

  const DeviceIcon = useMemo(() => (record ? deviceIcons[record.kind] : Cpu), [record]);

  const runLookup = (value: string) => {
    const nextRecord = lookupDemoDayDevice(value);
    void trackDemoDayLookup(value, Boolean(nextRecord), Boolean(nextRecord?.winner));
    setRecord(nextRecord);
    setSearched(true);
    setReserved(false);
    if (nextRecord?.winner) {
      setCelebrationKey((current) => current + 1);
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    runLookup(serial);
  };

  return (
    <div className={`demo-day-lookup${record?.winner ? " is-winner" : ""}`}>
      <section className="demo-day-search" aria-labelledby="demo-day-search-title">
        <div className="demo-day-search-intro">
          <p id="demo-day-search-title" className="demo-day-event-label"><TicketCheck aria-hidden="true" />{copy.eventLabel}</p>
        </div>

        <form className="demo-day-search-form" onSubmit={submit} noValidate>
          <label htmlFor="demo-day-serial">{copy.serialLabel}</label>
          <div className="demo-day-search-control">
            <div className="demo-day-input-wrap">
              <ScanLine aria-hidden="true" />
              <input
                id="demo-day-serial"
                value={serial}
                onChange={(event) => setSerial(formatDemoDaySerialInput(event.target.value))}
                placeholder={copy.serialPlaceholder}
                autoComplete="off"
                autoCapitalize="characters"
                maxLength={14}
                spellCheck={false}
                aria-describedby="demo-day-serial-hint"
              />
            </div>
            <button type="submit" disabled={!serial.trim()}>
              <Search aria-hidden="true" />
              <span>{copy.check}</span>
            </button>
          </div>
          <div className="demo-day-search-meta">
            <p id="demo-day-serial-hint">{copy.serialHint}</p>
            <button
              type="button"
              onClick={() => {
                setSerial(DEMO_DAY_EXAMPLE_SERIAL);
                runLookup(DEMO_DAY_EXAMPLE_SERIAL);
              }}
            >
              {copy.useExample}<ArrowRight aria-hidden="true" />
            </button>
          </div>
        </form>
      </section>

      {searched && !record ? (
        <section className="demo-day-not-found" role="alert">
          <div aria-hidden="true"><Search /></div>
          <span>
            <h4>{copy.notFoundTitle}</h4>
            <p>{copy.notFoundText}</p>
          </span>
          <button type="button" onClick={() => document.getElementById("demo-day-serial")?.focus()}>{copy.retry}</button>
        </section>
      ) : null}

      {record ? (
        <article className="demo-day-passport" aria-labelledby="demo-day-device-model">
          {record.winner ? <WinnerCelebration copy={copy} celebrationKey={celebrationKey} /> : null}

          {!record.winner ? (
            <section className="demo-day-non-winner" role="status" aria-labelledby="demo-day-non-winner-title">
              <span className="demo-day-non-winner-icon" aria-hidden="true"><TicketCheck /></span>
              <div>
                <p>{copy.nonWinnerEyebrow}</p>
                <h4 id="demo-day-non-winner-title">{copy.nonWinnerTitle}</h4>
                <span>{copy.nonWinnerText}</span>
              </div>
            </section>
          ) : null}

          <header className="demo-day-device-header">
            {showDeviceVisual ? (
              <div className="demo-day-device-visual">
                <div className="demo-day-device-model-shell">
                  {supportsWebGl() ? (
                    <Suspense fallback={<span className="demo-day-device-fallback" aria-hidden="true"><DeviceIcon /></span>}>
                      <DemoDayDeviceModel kind={record.kind} />
                    </Suspense>
                  ) : (
                    <span className="demo-day-device-fallback" aria-hidden="true"><DeviceIcon /></span>
                  )}
                </div>
              </div>
            ) : null}
            <div className="demo-day-device-title">
              <div className="demo-day-passport-meta">
                <span><ShieldCheck aria-hidden="true" />{copy.passport}</span>
                <span>{copy.demoRecord}</span>
              </div>
              <p>{record.manufacturer}</p>
              <h4 id="demo-day-device-model">{record.model}</h4>
              <dl>
                <div><dt>{copy.manufactured}</dt><dd>{record.manufacturedYear}</dd></div>
                <div><dt>{copy.weight}</dt><dd>{formatMass(record.weightG, language)}</dd></div>
                <div><dt>ID</dt><dd>{record.passportId}</dd></div>
              </dl>
            </div>
          </header>

          <section className="demo-day-impact" aria-labelledby="demo-day-impact-title">
            <div className="demo-day-impact-copy">
              <p className="demo-day-kicker">{copy.impactEyebrow}</p>
              <h5 id="demo-day-impact-title">{copy.impactTitle}</h5>
              <p>{copy.impactText}</p>
            </div>

            <div
              className="demo-day-impact-meter"
              style={{ "--demo-day-impact-value": `${record.recyclablePercent}%` } as CSSProperties}
              role="img"
              aria-label={`${record.recyclablePercent}% ${copy.recyclable}. ${copy.recyclableText}`}
            >
              <span>
                <strong>{record.recyclablePercent}%</strong>
                <small>{copy.recyclable}</small>
              </span>
            </div>

            <div className="demo-day-impact-facts">
              <div>
                <span className="demo-day-impact-fact-icon" aria-hidden="true"><Weight /></span>
                <span>
                  <strong>{formatMass(record.recoverableWeightG, language)}</strong>
                  <b>{copy.recoverable}</b>
                  <small>{copy.recoverableText}</small>
                </span>
              </div>
              <div>
                <span className="demo-day-impact-fact-icon" aria-hidden="true"><Leaf /></span>
                <span>
                  <strong>{formatNumber(record.avoidedCo2Kg, language)} kg</strong>
                  <b>{copy.avoidedCo2}</b>
                  <small>{copy.avoidedCo2Text}</small>
                </span>
              </div>
            </div>
          </section>

          <MetalProfile record={record} language={language} copy={copy} />

          <section className="demo-day-history">
            <div className="demo-day-history-copy">
              <History aria-hidden="true" />
              <span>
                <small>{copy.circularHistory}</small>
                <strong>{record.recycledBefore ? copy.previousCycles(record.previousCycles) : copy.firstCycle}</strong>
                <p>{record.recycledBefore ? copy.previousCyclesText : copy.firstCycleText}</p>
              </span>
            </div>
            {!record.winner ? (
              <button
                type="button"
                className={reserved ? "is-reserved" : ""}
                onClick={() => {
                  setReserved(true);
                  document.getElementById("demo-day-return-map")?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
              >
                {reserved ? <CheckCircle2 aria-hidden="true" /> : <PackageCheck aria-hidden="true" />}
                <span>{reserved ? copy.reserved : copy.reserve}</span>
              </button>
            ) : (
              <span className="demo-day-winner-verified"><Check aria-hidden="true" />{copy.winnerEyebrow}</span>
            )}
          </section>

          <ReturnLocationMap copy={copy} />
          {reserved ? (
            <section className="demo-day-reservation-benefit" role="status" aria-label={copy.reservationBenefitTitle}>
              <div className="demo-day-reservation-heading">
                <Leaf aria-hidden="true" />
                <div>
                  <p>{copy.reservationBenefitTitle}</p>
                  <strong>{copy.reserved}</strong>
                </div>
              </div>
              <div className="demo-day-reservation-cards">
                <div>
                  <small>{copy.discountBenefit}</small>
                  <strong>15%</strong>
                  <p>{copy.discountBenefitText("15%")}</p>
                </div>
                <div>
                  <small>{copy.certificateBenefit}</small>
                  <strong>1 / 50 <em>{copy.devices}</em></strong>
                  <span aria-hidden="true"><i /></span>
                  <p>{copy.certificateBenefitText(49, `${formatNumber(record.avoidedCo2Kg, language)} kg`)}</p>
                </div>
              </div>
              <p className="demo-day-reserve-note">{copy.reserveText}</p>
            </section>
          ) : null}
          <SourcesAndMethod record={record} language={language} copy={copy} />
        </article>
      ) : null}
    </div>
  );
}
