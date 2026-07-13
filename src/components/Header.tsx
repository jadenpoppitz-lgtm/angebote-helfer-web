import { Button } from "@/components/ui/button";
import { languages, useLanguage } from "@/lib/i18n";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

interface HeaderProps {
  onRequest: () => void;
}

export function Header({ onRequest }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const nav = [
    { href: "#kreislauf", label: t.producerNavLoop },
    { href: "#metalle", label: t.producerNavMetals },
    { href: "#vorteile", label: t.producerNavBenefits },
    { href: "#anfrage", label: t.producerNavRequest },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-background shadow-card ring-1 ring-border">
            <img src="/logo1-web.webp" alt="Leaftronics Logo" className="h-full w-full object-cover" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">Leaftronics</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
          <Link
            to="/angebote"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t.customerLink}
          </Link>
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <div className="flex rounded-md border border-border bg-muted/40 p-1" aria-label={t.language}>
            {languages.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => setLanguage(item.code)}
                aria-label={item.label}
                aria-pressed={language === item.code}
                className={`h-8 rounded px-2 text-xs font-medium transition-colors ${
                  language === item.code
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title={item.label}
              >
                {item.short}
              </button>
            ))}
          </div>
          <Button asChild size="lg" className="shadow-card" onClick={onRequest}>
            <a href="#anfrage">{t.closedLoopRequest}</a>
          </Button>
        </div>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label={t.menu}
          aria-controls="producer-mobile-navigation"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>
      {open && (
        <div id="producer-mobile-navigation" className="border-t border-border bg-background md:hidden">
          <div className="container flex flex-col gap-3 py-4">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-muted-foreground"
              >
                {item.label}
              </a>
            ))}
            <Link
              to="/angebote"
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-muted-foreground"
            >
              {t.customerLink}
            </Link>
            <div className="flex rounded-md border border-border bg-muted/40 p-1">
              {languages.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setLanguage(item.code)}
                  aria-label={item.label}
                  aria-pressed={language === item.code}
                  className={`h-8 flex-1 rounded px-2 text-xs font-medium ${
                    language === item.code
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <Button asChild className="mt-2" onClick={onRequest}>
              <a href="#anfrage" onClick={() => setOpen(false)}>
                {t.closedLoopRequest}
              </a>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
