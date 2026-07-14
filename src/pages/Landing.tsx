import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, FormEvent, MouseEvent as ReactMouseEvent, ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CirclePlay,
  Factory,
  Flame,
  Globe2,
  Handshake,
  Leaf,
  Menu,
  PackageCheck,
  QrCode,
  Recycle,
  SearchCheck,
  UserRound,
  Wrench,
  X,
} from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { CyclePrototypeMap } from "@/components/CyclePrototypeMap";
import { Footer } from "@/components/Footer";
import { PilotProjectSection } from "@/components/PilotProjectSection";
import { ProofOfProgress } from "@/components/ProofOfProgress";
import { ScrollPCBStory } from "@/components/ScrollPCBStory";
import { WaterfallToPCBHero } from "@/components/WaterfallToPCBHero";
import { languages, type Language, useLanguage } from "@/lib/i18n";
import { DEMO_SERIAL, SERIAL_DB, type SerialLookup } from "@/data/partners";

export type RoleId = "oem" | "customer" | "recycler" | "smelter" | "partner";
export type GraphPoint = "oem" | "customer" | "consulting" | "disassembly" | "smelter" | "materials";
type LandingPage = "home" | "problem" | "product" | "traction" | "cycle";

export type LandingCopy = {
  nav: {
    problem: string;
    process: string;
    product: string;
    traction: string;
    cycle: string;
    contact: string;
    impact: string;
    roles: string;
    solution: string;
    demos: string;
    forms: string;
  };
  hero: { eyebrow: string; title: string; titleAccent?: string; text: string; cta: string };
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
      sellSolution: string;
      material: string;
      materialReturn: string;
    };
  };
  demos: {
    eyebrow: string;
    title: string;
    text: string;
    liveLabel: string;
    problemLabel: string;
    valueLabel: string;
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
  traction: {
    eyebrow: string;
    title: string;
    text: string;
    events: Array<{
      date: string;
      title: string;
      text: string;
      href: string;
      link: string;
      image?: string;
      imageAlt?: string;
    }>;
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
    nav: {
      problem: "Problem",
      process: "Prozess",
      product: "Unser Produkt",
      traction: "Erfolge",
      cycle: "Kreislauf-Demo",
      contact: "Kontakt",
      impact: "Device Impact",
      roles: "Rollen",
      solution: "Kreislauf",
      demos: "Demos",
      forms: "Starten",
    },
    hero: {
      eyebrow: "",
      title: "Was wir abbauen, muss im Kreislauf bleiben.",
      text:
        "Leaftronics macht aus Recycling einen steuerbaren B2B-Prozess: Produkt identifizieren, sauber demontieren, Materialdaten sichern und Wertstoffe in Europa halten.",
      cta: "Rolle auswählen",
    },
    problem: {
      eyebrow: "Das Problem",
      title: "Materialien verschwinden, bevor sie wieder Produktion werden.",
      text:
        "Alte Produkte werden exportiert, unscharf gesammelt oder nicht sauber demontiert. Bestimmte Fraktionen werden im Prozess nicht gefiltert, OEMs verlieren Materialhoheit und Europa verliert Rohstoffsicherheit. Leaftronics setzt dort an, wo Produktdaten, Demontage und Materialrückführung bisher getrennt sind.",
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
          image: "/leaftronics-hero-pcb.jpg",
        },
        {
          title: "Unscharfe Sammlung",
          text: "B2B-Produkte werden mit Mischströmen vermengt und verlieren Qualität, Serienbezug und Verantwortung.",
          image: "/leaftronics-separated-components.jpg",
        },
        {
          title: "Keine Materialhoheit",
          text: "Ohne Datenfluss verlieren OEMs Rückführungsdaten, ESG-Nachweise und europäische Produktionsoptionen.",
          image: "/leaftronics-pcb-prototype.jpg",
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
      title: "Vom Produkt zurück zum Material.",
      text:
        "Sechs Stationen bilden einen kontrollierten Kreislauf: Produkte, Leiterplatten, Daten und Wertstoffe bleiben sichtbar und fließen gezielt zum OEM zurück.",
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
          title: "Leaftronics",
          label: "Leaftronics",
          problem: "Ohne Bewertung wird PCB anonym verkauft oder falsch geroutet.",
          solution: "Leaftronics bewertet Produkt und PCB, verkauft oder ordnet PCB zu und setzt die passende Lösung.",
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
        sellSolution: "Sell Solution",
        material: "Material",
        materialReturn: "Material zurück",
      },
    },
    demos: {
      eyebrow: "Demo-Oberflächen",
      title: "So fühlt sich das Netzwerk als Produkt an.",
      text: "Jede Rolle bekommt eine kleine Oberfläche mit Demo-Daten, damit der Prototyp nicht nur erklärt, sondern bedienbar wirkt.",
      liveLabel: "Live-Demo",
      problemLabel: "Problem",
      valueLabel: "Wert",
      customerLive: {
        title: "Live-Demo: Customer Rückgabe",
        text: "Gib eine Seriennummer ein. Leaftronics erkennt Produkt und Standort, zeigt Rückgabepartner und mögliche OEM-Rabatte.",
        serialLabel: "Seriennummer",
        serialPlaceholder: "z. B. LT-B2B-26-0001",
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
          { oem: "Leaftronics Network", offer: "CO2-Zertifikat + Einkaufsvorteil", condition: "für ESG-fähige Rückläufer" },
        ],
      },
      surfaces: {
        oem: {
          title: "OEM-Dashboard",
          subtitle: "Rückläufer, Materialwerte und ESG-Status",
          metrics: [
            { label: "CO2-Einsparung pro PCB", value: "1,8 kg" },
            { label: "Materialwert", value: "42,8 k EUR" },
            { label: "Datenabdeckung", value: "96%" },
          ],
          steps: ["Eingang qualifiziert", "PCB-Chargen zugeordnet", "Materialabruf freigeben"],
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
            { label: "Eingang", value: "420 kg" },
            { label: "Sortenreinheit", value: "94%" },
            { label: "Nächster Slot", value: "14:30" },
          ],
          steps: ["Produktchargen verifiziert", "Demontage abgeschlossen", "Fraktionen freigeben"],
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
            { label: "Routingfälle", value: "7" },
            { label: "SLA heute", value: "5 / 7" },
            { label: "Datenlücken", value: "2" },
          ],
          steps: ["Materialdaten validiert", "Partnerkapazität bestätigt", "Routingentscheidung senden"],
        },
      },
    },
    traction: {
      eyebrow: "Erfolge",
      title: "Was wir bereits erreicht haben.",
      text: "Förderungen, Accelerator-Programme, Auszeichnungen und Nominierungen zeigen, wie sich Leaftronics technologisch und unternehmerisch entwickelt.",
      events: [
        {
          date: "2024 / 2025",
          title: "Emanuel-Goldberg-Preis",
          text:
            "Anton Weißbach ist für die 2023 abgeschlossene Arbeit gelistet, Rakesh Rajendran Nair für die 2024 abgeschlossene Leaftronics-Dissertation. Die Preisverleihung erfolgt laut Quelle jeweils im Folgejahr.",
          href: "https://tu-dresden.de/dcpc/iapp/r-l-stiftung/emanuel-goldberg-preis",
          link: "Emanuel-Goldberg-Preis",
          image: "/traction-goldberg.jpg",
          imageAlt: "Emanuel-Goldberg-Preis an der TU Dresden",
        },
        {
          date: "01.03.2025 - 28.02.2027",
          title: "EXIST-Forschungstransfer",
          text:
            "Das Leaftronics-Projekt läuft an der TU Dresden mit BMWK-Förderung. Die Quelle nennt 1.146.357,09 Euro Fördersumme und das Ziel eines biobasierten, recycelbaren Leiterplattensubstrats.",
          href: "https://tu-dresden.de/mn/physik/iap/optoelektronik/forschung/projekte/exist-gruendungsstipendium-leaftronics",
          link: "TU Dresden EXIST-Projekt",
          image: "/traction-exist-leaftronics.jpg",
          imageAlt: "Leaftronics-Projektbild der TU Dresden",
        },
        {
          date: "02.07.2025 / 30.09.2025",
          title: "Joachim Herz Preis 2025",
          text:
            "Hans Kleemann erhält den mit 500.000 Euro dotierten Joachim Herz Preis 2025 für das Projekt UnbeLEAFable. Die Stiftung nennt die Verleihung am 30. September 2025 in Hamburg.",
          href: "https://www.joachim-herz-stiftung.de/presse/meldung/dresdner-wissenschaftler-hans-kleemann-erhaelt-joachim-herz-preis",
          link: "Joachim Herz Stiftung",
        },
        {
          date: "23.02.2026",
          title: "Förderpreis Richard Hartmann",
          text:
            "Dr. Rakesh Nair wird vom Industrieverein Sachsen 1828 e.V. für Arbeiten zu nachhaltiger, biologisch abbaubarer Elektronik auf Basis natürlicher Lignocellulose-Strukturen ausgezeichnet.",
          href: "https://tu-dresden.de/tu-dresden/newsportal/news/industrieverein-sachsen-zeichnet-dr-rakesh-nair-mit-foerderpreis-richard-hartmann-aus",
          link: "TU Dresden News",
          image: "/traction-richard-hartmann.jpg",
          imageAlt: "Rakesh Nair bei der Richard-Hartmann-Preisverleihung",
        },
        {
          date: "April 2026",
          title: "EXCITE Lab Accelerator",
          text:
            "Leaftronics ist im EXCITE Lab Startup-Portfolio in Batch #4 gelistet. Die Programmliste beschreibt Leaftronics als Entwickler auflösbarer PCB-Substrate für kreislauffähige Elektronik und Rückgewinnung von Edelmetallen.",
          href: "https://www.excitelab.co/startups#filter=.4",
          link: "EXCITE Lab Batch #4",
        },
        {
          date: "17.06.2026 / 19.06.2026",
          title: "Sächsischer Gründerpreis: Nominierung",
          text:
            "Auf der Sächsischen Innovationskonferenz 2026 wird Oxaphil Newcomer des Jahres. Leaftronics wird in der dresden|exists-Quelle als für den Sächsischen Gründerpreis nominiert genannt.",
          href: "https://www.dresden-exists.de/blog/2026/06/19/oxaphil-wird-newcomer-des-jahres-ein-tag-zwischen-konferenztrubel-und-echtem-startup-moment/",
          link: "dresden|exists Innovationskonferenz",
          image: "/traction-innovationskonferenz-leaftronics.jpg",
          imageAlt: "Leaftronics bei der Sächsischen Innovationskonferenz",
        },
      ],
    },
    form: {
      eyebrow: "Pilotprojekt",
      title: "Bringen wir Ihre Leiterplatte in den Kreislauf.",
      text: "Wählen Sie Ihre Rolle und skizzieren Sie Ihr Produkt. Gemeinsam definieren wir Materialanalyse, Pilotumfang und den nächsten technischen Schritt.",
      roleLabel: "Rolle",
      company: "Unternehmen",
      contact: "Ansprechpartner",
      email: "E-Mail",
      product: "Produkt / Seriennummer / Material",
      notes: "Was soll als Nächstes passieren?",
      submit: "Pilotprojekt anfragen",
      successTitle: "Pilotprojekt vorgemerkt",
      successText: (id, role) => `Referenz ${id}: Ihre Anfrage für ${role} ist vorgemerkt. Als Nächstes folgt ein passender Prozessvorschlag.`,
      demoId: "Pilot-Referenz",
    },
  },
  en: {
    nav: {
      problem: "Problem",
      process: "Process",
      product: "Our product",
      traction: "Milestones",
      cycle: "Loop demo",
      contact: "Contact",
      impact: "Device impact",
      roles: "Roles",
      solution: "Loop",
      demos: "Demos",
      forms: "Start",
    },
    hero: {
      eyebrow: "",
      title: "What we extract must stay in the loop.",
      text:
        "Leaftronics turns recycling into a controllable B2B process: identify products, disassemble cleanly, preserve material data and keep value in Europe.",
      cta: "Select role",
    },
    problem: {
      eyebrow: "The problem",
      title: "Materials disappear before they become production again.",
      text:
        "Old products are exported, collected too broadly or not disassembled cleanly. Specific fractions are never filtered, OEMs lose material sovereignty and Europe loses raw-material security. Leaftronics connects the product data, disassembly and material return paths that are currently separated.",
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
          image: "/leaftronics-hero-pcb.jpg",
        },
        {
          title: "Mixed collection",
          text: "B2B products are blended into mixed streams and lose quality, serial context and responsibility.",
          image: "/leaftronics-separated-components.jpg",
        },
        {
          title: "No material sovereignty",
          text: "Without data flow, OEMs lose return data, ESG proof and European production options.",
          image: "/leaftronics-pcb-prototype.jpg",
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
      title: "From product back to material.",
      text:
        "Six stations form one controlled loop: products, circuit boards, data and valuable materials stay visible and flow deliberately back to the OEM.",
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
          title: "Leaftronics",
          label: "Leaftronics",
          problem: "Without evaluation, PCB is sold anonymously or routed incorrectly.",
          solution: "Leaftronics evaluates product and PCB, sells or assigns PCB and sets the suitable solution.",
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
        sellSolution: "Sell Solution",
        material: "Material",
        materialReturn: "Material return",
      },
    },
    demos: {
      eyebrow: "Demo surfaces",
      title: "How the network feels as a product.",
      text: "Each role gets a small interface with demo data, so the prototype feels usable.",
      liveLabel: "Live demo",
      problemLabel: "Problem",
      valueLabel: "Value",
      customerLive: {
        title: "Live demo: customer return",
        text: "Enter a serial number. Leaftronics detects product and location, then shows return partners and possible OEM discounts.",
        serialLabel: "Serial number",
        serialPlaceholder: "e.g. LT-B2B-26-0001",
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
          { oem: "Leaftronics Network", offer: "CO2 certificate + purchase benefit", condition: "for ESG-ready returns" },
        ],
      },
      surfaces: {
        oem: {
          title: "OEM dashboard",
          subtitle: "Returns, material values and ESG status",
          metrics: [
            { label: "CO2 saved per PCB", value: "1.8 kg" },
            { label: "Material value", value: "EUR 42.8k" },
            { label: "Data coverage", value: "96%" },
          ],
          steps: ["Inbound qualified", "PCB batches assigned", "Release material call-off"],
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
            { label: "Inbound", value: "420 kg" },
            { label: "Purity", value: "94%" },
            { label: "Next slot", value: "14:30" },
          ],
          steps: ["Product batches verified", "Disassembly completed", "Release fractions"],
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
            { label: "Routing cases", value: "7" },
            { label: "SLA today", value: "5 / 7" },
            { label: "Data gaps", value: "2" },
          ],
          steps: ["Material data validated", "Partner capacity confirmed", "Send routing decision"],
        },
      },
    },
    traction: {
      eyebrow: "Milestones",
      title: "What we have achieved so far.",
      text: "Funding, accelerator programs, awards and nominations show how Leaftronics is progressing as a technology and as a company.",
      events: [
        {
          date: "2024 / 2025",
          title: "Emanuel Goldberg Prize",
          text:
            "Anton Weißbach is listed for the work completed in 2023, Rakesh Rajendran Nair for the Leaftronics dissertation completed in 2024. According to the source, each award ceremony takes place in the following year.",
          href: "https://tu-dresden.de/dcpc/iapp/r-l-stiftung/emanuel-goldberg-preis",
          link: "Emanuel Goldberg Prize",
          image: "/traction-goldberg.jpg",
          imageAlt: "Emanuel Goldberg Prize at TU Dresden",
        },
        {
          date: "01.03.2025 - 28.02.2027",
          title: "EXIST Research Transfer",
          text:
            "The Leaftronics project runs at TU Dresden with BMWK funding. The source lists EUR 1,146,357.09 in funding and the goal of a bio-based, recyclable circuit-board substrate.",
          href: "https://tu-dresden.de/mn/physik/iap/optoelektronik/forschung/projekte/exist-gruendungsstipendium-leaftronics",
          link: "TU Dresden EXIST project",
          image: "/traction-exist-leaftronics.jpg",
          imageAlt: "Leaftronics project image from TU Dresden",
        },
        {
          date: "02.07.2025 / 30.09.2025",
          title: "Joachim Herz Prize 2025",
          text:
            "Hans Kleemann receives the EUR 500,000 Joachim Herz Prize 2025 for the project UnbeLEAFable. The foundation lists the award ceremony on September 30, 2025 in Hamburg.",
          href: "https://www.joachim-herz-stiftung.de/presse/meldung/dresdner-wissenschaftler-hans-kleemann-erhaelt-joachim-herz-preis",
          link: "Joachim Herz Foundation",
        },
        {
          date: "23.02.2026",
          title: "Richard Hartmann Sponsorship Award",
          text:
            "Dr. Rakesh Nair is recognized by Industrieverein Sachsen 1828 e.V. for work on sustainable, biodegradable electronics based on natural lignocellulose structures.",
          href: "https://tu-dresden.de/tu-dresden/newsportal/news/industrieverein-sachsen-zeichnet-dr-rakesh-nair-mit-foerderpreis-richard-hartmann-aus",
          link: "TU Dresden news",
          image: "/traction-richard-hartmann.jpg",
          imageAlt: "Rakesh Nair at the Richard Hartmann award ceremony",
        },
        {
          date: "April 2026",
          title: "EXCITE Lab Accelerator",
          text:
            "Leaftronics is listed in the EXCITE Lab startup portfolio in Batch #4. The program list describes Leaftronics as developing dissolvable PCB substrates for circular electronics and precious-metal recovery.",
          href: "https://www.excitelab.co/startups#filter=.4",
          link: "EXCITE Lab Batch #4",
        },
        {
          date: "17.06.2026 / 19.06.2026",
          title: "Saxon Founder Award: nomination",
          text:
            "At the Saxon Innovation Conference 2026, Oxaphil becomes newcomer of the year. The dresden|exists source lists Leaftronics as nominated for the Saxon Founder Award.",
          href: "https://www.dresden-exists.de/blog/2026/06/19/oxaphil-wird-newcomer-des-jahres-ein-tag-zwischen-konferenztrubel-und-echtem-startup-moment/",
          link: "dresden|exists Innovation Conference",
          image: "/traction-innovationskonferenz-leaftronics.jpg",
          imageAlt: "Leaftronics at the Saxon Innovation Conference",
        },
      ],
    },
    form: {
      eyebrow: "Pilot project",
      title: "Let us bring your circuit board into the loop.",
      text: "Choose your role and outline your product. Together, we define the material analysis, pilot scope and next technical step.",
      roleLabel: "Role",
      company: "Company",
      contact: "Contact",
      email: "Email",
      product: "Product / serial / material",
      notes: "What should happen next?",
      submit: "Request pilot project",
      successTitle: "Pilot project registered",
      successText: (id, role) => `Reference ${id}: Your request for ${role} has been registered. A suitable process proposal follows next.`,
      demoId: "Pilot reference",
    },
  },
  zh: {
    nav: {
      problem: "问题",
      process: "过程",
      product: "我们的产品",
      traction: "成果",
      cycle: "循环演示",
      contact: "联系",
      impact: "设备影响",
      roles: "角色",
      solution: "循环",
      demos: "演示",
      forms: "开始",
    },
    hero: {
      eyebrow: "",
      title: "被开采的材料必须留在循环中。",
      text: "Leaftronics 将回收变成可控的 B2B 流程：识别产品、清晰拆解、保留材料数据，并把价值留在欧洲。",
      cta: "选择角色",
    },
    problem: {
      eyebrow: "问题",
      title: "材料在重新进入生产之前就消失了。",
      text:
        "旧产品被出口、混合收集或没有被清晰拆解。部分材料组分没有被过滤，OEM 失去材料主权，欧洲失去原材料安全。Leaftronics 连接产品数据、拆解和材料回流路径。",
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
          image: "/leaftronics-hero-pcb.jpg",
        },
        {
          title: "混合收集",
          text: "B2B 产品进入混合材料流，失去质量、序列号和责任关系。",
          image: "/leaftronics-separated-components.jpg",
        },
        {
          title: "没有材料主权",
          text: "没有数据流，OEM 失去回流数据、ESG 证明和欧洲生产选择。",
          image: "/leaftronics-pcb-prototype.jpg",
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
      title: "从产品回到材料。",
      text:
        "六个环节组成一个可控闭环：产品、电路板、数据和高价值材料始终可见，并有目的地回流至 OEM。",
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
          title: "Leaftronics",
          label: "Leaftronics",
          problem: "没有评估时，PCB 会被匿名出售或错误路由。",
          solution: "Leaftronics 评估产品和 PCB，分配或出售 PCB，并设置合适方案。",
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
        sellSolution: "Sell Solution",
        material: "材料",
        materialReturn: "材料回流",
      },
    },
    demos: {
      eyebrow: "演示界面",
      title: "网络作为产品的体验。",
      text: "每个角色都有包含演示数据的小界面，让原型更像可用产品。",
      liveLabel: "实时演示",
      problemLabel: "问题",
      valueLabel: "价值",
      customerLive: {
        title: "实时演示：客户退回",
        text: "输入序列号。Leaftronics 会识别产品和位置，并显示退回伙伴与可能的 OEM 折扣。",
        serialLabel: "序列号",
        serialPlaceholder: "例如 LT-B2B-26-0001",
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
          { oem: "Leaftronics Network", offer: "CO2 证书 + 采购优惠", condition: "适用于 ESG 可追踪退回" },
        ],
      },
      surfaces: {
        oem: {
          title: "OEM 仪表板",
          subtitle: "退回、材料价值和 ESG 状态",
          metrics: [
            { label: "退回率", value: "78%" },
            { label: "材料价值", value: "4.28万欧元" },
            { label: "数据覆盖率", value: "96%" },
          ],
          steps: ["来料已确认", "PCB 批次已分配", "批准材料调用"],
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
            { label: "来料", value: "420 kg" },
            { label: "纯度", value: "94%" },
            { label: "下一时段", value: "14:30" },
          ],
          steps: ["产品批次已验证", "拆解已完成", "批准组分"],
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
            { label: "路由任务", value: "7" },
            { label: "今日 SLA", value: "5 / 7" },
            { label: "数据缺口", value: "2" },
          ],
          steps: ["材料数据已验证", "伙伴产能已确认", "发送路由决定"],
        },
      },
    },
    traction: {
      eyebrow: "成果",
      title: "我们已经取得的进展。",
      text: "资助、加速器项目、奖项和提名展示了 Leaftronics 在技术与企业发展方面的持续进步。",
      events: [
        {
          date: "2024 / 2025",
          title: "Emanuel Goldberg 奖",
          text:
            "Anton Weißbach 因 2023 年完成的工作被列出，Rakesh Rajendran Nair 因 2024 年完成的 Leaftronics 博士论文被列出。根据来源，颁奖通常在下一年进行。",
          href: "https://tu-dresden.de/dcpc/iapp/r-l-stiftung/emanuel-goldberg-preis",
          link: "Emanuel Goldberg 奖",
          image: "/traction-goldberg.jpg",
          imageAlt: "德累斯顿工业大学 Emanuel Goldberg 奖",
        },
        {
          date: "01.03.2025 - 28.02.2027",
          title: "EXIST 研究转化",
          text:
            "Leaftronics 项目在德累斯顿工业大学获得 BMWK 资助。来源列出资助金额为 1,146,357.09 欧元，目标是开发生物基、可回收的电路板基材。",
          href: "https://tu-dresden.de/mn/physik/iap/optoelektronik/forschung/projekte/exist-gruendungsstipendium-leaftronics",
          link: "德累斯顿工业大学 EXIST 项目",
          image: "/traction-exist-leaftronics.jpg",
          imageAlt: "德累斯顿工业大学 Leaftronics 项目图",
        },
        {
          date: "02.07.2025 / 30.09.2025",
          title: "2025 Joachim Herz 奖",
          text:
            "Hans Kleemann 因 UnbeLEAFable 项目获得 50 万欧元 Joachim Herz Prize 2025。基金会列出的颁奖时间为 2025 年 9 月 30 日，地点在汉堡。",
          href: "https://www.joachim-herz-stiftung.de/presse/meldung/dresdner-wissenschaftler-hans-kleemann-erhaelt-joachim-herz-preis",
          link: "Joachim Herz 基金会",
        },
        {
          date: "23.02.2026",
          title: "Richard Hartmann 资助奖",
          text:
            "Dr. Rakesh Nair 因基于天然木质纤维素结构的可持续、可生物降解电子技术研究，获得 Industrieverein Sachsen 1828 e.V. 表彰。",
          href: "https://tu-dresden.de/tu-dresden/newsportal/news/industrieverein-sachsen-zeichnet-dr-rakesh-nair-mit-foerderpreis-richard-hartmann-aus",
          link: "德累斯顿工业大学新闻",
          image: "/traction-richard-hartmann.jpg",
          imageAlt: "Rakesh Nair 在 Richard Hartmann 颁奖现场",
        },
        {
          date: "April 2026",
          title: "EXCITE Lab 加速器",
          text:
            "Leaftronics 被列入 EXCITE Lab 第 4 批创业项目组合。项目列表描述 Leaftronics 正在开发可溶解 PCB 基材，用于循环电子产品和贵金属回收。",
          href: "https://www.excitelab.co/startups#filter=.4",
          link: "EXCITE Lab 第 4 批",
        },
        {
          date: "17.06.2026 / 19.06.2026",
          title: "萨克森创业奖：提名",
          text:
            "在 2026 年萨克森创新大会上，Oxaphil 成为年度新人。dresden|exists 来源列出 Leaftronics 获得萨克森创业奖提名。",
          href: "https://www.dresden-exists.de/blog/2026/06/19/oxaphil-wird-newcomer-des-jahres-ein-tag-zwischen-konferenztrubel-und-echtem-startup-moment/",
          link: "dresden|exists 创新大会",
          image: "/traction-innovationskonferenz-leaftronics.jpg",
          imageAlt: "Leaftronics 在萨克森创新大会",
        },
      ],
    },
    form: {
      eyebrow: "试点项目",
      title: "让我们将您的电路板带入循环。",
      text: "请选择您的角色并简述产品。我们将共同确定材料分析、试点范围和下一步技术方案。",
      roleLabel: "角色",
      company: "公司",
      contact: "联系人",
      email: "邮箱",
      product: "产品 / 序列号 / 材料",
      notes: "下一步应该是什么？",
      submit: "申请试点项目",
      successTitle: "试点项目已登记",
      successText: (id, role) => `参考号 ${id}: 您针对 ${role} 的申请已登记。下一步将提供匹配的流程建议。`,
      demoId: "试点参考号",
    },
  },
};

