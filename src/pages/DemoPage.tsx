import { useMemo } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { languages, type Language, useLanguage } from "@/lib/i18n";
import {
  copy,
  CustomerReturnDemo,
  DemoSurface,
  roleIcons,
  roleOrder,
  type RoleId,
} from "./Landing";

const pageCopy: Record<Language, { back: string; eyebrow: string; intro: string; switchRole: string; startForm: string }> = {
  de: {
    back: "Zur Startseite",
    eyebrow: "Live-Demo",
    intro: "Diese Seite zeigt die Demo groß und lesbar für die ausgewählte Rolle.",
    switchRole: "Andere Demo öffnen",
    startForm: "Anfrage starten",
  },
  en: {
    back: "Back to home",
    eyebrow: "Live demo",
    intro: "This page shows the selected role demo in a larger, easier-to-read layout.",
    switchRole: "Open another demo",
    startForm: "Start request",
  },
  zh: {
    back: "返回首页",
    eyebrow: "实时演示",
    intro: "此页面以更大、更易阅读的布局展示所选角色演示。",
    switchRole: "打开其他演示",
    startForm: "开始请求",
  },
};

const isRole = (value: string | undefined): value is RoleId => Boolean(value && roleOrder.includes(value as RoleId));

const DemoPage = () => {
  const { role } = useParams();
  const { language, setLanguage } = useLanguage();
  const content = copy[language];
  const labels = pageCopy[language];
  const reference = useMemo(() => `KB-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 900))}`, []);

  if (!isRole(role)) {
    return <Navigate to="/#demos" replace />;
  }

  const card = content.roles.cards[role];
  const surface = content.demos.surfaces[role];
  const Icon = roleIcons[role];

  return (
    <div className="min-h-screen bg-black text-background">
      <div className="fixed right-4 top-4 z-50 flex rounded-md border border-background/20 bg-black/35 p-1 shadow-card backdrop-blur-md">
        {languages.map((item) => (
          <button
            key={item.code}
            type="button"
            onClick={() => setLanguage(item.code)}
            className={`h-8 rounded px-2 text-xs font-medium transition-colors ${
              language === item.code ? "bg-background text-foreground" : "text-background/75 hover:text-background"
            }`}
            title={item.label}
          >
            {item.short}
          </button>
        ))}
      </div>

      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-6 pr-32 sm:px-8">
        <Link to="/" className="flex items-center gap-3 text-background/80 transition-colors hover:text-background">
          <ArrowLeft className="h-4 w-4" />
          {labels.back}
        </Link>
        <Link to="/#forms" className="hidden h-10 items-center gap-2 rounded-md bg-background px-4 text-sm font-semibold text-foreground md:inline-flex">
          {labels.startForm}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      <main className="mx-auto w-full max-w-7xl px-5 pb-20 pt-8 sm:px-8">
        <section className="grid gap-8 lg:grid-cols-[0.36fr_0.64fr]">
          <aside>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{labels.eyebrow}</p>
            <div className="mt-5 flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-lg bg-primary/15 text-primary">
                <Icon className="h-7 w-7" />
              </span>
              <div>
                <h1 className="font-display text-4xl font-semibold leading-tight md:text-5xl">{card.title}</h1>
                <p className="mt-1 text-sm text-background/55">{surface.subtitle}</p>
              </div>
            </div>
            <p className="mt-6 max-w-xl text-base leading-7 text-background/70">{labels.intro}</p>
            <div className="mt-6 rounded-lg border border-background/10 bg-background/8 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-background/45">Problem</p>
              <p className="mt-2 text-sm leading-6 text-background/75">{card.problem}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-primary">Value</p>
              <p className="mt-2 text-sm leading-6 text-background/75">{card.value}</p>
            </div>

            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-background/45">{labels.switchRole}</p>
              <div className="mt-3 grid gap-2">
                {roleOrder.map((nextRole) => {
                  const NextIcon = roleIcons[nextRole];
                  return (
                    <Link
                      key={nextRole}
                      to={`/demo/${nextRole}`}
                      className={`flex items-center gap-3 rounded-md border px-3 py-3 text-sm font-semibold transition-colors ${
                        nextRole === role
                          ? "border-primary bg-primary/15 text-background"
                          : "border-background/15 text-background/65 hover:text-background"
                      }`}
                    >
                      <NextIcon className="h-4 w-4" />
                      {content.roles.cards[nextRole].title}
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>

          <section>
            {role === "customer" ? (
              <CustomerReturnDemo content={content} language={language} reference={reference} />
            ) : (
              <DemoSurface content={content} surface={surface} reference={reference} />
            )}
          </section>
        </section>
      </main>
    </div>
  );
};

export default DemoPage;
