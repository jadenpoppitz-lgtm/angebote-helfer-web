import { useMemo, useState } from "react";
import type { CSSProperties, FormEvent, ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Factory,
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
import { DeviceImpact } from "@/components/DeviceImpact";
import { languages, type Language, useLanguage } from "@/lib/i18n";
import { DEMO_SERIAL, SERIAL_DB, type SerialLookup } from "@/data/partners";

export type RoleId = "oem" | "customer" | "recycler" | "smelter" | "partner";
type GraphPoint = "oem" | "customer" | "consulting" | "disassembly" | "smelter" | "materials";

export type LandingCopy = {
  nav: { problem: string; impact: string; roles: string; solution: string; demos: string; forms: string };
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
    flow: {
      product: string;
      sellPcb: string;
      productPcb: string;
      pcb: string;
      setSolution: string;
      material: string;
      materialReturn: string;
    };
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

export const copy: Record<Language, LandingCopy> = {
  de: {
    nav: { problem: "Problem", impact: "Device Impact", roles: "Rollen", solution: "Kreislauf", demos: "Demos", forms: "Starten" },
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
      eyebrow: "Interaktiver Wertstrom",
      title: "Produkt, PCB und Material laufen getrennt durch den Loop.",
      text:
        "Die Animation folgt dem Prozess aus der Skizze: OEM liefert Produkt, der Kunde gibt zurück, Kernbeisser routet PCB und Produkt, der Smelter gewinnt Material und Exportpfade werden sichtbar.",
      hoverLabel: "Aktiver Prozesspunkt",
      nextStep: "Nächster Schritt",
      nodes: {
        oem: {
          title: "OEM",
          label: "Produktion",
          problem: "Materialhoheit endet oft nach dem Verkauf.",
          solution: "Der OEM bleibt Start- und Zielpunkt: Produkt geht zum Kunden, PCB-Wert und Daten kommen zurück.",
          next: "OEM-Dashboard öffnen",
        },
        customer: {
          title: "Customer",
          label: "Customer",
          problem: "Produkte bleiben beim Kunden oder gehen in Mischströme.",
          solution: "Der Kunde gibt das Produkt in den Loop zurück, statt es anonym zu entsorgen.",
          next: "Rückgabe starten",
        },
        consulting: {
          title: "Consulting",
          label: "Kernbeisser",
          problem: "Ohne Bewertung wird PCB anonym verkauft oder falsch geroutet.",
          solution: "Kernbeisser bewertet Produkt und PCB, verkauft oder ordnet PCB zu und setzt die passende Lösung.",
          next: "Routing prüfen",
        },
        disassembly: {
          title: "Disassembly",
          label: "Produkt - PCB",
          problem: "PCB, Gehäuse und Komponenten vermischen sich.",
          solution: "Demontage trennt Produkt und PCB, bevor Material in den falschen Kanal fällt.",
          next: "Demontageauftrag anlegen",
        },
        smelter: {
          title: "Smelter",
          label: "PCB + Lösung",
          problem: "Unklare PCB-Chargen reduzieren Ausbeute.",
          solution: "Qualifizierte PCB-Ströme gehen mit Lösung und erwarteter Ausbeute zum Smelter.",
          next: "Charge prüfen",
        },
        materials: {
          title: "Materials",
          label: "Material",
          problem: "Materialwerte werden ohne klare Rückführung nicht produktiv genutzt.",
          solution: "Dokumentierte Materialien bleiben sichtbar und können gezielt in den Kreislauf zurückgeführt werden.",
          next: "Material prüfen",
        },
      },
      values: [
        { role: "OEM", value: "Recyclebare PCB, 50 Prozent weniger CO2, Materialhoheit." },
        { role: "Recycler", value: "Chemische Lösung, Fraktionslogik, sauberere Auflösung." },
        { role: "Smelter", value: "Bessere Chargen, dokumentierte Herkunft, erwartete Ausbeute." },
        { role: "Customer", value: "Rückgabe bestätigen, Rabatt erhalten, Produktstatus sehen." },
        { role: "Partner", value: "ESG-Reporting, offene Fälle, koordinierte Prozessdaten." },
      ],
      flow: {
        product: "Produkt",
        sellPcb: "PCB verkaufen",
        productPcb: "Produkt - PCB",
        pcb: "PCB",
        setSolution: "Lösung setzen",
        material: "Material",
        materialReturn: "Material zurück",
      },
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
    nav: { problem: "Problem", impact: "Device impact", roles: "Roles", solution: "Loop", demos: "Demos", forms: "Start" },
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
      eyebrow: "Interactive value flow",
      title: "Product, PCB and material move through separate loop paths.",
      text: "The animation follows the sketched process: OEM ships product, the customer returns it, Kernbeisser routes product and PCB, the smelter recovers material and export leakage becomes visible.",
      hoverLabel: "Active process point",
      nextStep: "Next step",
      nodes: {
        oem: {
          title: "OEM",
          label: "Production",
          problem: "Material sovereignty often ends after the product sale.",
          solution: "The OEM stays the start and target point: products go to customers, PCB value and data come back.",
          next: "Open OEM dashboard",
        },
        customer: {
          title: "Customer",
          label: "Customer",
          problem: "Products sit with customers or enter mixed streams.",
          solution: "The customer sends the product back into the loop instead of disposing of it anonymously.",
          next: "Start return",
        },
        consulting: {
          title: "Consulting",
          label: "Kernbeisser",
          problem: "Without evaluation, PCB is sold anonymously or routed incorrectly.",
          solution: "Kernbeisser evaluates product and PCB, sells or assigns PCB and sets the suitable solution.",
          next: "Review routing",
        },
        disassembly: {
          title: "Disassembly",
          label: "Product - PCB",
          problem: "PCB, housing and components get mixed.",
          solution: "Disassembly separates product and PCB before material falls into the wrong channel.",
          next: "Create disassembly order",
        },
        smelter: {
          title: "Smelter",
          label: "PCB + solution",
          problem: "Unclear PCB batches reduce yield.",
          solution: "Qualified PCB streams go to the smelter with the right solution and expected yield.",
          next: "Review batch",
        },
        materials: {
          title: "Materials",
          label: "Material",
          problem: "Material value is not productively used without a clear return path.",
          solution: "Documented materials stay visible and can be routed deliberately back into the loop.",
          next: "Review material",
        },
      },
      values: [
        { role: "OEM", value: "Recyclable PCB, 50 percent less CO2, material sovereignty." },
        { role: "Recycler", value: "Chemical solution, fraction logic, cleaner dissolution." },
        { role: "Smelter", value: "Better batches, documented origin, expected yield." },
        { role: "Customer", value: "Confirm return, receive discount, see product status." },
        { role: "Partner", value: "ESG reporting, open cases, coordinated process data." },
      ],
      flow: {
        product: "Product",
        sellPcb: "Sell PCB",
        productPcb: "Product - PCB",
        pcb: "PCB",
        setSolution: "Set solution",
        material: "Material",
        materialReturn: "Material return",
      },
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
    nav: { problem: "问题", impact: "设备影响", roles: "角色", solution: "循环", demos: "演示", forms: "开始" },
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
      eyebrow: "交互式价值流",
      title: "产品、PCB 和材料沿着不同路径进入循环。",
      text: "动画按照草图展示流程：OEM 交付产品，客户退回，Kernbeisser 路由产品和 PCB，冶炼方回收材料，同时显示出口流失路径。",
      hoverLabel: "当前流程点",
      nextStep: "下一步",
      nodes: {
        oem: {
          title: "OEM",
          label: "生产",
          problem: "材料主权常常在产品销售后结束。",
          solution: "OEM 保持起点和目标点：产品交给客户，PCB 价值和数据回到体系。",
          next: "打开 OEM 仪表板",
        },
        customer: {
          title: "客户",
          label: "客户",
          problem: "产品停留在客户处，或进入混合回收流。",
          solution: "客户把产品送回循环，而不是匿名处理。",
          next: "启动退回",
        },
        consulting: {
          title: "咨询 / 路由",
          label: "Kernbeisser",
          problem: "没有评估时，PCB 会被匿名出售或错误路由。",
          solution: "Kernbeisser 评估产品和 PCB，分配或出售 PCB，并设置合适方案。",
          next: "检查路由",
        },
        disassembly: {
          title: "拆解",
          label: "产品 - PCB",
          problem: "PCB、外壳和组件混合。",
          solution: "拆解先分离产品和 PCB，避免材料进入错误渠道。",
          next: "创建拆解任务",
        },
        smelter: {
          title: "冶炼方",
          label: "PCB + 方案",
          problem: "PCB 批次不清晰会降低产出。",
          solution: "合格 PCB 流带着方案和预期产出进入冶炼方。",
          next: "检查批次",
        },
        materials: {
          title: "Materials",
          label: "Material",
          problem: "材料价值需要清晰的回流路径。",
          solution: "被记录的材料保持可见，并能有目的地回到循环中。",
          next: "检查材料",
        },
      },
      values: [
        { role: "OEM", value: "可回收 PCB、50% CO2 减排、材料主权。" },
        { role: "回收商", value: "化学方案、组分逻辑、更干净的溶解。" },
        { role: "冶炼方", value: "更好批次、来源记录、预期产出。" },
        { role: "客户", value: "确认退回、获得折扣、查看产品状态。" },
        { role: "伙伴", value: "ESG 报告、未结案件、协调流程数据。" },
      ],
      flow: {
        product: "产品",
        sellPcb: "出售 PCB",
        productPcb: "产品 - PCB",
        pcb: "PCB",
        setSolution: "设置方案",
        material: "材料",
        materialReturn: "材料回流",
      },
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

export const roleOrder: RoleId[] = ["oem", "customer", "recycler", "smelter", "partner"];
const graphOrder: GraphPoint[] = ["oem", "customer", "consulting", "disassembly", "smelter", "materials"];

export const roleIcons: Record<RoleId, typeof Factory> = {
  oem: Factory,
  customer: UserRound,
  recycler: Recycle,
  smelter: Flame,
  partner: Handshake,
};

const graphIcons: Record<GraphPoint, typeof Factory> = {
  oem: Factory,
  customer: UserRound,
  consulting: Handshake,
  disassembly: Wrench,
  smelter: Flame,
  materials: PackageCheck,
};

const roleToPoint: Record<RoleId, GraphPoint> = {
  oem: "oem",
  customer: "customer",
  recycler: "disassembly",
  smelter: "smelter",
  partner: "consulting",
};

const Landing = () => {
  const [activeRole, setActiveRole] = useState<RoleId>("oem");
  const [activePoint, setActivePoint] = useState<GraphPoint>("oem");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<{ id: string; role: RoleId } | null>(null);
  const { language, setLanguage } = useLanguage();
  const content = copy[language];

  const activeNode = content.solution.nodes[activePoint];
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

    try {
      window.localStorage.setItem(`kernbeisser-request-${id}`, JSON.stringify(payload));
    } catch {
      // The prototype should still confirm submissions when storage is blocked.
    }
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
      <div className="fixed bottom-4 right-4 z-50 flex rounded-md border border-background/20 bg-black/45 p-1 shadow-card backdrop-blur-md sm:bottom-auto sm:top-4">
        {languages.map((item) => (
          <button
            key={item.code}
            type="button"
            onClick={() => setLanguage(item.code)}
            aria-label={item.label}
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

        <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-6 sm:px-8 sm:pr-32">
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
            <a href="#device-impact" className="transition-colors hover:text-background">
              {content.nav.impact}
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
            <a
              href="#solution"
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-md bg-background px-5 font-semibold text-foreground shadow-elegant transition-transform hover:-translate-y-0.5"
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
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {roleOrder.map((role) => {
              const Icon = roleIcons[role];
              const card = content.roles.cards[role];
              const surface = content.demos.surfaces[role];
              return (
                <Link
                  key={role}
                  to={`/demo/${role}`}
                  className="group rounded-lg border border-background/15 bg-background/8 p-5 shadow-elegant backdrop-blur transition-all hover:-translate-y-1 hover:border-primary/55"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid h-11 w-11 place-items-center rounded-md bg-primary/15 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-background/15 px-3 py-1 text-xs font-semibold text-background/70 group-hover:text-background">
                      {content.demos.liveLabel}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-semibold">{card.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-background/65">{surface.subtitle}</p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                    {content.form.demoId} {reference}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <DeviceImpact language={language} />

      <section id="roles" className="bg-[hsl(42_31%_91%)] py-16 text-foreground md:py-24">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{content.roles.eyebrow}</p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-6xl">{content.roles.title}</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">{content.roles.text}</p>
          </div>
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
                  key={activeRole}
                  name="product"
                  defaultValue={activeRole === "customer" ? DEMO_SERIAL : ""}
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
  const topRowY = 88;
  const mainRowY = 304;
  const topRowHeight = 148;

  const positions: Record<GraphPoint, { x: number; y: number; width: number; height?: number }> = {
    oem: { x: 80, y: mainRowY, width: 182 },
    customer: { x: 271, y: topRowY, width: 190, height: topRowHeight },
    consulting: { x: 453, y: mainRowY, width: 214 },
    disassembly: { x: 657, y: topRowY, width: 196, height: topRowHeight },
    smelter: { x: 858, y: mainRowY, width: 184 },
    materials: { x: 448, y: 510, width: 224 },
  };

  const pointToRole: Partial<Record<GraphPoint, RoleId>> = {
    oem: "oem",
    customer: "customer",
    consulting: "partner",
    disassembly: "recycler",
    smelter: "smelter",
  };

  const edges: FlowEdge[] = [
    {
      id: "oem-customer",
      from: "oem",
      to: "customer",
      path: "M171 300 C190 262 254 250 318 242",
      label: content.solution.flow.product,
      labelX: 224,
      labelY: 260,
      duration: 7.4,
      tone: "product",
    },
    {
      id: "customer-consulting",
      from: "customer",
      to: "consulting",
      path: "M366 242 C406 274 500 274 560 300",
      label: content.solution.flow.product,
      labelX: 438,
      labelY: 260,
      duration: 7.8,
      delay: 0.7,
      tone: "product",
    },
    {
      id: "consulting-oem",
      from: "consulting",
      to: "oem",
      path: "M447 378 C388 378 326 378 268 378",
      label: content.solution.flow.sellPcb,
      labelX: 326,
      labelY: 354,
      duration: 8.2,
      delay: 1.1,
      tone: "signal",
    },
    {
      id: "consulting-disassembly",
      from: "consulting",
      to: "disassembly",
      path: "M560 300 C620 274 714 274 755 242",
      duration: 8,
      delay: 1.7,
      tone: "recycle",
    },
    {
      id: "disassembly-smelter",
      from: "disassembly",
      to: "smelter",
      path: "M755 242 C814 250 930 262 950 300",
      duration: 7.2,
      delay: 0.4,
      tone: "recycle",
    },
    {
      id: "consulting-smelter-pcb",
      from: "consulting",
      to: "smelter",
      path: "M674 378 C734 378 792 378 852 378",
      label: content.solution.flow.pcb,
      labelX: 760,
      labelY: 354,
      duration: 7.6,
      delay: 1.3,
      tone: "signal",
    },
    {
      id: "smelter-consulting-solution",
      from: "smelter",
      to: "consulting",
      path: "M852 414 C792 414 734 414 674 414",
      label: content.solution.flow.setSolution,
      labelX: 720,
      labelY: 424,
      duration: 8.2,
      delay: 2,
      tone: "signal",
    },
    {
      id: "smelter-materials",
      from: "smelter",
      to: "materials",
      path: "M950 438 C902 514 768 568 678 586",
      label: content.solution.flow.material,
      labelX: 810,
      labelY: 516,
      duration: 8.4,
      delay: 2.2,
      tone: "material",
    },
    {
      id: "materials-oem",
      from: "materials",
      to: "oem",
      path: "M442 586 C352 568 220 514 171 438",
      label: content.solution.flow.materialReturn,
      labelX: 300,
      labelY: 516,
      duration: 9.5,
      delay: 0.9,
      tone: "material",
    },
  ];

  const handleNode = (point: GraphPoint) => {
    setActivePoint(point);
    const role = pointToRole[point];
    if (role) {
      chooseRole(role);
      jumpTo("demos");
      return;
    }
    jumpTo("forms");
  };

  return (
    <div className="rounded-lg border border-foreground/10 bg-[hsl(39_45%_95%)] p-3 shadow-elegant">
      <div className="hidden overflow-x-auto lg:block">
        <div className="relative h-[680px] min-w-[1120px] overflow-hidden rounded-md bg-[linear-gradient(120deg,hsl(44_55%_91%/.9),hsl(50_46%_96%/.96)_46%,hsl(155_35%_89%/.88))]">
          <div className="absolute inset-0 bg-[linear-gradient(hsl(155_30%_12%/.035)_1px,transparent_1px),linear-gradient(90deg,hsl(155_30%_12%/.035)_1px,transparent_1px)] bg-[size:44px_44px]" />

          <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full" viewBox="0 0 1120 680" aria-hidden="true">
            <defs>
              <marker id="flow-arrow-product" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="7" markerHeight="7" orient="auto">
                <path d="M2 2 L10 6 L2 10" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.9" strokeLinecap="round" />
              </marker>
              <marker id="flow-arrow-recycle" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="7" markerHeight="7" orient="auto">
                <path d="M2 2 L10 6 L2 10" fill="none" stroke="hsl(168 56% 34%)" strokeWidth="1.9" strokeLinecap="round" />
              </marker>
              <marker id="flow-arrow-signal" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="7" markerHeight="7" orient="auto">
                <path d="M2 2 L10 6 L2 10" fill="none" stroke="hsl(38 88% 44%)" strokeWidth="1.9" strokeLinecap="round" />
              </marker>
              <marker id="flow-arrow-material" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="7" markerHeight="7" orient="auto">
                <path d="M2 2 L10 6 L2 10" fill="none" stroke="hsl(142 28% 34%)" strokeWidth="1.9" strokeLinecap="round" />
              </marker>
              <marker id="flow-arrow-neutral" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="7" markerHeight="7" orient="auto">
                <path d="M2 2 L10 6 L2 10" fill="none" stroke="hsl(var(--foreground))" strokeWidth="1.9" strokeLinecap="round" />
              </marker>
            </defs>

            {edges.map((edge) => (
              <FlowBeam key={edge.id} edge={edge} active={edge.from === activePoint || edge.to === activePoint} />
            ))}
          </svg>

          {edges.map((edge) => edge.label ? (
            <span
              key={`${edge.id}-label`}
              className={`pointer-events-none absolute z-20 rounded-full border px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur ${
                edge.tone === "signal"
                  ? "border-amber-500/25 bg-amber-50/90 text-amber-800"
                  : edge.tone === "recycle"
                    ? "border-emerald-700/20 bg-emerald-50/90 text-emerald-800"
                    : edge.tone === "material"
                      ? "border-lime-800/15 bg-background/75 text-lime-900/80"
                      : edge.tone === "neutral"
                        ? "border-foreground/10 bg-background/70 text-foreground/55"
                        : "border-primary/15 bg-background/75 text-primary/75"
              }`}
              style={{ left: edge.labelX, top: edge.labelY }}
            >
              {edge.label}
            </span>
          ) : null)}

          {graphOrder.map((point) => {
            const Icon = graphIcons[point];
            const node = content.solution.nodes[point];
            const position = positions[point];
            return (
              <button
                key={point}
                type="button"
                onMouseEnter={() => setActivePoint(point)}
                onFocus={() => setActivePoint(point)}
                onClick={() => handleNode(point)}
                aria-pressed={activePoint === point}
                className={`absolute z-30 flex min-h-[126px] flex-col rounded-lg border bg-background/95 p-4 text-left shadow-card transition-all hover:-translate-y-1 ${
                  activePoint === point
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border"
                }`}
                style={{ left: position.x, top: position.y, width: position.width ?? 160, height: position.height }}
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {node.label}
                  </span>
                </span>
                <span className="mt-4 block font-display text-lg font-semibold leading-tight">{node.title}</span>
                <span className="mt-2 block text-xs leading-5 text-muted-foreground">{node.next}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-2 lg:hidden">
        {graphOrder.map((point, index) => {
          const Icon = graphIcons[point];
          const node = content.solution.nodes[point];
          return (
            <button
              key={point}
              type="button"
              onClick={() => handleNode(point)}
              className={`relative flex items-start gap-3 rounded-lg border bg-background p-4 text-left shadow-card ${
                activePoint === point
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border"
              }`}
            >
              {index < graphOrder.length - 1 ? <span aria-hidden className="absolute left-8 top-14 h-[calc(100%+8px)] w-px bg-primary/18" /> : null}
              <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
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

type FlowEdge = {
  id: string;
  from: GraphPoint;
  to: GraphPoint;
  path: string;
  label?: string;
  labelX?: number;
  labelY?: number;
  tone?: "product" | "recycle" | "signal" | "material" | "neutral";
  duration?: number;
  delay?: number;
};

// Beam styling follows Magic UI's MIT-licensed Animated Beam pattern, adapted to a fixed SVG process map.
const FlowBeam = ({ edge, active }: { edge: FlowEdge; active: boolean }) => {
  const tone = edge.tone ?? "product";
  const gradientId = `flow-gradient-${edge.id}`;
  const markerId = `flow-arrow-${tone}`;
  const flowColors: Record<NonNullable<FlowEdge["tone"]>, { stroke: string; glow: string }> = {
    product: { stroke: "hsl(var(--primary))", glow: "hsl(var(--primary-glow))" },
    recycle: { stroke: "hsl(168 56% 34%)", glow: "hsl(168 65% 52%)" },
    signal: { stroke: "hsl(38 88% 44%)", glow: "hsl(38 94% 58%)" },
    material: { stroke: "hsl(142 28% 34%)", glow: "hsl(142 45% 48%)" },
    neutral: { stroke: "hsl(var(--foreground))", glow: "hsl(var(--primary-glow))" },
  };
  const { stroke, glow } = flowColors[tone];
  const style = {
    "--beam-duration": `${edge.duration ?? 7.5}s`,
    "--beam-delay": `${edge.delay ?? 0}s`,
  } as CSSProperties;

  return (
    <g>
      <defs>
        <linearGradient id={gradientId} x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor={stroke} stopOpacity="0" />
          <stop offset="42%" stopColor={glow} stopOpacity="0.25" />
          <stop offset="72%" stopColor={stroke} stopOpacity="0.96" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={edge.path}
        fill="none"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity={active ? 0.48 : 0.24}
        strokeWidth={active ? 4.8 : 3.8}
        markerEnd={`url(#${markerId})`}
      />
      <path
        d={edge.path}
        className="flow-beam-trace"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={active ? 7 : 5.5}
        style={style}
      />
    </g>
  );
};

const InfoPanel = ({ content, activeNode }: { content: LandingCopy; activeNode: LandingCopy["solution"]["nodes"][GraphPoint] }) => (
  <div className="rounded-lg border border-primary/25 bg-background/80 p-4 shadow-card md:w-96">
    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">{content.solution.hoverLabel}</p>
    <h3 className="mt-3 font-display text-2xl font-semibold">{activeNode.title}</h3>
    <p className="mt-2 text-sm font-semibold text-primary/80">{activeNode.problem}</p>
    <p className="mt-2 text-sm leading-6 text-muted-foreground">{activeNode.solution}</p>
    <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
      {content.solution.nextStep}: {activeNode.next}
      <ArrowRight className="h-4 w-4" />
    </p>
  </div>
);

export const DemoSurface = ({ content, surface, reference }: { content: LandingCopy; surface: LandingCopy["demos"]["surfaces"][RoleId]; reference: string }) => (
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

export const CustomerReturnDemo = ({ content, language, reference }: { content: LandingCopy; language: Language; reference: string }) => {
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
  const normalized = device.replace(/Â·/g, "·");
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
