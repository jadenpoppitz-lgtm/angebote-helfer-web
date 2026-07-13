import { useEffect, type ReactNode } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { languages, useLanguage, type Language } from "@/lib/i18n";
import {
  hostingDetails,
  isHostingComplete,
  isOperatorComplete,
  legalOperator,
} from "@/lib/legal";

export type LegalPageKind = "imprint" | "privacy" | "accessibility";

type LegalCopy = {
  accessibility: {
    feedback: string;
    intro: string;
    limitations: string[];
    limitationsTitle: string;
    measures: string[];
    measuresTitle: string;
    scope: string;
    scopeTitle: string;
    title: string;
  };
  back: string;
  controller: string;
  eyebrow: string;
  hostingMissing: string;
  imprint: {
    editorial: string;
    editorialFallback: string;
    intro: string;
    offering: string;
    offeringText: string;
    provider: string;
    registration: string;
    title: string;
    vsbg: string;
    vsbgText: string;
  };
  incomplete: string;
  incompleteDetails: string[];
  incompleteTitle: string;
  legalBasis: string;
  privacy: {
    external: string;
    externalText: string;
    form: string;
    formText: string;
    hosting: string;
    hostingText: string;
    intro: string;
    localStorage: string;
    localStorageText: string;
    noTracking: string;
    noTrackingText: string;
    retention: string;
    retentionText: string;
    rights: string;
    rightsItems: string[];
    title: string;
  };
  published: string;
  tabs: Record<LegalPageKind, string>;
  updated: string;
};

