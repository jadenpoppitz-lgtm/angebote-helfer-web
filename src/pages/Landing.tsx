import { useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Factory,
  FileText,
  FlaskConical,
  Flame,
  Globe2,
  Handshake,
  PackageCheck,
  QrCode,
  Recycle,
  SearchCheck,
  UserRound,
  Wrench,
} from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { languages, type Language, useLanguage } from "@/lib/i18n";
import { DEMO_SERIAL, SERIAL_DB, type SerialLookup } from "@/data/partners";

type RoleId = "oem" | "customer" | "recycler" | "smelter" | "partner";
type GraphPoint = "identify" | "return" | "disassembly" | "recycler" | "smelter" | "reporting" | "oem";

type LandingCopy = {
  nav: { problem: string; roles: string; solution: string; demos: string; forms: string };
  hero: { eyebrow: string; title: string; text: string; cta: string };
  problem: {
    eyebrow: string;
    title: string;
    text: string;
    cta: string;
    stats: Array<{ value: string; label: string }>;
    tiles: Array<{ title: string; text: string; image: string }>;
  };
  roles: {
    eyebrow: string;
    title: string;
    text: string;
    cards: Record<RoleId, { title: string; problem: string; value: string; next: string; cta: string }>;
  };
  solution: {
    eyebrow: string;
    title: string;
    text: string;
    hoverLabel: string;
    nextStep: string;
    nodes: Record<GraphPoint, { title: string; label: string; problem: string; solution: string; next: string }>;
    values: Array<{ role: string; value: string }>;
  };
  demos: {
    eyebrow: string;
    title: string;
    text: string;
    liveLabel: string;
    customerLive: {
      title: string;
      text: string;
      serialLabel: string;
      serialPlaceholder: string;
      detect: string;
      detected: string;
      unknown: string;
      returnPoints: string;
      discounts: string;
      useDemo: string;
      confirm: string;
      locationPending: string;
      check: string;
      oemOffers: Array<{ oem: string; offer: string; condition: string }>;
    };
    surfaces: Record<RoleId, { title: string; subtitle: string; metrics: Array<{ label: string; value: string }>; steps: string[] }>;
  };
  form: {
    eyebrow: string;
    title: string;
    text: string;
    roleLabel: string;
    company: string;
    contact: string;
    email: string;
    product: string;
    notes: string;
    submit: string;
    successTitle: string;
    successText: (id: string, role: string) => string;
    demoId: string;
  };
};

