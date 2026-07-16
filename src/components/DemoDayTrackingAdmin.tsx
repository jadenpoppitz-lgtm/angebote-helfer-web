import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  Activity,
  CheckCircle2,
  Clock3,
  Eye,
  KeyRound,
  LockKeyhole,
  RefreshCw,
  SearchCheck,
  ShieldCheck,
  TicketCheck,
  UsersRound,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { lookupDemoDayDevice } from "@/data/demoDayDevices";
import {
  DemoDayTrackingError,
  fetchDemoDayAnalytics,
  type DemoDayAnalytics,
  type DemoDayTrackingEvent,
} from "@/lib/demoDayTracking";
import type { Language } from "@/lib/i18n";

type DemoDayTrackingAdminProps = {
  language: Language;
};

type AdminCopy = {
  footerHint: string;
  footerButton: string;
  title: string;
  description: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  unlock: string;
  privacy: string;
  unauthorized: string;
  unavailable: string;
  sessions: string;
  sessionsHint: string;
  visits: string;
  visitsHint: string;
  lookups: string;
  lookupsHint: string;
  recognized: string;
  recognizedHint: string;
  recent: string;
  recentText: string;
  empty: string;
  time: string;
  serial: string;
  device: string;
  result: string;
  winner: string;
  found: string;
  notFound: string;
  refresh: string;
  logout: string;
  updated: string;
  persistent: string;
  local: string;
  invalid: string;
  winnerChecks: string;
};

const adminCopy: Record<Language, AdminCopy> = {
  de: {
    footerHint: "Nur für das Leaftronics-Team",
    footerButton: "Internes Monitoring",
    title: "Demo-Day Monitoring",
    description: "Interne Übersicht über Website-Besuche und Geräteprüfungen in der Customer-Oberfläche.",
    passwordLabel: "Admin-Passwort",
    passwordPlaceholder: "Passwort eingeben",
    unlock: "Monitoring öffnen",
    privacy: "Es werden keine IP-Adressen, Namen oder Gerätekennungen gespeichert.",
    unauthorized: "Das Passwort ist nicht korrekt.",
    unavailable: "Das Monitoring ist aktuell nicht erreichbar.",
    sessions: "Sitzungen",
    sessionsHint: "Eindeutige Browser-Sitzungen",
    visits: "Aufrufe",
    visitsHint: "Erfasste Website-Aufrufe",
    lookups: "Prüfungen",
    lookupsHint: "Abgeschickte Seriennummern",
    recognized: "Erkannt",
    recognizedHint: "Gültige Demo-Nummern",
    recent: "Letzte Geräteprüfungen",
    recentText: "Die neuesten Eingaben, serverseitig nach Zeitpunkt sortiert.",
    empty: "Noch keine Seriennummer geprüft.",
    time: "Zeitpunkt",
    serial: "Seriennummer",
    device: "Gerät",
    result: "Ergebnis",
    winner: "Gewinnticket",
    found: "Erkannt",
    notFound: "Nicht gefunden",
    refresh: "Aktualisieren",
    logout: "Sperren",
    updated: "Aktualisiert",
    persistent: "Live gespeichert",
    local: "Lokale Vorschau",
    invalid: "Ungültige Eingaben",
    winnerChecks: "Gewinnprüfungen",
  },
  en: {
    footerHint: "Leaftronics team only",
    footerButton: "Internal monitoring",
    title: "Demo-day monitoring",
    description: "Internal overview of website visits and device checks in the customer interface.",
    passwordLabel: "Admin password",
    passwordPlaceholder: "Enter password",
    unlock: "Open monitoring",
    privacy: "No IP addresses, names or device identifiers are stored.",
    unauthorized: "The password is not correct.",
    unavailable: "Monitoring is currently unavailable.",
    sessions: "Sessions",
    sessionsHint: "Unique browser sessions",
    visits: "Visits",
    visitsHint: "Recorded website visits",
    lookups: "Checks",
    lookupsHint: "Submitted serial numbers",
    recognized: "Recognised",
    recognizedHint: "Valid demo numbers",
    recent: "Latest device checks",
    recentText: "The latest entries, sorted by server timestamp.",
    empty: "No serial number has been checked yet.",
    time: "Time",
    serial: "Serial number",
    device: "Device",
    result: "Result",
    winner: "Winning ticket",
    found: "Recognised",
    notFound: "Not found",
    refresh: "Refresh",
    logout: "Lock",
    updated: "Updated",
    persistent: "Stored live",
    local: "Local preview",
    invalid: "Invalid entries",
    winnerChecks: "Winner checks",
  },
  zh: {
    footerHint: "仅限 Leaftronics 团队",
    footerButton: "内部监控",
    title: "演示日监控",
    description: "网站访问和客户界面设备查询的内部概览。",
    passwordLabel: "管理员密码",
    passwordPlaceholder: "输入密码",
    unlock: "打开监控",
    privacy: "不会存储 IP 地址、姓名或设备标识符。",
    unauthorized: "密码不正确。",
    unavailable: "监控当前不可用。",
    sessions: "会话",
    sessionsHint: "唯一浏览器会话",
    visits: "访问",
    visitsHint: "已记录的网站访问",
    lookups: "查询",
    lookupsHint: "已提交的序列号",
    recognized: "已识别",
    recognizedHint: "有效演示编号",
    recent: "最近的设备查询",
    recentText: "按服务器时间排序的最新输入。",
    empty: "尚未查询序列号。",
    time: "时间",
    serial: "序列号",
    device: "设备",
    result: "结果",
    winner: "中奖编号",
    found: "已识别",
    notFound: "未找到",
    refresh: "刷新",
    logout: "锁定",
    updated: "更新时间",
    persistent: "实时保存",
    local: "本地预览",
    invalid: "无效输入",
    winnerChecks: "中奖查询",
  },
};