const legalCopy: Record<Language, LegalCopy> = {
  de: {
    eyebrow: "Rechtliches",
    back: "Zur Startseite",
    controller: "Verantwortlicher",
    incompleteTitle: "Vor Veröffentlichung vervollständigen",
    incomplete:
      "Die Seitenstruktur ist vorbereitet, die rechtsverbindlichen Betreiberangaben sind im Projekt jedoch noch nicht hinterlegt. Ohne diese Daten ist das Impressum nicht veröffentlichungsreif.",
    incompleteDetails: [
      "vollständiger Name und Rechtsform des Anbieters",
      "vertretungsberechtigte Person",
      "ladungsfähige Anschrift",
      "E-Mail-Adresse und gegebenenfalls Telefonnummer",
      "falls vorhanden: Register, Registernummer und USt-IdNr.",
      "falls journalistisch-redaktionell: Verantwortlicher nach § 18 Abs. 2 MStV",
    ],
    hostingMissing:
      "Der produktive Hosting-Anbieter, der Serverstandort und die Löschfrist für Serverprotokolle müssen vor dem Livegang ergänzt werden.",
    legalBasis: "Rechtliche Grundlagen",
    published: "Aktueller technischer Stand",
    updated: "Stand: 10. Juli 2026",
    tabs: { imprint: "Impressum", privacy: "Datenschutz", accessibility: "Barrierefreiheit" },
    imprint: {
      title: "Impressum",
      intro: "Anbieterkennzeichnung nach § 5 DDG und § 18 Abs. 1 MStV.",
      provider: "Anbieter",
      registration: "Register und Steuerangaben",
      editorial: "Inhaltlich verantwortlich",
      editorialFallback:
        "Die Website ist derzeit als Unternehmens- und Projektpräsentation angelegt. Falls künftig journalistisch-redaktionelle Inhalte veröffentlicht werden, ist eine verantwortliche Person mit Anschrift zu benennen.",
      offering: "Charakter des Angebots",
      offeringText:
        "Die Website informiert über Leaftronics und ermöglicht die Anbahnung von B2B-Pilotprojekten. Über die Website selbst wird kein verbindlicher Vertrag geschlossen und kein Verbraucher-Onlineshop betrieben.",
      vsbg: "Verbraucherstreitbeilegung",
      vsbgText:
        "Das Angebot richtet sich derzeit an Unternehmen. Vor Einführung von B2C-Angeboten ist zu prüfen und anzugeben, ob eine Teilnahme an einem Streitbeilegungsverfahren nach § 36 VSBG erfolgt.",
    },
    privacy: {
      title: "Datenschutzerklärung",
      intro:
        "Diese Hinweise beschreiben die Datenverarbeitung im aktuellen Website-Prototyp. Sie müssen beim Anschluss eines produktiven Hostings, Formular-Backends oder Analysewerkzeugs aktualisiert werden.",
      hosting: "Bereitstellung der Website",
      hostingText:
        "Beim produktiven Abruf einer Website verarbeitet der Hosting-Anbieter technisch erforderliche Verbindungsdaten, insbesondere IP-Adresse, Zeitpunkt, angeforderte Ressource, Referrer sowie Browser- und Geräteinformationen. Zweck sind Auslieferung, Stabilität und Sicherheit der Website; Rechtsgrundlage ist regelmäßig Art. 6 Abs. 1 lit. f DSGVO.",
      localStorage: "Spracheinstellung",
      localStorageText:
        "Die gewählte Sprache wird unter dem Schlüssel „language“ lokal im Browser gespeichert. Das dient der ausdrücklich gewünschten Sprachdarstellung. Die Information bleibt bis zur Löschung der Website-Daten im Browser erhalten und wird nicht zu Analysezwecken verwendet.",
      form: "Pilotprojekt-Formular",
      formText:
        "Im aktuellen Prototyp werden Unternehmen, Ansprechpartner, E-Mail, Produktangabe und Freitext ausschließlich lokal in diesem Browser unter einem Leaftronics-Referenzschlüssel gespeichert. Es findet noch keine Übertragung an Leaftronics oder Dritte statt. Vor Aktivierung eines Formular-Backends müssen Empfänger, Rechtsgrundlage, Speicherdauer und gegebenenfalls Auftragsverarbeiter ergänzt werden.",
      noTracking: "Keine Analyse- oder Marketingtracker",
      noTrackingText:
        "Der aktuelle Stand setzt keine Webanalyse, Werbepixel oder Social-Media-Tracker ein. Schriften, Bilder und 3D-Modelle werden lokal ausgeliefert. Für diese Funktionen ist daher kein Marketing-Cookie-Banner eingebaut.",
      external: "Externe Links",
      externalText:
        "Externe Forschungs- und Quellenlinks werden erst beim Anklicken aufgerufen. Ab diesem Zeitpunkt gelten die Datenschutzbestimmungen des jeweiligen Zielanbieters.",
      retention: "Speicherdauer",
      retentionText:
        "Lokale Spracheinstellungen und Pilot-Demodaten verbleiben bis zur manuellen Löschung der Website-Daten im Browser. Die Aufbewahrungsfrist produktiver Serverprotokolle ist noch mit dem Hosting-Anbieter festzulegen.",
      rights: "Ihre Rechte",
      rightsItems: [
        "Auskunft, Berichtigung und Löschung personenbezogener Daten",
        "Einschränkung der Verarbeitung und Datenübertragbarkeit, soweit anwendbar",
        "Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen",
        "Widerruf einer Einwilligung mit Wirkung für die Zukunft",
        "Beschwerde bei einer Datenschutzaufsichtsbehörde",
      ],
    },
    accessibility: {
      title: "Barrierefreiheit",
      intro:
        "Leaftronics möchte die Website unabhängig von Gerät und Eingabeform zugänglich machen. Diese freiwillige Erklärung beschreibt den aktuellen Entwicklungsstand und ist keine abgeschlossene Konformitätsbescheinigung.",
      measuresTitle: "Bereits umgesetzt",
      measures: [
        "semantische Überschriften, Formularbeschriftungen und sichtbare Fokuszustände",
        "Tastaturbedienbarkeit der Navigation, Formulare und interaktiven Bildmarker",
        "responsive Layouts für kleine Smartphones, Tablets, Desktop und Ultrawide",
        "reduzierte Bewegungen bei aktivierter Systemeinstellung „Bewegung reduzieren“",
        "Alternativtexte beziehungsweise textliche Erklärungen für zentrale Bilder und Prozessschritte",
      ],
      limitationsTitle: "Bekannte Grenzen",
      limitations: [
        "Die komplexe 3D-Prozessanimation ist textlich beschrieben, aber noch nicht in jedem Detail für Screenreader abbildbar.",
        "Eine unabhängige Prüfung nach WCAG 2.2 AA wurde noch nicht durchgeführt.",
        "Die endgültige Kontaktmöglichkeit für Barrierefreiheitsfeedback hängt von den Betreiberangaben ab.",
      ],
      scopeTitle: "Rechtlicher Anwendungsbereich",
      scope:
        "Ob das BFSG im konkreten Fall anwendbar ist, hängt unter anderem von Betreibergröße, Zielgruppe und angebotener Dienstleistung ab. Die Website wird unabhängig davon nach barrierearmen Grundsätzen weiterentwickelt.",
      feedback: "Feedback zur Barrierefreiheit über das Pilotformular senden",
    },
  },
  en: {
    eyebrow: "Legal",
    back: "Back to homepage",
    controller: "Controller",
    incompleteTitle: "Complete before publication",
    incomplete:
      "The page structure is ready, but the legally binding operator details have not yet been entered. The legal notice is not ready for publication without them.",
    incompleteDetails: [
      "full legal name and legal form",
      "authorised representative",
      "serviceable business address",
      "email address and, where applicable, telephone number",
      "where applicable: register, registration number and VAT ID",
      "for editorial content: responsible editor under section 18(2) MStV",
    ],
    hostingMissing:
      "The production hosting provider, server region and server-log retention period must be added before launch.",
    legalBasis: "Legal foundations",
    published: "Current technical state",
    updated: "Updated: 10 July 2026",
    tabs: { imprint: "Legal notice", privacy: "Privacy", accessibility: "Accessibility" },
    imprint: {
      title: "Legal notice",
      intro: "Provider information under section 5 DDG and section 18(1) MStV.",
      provider: "Provider",
      registration: "Register and tax information",
      editorial: "Editorial responsibility",
      editorialFallback:
        "The website is currently a company and project presentation. If journalistic or editorial content is added, a responsible person and address must be named.",
      offering: "Nature of the service",
      offeringText:
        "The website presents Leaftronics and supports initial B2B pilot enquiries. No binding contract is concluded through the website and it is not a consumer online shop.",
      vsbg: "Consumer dispute resolution",
      vsbgText:
        "The service currently targets businesses. Before introducing B2C services, participation information under section 36 VSBG must be assessed and added.",
    },
    privacy: {
      title: "Privacy policy",
      intro:
        "This notice describes processing in the current website prototype. It must be updated when production hosting, a form backend or analytics are connected.",
      hosting: "Website delivery",
      hostingText:
        "A production host technically processes connection data such as IP address, time, requested resource, referrer, browser and device information. This serves delivery, stability and security; the usual legal basis is Article 6(1)(f) GDPR.",
      localStorage: "Language preference",
      localStorageText:
        "The selected language is stored locally under the key “language”. It is used only to provide the requested language and remains until website data is deleted in the browser.",
      form: "Pilot-project form",
      formText:
        "In the current prototype, company, contact person, email, product details and free text are stored only in this browser under a Leaftronics reference key. Nothing is transmitted to Leaftronics or third parties yet. Recipients, legal basis and retention must be added before a backend is activated.",
      noTracking: "No analytics or marketing trackers",
      noTrackingText:
        "The current version uses no web analytics, advertising pixels or social-media trackers. Fonts, images and 3D models are served locally, so no marketing-cookie banner is included for these functions.",
      external: "External links",
      externalText:
        "Research and source links contact the external provider only after they are clicked. The destination provider's privacy terms then apply.",
      retention: "Retention",
      retentionText:
        "Language and pilot demo data remain until the browser's website data is deleted. Production server-log retention still needs to be defined with the hosting provider.",
      rights: "Your rights",
      rightsItems: [
        "access, rectification and erasure",
        "restriction and portability where applicable",
        "objection to processing based on legitimate interests",
        "withdrawal of consent for the future",
        "complaint to a data-protection authority",
      ],
    },
    accessibility: {
      title: "Accessibility",
      intro:
        "Leaftronics aims to make the website usable across devices and input methods. This voluntary statement describes the current development status and is not a completed certificate of conformity.",
      measuresTitle: "Already implemented",
      measures: [
        "semantic headings, form labels and visible focus states",
        "keyboard access for navigation, forms and interactive image markers",
        "responsive layouts from small phones to ultrawide screens",
        "reduced motion when the system preference is enabled",
        "alternative text or written explanations for key images and process steps",
      ],
      limitationsTitle: "Known limitations",
      limitations: [
        "The complex 3D process has a written explanation but not every visual detail is available to screen readers.",
        "No independent WCAG 2.2 AA audit has been completed yet.",
        "The final accessibility-feedback contact depends on the confirmed operator details.",
      ],
      scopeTitle: "Legal scope",
      scope:
        "Whether the German Accessibility Strengthening Act applies depends on the operator, audience and service. The site will continue to follow accessible design principles regardless.",
      feedback: "Send accessibility feedback through the pilot form",
    },
  },
  zh: {
    eyebrow: "法律信息",
    back: "返回首页",
    controller: "数据控制者",
    incompleteTitle: "发布前必须补充",
    incomplete: "页面结构已经完成，但具有法律约束力的运营方信息尚未录入。在补全前，本法律声明不适合正式发布。",
    incompleteDetails: [
      "运营方完整名称与法律形式",
      "法定代表人",
      "可接收法律文书的完整地址",
      "电子邮箱及适用时的电话号码",
      "适用时的登记机关、登记号与增值税号",
      "如有新闻编辑内容：依据 MStV 第 18(2) 条指定负责人",
    ],
    hostingMissing: "正式托管服务商、服务器地区与服务器日志保存期限必须在上线前补充。",
    legalBasis: "法律依据",
    published: "当前技术状态",
    updated: "更新日期：2026年7月10日",
    tabs: { imprint: "法律声明", privacy: "隐私政策", accessibility: "无障碍说明" },
    imprint: {
      title: "法律声明",
      intro: "依据德国 DDG 第 5 条与 MStV 第 18(1) 条提供运营方信息。",
      provider: "运营方",
      registration: "登记与税务信息",
      editorial: "内容负责人",
      editorialFallback: "本网站目前用于企业和项目展示。若今后发布新闻或编辑内容，必须补充负责人姓名与地址。",
      offering: "服务性质",
      offeringText: "本网站介绍 Leaftronics 并用于发起 B2B 试点合作。网站本身不会直接订立有约束力的合同，也不是面向消费者的网上商店。",
      vsbg: "消费者争议解决",
      vsbgText: "目前服务对象为企业。若未来增加 B2C 服务，应重新评估并补充德国 VSBG 第 36 条要求的信息。",
    },
    privacy: {
      title: "隐私政策",
      intro: "本说明描述当前网站原型的数据处理情况。接入正式托管、表单后端或分析工具时必须同步更新。",
      hosting: "网站提供",
      hostingText: "正式托管服务商通常会处理 IP 地址、访问时间、请求资源、来源页面、浏览器与设备信息，以保证网站交付、稳定与安全；通常依据 GDPR 第 6(1)(f) 条。",
      localStorage: "语言偏好",
      localStorageText: "所选语言以“language”为键保存在本地浏览器中，仅用于显示用户选择的语言，直到用户删除该网站的浏览器数据。",
      form: "试点项目表单",
      formText: "当前原型仅在此浏览器中保存企业、联系人、电子邮箱、产品信息与备注，并使用 Leaftronics 参考编号。本阶段不会传输给 Leaftronics 或第三方。接入后端前必须补充接收方、法律依据与保存期限。",
      noTracking: "无分析或营销追踪",
      noTrackingText: "当前版本不使用网站分析、广告像素或社交媒体追踪器。字体、图片与 3D 模型均由本站本地提供，因此这些功能无需营销 Cookie 弹窗。",
      external: "外部链接",
      externalText: "研究与来源链接仅在用户点击后访问外部服务，之后适用目标网站的隐私规则。",
      retention: "保存期限",
      retentionText: "语言和试点演示数据会保留到用户删除浏览器中的网站数据。正式服务器日志的保存期限仍需与托管服务商确定。",
      rights: "您的权利",
      rightsItems: ["查阅、更正和删除", "适用时限制处理与数据可携带", "反对基于合法利益的数据处理", "撤回对未来有效的同意", "向数据保护监管机构投诉"],
    },
    accessibility: {
      title: "无障碍说明",
      intro: "Leaftronics 希望网站能够在不同设备和输入方式下使用。本自愿说明反映当前开发状态，并非正式的合规认证。",
      measuresTitle: "已实施",
      measures: ["语义化标题、表单标签与清晰的焦点状态", "导航、表单与图片标记支持键盘操作", "适配小屏手机、平板、桌面与超宽屏", "尊重系统的减少动态效果设置", "为关键图片和流程步骤提供替代文字或文字说明"],
      limitationsTitle: "已知限制",
      limitations: ["复杂 3D 流程已有文字说明，但屏幕阅读器仍无法获得全部视觉细节。", "尚未完成独立的 WCAG 2.2 AA 审核。", "最终无障碍反馈联系方式取决于确认后的运营方信息。"],
      scopeTitle: "法律适用范围",
      scope: "德国 BFSG 是否适用取决于运营方规模、目标用户与具体服务。无论是否强制适用，网站都会继续遵循无障碍设计原则。",
      feedback: "通过试点表单提交无障碍反馈",
    },
  },
};