const copy: Record<Language, LandingCopy> = {
  de: {
    nav: { problem: "Problem", roles: "Rollen", solution: "Kreislauf", demos: "Demos", forms: "Starten" },
    hero: {
      eyebrow: "Materialien beginnen in der Natur",
      title: "Was wir abbauen, muss im Kreislauf bleiben.",
      text:
        "Kernbeisser macht aus Recycling einen steuerbaren B2B-Prozess: Produkt identifizieren, sauber demontieren, Materialdaten sichern und Wertstoffe in Europa halten.",
      cta: "Rolle auswählen",
    },
    problem: {
      eyebrow: "Das Problem",
      title: "Materialien verschwinden, bevor sie wieder Produktion werden.",
      text:
        "Alte Produkte werden exportiert, unscharf gesammelt oder nicht sauber demontiert. Bestimmte Fraktionen werden im Prozess nicht gefiltert, OEMs verlieren Materialhoheit und Europa verliert Rohstoffsicherheit. Kernbeisser setzt dort an, wo Produktdaten, Demontage und Materialrückführung bisher getrennt sind.",
      cta: "Zur Lösung",
      stats: [
        { value: "Export", label: "Kontrolle geht verloren" },
        { value: "CMA", label: "Rohstoffe in Europa halten" },
        { value: "OEM", label: "Materialhoheit sichern" },
      ],
      tiles: [
        {
          title: "Export statt Rückführung",
          text: "Produkte verlassen den regionalen Kreislauf, bevor Herkunft und Materialwert gesichert sind.",
          image: "https://images.unsplash.com/photo-1494412685616-a5d310fbb07d?auto=format&fit=crop&w=900&q=80",
        },
        {
          title: "Unscharfe Sammlung",
          text: "B2B-Produkte werden mit Mischströmen vermengt und verlieren Qualität, Serienbezug und Verantwortung.",
          image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
        },
        {
          title: "Fehlende Demontage",
          text: "PCB, Gehäuse und Komponenten werden nicht sauber getrennt, bevor Wertstoffe in falsche Kanäle fallen.",
          image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80",
        },
        {
          title: "Keine Materialhoheit",
          text: "Ohne Datenfluss verlieren OEMs Rückführungsdaten, ESG-Nachweise und europäische Produktionsoptionen.",
          image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80",
        },
      ],
    },
    roles: {
      eyebrow: "Rollenbasierter Einstieg",
      title: "Jeder Teilnehmer bekommt seinen nächsten Schritt.",
      text: "Wähle eine Rolle: Die Seite aktualisiert Graph, Demo-Oberfläche und Formular automatisch.",
      cards: {
        oem: {
          title: "OEM / Produzent",
          problem: "Material und ESG-Daten verschwinden nach dem Verkauf.",
          value: "Recyclebare Leiterplatten, bis zu 50 Prozent weniger CO2, Rückführungsdaten und Materialhoheit.",
          next: "Closed-Loop Gespräch starten",
          cta: "OEM auswählen",
        },
        customer: {
          title: "Customer / Rückgeber",
          problem: "Alte Produkte liegen ungenutzt oder gehen in unscharfe Sammelströme.",
          value: "Seriennummer erfassen, Rückgabe bestätigen und Rabatt bei OEMs im Netzwerk erhalten.",
          next: "Produkt zurückgeben",
          cta: "Rückgabe starten",
        },
        recycler: {
          title: "Recycler / Demontage",
          problem: "PCB und Fraktionen werden zu spät oder zu grob getrennt.",
          value: "Chemische Lösungen, Prozesslogik und klare Materialfraktionen für reinere Verwertung.",
          next: "Partnerprofil anlegen",
          cta: "Recycler auswählen",
        },
        smelter: {
          title: "Smelter / Materialpartner",
          problem: "Materialströme sind schlecht dokumentiert und schwankend in Qualität.",
          value: "Qualifizierte PCB-Chargen, erwartete Ausbeute und dokumentierte Herkunft.",
          next: "Materialinteresse melden",
          cta: "Smelter auswählen",
        },
        partner: {
          title: "Berater / Systempartner",
          problem: "Prozessstatus, offene Fälle und Reporting liegen verstreut.",
          value: "Gemeinsame Datenbasis für Fälle, ESG-Reporting und Partnerkoordination.",
          next: "Systempartner werden",
          cta: "Partner auswählen",
        },
      },
    },
    solution: {
      eyebrow: "Interaktiver Kreislauf",
      title: "Ein lesbarer Graph mit echten nächsten Schritten.",
      text:
        "Die Pfeile zeigen Material- und Transportwege. Die Punkte zeigen, wo Kernbeisser Wert erzeugt: von Seriennummer bis ESG-Bericht.",
      hoverLabel: "Aktiver Prozesspunkt",
      nextStep: "Nächster Schritt",
      nodes: {
        identify: {
          title: "Produkt identifizieren",
          label: "Serial / QR",
          problem: "Ohne Produkt-ID ist Material nicht rückführbar.",
          solution: "Seriennummer, PCB-Typ und OEM-Bezug werden erfasst.",
          next: "Rückgabeformular öffnen",
        },
        return: {
          title: "Rückgabe anstoßen",
          label: "Customer",
          problem: "Produkte bleiben liegen oder werden falsch entsorgt.",
          solution: "Rückgeber erhalten Status und Rabatt im OEM-Netzwerk.",
          next: "Rabattstatus prüfen",
        },
        disassembly: {
          title: "Sauber demontieren",
          label: "Demontage",
          problem: "PCB, Gehäuse und Komponenten vermischen sich.",
          solution: "Partner erhalten klare Demontage- und Fraktionslogik.",
          next: "Demontageauftrag anlegen",
        },
        recycler: {
          title: "Chemisch lösen",
          label: "Recycler",
          problem: "Wertstoffe werden nicht gezielt gefiltert.",
          solution: "Chemische Lösungen verbessern Auflösung und Trennung.",
          next: "Recycler-Demo ansehen",
        },
        smelter: {
          title: "Material verwerten",
          label: "Smelter",
          problem: "Schwankende Qualität senkt Ausbeute.",
          solution: "Qualifizierte PCB-Chargen gehen an passende Materialpartner.",
          next: "Charge prüfen",
        },
        reporting: {
          title: "ESG dokumentieren",
          label: "Reporting",
          problem: "Nachweise bleiben unvollständig.",
          solution: "CO2, Materialwert und Rückführung werden dokumentiert.",
          next: "Bericht erzeugen",
        },
        oem: {
          title: "An OEM zurückführen",
          label: "OEM",
          problem: "Materialhoheit endet nach dem Produktverkauf.",
          solution: "OEMs erhalten Daten, Sekundärmaterial und neue Produktionsoptionen.",
          next: "OEM-Dashboard öffnen",
        },
      },
      values: [
        { role: "OEM", value: "Recyclebare PCB, 50 Prozent weniger CO2, Materialhoheit." },
        { role: "Recycler", value: "Chemische Lösung, Fraktionslogik, sauberere Auflösung." },
        { role: "Smelter", value: "Bessere Chargen, dokumentierte Herkunft, erwartete Ausbeute." },
        { role: "Customer", value: "Rückgabe bestätigen, Rabatt erhalten, Produktstatus sehen." },
        { role: "Partner", value: "ESG-Reporting, offene Fälle, koordinierte Prozessdaten." },
      ],
    },
    demos: {
      eyebrow: "Demo-Oberflächen",
      title: "So fühlt sich das Netzwerk als Produkt an.",
      text: "Jede Rolle bekommt eine kleine Oberfläche mit Demo-Daten, damit der Prototyp nicht nur erklärt, sondern bedienbar wirkt.",
      liveLabel: "Live-Demo",
      customerLive: {
        title: "Live-Demo: Customer Rückgabe",
        text: "Gib eine Seriennummer ein. Kernbeisser erkennt Produkt und Standort, zeigt Rückgabepartner und mögliche OEM-Rabatte.",
        serialLabel: "Seriennummer",
        serialPlaceholder: "z. B. KB-DD-0001",
        detect: "Standort automatisch erkennen",
        detected: "Standort erkannt",
        unknown: "Seriennummer noch nicht im Demo-System",
        returnPoints: "Rückgabepartner",
        discounts: "Rabattaktionen der Partner-OEMs",
        useDemo: "Demo-Seriennummer nutzen",
        confirm: "Rückgabe bestätigen",
        locationPending: "Standort wird erkannt ...",
        check: "Prüfen",
        oemOffers: [
          { oem: "YETI Industrial", offer: "12% Rabatt auf Service-PCB", condition: "nach bestätigter Rückgabe" },
          { oem: "Leaftronics OEM", offer: "85 EUR Materialgutschrift", condition: "für sortenreine Leiterplatten" },
          { oem: "Kernbeisser Network", offer: "CO2-Zertifikat + Einkaufsvorteil", condition: "für ESG-fähige Rückläufer" },
        ],
      },
      surfaces: {
        oem: {
          title: "OEM-Dashboard",
          subtitle: "Rückläufer, Materialwerte und ESG-Status",
          metrics: [
            { label: "CO2-Einsparung", value: "-50%" },
            { label: "Rückläufer", value: "128" },
            { label: "ESG Status", value: "bereit" },
          ],
          steps: ["PCB-Design freigegeben", "Rückläufer zugeordnet", "Materialbericht erstellt"],
        },
        customer: {
          title: "Customer-Rückgabe",
          subtitle: "Seriennummer, Rabattstatus und Bestätigung",
          metrics: [
            { label: "Demo-ID", value: "KB-24-104" },
            { label: "Rabatt", value: "12%" },
            { label: "Status", value: "bestätigt" },
          ],
          steps: ["QR gescannt", "OEM erkannt", "Rückgabe akzeptiert"],
        },
        recycler: {
          title: "Recycler-Ansicht",
          subtitle: "Fraktionen, Chemie und Demontagestatus",
          metrics: [
            { label: "PCB", value: "420 kg" },
            { label: "Trennung", value: "94%" },
            { label: "Charge", value: "R-18" },
          ],
          steps: ["Demontage gestartet", "Chemische Lösung gewählt", "Fraktionen bereit"],
        },
        smelter: {
          title: "Smelter-Ansicht",
          subtitle: "PCB-Chargen, Qualität und Ausbeute",
          metrics: [
            { label: "Au", value: "hoch" },
            { label: "Cu", value: "HG" },
            { label: "Yield", value: "89%" },
          ],
          steps: ["Charge geprüft", "Ausbeute berechnet", "Materialpfad dokumentiert"],
        },
        partner: {
          title: "Partner-Board",
          subtitle: "Fälle, Reporting und Prozesskoordination",
          metrics: [
            { label: "Offene Fälle", value: "7" },
            { label: "Reports", value: "12" },
            { label: "Risiko", value: "niedrig" },
          ],
          steps: ["Partner zugeordnet", "ESG-Daten synchronisiert", "Nächste Aktion geplant"],
        },
      },
    },
    form: {
      eyebrow: "Conversion",
      title: "Starte mit deiner Rolle.",
      text: "Kurzes Demo-Formular mit Lade-, Erfolgs- und Referenzzustand. Die Anfrage wird lokal als Prototyp gespeichert.",
      roleLabel: "Rolle",
      company: "Unternehmen",
      contact: "Ansprechpartner",
      email: "E-Mail",
      product: "Produkt / Seriennummer / Material",
      notes: "Was soll als Nächstes passieren?",
      submit: "Anfrage speichern",
      successTitle: "Anfrage gespeichert",
      successText: (id, role) => `Referenz ${id}: ${role} wurde im Demo-System angelegt. Als Nächstes folgt ein passender Prozessvorschlag.`,
      demoId: "Demo-Referenz",
    },
  },
  en: {
    nav: { problem: "Problem", roles: "Roles", solution: "Loop", demos: "Demos", forms: "Start" },
    hero: {
      eyebrow: "Materials begin in nature",
      title: "What we extract must stay in the loop.",
      text:
        "Kernbeisser turns recycling into a controllable B2B process: identify products, disassemble cleanly, preserve material data and keep value in Europe.",
      cta: "Select role",
    },
    problem: {
      eyebrow: "The problem",
      title: "Materials disappear before they become production again.",
      text:
        "Old products are exported, collected too broadly or not disassembled cleanly. Specific fractions are never filtered, OEMs lose material sovereignty and Europe loses raw-material security. Kernbeisser connects the product data, disassembly and material return paths that are currently separated.",
      cta: "See solution",
      stats: [
        { value: "Export", label: "control gets lost" },
        { value: "CMA", label: "keep resources in Europe" },
        { value: "OEM", label: "secure material sovereignty" },
      ],
      tiles: [
        {
          title: "Export instead of return",
          text: "Products leave the regional loop before origin and material value are secured.",
          image: "https://images.unsplash.com/photo-1494412685616-a5d310fbb07d?auto=format&fit=crop&w=900&q=80",
        },
        {
          title: "Mixed collection",
          text: "B2B products are blended into mixed streams and lose quality, serial context and responsibility.",
          image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
        },
        {
          title: "Missing disassembly",
          text: "PCB, housing and components are not separated before materials fall into the wrong channels.",
          image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80",
        },
        {
          title: "No material sovereignty",
          text: "Without data flow, OEMs lose return data, ESG proof and European production options.",
          image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80",
        },
      ],
    },
    roles: {
      eyebrow: "Role-based entry",
      title: "Every participant gets a next step.",
      text: "Choose a role: graph, demo surface and form update automatically.",
      cards: {
        oem: {
          title: "OEM / Producer",
          problem: "Material and ESG data disappear after the product is sold.",
          value: "Recyclable PCBs, up to 50 percent less CO2, return data and material sovereignty.",
          next: "Start closed-loop call",
          cta: "Select OEM",
        },
        customer: {
          title: "Customer / Returner",
          problem: "Old products sit unused or enter unclear collection streams.",
          value: "Enter serial number, confirm return and receive OEM network discounts.",
          next: "Return product",
          cta: "Start return",
        },
        recycler: {
          title: "Recycler / Disassembly",
          problem: "PCB and fractions are separated too late or too roughly.",
          value: "Chemical solutions, process logic and clean material fractions.",
          next: "Create partner profile",
          cta: "Select recycler",
        },
        smelter: {
          title: "Smelter / Material partner",
          problem: "Material streams are poorly documented and inconsistent.",
          value: "Qualified PCB batches, expected yield and documented origin.",
          next: "Report material interest",
          cta: "Select smelter",
        },
        partner: {
          title: "Advisor / System partner",
          problem: "Process status, open cases and reporting are fragmented.",
          value: "Shared data layer for cases, ESG reporting and partner coordination.",
          next: "Become system partner",
          cta: "Select partner",
        },
      },
    },
    solution: {
      eyebrow: "Interactive loop",
      title: "A readable graph with real next steps.",
      text: "Arrows show material and transport paths. Nodes show where Kernbeisser creates value, from serial number to ESG report.",
      hoverLabel: "Active process point",
      nextStep: "Next step",
      nodes: {
        identify: {
          title: "Identify product",
          label: "Serial / QR",
          problem: "Without product ID, material cannot be returned.",
          solution: "Serial number, PCB type and OEM relation are captured.",
          next: "Open return form",
        },
        return: {
          title: "Trigger return",
          label: "Customer",
          problem: "Products sit idle or are disposed incorrectly.",
          solution: "Returners get status and discounts in the OEM network.",
          next: "Check discount status",
        },
        disassembly: {
          title: "Clean disassembly",
          label: "Disassembly",
          problem: "PCB, housing and components get mixed.",
          solution: "Partners receive disassembly and fraction logic.",
          next: "Create disassembly order",
        },
        recycler: {
          title: "Chemical recovery",
          label: "Recycler",
          problem: "Valuable fractions are not filtered deliberately.",
          solution: "Chemical solutions improve dissolution and separation.",
          next: "View recycler demo",
        },
        smelter: {
          title: "Recover material",
          label: "Smelter",
          problem: "Inconsistent quality reduces yield.",
          solution: "Qualified PCB batches go to suitable material partners.",
          next: "Review batch",
        },
        reporting: {
          title: "Document ESG",
          label: "Reporting",
          problem: "Proof stays incomplete.",
          solution: "CO2, material value and return path are documented.",
          next: "Generate report",
        },
        oem: {
          title: "Return to OEM",
          label: "OEM",
          problem: "Material sovereignty ends after sale.",
          solution: "OEMs receive data, secondary material and production options.",
          next: "Open OEM dashboard",
        },
      },
      values: [
        { role: "OEM", value: "Recyclable PCB, 50 percent less CO2, material sovereignty." },
        { role: "Recycler", value: "Chemical solution, fraction logic, cleaner dissolution." },
        { role: "Smelter", value: "Better batches, documented origin, expected yield." },
        { role: "Customer", value: "Confirm return, receive discount, see product status." },
        { role: "Partner", value: "ESG reporting, open cases, coordinated process data." },
      ],
    },
    demos: {
      eyebrow: "Demo surfaces",
      title: "How the network feels as a product.",
      text: "Each role gets a small interface with demo data, so the prototype feels usable.",
      liveLabel: "Live demo",
      customerLive: {
        title: "Live demo: customer return",
        text: "Enter a serial number. Kernbeisser detects product and location, then shows return partners and possible OEM discounts.",
        serialLabel: "Serial number",
        serialPlaceholder: "e.g. KB-DD-0001",
        detect: "Detect location automatically",
        detected: "Location detected",
        unknown: "Serial number is not in the demo system yet",
        returnPoints: "Return partners",
        discounts: "Partner OEM discount actions",
        useDemo: "Use demo serial",
        confirm: "Confirm return",
        locationPending: "Detecting location ...",
        check: "Check",
        oemOffers: [
          { oem: "YETI Industrial", offer: "12% discount on service PCB", condition: "after confirmed return" },
          { oem: "Leaftronics OEM", offer: "85 EUR material credit", condition: "for sorted circuit boards" },
          { oem: "Kernbeisser Network", offer: "CO2 certificate + purchase benefit", condition: "for ESG-ready returns" },
        ],
      },
      surfaces: {
        oem: {
          title: "OEM dashboard",
          subtitle: "Returns, material values and ESG status",
          metrics: [
            { label: "CO2 saving", value: "-50%" },
            { label: "Returns", value: "128" },
            { label: "ESG status", value: "ready" },
          ],
          steps: ["PCB design approved", "Returns matched", "Material report created"],
        },
        customer: {
          title: "Customer return",
          subtitle: "Serial number, discount status and confirmation",
          metrics: [
            { label: "Demo ID", value: "KB-24-104" },
            { label: "Discount", value: "12%" },
            { label: "Status", value: "confirmed" },
          ],
          steps: ["QR scanned", "OEM detected", "Return accepted"],
        },
        recycler: {
          title: "Recycler view",
          subtitle: "Fractions, chemistry and disassembly status",
          metrics: [
            { label: "PCB", value: "420 kg" },
            { label: "Separation", value: "94%" },
            { label: "Batch", value: "R-18" },
          ],
          steps: ["Disassembly started", "Chemical solution selected", "Fractions ready"],
        },
        smelter: {
          title: "Smelter view",
          subtitle: "PCB batches, quality and yield",
          metrics: [
            { label: "Au", value: "high" },
            { label: "Cu", value: "HG" },
            { label: "Yield", value: "89%" },
          ],
          steps: ["Batch reviewed", "Yield calculated", "Material path documented"],
        },
        partner: {
          title: "Partner board",
          subtitle: "Cases, reporting and coordination",
          metrics: [
            { label: "Open cases", value: "7" },
            { label: "Reports", value: "12" },
            { label: "Risk", value: "low" },
          ],
          steps: ["Partner matched", "ESG data synced", "Next action planned"],
        },
      },
    },
    form: {
      eyebrow: "Conversion",
      title: "Start with your role.",
      text: "Short demo form with loading, success and reference state. The request is stored locally as a prototype.",
      roleLabel: "Role",
      company: "Company",
      contact: "Contact",
      email: "Email",
      product: "Product / serial / material",
      notes: "What should happen next?",
      submit: "Save request",
      successTitle: "Request saved",
      successText: (id, role) => `Reference ${id}: ${role} was created in the demo system. Next, a matching process suggestion follows.`,
      demoId: "Demo reference",
    },
  },
  zh: {
    nav: { problem: "问题", roles: "角色", solution: "循环", demos: "演示", forms: "开始" },
    hero: {
      eyebrow: "材料源于自然",
      title: "被开采的材料必须留在循环中。",
      text: "Kernbeisser 将回收变成可控的 B2B 流程：识别产品、清晰拆解、保留材料数据，并把价值留在欧洲。",
      cta: "选择角色",
    },
    problem: {
      eyebrow: "问题",
      title: "材料在重新进入生产之前就消失了。",
      text:
        "旧产品被出口、混合收集或没有被清晰拆解。部分材料组分没有被过滤，OEM 失去材料主权，欧洲失去原材料安全。Kernbeisser 连接产品数据、拆解和材料回流路径。",
      cta: "查看解决方案",
      stats: [
        { value: "出口", label: "控制流失" },
        { value: "CMA", label: "材料留在欧洲" },
        { value: "OEM", label: "材料主权" },
      ],
      tiles: [
        {
          title: "出口而非回流",
          text: "产品在来源和材料价值被确认前就离开区域循环。",
          image: "https://images.unsplash.com/photo-1494412685616-a5d310fbb07d?auto=format&fit=crop&w=900&q=80",
        },
        {
          title: "混合收集",
          text: "B2B 产品进入混合材料流，失去质量、序列号和责任关系。",
          image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
        },
        {
          title: "缺少拆解",
          text: "PCB、外壳和组件没有被分离，材料进入错误渠道。",
          image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80",
        },
        {
          title: "没有材料主权",
          text: "没有数据流，OEM 失去回流数据、ESG 证明和欧洲生产选择。",
          image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80",
        },
      ],
    },
    roles: {
      eyebrow: "按角色进入",
      title: "每个参与者都有清晰的下一步。",
      text: "选择角色后，流程图、演示界面和表单会自动更新。",
      cards: {
        oem: {
          title: "OEM / 生产商",
          problem: "产品销售后，材料和 ESG 数据消失。",
          value: "可回收 PCB、最高 50% CO2 减排、回流数据和材料主权。",
          next: "开始闭环沟通",
          cta: "选择 OEM",
        },
        customer: {
          title: "客户 / 退回方",
          problem: "旧产品闲置或进入不清晰的收集流。",
          value: "输入序列号，确认退回，并获得 OEM 网络折扣。",
          next: "退回产品",
          cta: "开始退回",
        },
        recycler: {
          title: "回收商 / 拆解方",
          problem: "PCB 和材料组分分离太晚或太粗。",
          value: "化学解决方案、流程逻辑和更清晰的材料组分。",
          next: "创建伙伴档案",
          cta: "选择回收商",
        },
        smelter: {
          title: "冶炼方 / 材料伙伴",
          problem: "材料流记录不足，质量波动。",
          value: "经过确认的 PCB 批次、预期产出和来源记录。",
          next: "提交材料兴趣",
          cta: "选择冶炼方",
        },
        partner: {
          title: "顾问 / 系统伙伴",
          problem: "流程状态、未结案件和报告分散。",
          value: "用于案件、ESG 报告和伙伴协调的共享数据层。",
          next: "成为系统伙伴",
          cta: "选择伙伴",
        },
      },
    },
    solution: {
      eyebrow: "交互式循环",
      title: "可读的流程图和真实下一步。",
      text: "箭头显示材料和运输路径。节点显示 Kernbeisser 从序列号到 ESG 报告创造价值的位置。",
      hoverLabel: "当前流程点",
      nextStep: "下一步",
      nodes: {
        identify: {
          title: "识别产品",
          label: "序列号 / QR",
          problem: "没有产品 ID，材料无法回流。",
          solution: "记录序列号、PCB 类型和 OEM 关系。",
          next: "打开退回表单",
        },
        return: {
          title: "启动退回",
          label: "客户",
          problem: "产品闲置或被错误处理。",
          solution: "退回方获得状态和 OEM 网络折扣。",
          next: "检查折扣状态",
        },
        disassembly: {
          title: "清晰拆解",
          label: "拆解",
          problem: "PCB、外壳和组件混合。",
          solution: "伙伴获得拆解和材料组分逻辑。",
          next: "创建拆解任务",
        },
        recycler: {
          title: "化学回收",
          label: "回收商",
          problem: "有价值组分没有被有目标地过滤。",
          solution: "化学方案改善溶解和分离。",
          next: "查看回收商演示",
        },
        smelter: {
          title: "材料利用",
          label: "冶炼方",
          problem: "质量波动降低产出。",
          solution: "合格 PCB 批次进入合适材料伙伴。",
          next: "检查批次",
        },
        reporting: {
          title: "ESG 记录",
          label: "报告",
          problem: "证明不完整。",
          solution: "记录 CO2、材料价值和回流路径。",
          next: "生成报告",
        },
        oem: {
          title: "回流到 OEM",
          label: "OEM",
          problem: "材料主权在销售后结束。",
          solution: "OEM 获得数据、二次材料和生产选择。",
          next: "打开 OEM 仪表板",
        },
      },
      values: [
        { role: "OEM", value: "可回收 PCB、50% CO2 减排、材料主权。" },
        { role: "回收商", value: "化学方案、组分逻辑、更干净的溶解。" },
        { role: "冶炼方", value: "更好批次、来源记录、预期产出。" },
        { role: "客户", value: "确认退回、获得折扣、查看产品状态。" },
        { role: "伙伴", value: "ESG 报告、未结案件、协调流程数据。" },
      ],
    },
    demos: {
      eyebrow: "演示界面",
      title: "网络作为产品的体验。",
      text: "每个角色都有包含演示数据的小界面，让原型更像可用产品。",
      liveLabel: "实时演示",
      customerLive: {
        title: "实时演示：客户退回",
        text: "输入序列号。Kernbeisser 会识别产品和位置，并显示退回伙伴与可能的 OEM 折扣。",
        serialLabel: "序列号",
        serialPlaceholder: "例如 KB-DD-0001",
        detect: "自动识别位置",
        detected: "位置已识别",
        unknown: "该序列号暂未在演示系统中",
        returnPoints: "退回伙伴",
        discounts: "合作 OEM 折扣",
        useDemo: "使用演示序列号",
        confirm: "确认退回",
        locationPending: "正在识别位置 ...",
        check: "检查",
        oemOffers: [
          { oem: "YETI Industrial", offer: "服务 PCB 12% 折扣", condition: "确认退回后" },
          { oem: "Leaftronics OEM", offer: "85 欧元材料积分", condition: "适用于分类电路板" },
          { oem: "Kernbeisser Network", offer: "CO2 证书 + 采购优惠", condition: "适用于 ESG 可追踪退回" },
        ],
      },
      surfaces: {
        oem: {
          title: "OEM 仪表板",
          subtitle: "退回、材料价值和 ESG 状态",
          metrics: [
            { label: "CO2 节省", value: "-50%" },
            { label: "退回", value: "128" },
            { label: "ESG 状态", value: "就绪" },
          ],
          steps: ["PCB 设计已批准", "退回已匹配", "材料报告已创建"],
        },
        customer: {
          title: "客户退回",
          subtitle: "序列号、折扣状态和确认",
          metrics: [
            { label: "演示 ID", value: "KB-24-104" },
            { label: "折扣", value: "12%" },
            { label: "状态", value: "已确认" },
          ],
          steps: ["QR 已扫描", "OEM 已识别", "退回已接受"],
        },
        recycler: {
          title: "回收商视图",
          subtitle: "组分、化学和拆解状态",
          metrics: [
            { label: "PCB", value: "420 kg" },
            { label: "分离", value: "94%" },
            { label: "批次", value: "R-18" },
          ],
          steps: ["拆解已开始", "化学方案已选择", "组分已准备"],
        },
        smelter: {
          title: "冶炼方视图",
          subtitle: "PCB 批次、质量和产出",
          metrics: [
            { label: "Au", value: "高" },
            { label: "Cu", value: "HG" },
            { label: "产出", value: "89%" },
          ],
          steps: ["批次已检查", "产出已计算", "材料路径已记录"],
        },
        partner: {
          title: "伙伴看板",
          subtitle: "案件、报告和协调",
          metrics: [
            { label: "未结案件", value: "7" },
            { label: "报告", value: "12" },
            { label: "风险", value: "低" },
          ],
          steps: ["伙伴已匹配", "ESG 数据已同步", "下一步已计划"],
        },
      },
    },
    form: {
      eyebrow: "转化",
      title: "从你的角色开始。",
      text: "简短演示表单，包含加载、成功和参考号状态。请求会作为原型保存在本地。",
      roleLabel: "角色",
      company: "公司",
      contact: "联系人",
      email: "邮箱",
      product: "产品 / 序列号 / 材料",
      notes: "下一步应该是什么？",
      submit: "保存请求",
      successTitle: "请求已保存",
      successText: (id, role) => `参考号 ${id}: ${role} 已在演示系统中创建。下一步会生成匹配流程建议。`,
      demoId: "演示参考号",
    },
  },
};