const locales: Record<Language, string> = { de: "de-DE", en: "en-GB", zh: "zh-CN" };

function formatTimestamp(value: string, language: Language) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locales[language], {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(date);
}

function LookupResult({ event, copy }: { event: DemoDayTrackingEvent; copy: AdminCopy }) {
  if (event.winner) {
    return <span className="is-winner"><TicketCheck aria-hidden="true" />{copy.winner}</span>;
  }
  if (event.found) {
    return <span className="is-found"><CheckCircle2 aria-hidden="true" />{copy.found}</span>;
  }
  return <span className="is-missing"><XCircle aria-hidden="true" />{copy.notFound}</span>;
}

export function DemoDayTrackingAdmin({ language }: DemoDayTrackingAdminProps) {
  const copy = adminCopy[language];
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [analytics, setAnalytics] = useState<DemoDayAnalytics | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const lookupEvents = useMemo(
    () => analytics?.events.filter((event) => event.type === "lookup").slice(0, 100) ?? [],
    [analytics],
  );

  const loadAnalytics = async () => {
    setLoading(true);
    setError("");
    try {
      setAnalytics(await fetchDemoDayAnalytics(password));
    } catch (requestError) {
      const unauthorized = requestError instanceof DemoDayTrackingError && requestError.status === 401;
      setError(unauthorized ? copy.unauthorized : requestError instanceof Error ? requestError.message : copy.unavailable);
      if (unauthorized) setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void loadAnalytics();
  };

  const logout = () => {
    setAnalytics(null);
    setPassword("");
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <footer className="cycle-app-admin-footer">
        <span><ShieldCheck aria-hidden="true" />{copy.footerHint}</span>
        <DialogTrigger asChild>
          <button type="button"><LockKeyhole aria-hidden="true" />{copy.footerButton}</button>
        </DialogTrigger>
      </footer>

      <DialogContent className="demo-day-admin-dialog">
        {!analytics ? (
          <div className="demo-day-admin-login">
            <span className="demo-day-admin-lock" aria-hidden="true"><KeyRound /></span>
            <div className="demo-day-admin-login-copy">
              <p>Leaftronics Ops</p>
              <DialogTitle className="demo-day-admin-title">{copy.title}</DialogTitle>
              <DialogDescription className="demo-day-admin-description">{copy.description}</DialogDescription>
            </div>
            <form onSubmit={submit}>
              <label htmlFor="demo-day-admin-password">{copy.passwordLabel}</label>
              <div>
                <LockKeyhole aria-hidden="true" />
                <input
                  id="demo-day-admin-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={copy.passwordPlaceholder}
                  autoComplete="current-password"
                  autoFocus
                />
              </div>
              <button type="submit" disabled={!password || loading}>
                {loading ? <RefreshCw className="is-spinning" aria-hidden="true" /> : <KeyRound aria-hidden="true" />}
                {copy.unlock}
              </button>
            </form>
            {error ? <p className="demo-day-admin-error" role="alert">{error}</p> : null}
            <p className="demo-day-admin-privacy"><ShieldCheck aria-hidden="true" />{copy.privacy}</p>
          </div>
        ) : (
          <div className="demo-day-admin-dashboard">
            <header className="demo-day-admin-heading">
              <div>
                <p><Activity aria-hidden="true" />Leaftronics Ops</p>
                <DialogTitle className="demo-day-admin-title">{copy.title}</DialogTitle>
                <DialogDescription className="demo-day-admin-description">{copy.description}</DialogDescription>
              </div>
              <span className={analytics.storage === "persistent" ? "is-live" : "is-local"}>
                <i aria-hidden="true" />
                {analytics.storage === "persistent" ? copy.persistent : copy.local}
              </span>
            </header>

            <section className="demo-day-admin-metrics" aria-label={copy.title}>
              <article>
                <span><UsersRound aria-hidden="true" /></span>
                <div><strong>{analytics.summary.sessions}</strong><p>{copy.sessions}</p><small>{copy.sessionsHint}</small></div>
              </article>
              <article>
                <span><Eye aria-hidden="true" /></span>
                <div><strong>{analytics.summary.visits}</strong><p>{copy.visits}</p><small>{copy.visitsHint}</small></div>
              </article>
              <article>
                <span><SearchCheck aria-hidden="true" /></span>
                <div><strong>{analytics.summary.lookups}</strong><p>{copy.lookups}</p><small>{copy.lookupsHint}</small></div>
              </article>
              <article>
                <span><CheckCircle2 aria-hidden="true" /></span>
                <div><strong>{analytics.summary.recognized}</strong><p>{copy.recognized}</p><small>{copy.recognizedHint}</small></div>
              </article>
            </section>

            <div className="demo-day-admin-summary">
              <span><XCircle aria-hidden="true" /><strong>{analytics.summary.notFound}</strong>{copy.invalid}</span>
              <span><TicketCheck aria-hidden="true" /><strong>{analytics.summary.winnerChecks}</strong>{copy.winnerChecks}</span>
              <span><Clock3 aria-hidden="true" />{copy.updated}: {formatTimestamp(analytics.generatedAt, language)}</span>
            </div>

            <section className="demo-day-admin-activity" aria-labelledby="demo-day-admin-activity-title">
              <header>
                <div>
                  <h3 id="demo-day-admin-activity-title">{copy.recent}</h3>
                  <p>{copy.recentText}</p>
                </div>
                <button type="button" onClick={() => void loadAnalytics()} disabled={loading}>
                  <RefreshCw className={loading ? "is-spinning" : ""} aria-hidden="true" />
                  {copy.refresh}
                </button>
              </header>

              {lookupEvents.length ? (
                <div className="demo-day-admin-table-wrap">
                  <table>
                    <thead>
                      <tr><th>{copy.time}</th><th>{copy.serial}</th><th>{copy.device}</th><th>{copy.result}</th></tr>
                    </thead>
                    <tbody>
                      {lookupEvents.map((event) => {
                        const device = event.serial ? lookupDemoDayDevice(event.serial) : null;
                        return (
                          <tr key={event.id}>
                            <td data-label={copy.time}>{formatTimestamp(event.createdAt, language)}</td>
                            <td data-label={copy.serial}><code>{event.serial}</code></td>
                            <td data-label={copy.device}>{device?.model ?? "–"}</td>
                            <td data-label={copy.result}><LookupResult event={event} copy={copy} /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="demo-day-admin-empty"><SearchCheck aria-hidden="true" />{copy.empty}</p>
              )}
            </section>

            <footer className="demo-day-admin-actions">
              <p><ShieldCheck aria-hidden="true" />{copy.privacy}</p>
              <button type="button" onClick={logout}><LockKeyhole aria-hidden="true" />{copy.logout}</button>
            </footer>
            {error ? <p className="demo-day-admin-error" role="alert">{error}</p> : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
