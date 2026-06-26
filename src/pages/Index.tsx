import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, MapPin, QrCode, Search, Leaf, Clock, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SERIAL_DB, DEMO_SERIAL, type SerialLookup } from "@/data/partners";

const Index = () => {
  const [params, setParams] = useSearchParams();
  const initial = params.get("serial") ?? "";
  const [input, setInput] = useState(initial);
  const [result, setResult] = useState<SerialLookup | null>(null);
  const [notFound, setNotFound] = useState(false);

  const lookup = (raw: string) => {
    const key = raw.trim().toUpperCase();
    const hit = SERIAL_DB[key];
    if (hit) {
      setResult(hit);
      setNotFound(false);
      setParams({ role: "kunde", serial: key }, { replace: true });
    } else {
      setResult(null);
      setNotFound(key.length > 0);
    }
  };

  useEffect(() => {
    if (initial) lookup(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookup(input);
  };

  const useDemo = () => {
    setInput(DEMO_SERIAL);
    lookup(DEMO_SERIAL);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-background">
              <Leaf className="h-4 w-4" />
            </span>
            <span className="font-display text-base font-semibold uppercase tracking-[0.2em]">
              Kernbeißer
            </span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück
          </Link>
        </div>
      </header>

      <main className="container max-w-3xl py-16 md:py-24">
        {/* Intro */}
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Rückgabe
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold md:text-5xl">
            Seriennummer prüfen
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground md:text-base">
            Scannen Sie den QR-Code auf Ihrer Leiterplatte oder Baugruppe oder
            geben Sie die Seriennummer ein. Wir zeigen Ihnen Rückgabestellen in
            Ihrer Stadt.
          </p>
        </div>

        {/* Input */}
        <form
          onSubmit={onSubmit}
          className="mx-auto mt-10 flex max-w-xl flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <QrCode className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-12 pl-10 text-base tracking-wider"
              placeholder="z. B. KB-DD-0001"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoFocus
            />
          </div>
          <Button type="submit" size="lg" className="h-12 px-6">
            <Search className="mr-2 h-4 w-4" />
            Prüfen
          </Button>
        </form>
        <div className="mx-auto mt-3 max-w-xl text-center">
          <button
            onClick={useDemo}
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Test-Seriennummer verwenden ({DEMO_SERIAL})
          </button>
        </div>

        {/* Not found */}
        {notFound && (
          <div className="mx-auto mt-10 max-w-xl rounded-lg border border-border bg-card p-6 text-center">
            <p className="font-medium">Seriennummer nicht erkannt</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Bitte prüfen Sie Ihre Eingabe oder verwenden Sie die
              Test-Seriennummer.
            </p>
          </div>
        )}

        {/* Result */}
        {result && (
          <section className="mt-14">
            {/* Device card */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Erkannt
                  </div>
                  <p className="mt-2 font-display text-xl font-semibold">
                    {result.device}
                  </p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {result.serial}
                  </p>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-1.5 text-sm font-medium">
                    <MapPin className="h-4 w-4 text-primary" />
                    {result.city}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    PLZ {result.postalCode}
                  </p>
                </div>
              </div>
            </div>

            {/* Partners */}
            <div className="mt-10">
              <h2 className="font-display text-xl font-semibold">
                Rückgabestellen in {result.city}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {result.partners.length} Partner in Ihrer Nähe nehmen
                Baugruppen &amp; Leiterplatten an und leiten sie sortenrein an
                unsere Recyclinganlagen weiter.
              </p>

              <ul className="mt-6 divide-y divide-border rounded-xl border border-border bg-card">
                {result.partners.map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{p.name}</span>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          {p.type}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {p.street}
                      </p>
                      <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {p.hours}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground sm:text-right">
                      <span className="font-medium text-foreground">
                        {p.distanceKm.toFixed(1)} km
                      </span>{" "}
                      entfernt
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Process */}
            <div className="mt-12 rounded-xl border border-border bg-muted/30 p-6">
              <h3 className="font-display text-base font-semibold">
                So geht es weiter
              </h3>
              <ol className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
                    1
                  </span>
                  <span className="text-muted-foreground">
                    Baugruppe bei einem Partner abgeben — kostenfrei, ohne
                    Termin.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
                    2
                  </span>
                  <span className="text-muted-foreground">
                    Partner sortiert Leiterplatten und übergibt sie sortenrein
                    an die Recyclinganlage.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
                    3
                  </span>
                  <span className="text-muted-foreground">
                    Edelmetalle fließen über uns zurück an den ursprünglichen
                    Hersteller.
                  </span>
                </li>
              </ol>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-border/60 py-8">
        <div className="container text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Kernbeißer · Prototyp
        </div>
      </footer>
    </div>
  );
};

export default Index;