const legalSources: Record<LegalPageKind, Array<{ href: string; label: string }>> = {
  imprint: [
    { label: "§ 5 DDG", href: "https://www.gesetze-im-internet.de/ddg/__5.html" },
    { label: "§ 18 MStV", href: "https://www.gesetze-bayern.de/Content/Document/MStV-18" },
    { label: "§ 36 VSBG", href: "https://www.gesetze-im-internet.de/vsbg/__36.html" },
  ],
  privacy: [
    { label: "DSGVO, Art. 13", href: "https://eur-lex.europa.eu/eli/reg/2016/679/oj?locale=de" },
    { label: "§ 25 TDDDG", href: "https://www.gesetze-im-internet.de/ttdsg/__25.html" },
    { label: "Datenschutzaufsicht Sachsen", href: "https://www.datenschutz.sachsen.de/kontakt.html" },
  ],
  accessibility: [
    { label: "§ 2 BFSG", href: "https://www.gesetze-im-internet.de/bfsg/__2.html" },
    { label: "§ 3 BFSG", href: "https://www.gesetze-im-internet.de/bfsg/__3.html" },
  ],
};

function LegalSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="grid gap-4 border-t border-emerald-950/12 py-9 md:grid-cols-[minmax(10rem,0.35fr)_minmax(0,0.65fr)] md:gap-12 md:py-11">
      <h2 className="font-display text-2xl font-semibold leading-tight text-emerald-950">{title}</h2>
      <div className="space-y-4 text-[0.95rem] leading-7 text-emerald-950/68">{children}</div>
    </section>
  );
}

