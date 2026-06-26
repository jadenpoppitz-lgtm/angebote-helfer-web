import { Button } from "@/components/ui/button";
import { Recycle, Menu } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  onRequest: () => void;
}

const NAV = [
  { href: "#angebote", label: "Angebote" },
  { href: "#materialien", label: "Materialien" },
  { href: "#ablauf", label: "Ablauf" },
  { href: "#kontakt", label: "Kontakt" },
];

export function Header({ onRequest }: HeaderProps) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-6">
        <a href="#" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero text-primary-foreground shadow-card">
            <Recycle className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            Recycling<span className="text-primary">Angebote</span>
          </span>
        </a>
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
        </nav>
        <div className="hidden md:block">
          <Button onClick={onRequest} size="lg" className="shadow-card">
            Angebot anfragen
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
            <Button onClick={onRequest} className="mt-2">
              Angebot anfragen
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}