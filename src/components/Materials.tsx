import { MATERIALS } from "@/data/offers";
import { useLanguage } from "@/lib/i18n";
import { Cpu, Hammer, Newspaper, Package, Wine, TreePine, Battery } from "lucide-react";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Elektroschrott: Cpu,
  Metall: Hammer,
  Papier: Newspaper,
  Kunststoff: Package,
  Glas: Wine,
  Holz: TreePine,
  Batterien: Battery,
};

interface Props {
  onSelect: (material: string) => void;
}

export function Materials({ onSelect }: Props) {
  const { t, materialLabel } = useLanguage();

  return (
    <section id="materialien" className="container py-16">
      <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            {t.materialsEyebrow}
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">
            {t.materialsTitle}
          </h2>
        </div>
        <p className="max-w-md text-sm text-muted-foreground">{t.materialsText}</p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {MATERIALS.map((material) => {
          const Icon = ICONS[material];
          return (
            <button
              key={material}
              onClick={() => onSelect(material)}
              className="group flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-5 text-left shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elegant"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-gradient-hero group-hover:text-primary-foreground">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display text-lg font-semibold">{materialLabel(material)}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t.materialDescriptions[material]}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
