import { useLanguage } from "@/lib/i18n";
import { Search, FileText, Truck, Wallet } from "lucide-react";

const ICONS = [Search, FileText, Truck, Wallet];

export function Process() {
  const { t } = useLanguage();

  return (
    <section id="ablauf" className="bg-muted/40 py-16">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            {t.processEyebrow}
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">
            {t.processTitle}
          </h2>
        </div>
        <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {t.processSteps.map(([title, desc], index) => {
            const Icon = ICONS[index];
            return (
              <li key={title} className="relative rounded-2xl border border-border bg-card p-6 shadow-card">
                <span className="absolute -top-3 left-6 rounded-full bg-gradient-hero px-3 py-1 text-xs font-semibold text-primary-foreground">
                  {t.step} {index + 1}
                </span>
                <Icon className="h-6 w-6 text-primary" />
                <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
