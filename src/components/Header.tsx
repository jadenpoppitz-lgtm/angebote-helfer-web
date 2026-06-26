import { Button } from "@/components/ui/button";
import { Recycle, Menu } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

interface HeaderProps {
  onRequest: () => void;
}

const NAV = [
  { href: "#kreislauf", label: "Kreislauf" },
  { href: "#metalle", label: "Metalle" },
  { href: "#vorteile", label: "Vorteile" },
  { href: "#anfrage", label: "Anfrage" },
];

export function Header({ onRequest }: HeaderProps) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero text-primary-foreground shadow-card">
            <Recycle className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            Kern<span className="text-primary">beißer</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {n.label}
            </a>
          ))}
          <Link
            to="/angebote"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Für Kunden
          </Link>
        </nav>
        <div className="hidden md:block">
          <Button asChild size="lg" className="shadow-card">
            <a href="#anfrage">Closed-Loop anfragen</a>
          </Button>
        </div>
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menü"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="container flex flex-col gap-3 py-4">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-muted-foreground"
              >
                {n.label}
              </a>
            ))}
            <Link
              to="/angebote"
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-muted-foreground"
            >
              Für Kunden
            </Link>
            <Button asChild className="mt-2">
              <a href="#anfrage" onClick={() => setOpen(false)}>Closed-Loop anfragen</a>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}