export const roleOrder: RoleId[] = ["oem", "customer", "smelter"];
const demoRoleOrder: RoleId[] = ["oem", "customer", "smelter"];
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
  consulting: Leaf,
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

const heroScrollLabels: Record<Language, string> = {
  de: "Weiter scrollen",
  en: "Scroll to explore",
  zh: "向下探索",
};

const heroLoadingLabels: Record<Language, string> = {
  de: "3D-Leiterplatte wird geladen",
  en: "Loading 3D circuit board",
  zh: "正在加载 3D 电路板",
};

const cyclePageCopy: Record<
  Language,
  {
    eyebrow: string;
    title: string;
    text: string;
    productLink: string;
    flowLink: string;
    demosLink: string;
    navigationLabel: string;
  }
> = {
  de: {
    eyebrow: "Unser Produkt in Bewegung",
    title: "Interaktiver Wertstrom",
    text: "Verfolgen Sie den vollständigen Wertstrom und öffnen Sie anschließend die Arbeitsoberflächen der beteiligten Rollen.",
    productLink: "Produktdetails",
    flowLink: "Wertstrom",
    demosLink: "Rollen-Demos",
    navigationLabel: "Bereiche der Kreislauf-Demo",
  },
  en: {
    eyebrow: "Our product in motion",
    title: "Interactive value flow",
    text: "Follow the complete value stream, then explore the working interfaces used by each participating role.",
    productLink: "Product details",
    flowLink: "Value stream",
    demosLink: "Role demos",
    navigationLabel: "Loop demo sections",
  },
  zh: {
    eyebrow: "动态产品体验",
    title: "循环演示",
    text: "查看完整的价值流，然后探索各参与角色使用的工作界面。",
    productLink: "产品详情",
    flowLink: "价值流",
    demosLink: "角色演示",
    navigationLabel: "循环演示区域",
  },
};

