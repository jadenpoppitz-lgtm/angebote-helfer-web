import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";

const NotFound = () => {
  const { t } = useLanguage();

  return (
    <main className="relative isolate grid min-h-screen place-items-center overflow-hidden bg-[#07100c] px-5 py-16 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.13] [background-image:linear-gradient(rgba(255,255,255,.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.14)_1px,transparent_1px)] [background-size:64px_64px]"
      />
      <div aria-hidden="true" className="absolute inset-x-[12%] top-1/3 h-40 bg-emerald-300/10 blur-3xl" />

      <div className="relative w-full max-w-3xl text-center">
        <Link to="/" className="mx-auto inline-flex items-center gap-3" aria-label="Leaftronics Startseite">
          <span className="h-12 w-12 overflow-hidden rounded-full border border-white/12 bg-white/95">
            <img src="/logo1-web.webp" alt="" className="h-full w-full object-cover" />
          </span>
          <span className="font-display text-base font-semibold uppercase tracking-[0.22em]">Leaftronics</span>
        </Link>

        <p className="mt-14 font-mono text-xs font-semibold uppercase tracking-[0.32em] text-emerald-300/72">Error 404</p>
        <h1 className="mt-4 font-display text-5xl font-semibold leading-none sm:text-7xl">{t.notFoundTitle}</h1>
        <Link
          to="/"
          className="mt-9 inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#b8ff59] px-5 text-sm font-semibold text-[#07100c] shadow-[0_14px_38px_rgba(184,255,89,.14)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t.notFoundAction}
        </Link>
      </div>
    </main>
  );
};

export default NotFound;
