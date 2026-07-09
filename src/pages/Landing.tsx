import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, FormEvent, ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Factory,
  Flame,
  Globe2,
  Handshake,
  Leaf,
  PackageCheck,
  QrCode,
  Recycle,
  SearchCheck,
  UserRound,
  Wrench,
} from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Cycle3DMap } from "@/components/Cycle3DMap";
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
      traction: "Traction",
      cycle: "Praktischer Zyklus",
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
          { oem: "Leaftronics Network", offer: "CO2-Zertifikat + Einkaufsvorteil", condition: "für ESG-fähige Rückläufer" },
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
    traction: {
      eyebrow: "Traction",
      title: "Der Leaftronics-Lebenslauf.",
      text: "Die neuesten Meilensteine zuerst: Förderung, Accelerator, Auszeichnungen und Nominierungen als dynamischer Unternehmens- und Technologie-Lebenslauf.",
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
    nav: {
      problem: "Problem",
      process: "Process",
      product: "Our product",
      traction: "Traction",
      cycle: "Practical cycle",
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
          { oem: "Leaftronics Network", offer: "CO2 certificate + purchase benefit", condition: "for ESG-ready returns" },
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
    traction: {
      eyebrow: "Traction",
      title: "The Leaftronics track record.",
      text: "Latest milestones first: funding, accelerators, awards and nominations as a dynamic company and technology track record.",
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
    nav: {
      problem: "问题",
      process: "过程",
      product: "我们的产品",
      traction: "进展",
      cycle: "实用循环",
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
      title: "从产品回到材料。",
      text: "六个环节组成一个可控闭环：产品、电路板、数据和高价值材料始终可见，并有目的地回流至 OEM。",
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
          { oem: "Leaftronics Network", offer: "CO2 证书 + 采购优惠", condition: "适用于 ESG 可追踪退回" },
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
    traction: {
      eyebrow: "进展",
      title: "Leaftronics 发展路径。",
      text: "最新里程碑优先展示：资助、加速器、奖项和提名构成 Leaftronics 的企业与技术发展路径。",
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

const Landing = ({ page = "home" }: { page?: LandingPage }) => {
  const [activeRole, setActiveRole] = useState<RoleId>("oem");
  const [activePoint, setActivePoint] = useState<GraphPoint>("oem");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<{ id: string; role: RoleId } | null>(null);
  const { language, setLanguage } = useLanguage();
  const content = copy[language];

  const reference = useMemo(() => `KB-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 900))}`, []);
  const showHero = page === "home";
  const showProblem = page === "problem";
  const showProduct = page === "product";
  const showTraction = page === "traction";
  const showCycle = page === "cycle";
  const showContact = page === "home";

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

      <section className={showHero ? "relative isolate min-h-screen overflow-hidden" : "relative z-10 bg-black text-background"}>
        {showHero ? (
          <>
            <div className="absolute inset-0 grid md:grid-cols-2">
              <div className="relative min-h-full">
                <img src="/rainforest.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/18 to-black/8" />
              </div>
              <div className="relative hidden min-h-full md:block">
                <img src="/leaftronics-hero-pcb.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-l from-black/18 via-black/8 to-black/35" />
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/8 via-black/10 to-black/72" />
            <div className="absolute inset-y-0 left-1/2 hidden w-px bg-background/18 md:block" />
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-black" />
          </>
        ) : null}

        <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-6 sm:px-8 sm:pr-32">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-background shadow-elegant">
              <img src="/logo1.png" alt="Leaftronics Logo" className="h-full w-full object-cover" />
            </span>
            <span className="font-display text-base font-semibold uppercase tracking-[0.22em]">Leaftronics</span>
          </Link>
          <nav className="hidden items-center gap-1 rounded-lg border border-background/18 bg-black/54 p-1 text-sm font-semibold text-background/75 shadow-elegant backdrop-blur-md md:flex">
            <Link to="/problem" className="rounded-md px-3 py-2 transition-colors hover:bg-background/10 hover:text-background">
              {content.nav.problem}
            </Link>
            <Link to="/produkt" className="rounded-md px-3 py-2 transition-colors hover:bg-background/10 hover:text-background">
              {content.nav.product}
            </Link>
            <Link to="/traction" className="rounded-md px-3 py-2 transition-colors hover:bg-background/10 hover:text-background">
              {content.nav.traction}
            </Link>
            <Link to="/zyklus" className="rounded-md px-3 py-2 transition-colors hover:bg-background/10 hover:text-background">
              {content.nav.cycle}
            </Link>
            <a href="/#forms" className="rounded-md px-3 py-2 transition-colors hover:bg-background/10 hover:text-background">
              {content.nav.contact}
            </a>
          </nav>
        </header>

        {showHero ? (
        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-92px)] w-full max-w-7xl items-end px-5 pb-16 sm:px-8 lg:pb-24">
          <div className="w-full max-w-5xl rounded-lg border border-background/18 bg-black/54 p-4 shadow-elegant backdrop-blur-md sm:p-5 md:bg-black/48 lg:grid lg:grid-cols-[1.08fr_0.92fr] lg:items-end lg:gap-8">
            <div>
              {content.hero.eyebrow ? (
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-background/75">{content.hero.eyebrow}</p>
              ) : null}
              <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.04] text-background [text-shadow:0_2px_28px_hsl(0_0%_0%/.45)] md:text-5xl">
                {content.hero.title}
              </h1>
            </div>
            <div className="mt-4 lg:mt-0">
              <p className="max-w-xl text-base leading-7 text-background/82 [text-shadow:0_1px_18px_hsl(0_0%_0%/.35)]">
                {content.hero.text}
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/problem"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-background px-4 text-sm font-semibold text-foreground shadow-elegant transition-transform hover:-translate-y-0.5"
                >
                  {content.nav.problem}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/produkt"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-background/25 bg-background/10 px-4 text-sm font-semibold text-background backdrop-blur transition-transform hover:-translate-y-0.5"
                >
                  {content.nav.product}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
        ) : null}
      </section>

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

      {showProduct ? <ProductTechnologyPage /> : null}

      {showCycle ? (
      <section id="solution" className="scroll-mt-8 bg-[hsl(42_31%_91%)] pb-16 pt-20 text-foreground md:pb-24 md:pt-24">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
          <div className="mb-2 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)] lg:items-end lg:gap-16">
            <div className="max-w-4xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">{content.solution.eyebrow}</p>
              <h2 className="mt-4 max-w-4xl font-display text-4xl font-semibold leading-[1.08] md:text-5xl">
                {content.solution.title}
              </h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-muted-foreground md:text-lg md:leading-8">{content.solution.text}</p>
          </div>

          <Cycle3DMap
            content={content}
            activePoint={activePoint}
            setActivePoint={setActivePoint}
            chooseRole={chooseRole}
            jumpTo={jumpTo}
          />
        </div>
      </section>
      ) : null}

      {showCycle ? (
      <section id="demos" className="bg-[linear-gradient(90deg,hsl(45_52%_92%/.78)_1px,transparent_1px),linear-gradient(180deg,hsl(45_52%_92%/.78)_1px,transparent_1px),radial-gradient(circle_at_76%_20%,hsl(151_48%_82%/.72),transparent_32%),linear-gradient(120deg,hsl(43_53%_92%),hsl(47_48%_96%)_48%,hsl(155_38%_90%))] bg-[size:56px_56px,56px_56px,100%_100%,100%_100%] py-20 text-foreground md:py-28">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[minmax(0,34fr)_minmax(0,66fr)]">
          {(() => {
            const demoRole = demoRoleOrder.includes(activeRole) ? activeRole : "customer";
            const Icon = roleIcons[demoRole];
            const card = content.roles.cards[demoRole];
            const surface = content.demos.surfaces[demoRole];
            return (
              <>
                <aside>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{content.demos.eyebrow}</p>
                  <div className="mt-5 flex min-w-0 items-center gap-4">
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
                      <Icon className="h-7 w-7" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="break-words font-display text-4xl font-semibold leading-tight md:text-5xl lg:text-[2.65rem]">{card.title}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">{surface.subtitle}</p>
                    </div>
                  </div>
                  <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground">{content.demos.text}</p>

                  <div className="mt-6 rounded-lg border border-primary/20 bg-background/80 p-4 shadow-card backdrop-blur">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      {content.demos.problemLabel}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-foreground/75">{card.problem}</p>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                      {content.demos.valueLabel}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-foreground/75">{card.value}</p>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {demoRoleOrder.map((role) => {
                      const RoleIcon = roleIcons[role];
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => chooseRole(role)}
                          className={`inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-semibold transition-colors ${
                            role === demoRole
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-primary/20 bg-background/70 text-foreground/65 hover:text-foreground"
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
                    <SmelterDashboard content={content} surface={surface} reference={reference} />
                  ) : (
                    <DemoSurface content={content} surface={surface} reference={reference} />
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
      ) : null}
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
          <h2 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-6xl">{content.title}</h2>
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

const productStorySteps = [
  {
    index: "01",
    section: "Vom natürlichen Gerüst zum technischen Substrat",
    title: "Das Trägermaterial neu gedacht.",
    text: "Eine faserige, organische Struktur bildet die Basis. Sie bleibt sichtbar, leicht und materialbewusst statt als anonyme schwarze Trägerplatte zu verschwinden.",
  },
  {
    index: "02",
    section: "Vom natürlichen Gerüst zum technischen Substrat",
    title: "Ein stabiles Substrat für elektronische Anwendungen.",
    text: "Eine lösbare Polymermatrix stabilisiert das Gerüst mechanisch. Die Schicht macht aus dem Material eine belastbare Plattform für Elektronik.",
  },
  {
    index: "03",
    section: "Stabil genug für Elektronik",
    title: "Leiterbahnen, Lötstellen und elektrische Funktion bleiben erhalten.",
    text: "Kupferne Leiterbahnen werden präzise aufgebracht. Die elektrische Funktion bleibt klassischer PCB-Logik nahe, während das Substrat neu gedacht ist.",
  },
  {
    index: "04",
    section: "Stabil genug für Elektronik",
    title: "Stabil während Herstellung und Nutzung.",
    text: "Chips, Widerstände, Kondensatoren und Kontakte sitzen auf der Platte. Das Modul wirkt wie echte, funktionsfähige Elektronik.",
  },
  {
    index: "05",
    section: "Designed for Disassembly",
    title: "Für moderne Elektronik entwickelt.",
    text: "Im Produkt bleibt die Leiterplatte belastbar. Energie- und Datenlinien zeigen: Die neue Materiallogik ersetzt nicht Funktion, sondern ermöglicht ihren Kreislauf.",
  },
  {
    index: "06",
    section: "Designed for Disassembly",
    title: "Am Lebensende gezielt lösbar.",
    text: "In einer kontrollierten Lösung gibt das Substrat nach. Bauteile und Metalle bleiben erhalten, statt im Verbund untrennbar verloren zu gehen.",
  },
  {
    index: "07",
    section: "Wertstoffe zurück in den Kreislauf",
    title: "Wertstoffe werden sortenreiner zurückgewonnen.",
    text: "Bauteile, Kupfer, Edelmetalle und Substrat trennen sich in erkennbare Materialströme. Genau hier entsteht der Unterschied zur klassischen Leiterplatte.",
  },
  {
    index: "08",
    section: "Eine neue Materiallogik für Elektronik",
    title: "Elektronik für die Kreislaufwirtschaft.",
    text: "Metalle gehen zurück in die Produktion, Bauteile können geprüft werden, das Substrat wird abgebaut. Der Kreislauf wird zur Designentscheidung.",
  },
];

const proofImages = [
  {
    src: "/leaftronics-pcb-prototype.jpg",
    title: "Funktionsfähiger PCB-Prototyp",
    text: "Die Technologie bleibt anschlussfähig an reale Elektronik und bestehende Fertigungslogik.",
  },
  {
    src: "/leaftronics-lab-beaker.jpg",
    title: "Kontrollierte Lösung",
    text: "Die Trennung passiert nicht zufällig, sondern in einer steuerbaren Recyclingumgebung.",
  },
  {
    src: "/leaftronics-separated-components.jpg",
    title: "Sortenreinere Rückgewinnung",
    text: "Bauteile und Materialfraktionen werden sichtbar getrennt und können gezielter bewertet werden.",
  },
];

const materialStreamLabels = [
  { label: "Bauteile", className: "product-stream product-stream-1" },
  { label: "Kupfer", className: "product-stream product-stream-2" },
  { label: "Edelmetalle", className: "product-stream product-stream-3" },
  { label: "Substrat", className: "product-stream product-stream-4" },
];

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

const ProductTechnologyPage = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);

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

  const activeIndex = Math.min(productStorySteps.length - 1, Math.floor(progress * productStorySteps.length));

  return (
    <main className="bg-[hsl(42_38%_94%)] text-foreground">
      <section className="relative isolate overflow-hidden bg-[hsl(156_34%_9%)] text-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,hsl(150_68%_32%/.28),transparent_34%),radial-gradient(circle_at_86%_18%,hsl(31_92%_55%/.16),transparent_28%),linear-gradient(180deg,hsl(156_34%_9%),hsl(150_26%_13%))]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[hsl(42_38%_94%)]" />
        <div className="relative mx-auto grid min-h-[calc(100vh-92px)] w-full max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[0.45fr_0.55fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-background/60">Leaftronics Technologie</p>
            <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.02] md:text-7xl">
              Die Leiterplatte, die sich am Ende wieder trennen lässt.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-background/72 md:text-lg">
              Leaftronics denkt das Substrat neu: stabil während der Nutzung, kontrolliert lösbar am Ende des Produktlebens.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#technology-scroll"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-background px-5 text-sm font-semibold text-foreground shadow-elegant transition-transform hover:-translate-y-0.5"
              >
                Technologie ansehen
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/#forms"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-background/20 bg-background/8 px-5 text-sm font-semibold text-background backdrop-blur transition-transform hover:-translate-y-0.5"
              >
                Pilotprojekt anfragen
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div className="product-hero-visual">
            <figure className="product-reference-photo">
              <img src="/leaftronics-hand-pcb.png" alt="Leaftronics Leiterplattenprototyp in einem Laborhandschuh" />
            </figure>
            <ProductPcbScene progress={0.5} activeIndex={3} hero />
          </div>
        </div>
      </section>

      <section id="technology-scroll" ref={sectionRef} className="relative mx-auto grid w-full max-w-[92rem] gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,0.36fr)_minmax(0,0.64fr)] lg:gap-12 lg:py-24">
        <div className="grid min-w-0 gap-8 lg:pb-[34vh]">
          {productStorySteps.map((step, index) => {
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
                      <summary className="cursor-pointer text-sm font-semibold text-primary">Details anzeigen</summary>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">{step.text}</p>
                    </details>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="min-w-0 lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)]">
          <ProductPcbScene progress={progress} activeIndex={activeIndex} />
        </div>
      </section>

      <section className="bg-[hsl(156_28%_12%)] py-20 text-background md:py-28">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-glow">Proof of process</p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-6xl">
              Die Materiallogik wird im Labor sichtbar.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {proofImages.map((item) => (
              <article key={item.src} className="overflow-hidden rounded-lg border border-background/12 bg-background/6 shadow-elegant">
                <img src={item.src} alt="" className="h-72 w-full object-cover" loading="lazy" />
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
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Eine neue Materiallogik für Elektronik</p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-6xl">
              Klassische Funktion. Kontrollierbares Ende.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
              Eine klassische Leiterplatte ist schwer zu trennen, weil Substrat, Metalle und Bauteile fest verbunden bleiben. Leaftronics verändert das Trägermaterial so, dass Nutzung und Rückgewinnung zusammen gedacht werden.
            </p>
          </div>
          <a
            href="/#forms"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:-translate-y-0.5"
          >
            Pilotprojekt anfragen
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </main>
  );
};

const ProductPcbScene = ({ progress, activeIndex, hero = false }: { progress: number; activeIndex: number; hero?: boolean }) => {
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
        <span>{productStorySteps[activeIndex]?.index ?? "01"}</span>
        <span>{productStorySteps[activeIndex]?.section ?? "Leaftronics"}</span>
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
        {materialStreamLabels.map((stream) => (
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
  <div className="relative overflow-hidden rounded-lg border border-primary/25 bg-[linear-gradient(145deg,hsl(42_55%_98%),hsl(152_42%_92%)_48%,hsl(43_45%_96%))] p-1 shadow-[0_26px_70px_hsl(151_31%_34%/.22)]">
    <div className="absolute inset-x-8 top-0 h-px bg-primary/65" aria-hidden="true" />
    <div className="rounded-md border border-primary/14 bg-background/92 backdrop-blur-xl">
      <div className="flex flex-col gap-4 border-b border-primary/12 bg-[linear-gradient(90deg,hsl(45_55%_96%),hsl(153_42%_93%))] px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/90" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300/90" />
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          </span>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {content.form.demoId} {reference}
          </p>
        </div>
        <span className="inline-flex h-9 items-center gap-2 rounded-md border border-primary/25 bg-primary/10 px-3 text-sm font-semibold text-primary shadow-[0_10px_28px_hsl(151_40%_40%/.16)]">
          {icon}
          {content.demos.liveLabel}
        </span>
      </div>

      <div className="border-b border-primary/10 bg-[radial-gradient(circle_at_18%_0%,hsl(156_52%_82%/.72),transparent_38%)] px-5 py-5">
        <h3 className="font-display text-3xl font-semibold">{title}</h3>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{subtitle}</p>
      </div>

      <div className="bg-[linear-gradient(180deg,hsl(43_54%_97%/.96),hsl(154_32%_94%/.72))] p-5">
        {children}
      </div>
    </div>
  </div>
);

export const DemoSurface = ({ content, surface, reference }: { content: LandingCopy; surface: LandingCopy["demos"]["surfaces"][RoleId]; reference: string }) => (
  <DemoWindow content={content} reference={reference} icon={<BarChart3 className="h-4 w-4" />} title={surface.title} subtitle={surface.subtitle}>
    <div className="grid gap-3 md:grid-cols-3">
      {surface.metrics.map((metric) => (
        <div key={metric.label} className="rounded-md border border-primary/18 bg-background/82 p-4 shadow-[inset_0_1px_0_hsl(0_0%_100%/.72)]">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{metric.label}</p>
          <p className="mt-2 font-display text-3xl font-semibold">{metric.value}</p>
        </div>
      ))}
    </div>
    <div className="mt-5 grid gap-3">
      {surface.steps.map((step, index) => (
        <div key={step} className="flex items-center gap-3 rounded-md border border-primary/14 bg-background/76 px-4 py-3 shadow-[inset_0_1px_0_hsl(0_0%_100%/.65)]">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {index + 1}
          </span>
          <span className="text-sm font-medium text-foreground/78">{step}</span>
        </div>
      ))}
    </div>
  </DemoWindow>
);

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

export const SmelterDashboard = ({
  content,
  surface,
  reference,
}: {
  content: LandingCopy;
  surface: LandingCopy["demos"]["surfaces"][RoleId];
  reference: string;
}) => (
  <DemoWindow
    content={content}
    reference={reference}
    icon={<Flame className="h-4 w-4" />}
    title={surface.title}
    subtitle="Nächste Lieferungen, Materialanteile und Mengen im Überblick."
  >
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="min-w-0 rounded-md border border-primary/18 bg-background/86 p-4 shadow-[inset_0_1px_0_hsl(0_0%_100%/.72)]">
        <p className="text-xs uppercase leading-5 tracking-[0.18em] text-muted-foreground">nächste charge</p>
        <p className="mt-2 font-display text-3xl font-semibold leading-none">{smelterDeliveries[0].tonnes} t</p>
      </div>
      <div className="min-w-0 rounded-md border border-primary/18 bg-background/86 p-4 shadow-[inset_0_1px_0_hsl(0_0%_100%/.72)]">
        <p className="text-xs uppercase leading-5 tracking-[0.18em] text-muted-foreground">angemeldet</p>
        <p className="mt-2 font-display text-3xl font-semibold leading-none">93 t</p>
      </div>
      <div className="min-w-0 rounded-md border border-primary/18 bg-background/86 p-4 shadow-[inset_0_1px_0_hsl(0_0%_100%/.72)]">
        <p className="text-xs uppercase leading-5 tracking-[0.18em] text-muted-foreground">planung</p>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0">
          <p className="font-display text-3xl font-semibold leading-none">3</p>
          <p className="text-sm font-semibold leading-5 text-foreground/72">Lieferungen</p>
        </div>
      </div>
    </div>

    <div className="mt-5 grid gap-3">
      {smelterDeliveries.map((delivery) => (
        <div key={delivery.id} className="min-w-0 rounded-lg border border-primary/14 bg-background/88 p-4 shadow-[inset_0_1px_0_hsl(0_0%_100%/.65)]">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div className="min-w-0">
              <p className="break-words text-xs font-semibold uppercase leading-5 tracking-[0.18em] text-primary">{delivery.id} · {delivery.date}</p>
              <h4 className="mt-2 break-words font-display text-2xl font-semibold leading-tight">{delivery.source}</h4>
            </div>
            <div className="shrink-0 text-left sm:text-right">
              <p className="font-display text-4xl font-semibold text-primary">{delivery.tonnes} t</p>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{delivery.status}</p>
            </div>
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-4">
            {delivery.materials.map((material) => (
              <div key={material.label} className="flex min-w-0 flex-col rounded-md border border-primary/10 bg-primary/6 p-3">
                <p className="min-h-8 break-words text-[10px] font-semibold uppercase leading-4 tracking-[0.12em] text-muted-foreground">
                  {material.label}
                </p>
                <div className="mt-2 flex min-w-0 items-baseline justify-between gap-2">
                  <p className="shrink-0 whitespace-nowrap font-display text-2xl font-semibold leading-none">{material.tonnes.toFixed(1)} t</p>
                  <p className="shrink-0 text-xs font-semibold text-primary">{material.share}%</p>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-primary/10">
                  <span className="block h-full rounded-full bg-primary" style={{ width: `${material.share}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </DemoWindow>
);

export const CustomerReturnDemo = ({ content, language, reference }: { content: LandingCopy; language: Language; reference: string }) => {
  const [serial, setSerial] = useState(DEMO_SERIAL);
  const [lookup, setLookup] = useState<SerialLookup | null>(SERIAL_DB[DEMO_SERIAL]);
  const [notFound, setNotFound] = useState(false);
  const [location, setLocation] = useState(SERIAL_DB[DEMO_SERIAL].city);
  const [detecting, setDetecting] = useState(false);
  const [returnConfirmed, setReturnConfirmed] = useState(false);
  const copy = content.demos.customerLive;

  const checkSerial = (value = serial) => {
    const key = value.trim().toUpperCase();
    const result = SERIAL_DB[key];
    setLookup(result ?? null);
    setNotFound(!result && key.length > 0);
    setReturnConfirmed(false);
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
    <DemoWindow content={content} reference={reference} icon={<QrCode className="h-4 w-4" />} title={copy.title} subtitle={copy.text}>
      <div className="grid gap-4 lg:grid-cols-[0.45fr_0.55fr]">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            checkSerial();
          }}
          className="rounded-lg border border-primary/18 bg-background/82 p-4 shadow-[inset_0_1px_0_hsl(0_0%_100%/.72)]"
        >
          <label className="grid gap-2 text-sm font-semibold">
            {copy.serialLabel}
            <input
              value={serial}
              onChange={(event) => {
                setSerial(event.target.value);
                setReturnConfirmed(false);
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

          <div className="mt-4 rounded-md border border-primary/14 bg-primary/8 p-3">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{copy.detected}</p>
            <p className="mt-1 font-display text-2xl font-semibold">{location}</p>
          </div>
        </form>

        <div className="grid gap-4">
          <div className="rounded-lg border border-primary/14 bg-background/78 p-4 shadow-[inset_0_1px_0_hsl(0_0%_100%/.65)]">
            {lookup ? (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-primary">{lookup.serial}</p>
                    <h4 className="mt-2 font-display text-2xl font-semibold">{device}</h4>
                  </div>
                  <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">{lookup.postalCode}</span>
                </div>
                <p className="mt-4 text-sm font-semibold text-foreground/78">{copy.returnPoints}</p>
                <div className="mt-3 grid gap-2">
                  {lookup.partners.slice(0, 3).map((partner) => (
                    <div key={partner.id} className="flex items-center justify-between gap-3 rounded-md border border-primary/12 bg-primary/8 px-3 py-2">
                      <span>
                        <span className="block text-sm font-semibold">{partner.name}</span>
                        <span className="block text-xs text-muted-foreground">{partner.street}</span>
                      </span>
                      <span className="text-sm font-semibold text-primary">{partner.distanceKm.toFixed(1)} km</span>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setReturnConfirmed(true);
                    toast.success(copy.confirm, { description: lookup.serial });
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

          {returnConfirmed && lookup ? (
            <div className="rounded-lg border border-primary/18 bg-primary/10 p-4 shadow-[inset_0_1px_0_hsl(0_0%_100%/.45)]">
              <p className="text-sm font-semibold text-primary">{copy.discounts}</p>
              <div className="mt-3 grid gap-2">
                {copy.oemOffers.map((offer) => {
                  const percent = offer.offer.match(/\d+\s?%/)?.[0];
                  const remainder = percent ? offer.offer.replace(percent, "").trim() : offer.offer;
                  return (
                    <div key={offer.oem} className="rounded-md border border-primary/14 bg-background/90 p-3 shadow-sm">
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