function scrollToLandingSection(id: string, duration = 560) {
  const target = document.getElementById(id);
  if (!target) return;

  const startY = window.scrollY;
  const targetY = startY + target.getBoundingClientRect().top;
  const distance = targetY - startY;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  window.history.replaceState(null, "", `#${id}`);
  if (reducedMotion || Math.abs(distance) < 2) {
    window.scrollTo({ top: targetY });
    return;
  }

  const startedAt = performance.now();
  const animate = (now: number) => {
    const progress = Math.min(1, (now - startedAt) / duration);
    const eased = 1 - Math.pow(1 - progress, 4);
    window.scrollTo({ top: startY + distance * eased });
    if (progress < 1) window.requestAnimationFrame(animate);
  };
  window.requestAnimationFrame(animate);
}

const Landing = ({ page = "home" }: { page?: LandingPage }) => {
  const [activeRole, setActiveRole] = useState<RoleId>("oem");
  const [activePoint, setActivePoint] = useState<GraphPoint>("oem");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<{ id: string; role: RoleId } | null>(null);
  const { language, setLanguage, t } = useLanguage();
  const content = copy[language];

  const reference = useMemo(() => `KB-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 900))}`, []);
  const showHero = page === "home";
  const showProblem = page === "problem";
  const showProduct = page === "product";
  const showTraction = page === "traction";
  const showCycle = page === "cycle";
  const showContact = page === "home";

  useEffect(() => {
    if (!showHero || !window.location.hash) return;
    const id = window.location.hash.slice(1);
    const timer = window.setTimeout(() => scrollToLandingSection(id, 420), 80);
    return () => window.clearTimeout(timer);
  }, [showHero]);

  const handleSectionLink = (
    event: ReactMouseEvent<HTMLAnchorElement>,
    id: "problem-story" | "product-story" | "pilot-project",
    duration = 560,
  ) => {
    event.preventDefault();
    setMobileNavOpen(false);
    scrollToLandingSection(id, duration);
  };

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
      window.localStorage.setItem(`leaftronics-request-${id}`, JSON.stringify(payload));
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

  const mobileLanguageControl = (
    <div className="mt-1 grid grid-cols-3 gap-1 border-t border-current/10 pt-2">
      {languages.map((item) => (
        <button
          key={item.code}
          type="button"
          onClick={() => {
            setLanguage(item.code);
            setMobileNavOpen(false);
          }}
          aria-label={item.label}
          className={`h-10 rounded-md text-xs font-semibold transition-colors ${
            language === item.code ? "bg-primary text-primary-foreground" : "opacity-60 hover:bg-current/10 hover:opacity-100"
          }`}
        >
          {item.short}
        </button>
      ))}
    </div>
  );

  const primaryNavigationLabel = language === "de" ? "Hauptnavigation" : language === "zh" ? "主导航" : "Primary navigation";

  return (
    <div id="top" className={`min-h-screen ${showCycle ? "bg-[#f8f5eb] text-foreground" : "bg-black text-background"}`}>
      <div className={`site-language-switch fixed right-4 top-4 z-50 hidden p-1 shadow-card backdrop-blur-md lg:flex ${showCycle ? "is-light" : "is-dark"}`}>
        {languages.map((item) => (
          <button
            key={item.code}
            type="button"
            onClick={() => setLanguage(item.code)}
            aria-label={item.label}
            className={`site-language-button h-8 px-2 text-xs font-medium transition-colors ${language === item.code ? "is-active" : ""}`}
            title={item.label}
          >
            {item.short}
          </button>
        ))}
      </div>

      {showHero ? (
        <WaterfallToPCBHero loadingLabel={heroLoadingLabels[language]}>
          <header className="landing-hero-header relative z-10 mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between px-5 py-6 sm:px-8 sm:pr-32">
            <Link to="/" className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-background shadow-elegant">
                <img src="/logo1-web.webp" alt="Leaftronics Logo" className="h-full w-full object-cover" />
              </span>
              <span className="font-display text-base font-semibold uppercase tracking-[0.22em]">Leaftronics</span>
            </Link>
            <nav className="site-header-nav is-light hidden items-center gap-1 p-1 text-sm font-semibold shadow-elegant backdrop-blur-xl lg:flex" aria-label={primaryNavigationLabel}>
              <a href="#problem-story" onClick={(event) => handleSectionLink(event, "problem-story", 520)} className="site-header-link">
                {content.nav.problem}
              </a>
              <a href="#product-story" onClick={(event) => handleSectionLink(event, "product-story", 620)} className="site-header-link">
                {content.nav.product}
              </a>
              <a href="#pilot-project" onClick={(event) => handleSectionLink(event, "pilot-project", 700)} className="site-header-link">
                {content.nav.contact}
              </a>
              <Link to="/kreislauf-demo" className="site-header-demo-link">
                <CirclePlay className="h-4 w-4" aria-hidden="true" />
                {content.nav.cycle}
              </Link>
              <Link to="/erfolge" className="site-header-link">
                {content.nav.traction}
              </Link>
            </nav>
            <button
              type="button"
              onClick={() => setMobileNavOpen((open) => !open)}
              aria-label={t.menu}
              aria-controls="landing-mobile-navigation"
              aria-expanded={mobileNavOpen}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/60 bg-white/85 text-foreground shadow-card backdrop-blur lg:hidden"
            >
              {mobileNavOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </button>
            {mobileNavOpen ? (
              <nav
                id="landing-mobile-navigation"
                className="site-mobile-navigation is-light mt-3 w-full p-2 text-sm font-semibold shadow-elegant backdrop-blur-xl lg:hidden"
                aria-label={primaryNavigationLabel}
              >
                <a href="#problem-story" onClick={(event) => handleSectionLink(event, "problem-story", 520)} className="site-mobile-link">
                  {content.nav.problem}
                </a>
                <a href="#product-story" onClick={(event) => handleSectionLink(event, "product-story", 620)} className="site-mobile-link">
                  {content.nav.product}
                </a>
                <a href="#pilot-project" onClick={(event) => handleSectionLink(event, "pilot-project", 700)} className="site-mobile-link">
                  {content.nav.contact}
                </a>
                <Link to="/kreislauf-demo" onClick={() => setMobileNavOpen(false)} className="site-mobile-demo-link">
                  <CirclePlay className="h-4 w-4" aria-hidden="true" />
                  {content.nav.cycle}
                </Link>
                <Link to="/erfolge" onClick={() => setMobileNavOpen(false)} className="site-mobile-link">
                  {content.nav.traction}
                </Link>
                {mobileLanguageControl}
              </nav>
            ) : null}
          </header>

          <div className="landing-hero-content relative z-10 mx-auto flex min-h-[calc(96svh-92px)] w-full max-w-7xl px-5 sm:px-8">
            <div className="landing-hero-layout flex w-full flex-col justify-end pb-5 pt-[36svh] sm:pb-8 sm:pt-[40svh] lg:pb-10 lg:pt-[42svh]">
              <div className="landing-hero-statement max-w-[36rem]">
                {content.hero.eyebrow ? (
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-800/72">
                    {content.hero.eyebrow}
                  </p>
                ) : null}
                <h1 className="landing-hero-title max-w-[40rem] font-display text-[2.45rem] font-semibold leading-[1.02] text-emerald-950 [text-shadow:0_2px_24px_rgba(255,255,255,.92)] sm:text-5xl lg:text-[3rem]">
                  {content.hero.title}
                  {content.hero.titleAccent ? (
                    <>
                      {" "}
                      <span className="text-emerald-700">{content.hero.titleAccent}</span>
                    </>
                  ) : null}
                </h1>
                <div className="landing-hero-value mt-3 max-w-[34rem]">
                  <p className="landing-hero-copy text-sm leading-6 text-emerald-950/72 [text-shadow:0_1px_16px_rgba(255,255,255,.88)] md:text-base md:leading-7">
                    {content.hero.text}
                  </p>
                  <div className="landing-hero-actions mt-4 flex flex-row flex-wrap items-center gap-2 sm:gap-3">
                    <a
                      href="#problem-story"
                      onClick={(event) => handleSectionLink(event, "problem-story", 520)}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-emerald-900 px-4 text-sm font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5"
                    >
                      {content.nav.problem}
                      <ArrowRight className="h-4 w-4" />
                    </a>
                    <a
                      href="#product-story"
                      onClick={(event) => handleSectionLink(event, "product-story", 620)}
                      className="inline-flex h-10 items-center justify-center gap-2 px-2 text-sm font-semibold text-emerald-950/72 transition-colors hover:text-emerald-950"
                    >
                      {content.nav.product}
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="landing-hero-footer mt-4 flex justify-end">
                <a
                  href="#problem-story"
                  onClick={(event) => handleSectionLink(event, "problem-story", 520)}
                  aria-label={heroScrollLabels[language]}
                  className="landing-hero-scroll group inline-flex shrink-0 items-center gap-3 self-end text-emerald-950/64 transition-colors hover:text-emerald-950 sm:pb-0.5"
                >
                  <span className="landing-hero-scroll-label text-[10px] font-semibold uppercase tracking-[0.2em]">
                    {heroScrollLabels[language]}
                  </span>
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-emerald-950/22 bg-white/44 shadow-card backdrop-blur-md transition-colors group-hover:bg-white/74">
                    <ArrowDown className="landing-hero-scroll-arrow h-4 w-4" />
                  </span>
                </a>
              </div>
            </div>
          </div>
        </WaterfallToPCBHero>
      ) : (
        <section className={`site-subpage-header-shell relative z-30 ${showCycle ? "is-light" : "is-dark"}`}>
          <header className="site-subpage-header relative z-10 mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between px-5 py-6 sm:px-8 sm:pr-32">
            <Link to="/" className="flex items-center gap-3">
              <span className="site-header-logo flex h-11 w-11 items-center justify-center overflow-hidden rounded-full shadow-elegant">
                <img src="/logo1-web.webp" alt="Leaftronics Logo" className="h-full w-full object-cover" />
              </span>
              <span className="font-display text-base font-semibold uppercase tracking-[0.22em]">Leaftronics</span>
            </Link>
            <nav className={`site-header-nav hidden items-center gap-1 p-1 text-sm font-semibold shadow-elegant backdrop-blur-md lg:flex ${showCycle ? "is-light" : "is-dark"}`} aria-label={primaryNavigationLabel}>
              <Link to="/problem" aria-current={showProblem ? "page" : undefined} className={`site-header-link ${showProblem ? "is-active" : ""}`}>
                {content.nav.problem}
              </Link>
              <Link to="/produkt" aria-current={showProduct ? "page" : undefined} className={`site-header-link ${showProduct ? "is-active" : ""}`}>
                {content.nav.product}
              </Link>
              <a href="/#pilot-project" className="site-header-link">
                {content.nav.contact}
              </a>
              <Link to="/kreislauf-demo" aria-current={showCycle ? "page" : undefined} className={`site-header-demo-link ${showCycle ? "is-active" : ""}`}>
                <CirclePlay className="h-4 w-4" aria-hidden="true" />
                {content.nav.cycle}
              </Link>
              <Link to="/erfolge" aria-current={showTraction ? "page" : undefined} className={`site-header-link ${showTraction ? "is-active" : ""}`}>
                {content.nav.traction}
              </Link>
            </nav>
            <button
              type="button"
              onClick={() => setMobileNavOpen((open) => !open)}
              aria-label={t.menu}
              aria-controls="landing-mobile-navigation"
              aria-expanded={mobileNavOpen}
              className="site-header-menu-button inline-flex h-10 w-10 items-center justify-center backdrop-blur lg:hidden"
            >
              {mobileNavOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </button>
            {mobileNavOpen ? (
              <nav
                id="landing-mobile-navigation"
                className={`site-mobile-navigation mt-3 w-full p-2 text-sm font-semibold shadow-elegant backdrop-blur-xl lg:hidden ${showCycle ? "is-light" : "is-dark"}`}
                aria-label={primaryNavigationLabel}
              >
                <Link to="/problem" aria-current={showProblem ? "page" : undefined} onClick={() => setMobileNavOpen(false)} className={`site-mobile-link ${showProblem ? "is-active" : ""}`}>
                  {content.nav.problem}
                </Link>
                <Link to="/produkt" aria-current={showProduct ? "page" : undefined} onClick={() => setMobileNavOpen(false)} className={`site-mobile-link ${showProduct ? "is-active" : ""}`}>
                  {content.nav.product}
                </Link>
                <a href="/#pilot-project" onClick={() => setMobileNavOpen(false)} className="site-mobile-link">
                  {content.nav.contact}
                </a>
                <Link to="/kreislauf-demo" aria-current={showCycle ? "page" : undefined} onClick={() => setMobileNavOpen(false)} className={`site-mobile-demo-link ${showCycle ? "is-active" : ""}`}>
                  <CirclePlay className="h-4 w-4" aria-hidden="true" />
                  {content.nav.cycle}
                </Link>
                <Link to="/erfolge" aria-current={showTraction ? "page" : undefined} onClick={() => setMobileNavOpen(false)} className={`site-mobile-link ${showTraction ? "is-active" : ""}`}>
                  {content.nav.traction}
                </Link>
                {mobileLanguageControl}
              </nav>
            ) : null}
          </header>
        </section>
      )}

      {false ? (
        <section className="cycle-page-intro" aria-labelledby="cycle-page-title">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-12 sm:px-8 md:py-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)] lg:items-end lg:gap-16">
            <div className="max-w-3xl">
              <p className="cycle-page-eyebrow">
                <CirclePlay className="h-4 w-4" aria-hidden="true" />
                {cyclePageCopy[language].eyebrow}
              </p>
              <h1 id="cycle-page-title" className="mt-4 font-display text-5xl font-semibold leading-none text-emerald-950 sm:text-6xl">
                {cyclePageCopy[language].title}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-emerald-950/68 md:text-lg md:leading-8">
                {cyclePageCopy[language].text}
              </p>
            </div>
            <nav className="cycle-page-navigation" aria-label={cyclePageCopy[language].navigationLabel}>
              <Link to="/produkt" className="cycle-page-navigation-link">
                <span>01</span>
                {cyclePageCopy[language].productLink}
              </Link>
              <a href="#solution" className="cycle-page-navigation-link is-current">
                <span>02</span>
                {cyclePageCopy[language].flowLink}
              </a>
              <a href="#demos" className="cycle-page-navigation-link">
                <span>03</span>
                {cyclePageCopy[language].demosLink}
              </a>
            </nav>
          </div>
        </section>
      ) : null}

      {showHero ? (
        <>
          <ScrollPCBStory language={language} problem={content.problem} />
          <ProofOfProgress language={language} />
        </>
      ) : null}

      {showProblem ? (
      <section id="problem" className="relative isolate overflow-hidden bg-black py-24 text-background md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,hsl(150_80%_35%/.18),transparent_32%),radial-gradient(circle_at_80%_80%,hsl(40_90%_45%/.14),transparent_30%)]" />
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[0.46fr_0.54fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary">{content.problem.eyebrow}</p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-6xl">{content.problem.title}</h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-background/72">{content.problem.text}</p>
            <Link
              to="/produkt"
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-md bg-background px-5 font-semibold text-foreground shadow-elegant transition-transform hover:-translate-y-0.5"
            >
              {content.problem.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
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
      ) : null}

      {showProduct ? <ProductTechnologyPage language={language} /> : null}

      {showProduct || showCycle ? (
      <section
        id="solution"
        className={
          showCycle
            ? "cycle-prototype-section relative isolate scroll-mt-8 overflow-hidden pb-0 pt-8 text-foreground md:pb-0 md:pt-12"
            : "scroll-mt-8 bg-[hsl(42_31%_91%)] pb-16 pt-20 text-foreground md:pb-24 md:pt-24"
        }
      >
        {showCycle ? <div className="cycle-prototype-section-grid pointer-events-none absolute inset-0 -z-10" aria-hidden="true" /> : null}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8">
          <div
            className={
              showCycle
                ? "mb-1 grid gap-7 py-4 sm:py-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)] lg:items-end lg:gap-16"
                : "mb-2 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)] lg:items-end lg:gap-16"
            }
          >
            <div className="max-w-4xl">
              {!showCycle ? (
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                  {content.solution.eyebrow}
                </p>
              ) : null}
              <h2
                className={
                  showCycle
                    ? "mt-4 max-w-4xl font-display text-[2.45rem] font-semibold leading-[1.02] text-emerald-950 [text-shadow:0_2px_24px_rgba(255,255,255,.92)] sm:text-5xl lg:text-[3rem]"
                    : "mt-4 max-w-4xl font-display text-4xl font-semibold leading-[1.08] md:text-5xl"
                }
              >
                {content.solution.title}
              </h2>
            </div>
            {showCycle ? (
              <div className="max-w-xl border-l border-emerald-800/38 pl-4 sm:pl-5">
                <p className="text-sm leading-6 text-emerald-950/72 [text-shadow:0_1px_16px_rgba(255,255,255,.88)] md:text-base md:leading-7">
                  {content.solution.text}
                </p>
              </div>
            ) : (
              <p className="max-w-xl text-base leading-7 text-muted-foreground md:text-lg md:leading-8">{content.solution.text}</p>
            )}
            {showProduct ? <InfoPanel content={content} activeNode={activeNode} /> : null}
          </div>

          {showCycle ? (
            <CyclePrototypeMap
              content={content}
              activePoint={activePoint}
              setActivePoint={setActivePoint}
              chooseRole={chooseRole}
              jumpTo={jumpTo}
            />
          ) : null}

          {showProduct ? (
            <div className="mt-6 grid gap-3 md:grid-cols-5">
              {content.solution.values.map((item) => (
                <div key={item.role} className="rounded-lg border border-border bg-background/80 p-4 shadow-card">
                  <p className="font-display text-lg font-semibold">{item.role}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>
      ) : null}

      {showCycle ? (
      <section id="demos" className="cycle-demo-section pb-20 pt-8 text-foreground md:pb-28 md:pt-12">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[minmax(15rem,0.3fr)_minmax(0,0.7fr)] lg:items-start lg:gap-14">
          {(() => {
            const demoRole = demoRoleOrder.includes(activeRole) ? activeRole : "customer";
            const Icon = roleIcons[demoRole];
            const card = content.roles.cards[demoRole];
            const surface = content.demos.surfaces[demoRole];
            return (
              <>
                <aside className="cycle-demo-overview min-w-0 pr-1 lg:sticky lg:top-8 lg:pr-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{content.demos.eyebrow}</p>
                  <div className="mt-5 flex min-w-0 items-center gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center border border-primary/20 bg-primary/8 text-primary">
                      <Icon className="h-6 w-6" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="break-words font-display text-2xl font-semibold leading-tight md:text-3xl">{card.title}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">{surface.subtitle}</p>
                    </div>
                  </div>

                  <div className="mt-7 border-y border-primary/16 py-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">{content.demos.problemLabel}</p>
                    <p className="mt-2 text-sm leading-6 text-foreground/72">{card.problem}</p>
                    <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">{content.demos.valueLabel}</p>
                    <p className="mt-2 text-sm leading-6 text-foreground/78">{card.value}</p>
                  </div>

                  <div className="cycle-demo-role-tabs mt-6" role="tablist" aria-label={content.demos.eyebrow}>
                    {demoRoleOrder.map((role) => {
                      const RoleIcon = roleIcons[role];
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => chooseRole(role)}
                          role="tab"
                          aria-selected={role === demoRole}
                          className={`cycle-demo-role-tab ${
                            role === demoRole
                              ? "is-active"
                              : ""
                          }`}
                        >
                          <RoleIcon className="h-4 w-4" />
                          {content.roles.cards[role].title}
                        </button>
                      );
                    })}
                  </div>
                </aside>

                <section className="min-w-0">
                  {demoRole === "customer" ? (
                    <CustomerReturnDemo content={content} language={language} reference={reference} />
                  ) : demoRole === "smelter" ? (
                    <SmelterDashboard content={content} surface={surface} reference={reference} language={language} />
                  ) : (
                    <DemoSurface content={content} surface={surface} reference={reference} role={demoRole} language={language} />
                  )}
                </section>
              </>
            );
          })()}
        </div>
      </section>
      ) : null}

      {showTraction ? (
      <TractionTimeline content={content.traction} />
      ) : null}

      {showContact ? (
        <PilotProjectSection
          activeRole={activeRole}
          chooseRole={chooseRole}
          confirmation={
            confirmation
              ? {
                  title: content.form.successTitle,
                  text: content.form.successText(confirmation.id, content.roles.cards[confirmation.role].title),
                }
              : null
          }
          copy={content.form}
          defaultProduct={activeRole === "customer" ? DEMO_SERIAL : ""}
          isSubmitting={isSubmitting}
          language={language}
          onSubmit={submit}
          roleTitles={{
            oem: content.roles.cards.oem.title,
            customer: content.roles.cards.customer.title,
            recycler: content.roles.cards.recycler.title,
            smelter: content.roles.cards.smelter.title,
            partner: content.roles.cards.partner.title,
          }}
        />
      ) : null}
      <Footer />
    </div>
  );
};

const tractionEventRank = (event: LandingCopy["traction"]["events"][number]) => {
  const key = `${event.href} ${event.title}`;
  if (key.includes("dresden-exists")) return 20260619;
  if (key.includes("excitelab")) return 20260401;
  if (key.includes("richard-hartmann")) return 20260223;
  if (key.includes("joachim-herz")) return 20250930;
  if (key.includes("exist-gruendungsstipendium")) return 20250301;
  if (key.includes("emanuel-goldberg")) return 20250101;
  return 0;
};

const TractionTimeline = ({ content }: { content: LandingCopy["traction"] }) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lineProgress, setLineProgress] = useState(0);

  const events = useMemo(
    () => [...content.events].sort((a, b) => tractionEventRank(b) - tractionEventRank(a)),
    [content.events],
  );

  useEffect(() => {
    let frame = 0;

    const updateTimeline = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const section = sectionRef.current;
        if (!section) return;

        const rect = section.getBoundingClientRect();
        const progressDistance = Math.max(1, rect.height - window.innerHeight * 0.38);
        setLineProgress(clamp01((window.innerHeight * 0.58 - rect.top) / progressDistance));

        const viewportFocus = window.innerHeight * 0.48;
        let closestIndex = 0;
        let closestDistance = Number.POSITIVE_INFINITY;

        itemRefs.current.forEach((item, index) => {
          if (!item) return;
          const itemRect = item.getBoundingClientRect();
          const itemCenter = itemRect.top + itemRect.height * 0.42;
          const distance = Math.abs(itemCenter - viewportFocus);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });

        setActiveIndex(closestIndex);
      });
    };

    updateTimeline();
    window.addEventListener("scroll", updateTimeline, { passive: true });
    window.addEventListener("resize", updateTimeline);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateTimeline);
      window.removeEventListener("resize", updateTimeline);
    };
  }, [events.length]);

  return (
    <section
      id="traction"
      ref={sectionRef}
      className="traction-timeline-section"
      style={{ "--timeline-progress": lineProgress } as CSSProperties}
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="traction-timeline-intro">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{content.eyebrow}</p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-6xl">{content.title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">{content.text}</p>
        </div>

        <div className="traction-timeline">
          <div className="traction-timeline-line" aria-hidden="true">
            <span />
          </div>
          <div className="traction-timeline-list">
            {events.map((item, index) => {
              const stateClass = index === activeIndex ? "is-active" : index < activeIndex ? "is-past" : "is-future";
              return (
                <article
                  key={`${item.date}-${item.title}`}
                  ref={(node) => {
                    itemRefs.current[index] = node;
                  }}
                  className={`traction-timeline-item ${stateClass}`}
                >
                  <div className="traction-timeline-date" aria-hidden="true">
                    <span>{item.date}</span>
                  </div>
                  <span className="traction-timeline-dot" aria-hidden="true" />
                  <div className="traction-timeline-card">
                    {item.image ? (
                      <img src={item.image} alt={item.imageAlt} className="traction-timeline-image" loading="lazy" />
                    ) : null}
                    <div className="traction-timeline-card-body">
                      <p className="traction-timeline-mobile-date">{item.date}</p>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                      <a href={item.href} target="_blank" rel="noreferrer">
                        {item.link}
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

type ProductTechnologyContent = {
  heroEyebrow: string;
  heroTitle: string;
  heroText: string;
  heroPrimary: string;
  heroSecondary: string;
  heroImageAlt: string;
  details: string;
  proofEyebrow: string;
  proofTitle: string;
  finalEyebrow: string;
  finalTitle: string;
  finalText: string;
  finalCta: string;
  steps: Array<{ index: string; section: string; title: string; text: string }>;
  proofImages: Array<{ src: string; title: string; text: string }>;
  materialStreams: Array<{ label: string; className: string }>;
};

const productTechnologyCopy: Record<Language, ProductTechnologyContent> = {
  de: {
    heroEyebrow: "Leaftronics Technologie",
    heroTitle: "Die Leiterplatte, die sich am Ende wieder trennen lässt.",
    heroText: "Leaftronics denkt das Substrat neu: stabil während der Nutzung, kontrolliert lösbar am Ende des Produktlebens.",
    heroPrimary: "Technologie ansehen",
    heroSecondary: "Pilotprojekt anfragen",
    heroImageAlt: "Leaftronics Leiterplattenprototyp in einem Laborhandschuh",
    details: "Details anzeigen",
    proofEyebrow: "Prozessnachweis",
    proofTitle: "Die Materiallogik wird im Labor sichtbar.",
    finalEyebrow: "Eine neue Materiallogik für Elektronik",
    finalTitle: "Klassische Funktion. Kontrollierbares Ende.",
    finalText: "Eine klassische Leiterplatte ist schwer zu trennen, weil Substrat, Metalle und Bauteile fest verbunden bleiben. Leaftronics verändert das Trägermaterial so, dass Nutzung und Rückgewinnung zusammen gedacht werden.",
    finalCta: "Pilotprojekt anfragen",
    steps: [
      { index: "01", section: "Von Glasfaser zum technischen Substrat", title: "Das Trägermaterial neu gedacht.", text: "Eine Glasfaserstruktur mit einem besonderen Harz bildet die Basis. Sie bleibt leicht und stabil." },
      { index: "02", section: "Von Glasfaser zum technischen Substrat", title: "Ein stabiles Substrat für elektronische Anwendungen.", text: "Das besondere Harz stabilisiert die Glasfaserstruktur während der Nutzung." },
      { index: "03", section: "Stabil genug für Elektronik", title: "Leiterbahnen, Lötstellen und elektrische Funktion bleiben erhalten.", text: "Kupferne Leiterbahnen werden präzise aufgebracht. Die elektrische Funktion bleibt klassischer PCB-Logik nahe, während das Substrat neu gedacht ist." },
      { index: "04", section: "Stabil genug für Elektronik", title: "Stabil während Herstellung und Nutzung.", text: "Chips, Widerstände, Kondensatoren und Kontakte sitzen auf der Platte. Das Modul wirkt wie echte, funktionsfähige Elektronik." },
      { index: "05", section: "Designed for Disassembly", title: "Für moderne Elektronik entwickelt.", text: "Im Produkt bleibt die Leiterplatte belastbar. Energie- und Datenlinien zeigen: Die neue Materiallogik ersetzt nicht Funktion, sondern ermöglicht ihren Kreislauf." },
      { index: "06", section: "Designed for Disassembly", title: "Am Lebensende gezielt lösbar.", text: "In einer kontrollierten Lösung gibt das Substrat nach. Bauteile und Metalle bleiben erhalten, statt im Verbund untrennbar verloren zu gehen." },
      { index: "07", section: "Wertstoffe zurück in den Kreislauf", title: "Wertstoffe werden sortenreiner zurückgewonnen.", text: "Bauteile, Kupfer, Edelmetalle und Substrat trennen sich in erkennbare Materialströme. Genau hier entsteht der Unterschied zur klassischen Leiterplatte." },
      { index: "08", section: "Eine neue Materiallogik für Elektronik", title: "Elektronik für die Kreislaufwirtschaft.", text: "Metalle gehen zurück in die Produktion, Bauteile können geprüft werden, das Substrat wird abgebaut. Der Kreislauf wird zur Designentscheidung." },
    ],
    proofImages: [
      { src: "/leaftronics-pcb-prototype.jpg", title: "Funktionsfähiger PCB-Prototyp", text: "Die Technologie bleibt anschlussfähig an reale Elektronik und bestehende Fertigungslogik." },
      { src: "/leaftronics-lab-beaker.jpg", title: "Kontrollierte Lösung", text: "Die Trennung passiert nicht zufällig, sondern in einer steuerbaren Recyclingumgebung." },
      { src: "/leaftronics-separated-components.jpg", title: "Sortenreinere Rückgewinnung", text: "Bauteile und Materialfraktionen werden sichtbar getrennt und können gezielter bewertet werden." },
    ],
    materialStreams: [
      { label: "Bauteile", className: "product-stream product-stream-1" },
      { label: "Kupfer", className: "product-stream product-stream-2" },
      { label: "Edelmetalle", className: "product-stream product-stream-3" },
      { label: "Substrat", className: "product-stream product-stream-4" },
    ],
  },
  en: {
    heroEyebrow: "Leaftronics technology",
    heroTitle: "The circuit board designed to come apart at the end.",
    heroText: "Leaftronics rethinks the substrate: stable in use and controllably separable at the end of the product life cycle.",
    heroPrimary: "Explore the technology",
    heroSecondary: "Request a pilot project",
    heroImageAlt: "Leaftronics circuit board prototype held in a laboratory glove",
    details: "Show details",
    proofEyebrow: "Proof of process",
    proofTitle: "The material logic becomes visible in the lab.",
    finalEyebrow: "A new material logic for electronics",
    finalTitle: "Classic function. A controllable end.",
    finalText: "A conventional circuit board is difficult to separate because the substrate, metals and components remain permanently bonded. Leaftronics changes the carrier material so use and recovery can be designed together.",
    finalCta: "Request a pilot project",
    steps: [
      { index: "01", section: "From glass fiber to technical substrate", title: "Rethinking the carrier material.", text: "A glass-fiber structure with a specially engineered resin forms the basis. It remains lightweight and stable instead of disappearing into an anonymous black board." },
      { index: "02", section: "From glass fiber to technical substrate", title: "A stable substrate for electronic applications.", text: "The special resin stabilizes the glass-fiber structure during use. At end of life, it dissolves in a controlled process and releases the circuit-board structure for recovery." },
      { index: "03", section: "Stable enough for electronics", title: "Traces, solder joints and electrical function remain intact.", text: "Copper traces are applied precisely. Electrical function stays close to conventional PCB logic while the substrate is redesigned." },
      { index: "04", section: "Stable enough for electronics", title: "Stable through manufacturing and use.", text: "Chips, resistors, capacitors and contacts sit on the board. The module behaves like real, functional electronics." },
      { index: "05", section: "Designed for disassembly", title: "Built for modern electronics.", text: "The circuit board remains robust inside the product. Power and data lines show that the new material logic preserves function while enabling circularity." },
      { index: "06", section: "Designed for disassembly", title: "Deliberately separable at end of life.", text: "In a controlled solution, the substrate releases. Components and metals remain intact instead of becoming inseparably trapped in the composite." },
      { index: "07", section: "Returning valuable materials to the loop", title: "Valuable materials are recovered in cleaner fractions.", text: "Components, copper, precious metals and substrate separate into recognizable material streams. This is where the design differs from a conventional circuit board." },
      { index: "08", section: "A new material logic for electronics", title: "Electronics for the circular economy.", text: "Metals return to production, components can be tested and the substrate is broken down. Circularity becomes a design decision." },
    ],
    proofImages: [
      { src: "/leaftronics-pcb-prototype.jpg", title: "Functional PCB prototype", text: "The technology remains compatible with real electronics and established manufacturing processes." },
      { src: "/leaftronics-lab-beaker.jpg", title: "Controlled solution", text: "Separation does not happen by chance, but in a controlled recycling environment." },
      { src: "/leaftronics-separated-components.jpg", title: "Cleaner material recovery", text: "Components and material fractions are visibly separated and can be evaluated more precisely." },
    ],
    materialStreams: [
      { label: "Components", className: "product-stream product-stream-1" },
      { label: "Copper", className: "product-stream product-stream-2" },
      { label: "Precious metals", className: "product-stream product-stream-3" },
      { label: "Substrate", className: "product-stream product-stream-4" },
    ],
  },
  zh: {
    heroEyebrow: "Leaftronics 技术",
    heroTitle: "一块在寿命终点可以重新分离的电路板。",
    heroText: "Leaftronics 重新设计基材：使用期间稳定，产品寿命结束时可受控分离。",
    heroPrimary: "查看技术",
    heroSecondary: "申请试点项目",
    heroImageAlt: "实验室手套中拿着的 Leaftronics 电路板原型",
    details: "查看详情",
    proofEyebrow: "流程验证",
    proofTitle: "材料逻辑在实验室中清晰可见。",
    finalEyebrow: "电子产品的新材料逻辑",
    finalTitle: "传统功能，可控的终点。",
    finalText: "传统电路板难以分离，因为基材、金属和元器件始终牢固结合。Leaftronics 改变载体材料，让使用与回收从设计阶段就被共同考虑。",
    finalCta: "申请试点项目",
    steps: [
      { index: "01", section: "从玻璃纤维到技术基材", title: "重新思考载体材料。", text: "由特殊树脂稳定的玻璃纤维结构构成基础。它轻盈而稳定。" },
      { index: "02", section: "从玻璃纤维到技术基材", title: "适用于电子应用的稳定基材。", text: "特殊树脂在使用期间稳定玻璃纤维结构。" },
      { index: "03", section: "足够稳定，可用于电子产品", title: "线路、焊点和电气功能保持完整。", text: "铜线路被精确施加。电气功能接近传统 PCB 逻辑，同时基材得到重新设计。" },
      { index: "04", section: "足够稳定，可用于电子产品", title: "在制造和使用期间保持稳定。", text: "芯片、电阻、电容和触点安装在板上，模块具备真实、可运行的电子功能。" },
      { index: "05", section: "为拆解而设计", title: "为现代电子产品而开发。", text: "电路板在产品内部保持可靠。电源和数据线路表明，新材料逻辑保留功能并支持循环利用。" },
      { index: "06", section: "为拆解而设计", title: "在寿命终点可有针对性地分离。", text: "在受控溶液中，基材会释放。元器件和金属得以保留，不再不可分离地困在复合结构中。" },
      { index: "07", section: "让高价值材料回到循环", title: "以更纯净的材料组分进行回收。", text: "元器件、铜、贵金属和基材分离成清晰可辨的材料流，这正是它与传统电路板的区别。" },
      { index: "08", section: "电子产品的新材料逻辑", title: "面向循环经济的电子产品。", text: "金属回到生产，元器件可以被检测，基材得到分解。循环利用成为设计决策。" },
    ],
    proofImages: [
      { src: "/leaftronics-pcb-prototype.jpg", title: "可运行的 PCB 原型", text: "该技术能够兼容真实电子产品和现有制造流程。" },
      { src: "/leaftronics-lab-beaker.jpg", title: "受控溶液", text: "分离并非偶然发生，而是在可控的回收环境中进行。" },
      { src: "/leaftronics-separated-components.jpg", title: "更纯净的材料回收", text: "元器件和材料组分被清晰分开，可以进行更有针对性的评估。" },
    ],
    materialStreams: [
      { label: "元器件", className: "product-stream product-stream-1" },
      { label: "铜", className: "product-stream product-stream-2" },
      { label: "贵金属", className: "product-stream product-stream-3" },
      { label: "基材", className: "product-stream product-stream-4" },
    ],
  },
};

const boardTraceClasses = [
  "product-trace product-trace-1",
  "product-trace product-trace-2",
  "product-trace product-trace-3",
  "product-trace product-trace-4",
  "product-trace product-trace-5",
  "product-trace product-trace-6",
  "product-trace product-trace-7",
  "product-trace product-trace-8",
  "product-trace product-trace-9",
  "product-trace product-trace-10",
  "product-trace product-trace-11",
  "product-trace product-trace-12",
  "product-trace product-trace-13",
  "product-trace product-trace-14",
  "product-trace product-trace-15",
  "product-trace product-trace-16",
  "product-trace product-trace-17",
  "product-trace product-trace-18",
];

const boardComponentClasses = [
  "product-component product-component-1",
  "product-component product-component-2",
  "product-component product-component-3",
  "product-component product-component-4",
  "product-component product-component-5",
  "product-component product-component-6",
  "product-component product-component-7",
  "product-component product-component-8",
  "product-component product-component-9",
  "product-component product-component-10",
  "product-component product-component-11",
  "product-component product-component-12",
];

const boardFragmentClasses = [
  "product-fragment product-fragment-1",
  "product-fragment product-fragment-2",
  "product-fragment product-fragment-3",
  "product-fragment product-fragment-4",
  "product-fragment product-fragment-5",
  "product-fragment product-fragment-6",
  "product-fragment product-fragment-7",
  "product-fragment product-fragment-8",
  "product-fragment product-fragment-9",
  "product-fragment product-fragment-10",
  "product-fragment product-fragment-11",
  "product-fragment product-fragment-12",
];

const boardVias = [
  ["7%", "12%"], ["12%", "18%"], ["17%", "14%"], ["24%", "18%"], ["30%", "13%"], ["36%", "18%"], ["43%", "14%"], ["50%", "18%"],
  ["57%", "14%"], ["64%", "18%"], ["71%", "14%"], ["80%", "18%"], ["88%", "13%"], ["93%", "20%"], ["9%", "33%"], ["15%", "39%"],
  ["24%", "36%"], ["32%", "43%"], ["40%", "38%"], ["49%", "44%"], ["58%", "39%"], ["68%", "45%"], ["78%", "38%"], ["88%", "43%"],
  ["11%", "58%"], ["18%", "66%"], ["27%", "61%"], ["36%", "68%"], ["45%", "62%"], ["54%", "69%"], ["64%", "63%"], ["74%", "69%"],
  ["84%", "62%"], ["92%", "70%"], ["8%", "84%"], ["16%", "79%"], ["28%", "85%"], ["40%", "80%"], ["53%", "85%"], ["66%", "80%"],
  ["78%", "86%"], ["90%", "80%"],
];

const boardMounts = [
  ["7%", "9%"], ["92%", "10%"], ["7%", "88%"], ["92%", "88%"],
];

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const progressBetween = (value: number, start: number, end: number) => clamp01((value - start) / (end - start));

const ProductTechnologyPage = ({ language }: { language: Language }) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);
  const technology = productTechnologyCopy[language];

  useEffect(() => {
    const updateProgress = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const scrollable = Math.max(1, section.offsetHeight - window.innerHeight);
      setProgress(clamp01(-rect.top / scrollable));
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  const activeIndex = Math.min(technology.steps.length - 1, Math.floor(progress * technology.steps.length));

  return (
    <main className="bg-[hsl(42_38%_94%)] text-foreground">
      <section className="relative isolate overflow-hidden bg-[hsl(156_34%_9%)] text-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,hsl(150_68%_32%/.28),transparent_34%),radial-gradient(circle_at_86%_18%,hsl(31_92%_55%/.16),transparent_28%),linear-gradient(180deg,hsl(156_34%_9%),hsl(150_26%_13%))]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[hsl(42_38%_94%)]" />
        <div className="relative mx-auto grid min-h-[calc(100vh-92px)] w-full max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[0.45fr_0.55fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-background/60">{technology.heroEyebrow}</p>
            <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.02] md:text-7xl">
              {technology.heroTitle}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-background/72 md:text-lg">
              {technology.heroText}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#technology-scroll"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-background px-5 text-sm font-semibold text-foreground shadow-elegant transition-transform hover:-translate-y-0.5"
              >
                {technology.heroPrimary}
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/#forms"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-background/20 bg-background/8 px-5 text-sm font-semibold text-background backdrop-blur transition-transform hover:-translate-y-0.5"
              >
                {technology.heroSecondary}
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div className="product-hero-visual">
            <figure className="product-reference-photo">
              <img src="/leaftronics-hand-pcb.png" alt={technology.heroImageAlt} />
            </figure>
            <ProductPcbScene progress={0.5} activeIndex={3} language={language} hero />
          </div>
        </div>
      </section>

      <section id="technology-scroll" ref={sectionRef} className="relative mx-auto grid w-full max-w-[92rem] gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,0.36fr)_minmax(0,0.64fr)] lg:gap-12 lg:py-24">
        <div className="grid min-w-0 gap-8 lg:pb-[34vh]">
          {technology.steps.map((step, index) => {
            const active = index === activeIndex;
            return (
              <article
                key={step.index}
                className={`min-h-[34vh] rounded-lg border p-5 transition-all duration-500 md:min-h-[52vh] md:p-6 ${
                  active
                    ? "border-primary/25 bg-background/86 shadow-elegant"
                    : "border-transparent bg-transparent opacity-55"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">{step.section}</p>
                <div className="mt-6 flex items-start gap-4">
                  <span className="font-mono text-xs font-semibold text-muted-foreground">{step.index}</span>
                  <div>
                    <h2 className="font-display text-3xl font-semibold leading-tight md:text-5xl">{step.title}</h2>
                    <p className="mt-5 hidden max-w-xl text-base leading-8 text-muted-foreground md:block">{step.text}</p>
                    <details className="mt-4 rounded-md border border-primary/15 bg-background/70 p-3 md:hidden" open={active}>
                      <summary className="cursor-pointer text-sm font-semibold text-primary">{technology.details}</summary>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">{step.text}</p>
                    </details>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="min-w-0 lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)]">
          <ProductPcbScene progress={progress} activeIndex={activeIndex} language={language} />
        </div>
      </section>

      <section className="bg-[hsl(156_28%_12%)] py-20 text-background md:py-28">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-glow">{technology.proofEyebrow}</p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-6xl">
              {technology.proofTitle}
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {technology.proofImages.map((item) => (
              <article key={item.src} className="overflow-hidden rounded-lg border border-background/12 bg-background/6 shadow-elegant">
                <img src={item.src} alt={item.title} className="h-72 w-full object-cover" loading="lazy" />
                <div className="p-5">
                  <h3 className="font-display text-2xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-background/70">{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[hsl(42_38%_94%)] py-20 md:py-28">
        <div className="mx-auto grid w-full max-w-7xl items-end gap-8 px-5 sm:px-8 lg:grid-cols-[0.65fr_0.35fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{technology.finalEyebrow}</p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-6xl">
              {technology.finalTitle}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
              {technology.finalText}
            </p>
          </div>
          <a
            href="/#forms"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:-translate-y-0.5"
          >
            {technology.finalCta}
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </main>
  );
};

const ProductPcbScene = ({
  progress,
  activeIndex,
  language,
  hero = false,
}: {
  progress: number;
  activeIndex: number;
  language: Language;
  hero?: boolean;
}) => {
  const technology = productTechnologyCopy[language];
  const polymer = hero ? 1 : progressBetween(progress, 0.1, 0.22);
  const traces = hero ? 1 : progressBetween(progress, 0.23, 0.36);
  const components = hero ? 1 : progressBetween(progress, 0.36, 0.5);
  const product = hero ? 0.36 : progressBetween(progress, 0.48, 0.62);
  const solution = hero ? 0 : progressBetween(progress, 0.62, 0.76);
  const release = hero ? 0 : progressBetween(progress, 0.66, 0.84);
  const substrateDissolve = hero ? 0 : progressBetween(progress, 0.7, 0.92);
  const copperRelease = hero ? 0 : progressBetween(progress, 0.7, 0.9);
  const streams = hero ? 0 : progressBetween(progress, 0.74, 0.9);
  const loop = hero ? 0 : progressBetween(progress, 0.86, 1);
  const tilt = hero ? 58 : 62 - progress * 24;
  const rotate = hero ? -13 : -16 + progress * 24;
  const sink = solution * 44;
  const componentOpacity = components * (hero ? 1 : 1 - release * 0.18);
  const substrateOpacity = hero ? 0.95 : 0.95 - substrateDissolve * 0.66;
  const polymerOpacity = polymer * (hero ? 1 : 1 - substrateDissolve * 0.82);
  const detailOpacity = traces * (hero ? 1 : 1 - substrateDissolve * 0.44);
  const traceOpacity = traces * (hero ? 1 : 1 - copperRelease * 0.08);

  return (
    <div className={`product-scene-shell ${hero ? "min-h-[440px]" : "min-h-[540px] lg:h-full"}`}>
      <div className="product-scene-grid" />
      <div className="product-stage-label">
        <span>{technology.steps[activeIndex]?.index ?? "01"}</span>
        <span>{technology.steps[activeIndex]?.section ?? "Leaftronics"}</span>
      </div>

      <div className="product-housing" style={{ opacity: product, transform: `translate(-50%, -50%) scale(${0.82 + product * 0.1})` }} />
      <div className="product-solution-vessel" style={{ opacity: solution }}>
        <div className="product-liquid" />
      </div>

      <div className="product-pcb-viewport">
        <div
          className="product-pcb-assembly"
          style={{
            transform: `translate3d(-50%, calc(-50% + ${sink}px), 0) rotateX(${tilt}deg) rotateZ(${rotate}deg)`,
            "--substrate-dissolve": substrateDissolve,
            "--copper-release": copperRelease,
            "--component-release": release,
          } as CSSProperties}
        >
          <div className="product-pcb-shadow" />
          <div className="product-layer product-fiber-layer" style={{ opacity: substrateOpacity }} />
          <div className="product-layer product-polymer-layer" style={{ opacity: polymerOpacity }} />
          <div className="product-substrate-fragments" style={{ opacity: substrateDissolve }}>
            {boardFragmentClasses.map((className) => (
              <span key={className} className={className} />
            ))}
          </div>
          <div className="product-board-detail-layer" style={{ opacity: detailOpacity }}>
            <div className="product-silk product-silk-brand">LEAFTRONICS</div>
            <div className="product-silk product-silk-io">DIGITAL I/O</div>
            <div className="product-silk product-silk-power">POWER</div>
            <div className="product-header product-header-top" />
            <div className="product-header product-header-bottom" />
            <div className="product-usb-port" />
            <div className="product-power-jack" />
            {boardMounts.map(([left, top]) => (
              <span key={`${left}-${top}`} className="product-mount-hole" style={{ left, top }} />
            ))}
            {boardVias.map(([left, top]) => (
              <span key={`${left}-${top}`} className="product-via" style={{ left, top }} />
            ))}
          </div>
          <div className="product-trace-layer" style={{ opacity: traceOpacity }}>
            {boardTraceClasses.map((className) => (
              <span key={className} className={className} />
            ))}
          </div>
          <div
            className="product-component-layer"
            style={{
              opacity: componentOpacity,
              transform: `translateZ(${18 + components * 16}px)`,
              "--component-release": release,
            } as CSSProperties}
          >
            {boardComponentClasses.map((className) => (
              <span key={className} className={className} />
            ))}
          </div>
        </div>
      </div>

      <div className="product-energy-lines" style={{ opacity: product }}>
        <span />
        <span />
        <span />
      </div>

      <div className="product-material-streams" style={{ opacity: streams }}>
        {technology.materialStreams.map((stream) => (
          <span key={stream.label} className={stream.className}>
            {stream.label}
          </span>
        ))}
      </div>

      <div className="product-loop-ring" style={{ opacity: loop, transform: `translate(-50%, -50%) scale(${0.86 + loop * 0.18})` }} />
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
  const [hoveredPoint, setHoveredPoint] = useState<GraphPoint | null>(null);
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
    smelter: "smelter",
  };
  const mutedPoints = new Set<GraphPoint>(["disassembly", "materials"]);

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
      id: "consulting-oem-sell",
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
      path: "M674 378 C718 378 762 378 806 378",
      label: content.solution.flow.pcb,
      labelX: 724,
      labelY: 354,
      duration: 7.6,
      delay: 1.3,
      tone: "product",
    },
    {
      id: "consulting-smelter-solution",
      from: "consulting",
      to: "smelter",
      path: "M674 414 C718 414 762 414 806 414",
      label: content.solution.flow.sellSolution,
      labelX: 686,
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
      setActivePoint(point);
      jumpTo("demos");
      return;
    }
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
            const hasDemo = Boolean(pointToRole[point]);
            const isMuted = mutedPoints.has(point);
            const tooltipStyle: CSSProperties = point === "materials"
              ? { bottom: "calc(100% + 0.75rem)", left: 0 }
              : point === "smelter" || point === "disassembly"
                ? { top: "calc(100% + 0.75rem)", right: 0 }
                : { top: "calc(100% + 0.75rem)", left: 0 };
            return (
              <button
                key={point}
                type="button"
                data-graph-point={point}
                onMouseEnter={() => {
                  setActivePoint(point);
                  setHoveredPoint(point);
                }}
                onMouseLeave={() => setHoveredPoint(null)}
                onFocus={() => {
                  setActivePoint(point);
                  setHoveredPoint(point);
                }}
                onBlur={() => setHoveredPoint(null)}
                onClick={() => handleNode(point)}
                aria-pressed={activePoint === point}
                className={`group absolute z-30 flex min-h-[126px] flex-col rounded-lg border p-4 text-left shadow-card transition-all hover:z-40 hover:-translate-y-1 ${
                  activePoint === point
                    ? isMuted
                      ? "border-primary bg-stone-100/95 ring-2 ring-primary/20"
                      : "border-primary bg-background/95 ring-2 ring-primary/20"
                    : isMuted
                      ? "border-stone-200 bg-stone-100/90 text-foreground/72"
                      : "border-border bg-background/95"
                } ${hasDemo ? "cursor-pointer" : "cursor-default"}`}
                style={{ left: position.x, top: position.y, width: position.width ?? 160, height: position.height }}
              >
                <span className="flex items-start justify-between gap-3">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    isMuted ? "bg-stone-200 text-foreground/55" : "bg-primary/10 text-primary"
                  }`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                    isMuted ? "bg-stone-200/80 text-foreground/48" : "bg-muted text-muted-foreground"
                  }`}>
                    {node.label}
                  </span>
                </span>
                <span className="mt-4 block font-display text-lg font-semibold leading-tight">{node.title}</span>
                <span className="mt-2 block text-xs leading-5 text-muted-foreground">{node.next}</span>
                <span
                  className={`pointer-events-none absolute z-50 w-72 rounded-lg border border-primary/20 bg-background/95 p-4 text-left shadow-elegant backdrop-blur group-hover:block group-focus:block ${
                    hoveredPoint === point ? "block" : "hidden"
                  }`}
                  style={tooltipStyle}
                >
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                    {content.solution.hoverLabel}
                  </span>
                  <span className="mt-2 block font-display text-xl font-semibold text-foreground">{node.title}</span>
                  <span className="mt-2 block text-xs font-semibold leading-5 text-primary/80">{node.problem}</span>
                  <span className="mt-2 block text-xs leading-5 text-muted-foreground">{node.solution}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-2 lg:hidden">
        {graphOrder.map((point, index) => {
          const Icon = graphIcons[point];
          const node = content.solution.nodes[point];
          const isMuted = mutedPoints.has(point);
          return (
            <button
              key={point}
              type="button"
              onClick={() => handleNode(point)}
              className={`relative flex items-start gap-3 rounded-lg border p-4 text-left shadow-card ${
                activePoint === point
                  ? "border-primary bg-background ring-2 ring-primary/20"
                  : isMuted
                    ? "border-stone-200 bg-stone-100/90"
                    : "border-border bg-background"
                }`}
              >
              {index < graphOrder.length - 1 ? <span aria-hidden className="absolute left-8 top-14 h-[calc(100%+8px)] w-px bg-primary/18" /> : null}
              <span className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                isMuted ? "bg-stone-200 text-foreground/55" : "bg-primary/10 text-primary"
              }`}>
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

const demoInterfaceLabels: Record<
  Language,
  {
    active: string;
    activeCase: string;
    completed: string;
    current: string;
    nextAction: string;
    owner: string;
    process: string;
    updated: string;
    updatedValue: string;
  }
> = {
  de: {
    active: "Aktiv",
    activeCase: "Aktiver Vorgang",
    completed: "Erledigt",
    current: "In Bearbeitung",
    nextAction: "Nächste Aktion",
    owner: "Verantwortlich",
    process: "Prozessstatus",
    updated: "Aktualisiert",
    updatedValue: "vor 4 Min.",
  },
  en: {
    active: "Active",
    activeCase: "Active case",
    completed: "Completed",
    current: "In progress",
    nextAction: "Next action",
    owner: "Owner",
    process: "Process status",
    updated: "Updated",
    updatedValue: "4 min ago",
  },
  zh: {
    active: "进行中",
    activeCase: "当前流程",
    completed: "已完成",
    current: "处理中",
    nextAction: "下一步",
    owner: "负责人",
    process: "流程状态",
    updated: "更新时间",
    updatedValue: "4 分钟前",
  },
};

const roleCaseMeta: Record<RoleId, { id: string; owner: string }> = {
  oem: { id: "RET-2048", owner: "OEM Circular Ops" },
  customer: { id: "KB-DD-0001", owner: "Return Service" },
  recycler: { id: "DIS-0718", owner: "Separation Cell 02" },
  smelter: { id: "LT-0726-18", owner: "Material Intake" },
  partner: { id: "RTG-0314", owner: "Leaftronics Ops" },
};

const DemoWindow = ({
  content,
  reference,
  icon,
  title,
  subtitle,
  children,
}: {
  content: LandingCopy;
  reference: string;
  icon: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
}) => (
  <div className="cycle-demo-window">
      <div className="cycle-demo-window-bar">
        <p className="min-w-0 break-words font-mono text-[11px] font-semibold uppercase text-muted-foreground">
          {content.form.demoId} <span className="text-foreground/70">{reference}</span>
        </p>
        <span className="inline-flex h-8 shrink-0 items-center gap-2 border border-primary/20 bg-primary/8 px-3 text-xs font-semibold text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
          {icon}
          {content.demos.liveLabel}
        </span>
      </div>

      <div className="cycle-demo-window-heading">
        <h3 className="font-display text-[1.75rem] font-semibold leading-tight md:text-3xl">{title}</h3>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{subtitle}</p>
      </div>

      <div className="cycle-demo-window-content">
        {children}
      </div>
  </div>
);

export const DemoSurface = ({
  content,
  surface,
  reference,
  role,
  language,
}: {
  content: LandingCopy;
  surface: LandingCopy["demos"]["surfaces"][RoleId];
  reference: string;
  role: RoleId;
  language: Language;
}) => {
  const labels = demoInterfaceLabels[language];
  const caseMeta = roleCaseMeta[role];

  return (
    <DemoWindow content={content} reference={reference} icon={<BarChart3 className="h-4 w-4" />} title={surface.title} subtitle={surface.subtitle}>
      <div className="cycle-demo-metric-strip">
        {surface.metrics.map((metric) => (
          <div key={metric.label} className="cycle-demo-metric">
            <p>{metric.label}</p>
            <strong>{metric.value}</strong>
          </div>
        ))}
      </div>

      <div className="cycle-demo-workspace">
        <section className="cycle-demo-process" aria-label={labels.process}>
          <div className="cycle-demo-subheading">
            <span>{labels.process}</span>
            <span className="cycle-demo-status-dot">{labels.active}</span>
          </div>
          <div className="mt-1">
            {surface.steps.map((step, index) => {
              const isCurrent = index === surface.steps.length - 1;
              return (
                <div key={step} className={`cycle-demo-process-row ${isCurrent ? "is-current" : "is-complete"}`}>
                  <span className="cycle-demo-process-index">{isCurrent ? index + 1 : <CheckCircle2 className="h-4 w-4" />}</span>
                  <span className="min-w-0 flex-1 text-sm font-semibold text-foreground/78">{step}</span>
                  <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                    {isCurrent ? labels.current : labels.completed}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="cycle-demo-case-summary">
          <div className="cycle-demo-subheading">
            <span>{labels.activeCase}</span>
            <span className="font-mono text-primary">{caseMeta.id}</span>
          </div>
          <dl className="mt-3 grid gap-3 text-sm">
            <div>
              <dt>{labels.owner}</dt>
              <dd>{caseMeta.owner}</dd>
            </div>
            <div>
              <dt>{labels.updated}</dt>
              <dd>{labels.updatedValue}</dd>
            </div>
            <div className="border-t border-primary/12 pt-3">
              <dt>{labels.nextAction}</dt>
              <dd className="text-primary">{surface.steps[surface.steps.length - 1]}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </DemoWindow>
  );
};

const smelterDeliveries = [
  {
    id: "LT-0726-18",
    date: "18.07.2026",
    source: "Leaftronics Dresden",
    tonnes: 38,
    status: "freigegeben",
    materials: [
      { label: "Kupfer", share: 41, tonnes: 15.6 },
      { label: "Substrat", share: 34, tonnes: 12.9 },
      { label: "Edelmetalle", share: 8, tonnes: 3.0 },
      { label: "Lötmetalle", share: 17, tonnes: 6.5 },
    ],
  },
  {
    id: "LT-0726-24",
    date: "24.07.2026",
    source: "OEM-Rückläufer Süd",
    tonnes: 31,
    status: "angemeldet",
    materials: [
      { label: "Kupfer", share: 38, tonnes: 11.8 },
      { label: "Substrat", share: 37, tonnes: 11.5 },
      { label: "Edelmetalle", share: 7, tonnes: 2.2 },
      { label: "Lötmetalle", share: 18, tonnes: 5.6 },
    ],
  },
  {
    id: "LT-0726-31",
    date: "31.07.2026",
    source: "Industriechargen Ost",
    tonnes: 24,
    status: "in Prüfung",
    materials: [
      { label: "Kupfer", share: 44, tonnes: 10.6 },
      { label: "Substrat", share: 31, tonnes: 7.4 },
      { label: "Edelmetalle", share: 9, tonnes: 2.2 },
      { label: "Lötmetalle", share: 16, tonnes: 3.8 },
    ],
  },
];

const recoveryMetalsByBatch: Record<string, Array<{ label: string; value: string; uplift: string }>> = {
  "LT-0726-18": [
    { label: "Gold", value: "4.8 kg", uplift: "+42%" },
    { label: "Silver", value: "38.4 kg", uplift: "+31%" },
    { label: "Tantalum", value: "1.6 kg", uplift: "+55%" },
    { label: "Gallium", value: "0.7 kg", uplift: "+28%" },
    { label: "Palladium", value: "2.1 kg", uplift: "+47%" },
  ],
  "LT-0726-24": [
    { label: "Gold", value: "3.6 kg", uplift: "+36%" },
    { label: "Silver", value: "29.1 kg", uplift: "+24%" },
    { label: "Tantalum", value: "1.2 kg", uplift: "+43%" },
    { label: "Gallium", value: "0.5 kg", uplift: "+21%" },
    { label: "Palladium", value: "1.6 kg", uplift: "+39%" },
  ],
  "LT-0726-31": [
    { label: "Gold", value: "3.1 kg", uplift: "+39%" },
    { label: "Silver", value: "24.6 kg", uplift: "+27%" },
    { label: "Tantalum", value: "1.0 kg", uplift: "+49%" },
    { label: "Gallium", value: "0.4 kg", uplift: "+22%" },
    { label: "Palladium", value: "1.3 kg", uplift: "+41%" },
  ],
};

const smelterInterfaceLabels: Record<
  Language,
  {
    batchPlan: string;
    materialMix: string;
    nextBatch: string;
    planned: string;
    registered: string;
    statuses: Record<string, string>;
    materials: Record<string, string>;
  }
> = {
  de: {
    batchPlan: "Lieferplan",
    materialMix: "Erwarteter Materialmix",
    nextBatch: "Nächste Charge",
    planned: "Lieferungen geplant",
    registered: "Angemeldete Menge",
    statuses: { freigegeben: "Freigegeben", angemeldet: "Angemeldet", "in Prüfung": "In Prüfung" },
    materials: { Kupfer: "Kupfer", Substrat: "Substrat", Edelmetalle: "Edelmetalle", Lötmetalle: "Lötmetalle" },
  },
  en: {
    batchPlan: "Delivery plan",
    materialMix: "Expected material mix",
    nextBatch: "Next batch",
    planned: "Planned deliveries",
    registered: "Registered volume",
    statuses: { freigegeben: "Approved", angemeldet: "Registered", "in Prüfung": "In review" },
    materials: { Kupfer: "Copper", Substrat: "Substrate", Edelmetalle: "Precious metals", Lötmetalle: "Solder metals" },
  },
  zh: {
    batchPlan: "交付计划",
    materialMix: "预计材料构成",
    nextBatch: "下一批次",
    planned: "计划交付",
    registered: "已登记数量",
    statuses: { freigegeben: "已批准", angemeldet: "已登记", "in Prüfung": "审核中" },
    materials: { Kupfer: "铜", Substrat: "基板", Edelmetalle: "贵金属", Lötmetalle: "焊料金属" },
  },
};

const recoveryDashboardCopy: Record<Language, { materials: string; comparison: string }> = {
  de: { materials: "Rueckgewinnbare kritische Materialien", comparison: "ueber gemischtem PCB-Eingang" },
  en: { materials: "Recoverable critical materials", comparison: "above mixed PCB intake" },
  zh: { materials: "可回收关键材料", comparison: "高于混合 PCB 输入" },
};

const customerBenefitCopy: Record<
  Language,
  { certificate: string; discount: string; discountRange: string; discountText: string; devices: string; certificateText: string }
> = {
  de: {
    certificate: "Leaftronics Certified",
    certificateText: "Noch 28 Geraete schalten ein CO2-Zertifikat fuer die externe Kommunikation frei.",
    devices: "Geraete",
    discount: "Rueckgabe-Rabatt",
    discountRange: "0,5 % bis 5 %",
    discountText: "5 Geraete zurueckgegeben. Der Rabatt steigt mit jeder bestaetigten Rueckgabe.",
  },
  en: {
    certificate: "Leaftronics Certified",
    certificateText: "28 more devices unlock a CO2 certificate for external communication.",
    devices: "devices",
    discount: "Return discount",
    discountRange: "0.5% to 5%",
    discountText: "5 devices returned. The discount rises with every confirmed return.",
  },
  zh: {
    certificate: "Leaftronics Certified",
    certificateText: "再回收 28 台设备即可获得可用于对外沟通的 CO2 证书。",
    devices: "台设备",
    discount: "回收折扣",
    discountRange: "0.5% 至 5%",
    discountText: "已回收 5 台设备。每次确认回收都会提高折扣。",
  },
};

const customerCatalogCopy: Record<
  Language,
  {
    materialContent: string;
    preciousMetals: string;
    pcb: string;
    copper: string;
    substrate: string;
    aluminium: string;
    refurbishment: Record<"refurbished" | "refurbishable" | "not_assessed", string>;
  }
> = {
  de: {
    materialContent: "Materialinhalt",
    preciousMetals: "Edelmetalle und kritische Rohstoffe",
    pcb: "Leiterplatte",
    copper: "Kupfer",
    substrate: "Glasfaser & Harz",
    aluminium: "Aluminium",
    refurbishment: {
      refurbished: "Bereits refurbished",
      refurbishable: "Fuer Refurbishment geeignet",
      not_assessed: "Refurbishment noch nicht bewertet",
    },
  },
  en: {
    materialContent: "Material content",
    preciousMetals: "Precious metals and critical materials",
    pcb: "Circuit board",
    copper: "Copper",
    substrate: "Glass fiber & resin",
    aluminium: "Aluminium",
    refurbishment: {
      refurbished: "Already refurbished",
      refurbishable: "Suitable for refurbishment",
      not_assessed: "Refurbishment not yet assessed",
    },
  },
  zh: {
    materialContent: "材料构成",
    preciousMetals: "贵金属与关键材料",
    pcb: "电路板",
    copper: "铜",
    substrate: "玻璃纤维与树脂",
    aluminium: "铝",
    refurbishment: {
      refurbished: "已翻新",
      refurbishable: "适合翻新",
      not_assessed: "尚未评估翻新状态",
    },
  },
};

const customerReturnTotalsCopy: Record<
  Language,
  {
    quantity: string;
    totalWeight: string;
    metalShare: string;
    copper: string;
    totalForReturn: string;
  }
> = {
  de: {
    quantity: "Rueckgabemenge",
    totalWeight: "Gesamtgewicht",
    metalShare: "Metallanteil",
    copper: "Kupfer",
    totalForReturn: "Gesamtmenge fuer diese Rueckgabe",
  },
  en: {
    quantity: "Return quantity",
    totalWeight: "Total weight",
    metalShare: "Metal share",
    copper: "Copper",
    totalForReturn: "Total for this return",
  },
  zh: {
    quantity: "回收数量",
    totalWeight: "总重量",
    metalShare: "金属占比",
    copper: "铜",
    totalForReturn: "本次回收总量",
  },
};

const customerBenefitProgressCopy: Record<
  Language,
  { returns: (count: number) => string; certificate: (remaining: number) => string }
> = {
  de: {
    returns: (count) => `${count} bestaetigte Rueckgaben im aktuellen Zeitraum.`,
    certificate: (remaining) => `Noch ${remaining} Geraete bis zu Leaftronics Certified.`,
  },
  en: {
    returns: (count) => `${count} confirmed returns in the current period.`,
    certificate: (remaining) => `${remaining} more devices until Leaftronics Certified.`,
  },
  zh: {
    returns: (count) => `当前周期内已确认 ${count} 台回收设备。`,
    certificate: (remaining) => `再回收 ${remaining} 台设备即可获得 Leaftronics Certified。`,
  },
};

export const SmelterDashboard = ({
  content,
  surface,
  reference,
  language,
}: {
  content: LandingCopy;
  surface: LandingCopy["demos"]["surfaces"][RoleId];
  reference: string;
  language: Language;
}) => {
  const labels = smelterInterfaceLabels[language];
  const recoveryCopy = recoveryDashboardCopy[language];

  return (
    <DemoWindow
      content={content}
      reference={reference}
      icon={<Flame className="h-4 w-4" />}
      title={surface.title}
      subtitle={surface.subtitle}
    >
      <div className="cycle-demo-metric-strip">
        <div className="cycle-demo-metric">
          <p>{labels.nextBatch}</p>
          <strong>{smelterDeliveries[0].tonnes} t</strong>
        </div>
        <div className="cycle-demo-metric">
          <p>{labels.registered}</p>
          <strong>93 t</strong>
        </div>
        <div className="cycle-demo-metric">
          <p>{labels.planned}</p>
          <strong>3</strong>
        </div>
      </div>

      <section className="cycle-smelter-plan" aria-label={labels.batchPlan}>
        <div className="cycle-demo-subheading">
          <span>{labels.batchPlan}</span>
          <span>{labels.materialMix}</span>
        </div>
        <div className="cycle-smelter-list">
          {smelterDeliveries.map((delivery) => (
            <article key={delivery.id} className="cycle-smelter-delivery">
              <header>
                <div className="min-w-0">
                  <p className="font-mono text-[10px] font-semibold uppercase text-primary">{delivery.id} · {delivery.date}</p>
                  <h4 className="mt-1 break-words font-display text-xl font-semibold leading-tight">{delivery.source}</h4>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-display text-3xl font-semibold leading-none text-primary">{delivery.tonnes} t</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase text-muted-foreground">{labels.statuses[delivery.status]}</p>
                </div>
              </header>
              <div className="cycle-material-mix">
                {delivery.materials.map((material) => (
                  <div key={material.label} className="cycle-material-row">
                    <span className="cycle-material-name">{labels.materials[material.label]}</span>
                    <span className="cycle-material-bar" aria-hidden="true">
                      <span style={{ width: `${material.share}%` }} />
                    </span>
                    <span className="cycle-material-share">{material.share}%</span>
                    <strong>{material.tonnes.toFixed(1)} t</strong>
                  </div>
                ))}
              </div>
              <div className="mt-5 border-t border-primary/12 pt-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{recoveryCopy.materials}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">{recoveryCopy.comparison}</p>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {recoveryMetalsByBatch[delivery.id].map((metal) => (
                    <div key={metal.label} className="min-w-0 border-l-2 border-primary/30 bg-primary/[0.045] px-2.5 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{metal.label}</p>
                      <p className="mt-1 font-display text-lg font-semibold leading-none text-foreground">{metal.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </DemoWindow>
  );
};

export const CustomerReturnDemo = ({ content, language, reference }: { content: LandingCopy; language: Language; reference: string }) => {
  const [serial, setSerial] = useState(DEMO_SERIAL);
  const [lookup, setLookup] = useState<SerialLookup | null>(SERIAL_DB[DEMO_SERIAL]);
  const [notFound, setNotFound] = useState(false);
  const [location, setLocation] = useState(SERIAL_DB[DEMO_SERIAL].city);
  const [detecting, setDetecting] = useState(false);
  const [returnQuantity, setReturnQuantity] = useState(SERIAL_DB[DEMO_SERIAL].catalogEntry?.returnQuantity ?? 1);
  const [discountPercent, setDiscountPercent] = useState(() => 0.5 + Math.floor(Math.random() * 10) * 0.5);
  const [certifiedDevices, setCertifiedDevices] = useState(() => 5 + Math.floor(Math.random() * 86));
  const copy = content.demos.customerLive;
  const benefitCopy = customerBenefitCopy[language];
  const catalogCopy = customerCatalogCopy[language];
  const totalsCopy = customerReturnTotalsCopy[language];
  const progressCopy = customerBenefitProgressCopy[language];
  const displayLocation = localizeCity(location, language);

  const checkSerial = (value = serial) => {
    const key = value.trim().toUpperCase();
    const result = SERIAL_DB[key];
    setLookup(result ?? null);
    setNotFound(!result && key.length > 0);
    if (result) {
      setLocation(result.city);
      setReturnQuantity(result.catalogEntry?.returnQuantity ?? 1);
    }
  };

  const detectLocation = () => {
    setDetecting(true);
    window.setTimeout(() => {
      const next = lookup?.city ?? "Dresden";
      setLocation(next);
      setDetecting(false);
      toast.success(copy.detected, { description: localizeCity(next, language) });
    }, 650);
  };

  const device = lookup ? localizeDevice(lookup.device, language) : null;
  const confirmedQuantity = Math.max(1, Math.min(99, Math.floor(returnQuantity) || 1));

  return (
    <DemoWindow content={content} reference={reference} icon={<QrCode className="h-4 w-4" />} title={copy.title} subtitle={copy.text}>
      <div className="cycle-customer-workspace">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            checkSerial();
          }}
          className="cycle-demo-panel"
        >
          <label className="grid gap-2 text-sm font-semibold">
            {copy.serialLabel}
            <input
              value={serial}
              onChange={(event) => {
                setSerial(event.target.value);
              }}
              placeholder={copy.serialPlaceholder}
              className="h-11 rounded-md border border-primary/18 bg-background px-3 font-mono text-sm text-foreground outline-none focus:border-primary"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              setSerial(DEMO_SERIAL);
              checkSerial(DEMO_SERIAL);
            }}
            className="mt-2 inline-flex text-sm font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {copy.useDemo}
          </button>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="submit" className="inline-flex h-10 items-center gap-2 rounded-md bg-foreground px-4 text-sm font-semibold text-background shadow-card">
              <SearchCheck className="h-4 w-4" />
              {copy.check}
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

          <div className="cycle-inline-data mt-4">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{copy.detected}</p>
            <p className="mt-1 font-display text-2xl font-semibold">{displayLocation}</p>
          </div>
        </form>

        <div className="grid min-w-0 gap-4">
          <div className="cycle-demo-panel">
            {lookup ? (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-primary">{lookup.serial}</p>
                    <h4 className="mt-2 font-display text-2xl font-semibold">{device}</h4>
                  </div>
                  <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">{lookup.postalCode}</span>
                </div>
                {lookup.catalogEntry ? (
                  <section className="mt-4 border-y border-primary/12 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{totalsCopy.totalForReturn}</p>
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
                        {catalogCopy.refurbishment[lookup.catalogEntry.refurbishmentStatus]}
                      </span>
                    </div>
                    <label className="mt-3 grid max-w-48 gap-1 text-xs font-semibold text-foreground/80">
                      {totalsCopy.quantity}
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={returnQuantity}
                        onChange={(event) => setReturnQuantity(Math.max(1, Math.min(99, Number(event.target.value) || 1)))}
                        className="h-10 rounded-md border border-primary/18 bg-background px-3 font-mono text-sm text-foreground outline-none focus:border-primary"
                      />
                    </label>
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {[
                        [totalsCopy.quantity, `${confirmedQuantity}`],
                        [totalsCopy.totalWeight, formatKilograms(lookup.catalogEntry.totalWeightKg * confirmedQuantity)],
                        [totalsCopy.metalShare, `${lookup.catalogEntry.metalSharePercent}%`],
                        [totalsCopy.copper, formatGrams(lookup.catalogEntry.metalsG.copper * confirmedQuantity)],
                      ].map(([label, value]) => (
                        <div key={label} className="min-w-0 border-l-2 border-primary/30 bg-primary/[0.045] px-2.5 py-2">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
                          <p className="mt-1 font-display text-base font-semibold leading-none text-foreground">{value}</p>
                        </div>
                      ))}
                    </div>
                    <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{catalogCopy.preciousMetals}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
                      {Object.entries(lookup.catalogEntry.metalsG)
                        .filter(([metal]) => metal !== "copper")
                        .map(([metal, value]) => (
                        <div key={metal} className="min-w-0 border-l-2 border-primary/30 bg-primary/[0.045] px-2.5 py-2">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{metal}</p>
                          <p className="mt-1 font-display text-base font-semibold leading-none text-foreground">{formatGrams(value * confirmedQuantity)}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}
                <p className="mt-4 text-sm font-semibold text-foreground/78">{copy.returnPoints}</p>
                <div className="mt-3 grid gap-2">
                  {lookup.partners.slice(0, 3).map((partner) => (
                    <div key={partner.id} className="cycle-demo-list-row">
                      <span>
                        <span className="block text-sm font-semibold">{partner.name}</span>
                        <span className="block text-xs text-muted-foreground">{partner.street}</span>
                      </span>
                      <span className="text-sm font-semibold text-primary">{partner.distanceKm.toFixed(1)} km</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-3 border-t border-primary/12 pt-4 sm:grid-cols-2">
                  <div className="rounded-md border border-primary/16 bg-primary/[0.05] p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{benefitCopy.discount}</p>
                    <div className="mt-2 flex items-end justify-between gap-3">
                      <strong className="font-display text-2xl text-primary">{discountPercent.toFixed(1)}%</strong>
                      <span className="text-xs text-muted-foreground">{benefitCopy.discountRange}</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-primary/10">
                      <span className="block h-full rounded-full bg-primary" style={{ width: `${(discountPercent / 5) * 100}%` }} />
                    </div>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">{progressCopy.returns(certifiedDevices)}</p>
                  </div>
                  <div className="rounded-md border border-primary/16 bg-primary/[0.05] p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{benefitCopy.certificate}</p>
                    <div className="mt-2 flex items-end justify-between gap-3">
                      <strong className="font-display text-2xl text-primary">{certifiedDevices} / 100</strong>
                      <span className="text-xs text-muted-foreground">{benefitCopy.devices}</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-primary/10">
                      <span className="block h-full rounded-full bg-primary" style={{ width: `${certifiedDevices}%` }} />
                    </div>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">{progressCopy.certificate(Math.max(0, 100 - certifiedDevices))}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCertifiedDevices((current) => Math.min(100, current + confirmedQuantity));
                    setDiscountPercent((current) => Math.min(5, Number((current + confirmedQuantity * 0.1).toFixed(1))));
                    toast.success(copy.confirm, { description: `${lookup.serial} · ${confirmedQuantity}` });
                  }}
                  className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {copy.confirm}
                </button>
              </>
            ) : notFound ? (
              <div className="rounded-md border border-background/12 bg-black/25 p-4 text-sm text-background/70">{copy.unknown}</div>
            ) : (
              <div className="rounded-md border border-background/12 bg-black/25 p-4 text-sm text-background/70">{copy.text}</div>
            )}
          </div>

          {false ? (
            <div className="cycle-demo-confirmation">
              <p className="text-sm font-semibold text-primary">{copy.discounts}</p>
              <div className="mt-3 grid gap-2">
                {copy.oemOffers.map((offer) => {
                  const percent = offer.offer.match(/\d+\s?%/)?.[0];
                  const remainder = percent ? offer.offer.replace(percent, "").trim() : offer.offer;
                  return (
                    <div key={offer.oem} className="border-t border-primary/12 py-3 first:border-t-0 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-display text-lg font-semibold">{offer.oem}</p>
                        <span className="rounded-full bg-primary/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                          OEM
                        </span>
                      </div>
                      {percent ? (
                        <div className="mt-2 flex items-end gap-2">
                          <p className="font-display text-5xl font-semibold leading-none text-primary">{percent}</p>
                          <p className="pb-1 text-sm font-semibold text-foreground/72">{remainder}</p>
                        </div>
                      ) : (
                        <p className="mt-2 font-display text-2xl font-semibold text-primary">{offer.offer}</p>
                      )}
                      <p className="mt-2 text-xs text-muted-foreground">{offer.condition}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </DemoWindow>
  );
};

function formatGrams(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 1 : 2)} kg`;
  }
  return `${value.toFixed(value < 1 ? 3 : 2).replace(/\.00$/, "")} g`;
}

function formatKilograms(value: number) {
  return value >= 1000 ? `${(value / 1000).toFixed(1)} t` : `${value.toFixed(value % 1 === 0 ? 0 : 1)} kg`;
}

function localizeCity(city: string, language: Language) {
  if (language === "en") {
    return city === "München" ? "Munich" : city === "Köln" ? "Cologne" : city;
  }
  if (language === "zh") {
    const labels: Record<string, string> = {
      Berlin: "柏林",
      Hamburg: "汉堡",
      München: "慕尼黑",
      Köln: "科隆",
      "Frankfurt am Main": "法兰克福",
      Stuttgart: "斯图加特",
      Leipzig: "莱比锡",
      Dresden: "德累斯顿",
    };
    return labels[city] ?? city;
  }
  return city;
}

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

export default Landing;