const roleOrder: RoleId[] = ["oem", "customer", "recycler", "smelter", "partner"];
const graphOrder: GraphPoint[] = ["identify", "return", "disassembly", "recycler", "smelter", "reporting", "oem"];

const roleIcons: Record<RoleId, typeof Factory> = {
  oem: Factory,
  customer: UserRound,
  recycler: Recycle,
  smelter: Flame,
  partner: Handshake,
};

const graphIcons: Record<GraphPoint, typeof Factory> = {
  identify: SearchCheck,
  return: QrCode,
  disassembly: Wrench,
  recycler: FlaskConical,
  smelter: Flame,
  reporting: FileText,
  oem: Factory,
};

const roleToPoint: Record<RoleId, GraphPoint> = {
  oem: "oem",
  customer: "return",
  recycler: "recycler",
  smelter: "smelter",
  partner: "reporting",
};

const Landing = () => {
  const [activeRole, setActiveRole] = useState<RoleId>("oem");
  const [activePoint, setActivePoint] = useState<GraphPoint>("oem");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<{ id: string; role: RoleId } | null>(null);
  const { language, setLanguage } = useLanguage();
  const content = copy[language];

  const activeNode = content.solution.nodes[activePoint];
  const activeSurface = content.demos.surfaces[activeRole];
  const reference = useMemo(() => `KB-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 900))}`, []);

  const chooseRole = (role: RoleId) => {
    setActiveRole(role);
    setActivePoint(roleToPoint[role]);
  };

  const jumpTo = (id: "demos" | "forms") => {
    window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const form = new FormData(event.currentTarget);
    const id = `KB-${Date.now().toString().slice(-6)}`;
    const payload = {
      id,
      role: activeRole,
      company: form.get("company"),
      contact: form.get("contact"),
      email: form.get("email"),
      product: form.get("product"),
      notes: form.get("notes"),
      createdAt: new Date().toISOString(),
    };

    window.localStorage.setItem(`kernbeisser-request-${id}`, JSON.stringify(payload));
    window.setTimeout(() => {
      setConfirmation({ id, role: activeRole });
      setIsSubmitting(false);
      toast.success(content.form.successTitle, {
        description: content.form.successText(id, content.roles.cards[activeRole].title),
      });
    }, 450);
  };

  return (
    <div className="min-h-screen bg-black text-background">
      <div className="fixed right-4 top-4 z-50 flex rounded-md border border-background/20 bg-black/35 p-1 shadow-card backdrop-blur-md">
        {languages.map((item) => (
          <button
            key={item.code}
            type="button"
            onClick={() => setLanguage(item.code)}
            className={`h-8 rounded px-2 text-xs font-medium transition-colors ${
              language === item.code ? "bg-background text-foreground" : "text-background/75 hover:text-background"
            }`}
            title={item.label}
          >
            {item.short}
          </button>
        ))}
      </div>

      <section className="relative isolate min-h-screen overflow-hidden">
        <img src="/rainforest.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/80" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-black" />

        <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-6 pr-32 sm:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-background shadow-elegant">
              <img src="/logo.png" alt="Kernbeisser Logo" className="h-full w-full object-cover" />
            </span>
            <span className="font-display text-base font-semibold uppercase tracking-[0.22em]">Kernbeisser</span>
          </Link>
          <nav className="hidden items-center gap-5 text-sm font-semibold text-background/75 md:flex">
            <a href="#problem" className="transition-colors hover:text-background">
              {content.nav.problem}
            </a>
            <a href="#roles" className="transition-colors hover:text-background">
              {content.nav.roles}
            </a>
            <a href="#solution" className="transition-colors hover:text-background">
              {content.nav.solution}
            </a>
            <a href="#demos" className="transition-colors hover:text-background">
              {content.nav.demos}
            </a>
          </nav>
        </header>

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-92px)] w-full max-w-7xl items-end px-5 pb-16 sm:px-8 lg:pb-24">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-background/75">{content.hero.eyebrow}</p>
            <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.02] text-background [text-shadow:0_2px_28px_hsl(0_0%_0%/.45)] md:text-7xl">
              {content.hero.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-background/85 [text-shadow:0_1px_18px_hsl(0_0%_0%/.35)]">
              {content.hero.text}
            </p>
            <a
              href="#roles"
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-md bg-background px-5 font-semibold text-foreground shadow-elegant transition-transform hover:-translate-y-0.5"
            >
              {content.hero.cta}
              <ArrowDown className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <section id="problem" className="relative isolate overflow-hidden bg-black py-24 text-background md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,hsl(150_80%_35%/.18),transparent_32%),radial-gradient(circle_at_80%_80%,hsl(40_90%_45%/.14),transparent_30%)]" />
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[0.46fr_0.54fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary">{content.problem.eyebrow}</p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-6xl">{content.problem.title}</h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-background/72">{content.problem.text}</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {content.problem.stats.map((stat) => (
                <div key={stat.label} className="border-l border-background/20 pl-4">
                  <p className="font-display text-3xl font-semibold text-background">{stat.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-background/50">{stat.label}</p>
                </div>
              ))}
            </div>
            <a
              href="#solution"
              className="mt-10 inline-flex h-12 items-center gap-2 rounded-md bg-background px-5 font-semibold text-foreground shadow-elegant transition-transform hover:-translate-y-0.5"
            >
              {content.problem.cta}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {content.problem.tiles.map((tile, index) => (
              <div
                key={tile.title}
                className={`relative min-h-64 overflow-hidden rounded-lg border border-background/10 bg-background/5 ${
                  index % 2 === 1 ? "sm:mt-12" : ""
                }`}
              >
                <img src={tile.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-65 grayscale" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <p className="font-display text-xl font-semibold">{tile.title}</p>
                  <p className="mt-2 text-sm font-medium leading-6 text-background/78">{tile.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="roles" className="bg-[hsl(42_31%_91%)] py-16 text-foreground md:py-24">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{content.roles.eyebrow}</p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-6xl">{content.roles.title}</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">{content.roles.text}</p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-5">
            {roleOrder.map((role) => {
              const Icon = roleIcons[role];
              const card = content.roles.cards[role];
              const active = activeRole === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => chooseRole(role)}
                  className={`flex min-h-72 flex-col rounded-lg border bg-background p-4 text-left shadow-card transition-all hover:-translate-y-1 ${
                    active ? "border-primary ring-2 ring-primary/20" : "border-border"
                  }`}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="mt-4 font-display text-xl font-semibold">{card.title}</span>
                  <span className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-destructive/80">Problem</span>
                  <span className="mt-1 text-sm leading-6 text-muted-foreground">{card.problem}</span>
                  <span className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Value</span>
                  <span className="mt-1 text-sm leading-6 text-muted-foreground">{card.value}</span>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-primary">
                    {card.cta}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section id="solution" className="bg-[hsl(42_31%_91%)] pb-16 text-foreground md:pb-24">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
          <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{content.solution.eyebrow}</p>
              <h2 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-6xl">{content.solution.title}</h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">{content.solution.text}</p>
            </div>
            <InfoPanel content={content} activeNode={activeNode} />
          </div>

          <ProcessGraph
            content={content}
            activePoint={activePoint}
            setActivePoint={setActivePoint}
            chooseRole={chooseRole}
            jumpTo={jumpTo}
          />

          <div className="mt-6 grid gap-3 md:grid-cols-5">
            {content.solution.values.map((item) => (
              <div key={item.role} className="rounded-lg border border-border bg-background/80 p-4 shadow-card">
                <p className="font-display text-lg font-semibold">{item.role}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="demos" className="bg-black py-20 text-background md:py-28">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[0.35fr_0.65fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{content.demos.eyebrow}</p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-5xl">{content.demos.title}</h2>
            <p className="mt-5 text-base leading-7 text-background/70">{content.demos.text}</p>
            <div className="mt-6 grid gap-2">
              {roleOrder.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => chooseRole(role)}
                  className={`rounded-md border px-4 py-3 text-left text-sm font-semibold transition-colors ${
                    activeRole === role
                      ? "border-primary bg-primary/15 text-background"
                      : "border-background/15 text-background/65 hover:text-background"
                  }`}
                >
                  {content.roles.cards[role].title}
                </button>
              ))}
            </div>
          </div>
          {activeRole === "customer" ? (
            <CustomerReturnDemo content={content} language={language} reference={reference} />
          ) : (
            <DemoSurface content={content} surface={activeSurface} reference={reference} />
          )}
        </div>
      </section>

      <section id="forms" className="bg-[hsl(42_31%_91%)] py-16 text-foreground md:py-24">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[0.42fr_0.58fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{content.form.eyebrow}</p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-5xl">{content.form.title}</h2>
            <p className="mt-5 text-base leading-7 text-muted-foreground">{content.form.text}</p>
            {confirmation ? (
              <div className="mt-6 rounded-lg border border-primary/25 bg-background p-4 shadow-card">
                <p className="inline-flex items-center gap-2 font-semibold text-primary">
                  <CheckCircle2 className="h-5 w-5" />
                  {content.form.successTitle}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {content.form.successText(confirmation.id, content.roles.cards[confirmation.role].title)}
                </p>
              </div>
            ) : null}
          </div>

          <form onSubmit={submit} className="rounded-lg border border-border bg-background p-5 shadow-card md:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium">
                {content.form.roleLabel}
                <select
                  value={activeRole}
                  onChange={(event) => chooseRole(event.target.value as RoleId)}
                  className="h-11 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {roleOrder.map((role) => (
                    <option key={role} value={role}>
                      {content.roles.cards[role].title}
                    </option>
                  ))}
                </select>
              </label>
              <TextInput name="company" label={content.form.company} required />
              <TextInput name="contact" label={content.form.contact} required />
              <TextInput name="email" label={content.form.email} type="email" required />
              <label className="grid gap-2 text-sm font-medium sm:col-span-2">
                {content.form.product}
                <input
                  name="product"
                  defaultValue={activeRole === "customer" ? "KB-DD-0001" : ""}
                  className="h-11 rounded-md border border-input bg-background px-3 text-sm"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium sm:col-span-2">
                {content.form.notes}
                <textarea name="notes" rows={4} className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </label>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-md bg-foreground px-5 font-semibold text-background shadow-elegant transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {isSubmitting ? "..." : content.form.submit}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

const ProcessGraph = ({
  content,
  activePoint,
  setActivePoint,
  chooseRole,
  jumpTo,
}: {
  content: LandingCopy;
  activePoint: GraphPoint;
  setActivePoint: (point: GraphPoint) => void;
  chooseRole: (role: RoleId) => void;
  jumpTo: (id: "demos" | "forms") => void;
}) => {
  const positions: Record<GraphPoint, string> = {
    identify: "left-[5%] top-[42%]",
    return: "left-[18%] top-[16%]",
    disassembly: "left-[34%] top-[42%]",
    recycler: "left-[50%] top-[16%]",
    smelter: "left-[66%] top-[42%]",
    reporting: "left-[78%] top-[16%]",
    oem: "left-[84%] top-[63%]",
  };

  return (
    <div className="rounded-lg border border-foreground/10 bg-[hsl(39_45%_95%)] p-3 shadow-elegant">
      <div className="hidden overflow-x-auto lg:block">
        <div className="relative h-[660px] min-w-[1120px] overflow-hidden rounded-md bg-[linear-gradient(120deg,hsl(44_55%_88%/.72),transparent_42%,hsl(155_35%_87%/.8))]">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1120 660" aria-hidden="true">
            <defs>
              <marker id="graph-arrow" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="8" markerHeight="8" orient="auto">
                <path d="M2 2 L10 6 L2 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </marker>
              <path id="flow-a" d="M145 345 C230 180 330 180 415 345 S600 510 735 345 S910 185 970 255" />
              <path id="flow-b" d="M150 410 C300 545 510 560 705 420 S900 410 975 485" />
            </defs>
            <g className="text-primary/70" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" markerEnd="url(#graph-arrow)">
              <path d="M145 345 C230 180 330 180 415 345" />
              <path d="M415 345 C500 510 620 510 735 345" />
              <path d="M735 345 C825 185 915 185 970 255" />
              <path d="M150 410 C300 545 510 560 705 420" strokeDasharray="14 16" />
              <path d="M705 420 C820 340 910 405 975 485" />
            </g>
            <g>
              {[0, 1, 2].map((index) => (
                <circle key={index} r="6" className="fill-primary">
                  <animateMotion dur="7s" repeatCount="indefinite" begin={`${index * 1.4}s`}>
                    <mpath href="#flow-a" />
                  </animateMotion>
                </circle>
              ))}
              {[0, 1].map((index) => (
                <circle key={index} r="5" className="fill-foreground/60">
                  <animateMotion dur="8s" repeatCount="indefinite" begin={`${index * 2}s`}>
                    <mpath href="#flow-b" />
                  </animateMotion>
                </circle>
              ))}
            </g>
          </svg>

          {graphOrder.map((point) => {
            const Icon = graphIcons[point];
            const node = content.solution.nodes[point];
            const role = point === "oem" ? "oem" : point === "return" ? "customer" : point === "recycler" ? "recycler" : point === "smelter" ? "smelter" : point === "reporting" ? "partner" : null;
            return (
              <button
                key={point}
                type="button"
                onMouseEnter={() => setActivePoint(point)}
                onFocus={() => setActivePoint(point)}
                onClick={() => {
                  setActivePoint(point);
                  if (role) {
                    chooseRole(role);
                    jumpTo("demos");
                    return;
                  }
                  jumpTo(point === "identify" ? "forms" : "demos");
                }}
                className={`absolute w-40 rounded-lg border bg-background/95 p-4 text-left shadow-card transition-all hover:-translate-y-1 ${
                  activePoint === point ? "border-primary ring-2 ring-primary/20" : "border-border"
                } ${positions[point]}`}
              >
                <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="block font-display text-lg font-semibold leading-tight">{node.title}</span>
                <span className="mt-2 block text-xs text-muted-foreground">{node.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 lg:hidden">
        {graphOrder.map((point, index) => {
          const Icon = graphIcons[point];
          const node = content.solution.nodes[point];
          return (
            <button
              key={point}
              type="button"
              onClick={() => {
                setActivePoint(point);
                jumpTo(point === "identify" || point === "return" ? "forms" : "demos");
              }}
              className={`flex items-start gap-3 rounded-lg border bg-background p-4 text-left shadow-card ${
                activePoint === point ? "border-primary ring-2 ring-primary/20" : "border-border"
              }`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="block font-display text-lg font-semibold">{node.title}</span>
                <span className="mt-1 block text-sm leading-6 text-muted-foreground">{node.solution}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const InfoPanel = ({ content, activeNode }: { content: LandingCopy; activeNode: LandingCopy["solution"]["nodes"][GraphPoint] }) => (
  <div className="rounded-lg border border-primary/25 bg-background/80 p-4 shadow-card md:w-96">
    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">{content.solution.hoverLabel}</p>
    <h3 className="mt-3 font-display text-2xl font-semibold">{activeNode.title}</h3>
    <p className="mt-2 text-sm font-semibold text-destructive/80">{activeNode.problem}</p>
    <p className="mt-2 text-sm leading-6 text-muted-foreground">{activeNode.solution}</p>
    <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
      {content.solution.nextStep}: {activeNode.next}
      <ArrowRight className="h-4 w-4" />
    </p>
  </div>
);

const DemoSurface = ({ content, surface, reference }: { content: LandingCopy; surface: LandingCopy["demos"]["surfaces"][RoleId]; reference: string }) => (
  <div className="rounded-lg border border-background/15 bg-background/8 p-5 shadow-elegant backdrop-blur">
    <div className="flex flex-col justify-between gap-4 border-b border-background/15 pb-5 md:flex-row md:items-center">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">{content.form.demoId} {reference}</p>
        <h3 className="mt-2 font-display text-3xl font-semibold">{surface.title}</h3>
        <p className="mt-1 text-sm text-background/65">{surface.subtitle}</p>
      </div>
      <span className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">
        <BarChart3 className="h-4 w-4" />
        {content.demos.liveLabel}
      </span>
    </div>
    <div className="mt-5 grid gap-3 md:grid-cols-3">
      {surface.metrics.map((metric) => (
        <div key={metric.label} className="rounded-md border border-background/10 bg-black/25 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-background/45">{metric.label}</p>
          <p className="mt-2 font-display text-3xl font-semibold">{metric.value}</p>
        </div>
      ))}
    </div>
    <div className="mt-5 grid gap-3">
      {surface.steps.map((step, index) => (
        <div key={step} className="flex items-center gap-3 rounded-md border border-background/10 bg-black/20 px-4 py-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
            {index + 1}
          </span>
          <span className="text-sm font-medium text-background/80">{step}</span>
        </div>
      ))}
    </div>
  </div>
);

const CustomerReturnDemo = ({ content, language, reference }: { content: LandingCopy; language: Language; reference: string }) => {
  const [serial, setSerial] = useState(DEMO_SERIAL);
  const [lookup, setLookup] = useState<SerialLookup | null>(SERIAL_DB[DEMO_SERIAL]);
  const [notFound, setNotFound] = useState(false);
  const [location, setLocation] = useState(SERIAL_DB[DEMO_SERIAL].city);
  const [detecting, setDetecting] = useState(false);
  const copy = content.demos.customerLive;

  const checkSerial = (value = serial) => {
    const key = value.trim().toUpperCase();
    const result = SERIAL_DB[key];
    setLookup(result ?? null);
    setNotFound(!result && key.length > 0);
    if (result) {
      setLocation(result.city);
    }
  };

  const detectLocation = () => {
    setDetecting(true);
    window.setTimeout(() => {
      const next = lookup?.city ?? "Dresden";
      setLocation(next);
      setDetecting(false);
      toast.success(copy.detected, { description: next });
    }, 650);
  };

  const device = lookup ? localizeDevice(lookup.device, language) : null;

  return (
    <div className="rounded-lg border border-background/15 bg-background/8 p-5 shadow-elegant backdrop-blur">
      <div className="flex flex-col justify-between gap-4 border-b border-background/15 pb-5 md:flex-row md:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">{content.form.demoId} {reference}</p>
          <h3 className="mt-2 font-display text-3xl font-semibold">{copy.title}</h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-background/65">{copy.text}</p>
        </div>
        <span className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">
          <QrCode className="h-4 w-4" />
          {content.demos.liveLabel}
        </span>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[0.45fr_0.55fr]">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            checkSerial();
          }}
          className="rounded-lg border border-background/10 bg-black/25 p-4"
        >
          <label className="grid gap-2 text-sm font-semibold">
            {copy.serialLabel}
            <input
              value={serial}
              onChange={(event) => setSerial(event.target.value)}
              placeholder={copy.serialPlaceholder}
              className="h-11 rounded-md border border-background/15 bg-black/30 px-3 font-mono text-sm text-background outline-none focus:border-primary"
            />
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="submit" className="inline-flex h-10 items-center gap-2 rounded-md bg-background px-4 text-sm font-semibold text-foreground">
              <SearchCheck className="h-4 w-4" />
              {copy.check}
            </button>
            <button
              type="button"
              onClick={() => {
                setSerial(DEMO_SERIAL);
                checkSerial(DEMO_SERIAL);
              }}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-background/15 px-4 text-sm font-semibold text-background/75 hover:text-background"
            >
              {copy.useDemo}
            </button>
          </div>

          <button
            type="button"
            onClick={detectLocation}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-primary/35 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary"
          >
            <Globe2 className="h-4 w-4" />
            {detecting ? copy.locationPending : copy.detect}
          </button>

          <div className="mt-4 rounded-md border border-background/10 bg-black/20 p-3">
            <p className="text-xs uppercase tracking-[0.22em] text-background/45">{copy.detected}</p>
            <p className="mt-1 font-display text-2xl font-semibold">{location}</p>
          </div>
        </form>

        <div className="grid gap-4">
          <div className="rounded-lg border border-background/10 bg-black/25 p-4">
            {lookup ? (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-primary">{lookup.serial}</p>
                    <h4 className="mt-2 font-display text-2xl font-semibold">{device}</h4>
                  </div>
                  <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">{lookup.postalCode}</span>
                </div>
                <p className="mt-4 text-sm font-semibold text-background/80">{copy.returnPoints}</p>
                <div className="mt-3 grid gap-2">
                  {lookup.partners.slice(0, 3).map((partner) => (
                    <div key={partner.id} className="flex items-center justify-between gap-3 rounded-md border border-background/10 bg-black/20 px-3 py-2">
                      <span>
                        <span className="block text-sm font-semibold">{partner.name}</span>
                        <span className="block text-xs text-background/50">{partner.street}</span>
                      </span>
                      <span className="text-sm font-semibold text-primary">{partner.distanceKm.toFixed(1)} km</span>
                    </div>
                  ))}
                </div>
              </>
            ) : notFound ? (
              <div className="rounded-md border border-background/10 bg-black/20 p-4 text-sm text-background/70">{copy.unknown}</div>
            ) : (
              <div className="rounded-md border border-background/10 bg-black/20 p-4 text-sm text-background/70">{copy.text}</div>
            )}
          </div>

          <div className="rounded-lg border border-background/10 bg-black/25 p-4">
            <p className="text-sm font-semibold text-background/85">{copy.discounts}</p>
            <div className="mt-3 grid gap-2">
              {copy.oemOffers.map((offer) => (
                <div key={offer.oem} className="rounded-md border border-background/10 bg-black/20 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-display text-lg font-semibold">{offer.oem}</p>
                    <span className="rounded-full bg-primary/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                      OEM
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-background/85">{offer.offer}</p>
                  <p className="mt-1 text-xs text-background/50">{offer.condition}</p>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => toast.success(copy.confirm, { description: lookup?.serial ?? serial })}
              className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              <CheckCircle2 className="h-4 w-4" />
              {copy.confirm}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function localizeDevice(device: string, language: Language) {
  if (language === "en") {
    return device
      .replace("Steuerungsmodul Â· Leiterplatte Rev. C", "Control module · circuit board Rev. C")
      .replace("Leiterplatte Â· Sensorboard", "Circuit board · sensor board")
      .replace("Hauptplatine Â· Industriesteuerung", "Mainboard · industrial controller");
  }
  if (language === "zh") {
    return device
      .replace("Steuerungsmodul Â· Leiterplatte Rev. C", "控制模块 · 电路板 Rev. C")
      .replace("Leiterplatte Â· Sensorboard", "电路板 · 传感器板")
      .replace("Hauptplatine Â· Industriesteuerung", "主板 · 工业控制器");
  }
  return device.replace(/Â·/g, "·");
}

const TextInput = ({
  label,
  name,
  required,
  type = "text",
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
}) => (
  <label className="grid gap-2 text-sm font-medium">
    {label}
    <input name={name} type={type} required={required} className="h-11 rounded-md border border-input bg-background px-3 text-sm" />
  </label>
);

export default Landing;