function IncompleteNotice({ copy }: { copy: LegalCopy }) {
  return (
    <aside className="border-l-2 border-amber-500 bg-amber-50/72 px-5 py-5 text-amber-950">
      <p className="font-semibold">{copy.incompleteTitle}</p>
      <p className="mt-2 text-sm leading-6 text-amber-950/72">{copy.incomplete}</p>
      <ul className="mt-4 grid gap-2 text-sm leading-6 text-amber-950/72 sm:grid-cols-2">
        {copy.incompleteDetails.map((item) => <li key={item}>• {item}</li>)}
      </ul>
    </aside>
  );
}

function OperatorDetails() {
  return (
    <address className="not-italic">
      <p className="font-semibold text-emerald-950">{legalOperator.legalName} {legalOperator.legalForm}</p>
      <p>{legalOperator.streetAddress}</p>
      <p>{legalOperator.postalCode} {legalOperator.city}</p>
      <p>{legalOperator.country}</p>
      <p className="mt-4">Vertreten durch: {legalOperator.representedBy}</p>
      <a className="mt-4 block font-semibold text-emerald-800 hover:text-emerald-950" href={`mailto:${legalOperator.email}`}>
        {legalOperator.email}
      </a>
      {legalOperator.phone ? <a className="block text-emerald-800 hover:text-emerald-950" href={`tel:${legalOperator.phone}`}>{legalOperator.phone}</a> : null}
    </address>
  );
}

