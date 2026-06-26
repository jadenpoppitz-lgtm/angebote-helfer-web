import { Recycle, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer id="kontakt" className="border-t border-border bg-card">
      <div className="container grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero text-primary-foreground">
              <Recycle className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-semibold">
              Recycling<span className="text-primary">Angebote</span>
            </span>
          </div>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            Die unabhängige Plattform für faire Recycling-Angebote in
            Deutschland. Verbinden Sie sich mit zertifizierten Entsorgern.
          </p>
        </div>
        <div>
          <h4 className="font-semibold">Kontakt</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> hallo@recycling-angebote.de
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> +49 30 1234 5678
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Berlin, Deutschland
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold">Rechtliches</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Impressum</li>
            <li>Datenschutz</li>
            <li>AGB</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container flex flex-col items-center justify-between gap-2 py-4 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} Recycling Angebote. Alle Rechte vorbehalten.</p>
          <p>Made with ♻ in Deutschland</p>
        </div>
      </div>
    </footer>
  );
}