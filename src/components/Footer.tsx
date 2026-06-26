import { useLanguage } from "@/lib/i18n";
import { Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer id="kontakt" className="border-t border-border bg-card">
      <div className="container grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-background ring-1 ring-border">
              <img src="/logo.png" alt="Kernbeisser Logo" className="h-full w-full object-cover" />
            </span>
            <span className="font-display text-lg font-semibold">
              Recycling<span className="text-primary">Angebote</span>
            </span>
          </div>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">{t.footerText}</p>
        </div>
        <div>
          <h4 className="font-semibold">{t.navContact}</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> hallo@recycling-angebote.de
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> +49 30 1234 5678
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> {t.berlinGermany}
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold">{t.legal}</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>{t.imprint}</li>
            <li>{t.privacy}</li>
            <li>{t.terms}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container flex flex-col items-center justify-between gap-2 py-4 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} Recycling Angebote. {t.rights}</p>
          <p>{t.madeIn}</p>
        </div>
      </div>
    </footer>
  );
}