export default function LegalPage({ kind }: { kind: LegalPageKind }) {
  const { language, setLanguage } = useLanguage();
  const copy = legalCopy[language];
  const pageCopy = copy[kind];

  useEffect(() => {
    window.scrollTo({ top: 0 });
    const frame = window.requestAnimationFrame(() => {
      document.title = `${pageCopy.title} | Leaftronics`;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pageCopy.title]);

  return (
    <div className="min-h-screen bg-[#f5faf4] text-emerald-950">
      <header className="relative z-40 border-b border-emerald-950/10 bg-[#f5faf4]">
        <div className="mx-auto flex min-h-20 w-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-3" aria-label="Leaftronics">
            <span className="h-10 w-10 overflow-hidden rounded-full border border-emerald-950/10 bg-white">
              <img src="/logo1-web.webp" alt="" className="h-full w-full object-cover" />
            </span>
            <span className="hidden font-display text-sm font-semibold uppercase tracking-[0.2em] sm:inline">Leaftronics</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-md border border-emerald-950/10 bg-white/58 p-1">
              {languages.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setLanguage(item.code)}
                  aria-label={item.label}
                  aria-pressed={language === item.code}
                  className={`h-8 rounded px-2 text-[10px] font-semibold ${language === item.code ? "bg-emerald-900 text-white" : "text-emerald-950/48 hover:text-emerald-950"}`}
                >
                  {item.short}
                </button>
              ))}
            </div>
            <Link to="/" className="inline-flex h-10 items-center gap-2 rounded-md px-2 text-sm font-semibold text-emerald-950/62 hover:text-emerald-950">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{copy.back}</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative isolate overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(90deg,rgba(34,86,54,.12)_1px,transparent_1px),linear-gradient(0deg,rgba(34,86,54,.1)_1px,transparent_1px)] [background-size:68px_68px]" />
        <div aria-hidden className="pointer-events-none absolute -right-[16vw] top-10 h-72 w-[62vw] rotate-[-8deg] rounded-[4rem] bg-emerald-300/18 blur-3xl" />

        <div className="relative mx-auto w-full max-w-7xl px-5 pb-20 pt-14 sm:px-8 md:pb-28 md:pt-20">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">{copy.eyebrow}</p>
          <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.52fr)] lg:items-end lg:gap-16">
            <h1 className="max-w-4xl font-display text-[2.7rem] font-semibold leading-[1.03] sm:text-6xl md:text-7xl">
              {language === "de" && kind === "privacy" ? (
                <>Datenschutz&shy;erklärung</>
              ) : language === "de" && kind === "accessibility" ? (
                <>Barriere&shy;freiheit</>
              ) : pageCopy.title}
            </h1>
            <p className="max-w-xl text-base leading-7 text-emerald-950/62">{pageCopy.intro}</p>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-b border-emerald-950/12 pb-5 text-sm font-semibold">
            {(Object.keys(copy.tabs) as LegalPageKind[]).map((tab) => (
              <Link key={tab} to={tab === "imprint" ? "/impressum" : tab === "privacy" ? "/datenschutz" : "/barrierefreiheit"} className={tab === kind ? "text-emerald-900" : "text-emerald-950/42 hover:text-emerald-950"}>
                {copy.tabs[tab]}
              </Link>
            ))}
          </div>

          <div className="mt-10 max-w-5xl bg-[#f5faf4]/68 backdrop-blur-md">
            {kind === "imprint" ? (
              <>
                {!isOperatorComplete ? <IncompleteNotice copy={copy} /> : null}
                <LegalSection title={copy.imprint.provider}>
                  {isOperatorComplete ? <OperatorDetails /> : <p>{copy.incomplete}</p>}
                </LegalSection>
                {(legalOperator.registerCourt || legalOperator.registerNumber || legalOperator.vatId) ? (
                  <LegalSection title={copy.imprint.registration}>
                    {legalOperator.registerCourt ? <p>{legalOperator.registerCourt}</p> : null}
                    {legalOperator.registerNumber ? <p>{legalOperator.registerNumber}</p> : null}
                    {legalOperator.vatId ? <p>{legalOperator.vatId}</p> : null}
                  </LegalSection>
                ) : null}
                <LegalSection title={copy.imprint.editorial}>
                  {legalOperator.editorialResponsible ? (
                    <p>{legalOperator.editorialResponsible}<br />{legalOperator.editorialAddress}</p>
                  ) : <p>{copy.imprint.editorialFallback}</p>}
                </LegalSection>
                <LegalSection title={copy.imprint.offering}><p>{copy.imprint.offeringText}</p></LegalSection>
                <LegalSection title={copy.imprint.vsbg}><p>{copy.imprint.vsbgText}</p></LegalSection>
              </>
            ) : null}

            {kind === "privacy" ? (
              <>
                {!isOperatorComplete ? <IncompleteNotice copy={copy} /> : null}
                <LegalSection title={copy.controller}>
                  {isOperatorComplete ? <OperatorDetails /> : <p>{copy.incomplete}</p>}
                </LegalSection>
                <LegalSection title={copy.privacy.hosting}>
                  <p>{copy.privacy.hostingText}</p>
                  {!isHostingComplete ? <p className="border-l-2 border-amber-500 pl-4 text-amber-900">{copy.hostingMissing}</p> : (
                    <p>{hostingDetails.provider}<br />{hostingDetails.address}<br />{hostingDetails.region}<br />{hostingDetails.serverLogRetention}</p>
                  )}
                </LegalSection>
                <LegalSection title={copy.privacy.localStorage}><p>{copy.privacy.localStorageText}</p></LegalSection>
                <LegalSection title={copy.privacy.form}><p>{copy.privacy.formText}</p></LegalSection>
                <LegalSection title={copy.privacy.noTracking}><p>{copy.privacy.noTrackingText}</p></LegalSection>
                <LegalSection title={copy.privacy.external}><p>{copy.privacy.externalText}</p></LegalSection>
                <LegalSection title={copy.privacy.retention}><p>{copy.privacy.retentionText}</p></LegalSection>
                <LegalSection title={copy.privacy.rights}>
                  <ul className="grid gap-2">
                    {copy.privacy.rightsItems.map((item) => <li key={item}>• {item}</li>)}
                  </ul>
                  <a href="https://www.datenschutz.sachsen.de/kontakt.html" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-semibold text-emerald-800 hover:text-emerald-950">
                    Datenschutzaufsicht Sachsen <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </LegalSection>
              </>
            ) : null}

            {kind === "accessibility" ? (
              <>
                <LegalSection title={copy.accessibility.measuresTitle}>
                  <ul className="grid gap-2">{copy.accessibility.measures.map((item) => <li key={item}>• {item}</li>)}</ul>
                </LegalSection>
                <LegalSection title={copy.accessibility.limitationsTitle}>
                  <ul className="grid gap-2">{copy.accessibility.limitations.map((item) => <li key={item}>• {item}</li>)}</ul>
                </LegalSection>
                <LegalSection title={copy.accessibility.scopeTitle}>
                  <p>{copy.accessibility.scope}</p>
                  <a href="/#forms" className="inline-flex font-semibold text-emerald-800 hover:text-emerald-950">{copy.accessibility.feedback}</a>
                </LegalSection>
              </>
            ) : null}

            <LegalSection title={copy.legalBasis}>
              <div className="flex flex-wrap gap-x-5 gap-y-3">
                {legalSources[kind].map((source) => (
                  <a key={source.href} href={source.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-semibold text-emerald-800 hover:text-emerald-950">
                    {source.label}<ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-950/42">{copy.updated} · {copy.published}</p>
            </LegalSection>
          </div>
        </div>
      </main>

      <Footer compact />
    </div>
  );
}
