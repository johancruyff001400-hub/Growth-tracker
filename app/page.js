"use client";
import React, { useState, useEffect, useMemo } from "react";

const C = {
  bg: "#0a0e13", panel: "#11161d", panel2: "#151b23", border: "#232c36", borderBright: "#2f3d4a",
  cyan: "#5eead4", violet: "#a78bfa", gold: "#e8c468", text: "#e7edf2", muted: "#5c6b78", danger: "#e08a6f",
};
const FONT_DISPLAY = "'Space Grotesk', 'Segoe UI', -apple-system, system-ui, sans-serif";
const FONT_MONO = "'JetBrains Mono', 'SF Mono', ui-monospace, Menlo, monospace";
const FONT_BODY = "-apple-system, system-ui, 'Segoe UI', sans-serif";

const STRINGS = {
  ru: {
    hookQuestion: "Сколько часов в день ты проводишь в соцсетях?", hoursShort: "ч", reveal: "Показать, что это значит",
    yearCalc: "РАСЧЁТ ЗА ГОД", perYear: "часов в год", daysStraight: "это {d} суток непрерывно",
    hookBody: "Это время никуда не делось — оно просто не пошло на то, что важно тебе. Дальше — не про запреты, а про то, куда направить хотя бы часть этого времени.",
    choose: "Выбрать, что растить", setup: "SETUP", onboardTitle: "Одна цель. Каждый день — шаг.",
    onboardBody: "Ядро роста будет заполняться с каждым отмеченным днём.", goalPlaceholder: "например: учу английский до C1",
    launch: "Запустить ядро", diary: "ДНЕВНИК РОСТА", series: "серия", days: "дней", day: "день", entriesWord: "записей",
    alreadyToday: "Сегодняшняя запись уже сделана. Ядро ждёт завтра.", checkinQ: "Как прошёл сегодня день по цели «{g}»?",
    checkinPlaceholder: "например: позанимался 20 минут, повторил слова", markDay: "Отметить день", analyzing: "Анализирую…",
    aiError: "AI сейчас недоступен. Попробуй ещё раз.", log: "ЛОГ", tabHome: "Рост", tabProfile: "Профиль", tabSettings: "Настройки",
    signInTitle: "Добро пожаловать", signInBody: "Войди, чтобы прогресс сохранялся за тобой на любом устройстве.",
    signInGoogle: "Войти через Google", signInSkip: "Продолжить без входа", settingsLang: "Язык",
    settingsNotif: "Напоминания вечером", settingsAccount: "Аккаунт", settingsSignOut: "Выйти",
    settingsVersion: "v0.4 · localStorage", profileLevel: "Уровень", profileStreak: "Серия", profileEntries: "Записей", guest: "Гость",
    yourGoals: "ТВОИ ЦЕЛИ", addGoal: "+ Новая цель", newGoalTitle: "Новая цель", achievements: "ДОСТИЖЕНИЯ", locked: "заблокировано",
    ach_first_step: "Первый шаг", ach_first_step_d: "Сделай первую запись", ach_three_day: "Разгон", ach_three_day_d: "Серия 3 дня подряд",
    ach_week_warrior: "Неделя силы", ach_week_warrior_d: "Серия 7 дней подряд", ach_level5: "На полпути", ach_level5_d: "Достигни уровня 5 в любой цели",
    ach_level10: "Максимум", ach_level10_d: "Достигни уровня 10 в любой цели", ach_multi_goal: "Многозадачность", ach_multi_goal_d: "Веди 2 цели одновременно",
    weeklyReport: "ЕЖЕНЕДЕЛЬНЫЙ ОТЧЁТ", getReport: "Получить отчёт за неделю", reportNeed: "Нужно ещё {n} записей для отчёта",
    generatingReport: "AI анализирует твою неделю…", reportDate: "Отчёт от", newAchievement: "Новое достижение!",
  },
};
function t(key, vars) {
  let s = STRINGS.ru[key] || key;
  if (vars) Object.keys(vars).forEach((k) => (s = s.replace(`{${k}}`, vars[k])));
  return s;
}

const ACHIEVEMENT_DEFS = [
  { id: "first_step", check: (ctx) => ctx.totalEntries >= 1 },
  { id: "three_day", check: (ctx) => ctx.maxStreak >= 3 },
  { id: "week_warrior", check: (ctx) => ctx.maxStreak >= 7 },
  { id: "level5", check: (ctx) => ctx.maxLevel >= 5 },
  { id: "level10", check: (ctx) => ctx.maxLevel >= 10 },
  { id: "multi_goal", check: (ctx) => ctx.goalCount >= 2 },
];

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
      @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.55; } }
      @keyframes rise { from { transform: translateY(14px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      @keyframes coreIn { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      @keyframes popIn { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      .gt-rise { animation: rise 0.5s cubic-bezier(0.22,1,0.36,1) both; }
      .gt-core-wrap { animation: coreIn 0.6s cubic-bezier(0.22,1,0.36,1) both; }
      .gt-pop { animation: popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
      .gt-btn { transition: transform 0.15s ease, box-shadow 0.2s ease, filter 0.15s ease; }
      .gt-btn:active { transform: translateY(1px) scale(0.98); }
      .gt-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
      .gt-input:focus { outline: none; border-color: ${C.cyan} !important; box-shadow: 0 0 0 3px rgba(94,234,212,0.12); }
      .gt-tab { transition: color 0.15s ease, transform 0.15s ease; }
      .gt-tab:hover { transform: translateY(-1px); }
      .gt-card { transition: border-color 0.2s ease, transform 0.2s ease; }
      .gt-card:hover { border-color: ${C.borderBright}; }
      .gt-chip { transition: all 0.15s ease; cursor: pointer; }
      html, body { background: ${C.bg}; }
      * { box-sizing: border-box; }
    `}</style>
  );
}

const PANEL_SHADOW = "0 1px 0 rgba(255,255,255,0.04) inset, 0 24px 48px -24px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.02) inset";
const BTN_GLOW = `0 8px 24px -8px rgba(94,234,212,0.35), 0 2px 8px -2px rgba(167,139,250,0.25)`;

function Icon({ name, color }) {
  const common = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  if (name === "home") return <svg {...common}><path d="M12 3l8 6.5V20a1 1 0 01-1 1h-4.5v-6h-5v6H5a1 1 0 01-1-1V9.5L12 3z" /></svg>;
  if (name === "profile") return <svg {...common}><circle cx="12" cy="8" r="3.6" /><path d="M4.5 20c1.2-3.6 4.2-5.5 7.5-5.5s6.3 1.9 7.5 5.5" /></svg>;
  if (name === "settings") return <svg {...common}><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 00-.14-1.4l2-1.5-2-3.4-2.36.9a7 7 0 00-2.4-1.4L13.6 3h-3.2l-.5 2.2a7 7 0 00-2.4 1.4l-2.36-.9-2 3.4 2 1.5A7 7 0 005 12c0 .47.05.94.14 1.4l-2 1.5 2 3.4 2.36-.9c.7.6 1.52 1.08 2.4 1.4l.5 2.2h3.2l.5-2.2a7 7 0 002.4-1.4l2.36.9 2-3.4-2-1.5c.09-.46.14-.93.14-1.4z" /></svg>;
  if (name === "medal") return <svg {...common}><circle cx="12" cy="14" r="6" /><path d="M9 8.5L7 3h3l2 4M15 8.5L17 3h-3l-2 4" /></svg>;
  if (name === "lock") return <svg {...common}><rect x="5" y="11" width="14" height="9" rx="1.5" /><path d="M8 11V7a4 4 0 018 0v4" /></svg>;
  return null;
}

function GridBg() {
  return (
    <>
      <div style={{ position: "fixed", inset: 0, backgroundImage: `linear-gradient(${C.border} 1px, transparent 1px), linear-gradient(90deg, ${C.border} 1px, transparent 1px)`, backgroundSize: "42px 42px", opacity: 0.28, pointerEvents: "none", maskImage: "radial-gradient(ellipse 60% 50% at 50% 0%, black, transparent)" }} />
      <div style={{ position: "fixed", top: "-10%", left: "50%", transform: "translateX(-50%)", width: 480, height: 480, borderRadius: "50%", pointerEvents: "none", background: `radial-gradient(circle, rgba(94,234,212,0.10), rgba(167,139,250,0.06) 45%, transparent 70%)`, filter: "blur(10px)" }} />
    </>
  );
}

function Button({ children, onClick, disabled, variant = "primary", style }) {
  const base = { width: "100%", border: "none", borderRadius: 8, padding: "13px", fontSize: 14.5, fontWeight: 600, fontFamily: FONT_DISPLAY, cursor: disabled ? "default" : "pointer", letterSpacing: "0.01em" };
  const variants = {
    primary: { background: disabled ? C.border : `linear-gradient(135deg, ${C.cyan}, ${C.violet})`, color: disabled ? C.muted : "#0a0e13", boxShadow: disabled ? "none" : BTN_GLOW },
    ghost: { background: "transparent", color: C.muted, border: `1px solid ${C.border}` },
    google: { background: "#ffffff", color: "#1f1f1f", boxShadow: "0 8px 20px -10px rgba(0,0,0,0.5)" },
  };
  return <button className="gt-btn" onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...style }}>{children}</button>;
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" style={{ verticalAlign: "middle", marginRight: 10 }}>
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.95v2.33A9 9 0 009 18z" />
      <path fill="#FBBC05" d="M3.97 10.71a5.41 5.41 0 010-3.42V4.96H.95a9 9 0 000 8.08l3.02-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0A9 9 0 00.95 4.96l3.02 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}

function Avatar({ name, size = 36 }) {
  const initial = (name || "?").trim()[0]?.toUpperCase() || "?";
  return <div style={{ width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg, ${C.cyan}, ${C.violet})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_DISPLAY, fontWeight: 700, color: C.bg, fontSize: size * 0.42, flexShrink: 0 }}>{initial}</div>;
}

function Core({ level, maxLevel = 10, pulse, size = 220 }) {
  const cx = size / 2, cy = size / 2;
  const rings = [size * 0.4, size * 0.327, size * 0.254];
  const pct = Math.min(level / maxLevel, 1);
  return (
    <div style={{ position: "relative", filter: "drop-shadow(0 12px 32px rgba(94,234,212,0.12)) drop-shadow(0 4px 16px rgba(167,139,250,0.10))" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="coreGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={C.cyan} /><stop offset="100%" stopColor={C.violet} /></linearGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        {rings.map((r, i) => {
          const circumference = 2 * Math.PI * r;
          const ringPct = Math.max(0, Math.min(1, pct * 3 - i));
          return (
            <g key={i} transform={`rotate(${-90 + i * 8} ${cx} ${cy})`}>
              <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth="3" />
              <circle cx={cx} cy={cy} r={r} fill="none" stroke="url(#coreGrad)" strokeWidth="3" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - ringPct)} filter="url(#glow)" style={{ transition: "stroke-dashoffset 0.8s ease" }} />
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r={size * 0.173} fill={C.panel2} stroke={C.borderBright} strokeWidth="1" />
        <text x={cx} y={cy - 2} textAnchor="middle" fill={C.text} fontFamily={FONT_MONO} fontSize={size * 0.118} fontWeight="600" style={pulse ? { animation: "pulse 1.6s ease-in-out infinite" } : {}}>{level}</text>
        <text x={cx} y={cy + size * 0.073} textAnchor="middle" fill={C.muted} fontFamily={FONT_MONO} fontSize={size * 0.041} letterSpacing="1.5">LEVEL</text>
      </svg>
    </div>
  );
}

function computeStreak(entries) {
  let s = 0;
  const sorted = [...entries].sort((a, b) => b.date - a.date);
  let cursor = new Date();
  for (const e of sorted) {
    if (new Date(e.date).toDateString() === cursor.toDateString()) { s++; cursor.setDate(cursor.getDate() - 1); } else break;
  }
  return s;
}

function TabBar({ active, setActive }) {
  const tabs = [{ id: "home", label: t("tabHome"), icon: "home" }, { id: "profile", label: t("tabProfile"), icon: "profile" }, { id: "settings", label: t("tabSettings"), icon: "settings" }];
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(15,19,25,0.85)", backdropFilter: "blur(14px)", borderTop: `1px solid ${C.border}`, boxShadow: "0 -8px 30px -12px rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", padding: "12px 0 max(12px, env(safe-area-inset-bottom))" }}>
      <div style={{ display: "flex", gap: 52, maxWidth: 460, width: "100%", justifyContent: "center" }}>
        {tabs.map((tb) => (
          <div key={tb.id} onClick={() => setActive(tb.id)} className="gt-tab" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", color: active === tb.id ? C.cyan : C.muted }}>
            <Icon name={tb.icon} color={active === tb.id ? C.cyan : C.muted} />
            <span style={{ fontSize: 10, fontFamily: FONT_MONO }}>{tb.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function load(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try { const v = window.localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
}
function save(key, val) {
  try { window.localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
}

export default function Page() {
  const [stage, setStage] = useState("loading");
  const [tab, setTab] = useState("home");
  const [notif, setNotif] = useState(true);
  const [user, setUser] = useState(null);
  const [hoursInput, setHoursInput] = useState(4);
  const [goals, setGoals] = useState([]);
  const [activeGoalId, setActiveGoalId] = useState(null);
  const [goalInput, setGoalInput] = useState("");
  const [addingGoal, setAddingGoal] = useState(false);
  const [checkin, setCheckin] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unlockedAch, setUnlockedAch] = useState([]);
  const [newBadge, setNewBadge] = useState(null);

  useEffect(() => {
    const g = load("goals", []);
    const u = load("user", null);
    const a = load("achievements", []);
    setGoals(g); setUser(u); setUnlockedAch(a);
    if (g.length) setActiveGoalId(g[0].id);
    if (!u) setStage("signin"); else if (!g.length) setStage("hook"); else setStage("app");
  }, []);

  const mockGoogleSignIn = () => { const u = { name: "Alex", email: "alex@gmail.com" }; setUser(u); save("user", u); setStage("hook"); };
  const skipSignIn = () => { const u = { name: t("guest"), email: "" }; setUser(u); save("user", u); setStage("hook"); };
  const signOut = () => { setUser(null); setGoals([]); setActiveGoalId(null); save("user", null); save("goals", []); save("achievements", []); setStage("signin"); };

  const [goalValidating, setGoalValidating] = useState(false);
  const [goalError, setGoalError] = useState(null);

  const createGoal = async (name) => {
    setGoalValidating(true); setGoalError(null);
    try {
      const res = await fetch("/api/validate-goal", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalName: name, lang: "ru" }),
      });
      const { valid, reason } = await res.json();
      if (!valid) {
        setGoalError(reason || "Эта цель не подходит, попробуй сформулировать иначе.");
        setGoalValidating(false);
        return;
      }
    } catch (e) {
      // if validation call fails, allow through rather than blocking the user
    }
    const g = { id: Date.now().toString(), name, createdAt: Date.now(), entries: [], report: null };
    const newGoals = [...goals, g];
    setGoals(newGoals); save("goals", newGoals); setActiveGoalId(g.id); setAddingGoal(false); setGoalInput("");
    setGoalValidating(false);
    if (stage !== "app") setStage("app");
  };

  const activeGoal = goals.find((g) => g.id === activeGoalId) || null;
  const today = new Date().toDateString();
  const alreadyToday = activeGoal ? activeGoal.entries.some((e) => new Date(e.date).toDateString() === today) : false;
  const level = activeGoal ? Math.min(activeGoal.entries.length, 10) : 0;
  const streak = activeGoal ? computeStreak(activeGoal.entries) : 0;

  const globalStats = useMemo(() => ({
    totalEntries: goals.reduce((s, g) => s + g.entries.length, 0),
    maxStreak: goals.reduce((m, g) => Math.max(m, computeStreak(g.entries)), 0),
    maxLevel: goals.reduce((m, g) => Math.max(m, Math.min(g.entries.length, 10)), 0),
    goalCount: goals.length,
  }), [goals]);

  useEffect(() => {
    const newlyUnlocked = ACHIEVEMENT_DEFS.filter((d) => !unlockedAch.includes(d.id) && d.check(globalStats)).map((d) => d.id);
    if (newlyUnlocked.length) {
      const updated = [...unlockedAch, ...newlyUnlocked];
      setUnlockedAch(updated); save("achievements", updated);
      setNewBadge(newlyUnlocked[0]);
      setTimeout(() => setNewBadge(null), 3200);
    }
    // eslint-disable-next-line
  }, [globalStats.totalEntries, globalStats.maxStreak, globalStats.maxLevel, globalStats.goalCount]);

  const submitCheckin = async () => {
    if (!checkin.trim() || !activeGoal) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalName: activeGoal.name, checkinText: checkin, lang: "ru" }),
      });
      const parsed = await res.json();
      if (parsed.relevant === false) {
        setError(parsed.comment || "Эта запись не похожа на прогресс по цели. Опиши, что реально было сделано.");
        setLoading(false);
        return;
      }
      const newEntries = [...activeGoal.entries, { date: Date.now(), text: checkin, score: parsed.score }];
      const newGoals = goals.map((g) => (g.id === activeGoal.id ? { ...g, entries: newEntries } : g));
      setGoals(newGoals); save("goals", newGoals); setFeedback(parsed.comment); setCheckin("");
    } catch (err) { setError(t("aiError")); } finally { setLoading(false); }
  };

  const getWeeklyReport = async () => {
    if (!activeGoal || activeGoal.entries.length < 5) return;
    setReportLoading(true); setError(null);
    try {
      const recent = activeGoal.entries.slice(-7);
      const log = recent.map((e) => `- ${new Date(e.date).toLocaleDateString("ru-RU")}: ${e.text} (оценка ${e.score}/5)`).join("\n");
      const res = await fetch("/api/report", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalName: activeGoal.name, log, lang: "ru" }),
      });
      const { text } = await res.json();
      const report = { date: Date.now(), text };
      const newGoals = goals.map((g) => (g.id === activeGoal.id ? { ...g, report } : g));
      setGoals(newGoals); save("goals", newGoals);
    } catch (err) { setError(t("aiError")); } finally { setReportLoading(false); }
  };

  const shell = { background: C.bg, minHeight: "100vh", color: C.text, fontFamily: FONT_BODY, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 18px 100px" };

  if (stage === "loading") return <div style={{ background: C.bg, minHeight: "100vh" }} />;

  if (stage === "signin") return (
    <div style={shell}><GlobalStyle /><GridBg />
      <div className="gt-rise" style={{ maxWidth: 400, width: "100%", textAlign: "center", marginTop: 80 }}>
        <div style={{ margin: "0 auto 22px", width: 64, height: 64, borderRadius: 16, background: `linear-gradient(135deg, ${C.cyan}, ${C.violet})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_MONO, fontWeight: 700, fontSize: 26, color: C.bg }}>◎</div>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 24, marginBottom: 10 }}>{t("signInTitle")}</h1>
        <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.5, marginBottom: 30 }}>{t("signInBody")}</p>
        <Button variant="google" onClick={mockGoogleSignIn} style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}><GoogleIcon />{t("signInGoogle")}</Button>
        <Button variant="ghost" onClick={skipSignIn}>{t("signInSkip")}</Button>
      </div>
    </div>
  );

  if (stage === "hook") {
    const yearHours = Math.round(hoursInput * 365);
    return (
      <div style={shell}><GlobalStyle /><GridBg />
        <div className="gt-rise" style={{ maxWidth: 440, width: "100%", textAlign: "center", marginTop: 40 }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 3, color: C.cyan, marginBottom: 18 }}>SYSTEM CHECK</div>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 26, lineHeight: 1.35, margin: "0 0 30px" }}>{t("hookQuestion")}</h1>
          <div style={{ fontFamily: FONT_MONO, fontSize: 48, fontWeight: 700, background: `linear-gradient(135deg, ${C.cyan}, ${C.violet})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 14 }}>{hoursInput} {t("hoursShort")}</div>
          <input type="range" min="0.5" max="10" step="0.5" value={hoursInput} onChange={(e) => setHoursInput(parseFloat(e.target.value))} style={{ width: "100%", accentColor: C.cyan, marginBottom: 34 }} />
          <Button onClick={() => setStage("hookReveal")}>{t("reveal")}</Button>
        </div>
      </div>
    );
  }

  if (stage === "hookReveal") {
    const yearHours = Math.round(hoursInput * 365); const yearDays = Math.round(yearHours / 24);
    return (
      <div style={shell}><GlobalStyle /><GridBg />
        <div className="gt-rise" style={{ maxWidth: 440, width: "100%", textAlign: "center", marginTop: 40 }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 3, color: C.danger, marginBottom: 18 }}>{t("yearCalc")}</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 56, fontWeight: 700, marginBottom: 4 }}>{yearHours.toLocaleString("ru-RU")}</div>
          <div style={{ color: C.muted, fontSize: 14, marginBottom: 28 }}>{t("perYear")} · {t("daysStraight", { d: yearDays })}</div>
          <p style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 30 }}>{t("hookBody")}</p>
          <Button onClick={() => setStage("onboard")}>{t("choose")}</Button>
        </div>
      </div>
    );
  }

  if (stage === "onboard") {
    return (
      <div style={shell}><GlobalStyle /><GridBg />
        <div className="gt-rise" style={{ maxWidth: 420, width: "100%", marginTop: 40 }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 3, color: C.cyan, marginBottom: 14, textAlign: "center" }}>{t("setup")}</div>
          <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 22, textAlign: "center", marginBottom: 8 }}>{t("onboardTitle")}</h2>
          <p style={{ color: C.muted, fontSize: 13.5, textAlign: "center", marginBottom: 26 }}>{t("onboardBody")}</p>
          <input className="gt-input" value={goalInput} onChange={(e) => setGoalInput(e.target.value)} placeholder={t("goalPlaceholder")} style={{ width: "100%", background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, padding: "13px 14px", color: C.text, fontSize: 15, fontFamily: FONT_BODY, marginBottom: 12 }} />
          {goalError && <div style={{ color: C.danger, fontSize: 13, marginBottom: 12, lineHeight: 1.5 }}>{goalError}</div>}
          <Button disabled={!goalInput.trim() || goalValidating} onClick={() => goalInput.trim() && createGoal(goalInput.trim())}>{goalValidating ? "Проверяю…" : t("launch")}</Button>
        </div>
      </div>
    );
  }

  const achDef = newBadge ? ACHIEVEMENT_DEFS.find((d) => d.id === newBadge) : null;

  return (
    <div style={shell}><GlobalStyle /><GridBg />
      {achDef && (
        <div className="gt-pop" style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 50, background: C.panel, border: `1px solid ${C.gold}`, borderRadius: 12, padding: "12px 18px", display: "flex", alignItems: "center", gap: 10, boxShadow: PANEL_SHADOW }}>
          <Icon name="medal" color={C.gold} />
          <div><div style={{ fontSize: 11, color: C.gold, fontFamily: FONT_MONO }}>{t("newAchievement")}</div><div style={{ fontSize: 13, fontWeight: 600 }}>{t(`ach_${achDef.id}`)}</div></div>
        </div>
      )}

      {tab === "home" && (
        <div className="gt-rise" style={{ maxWidth: 460, width: "100%" }}>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6, marginBottom: 18 }}>
            {goals.map((g) => (
              <div key={g.id} className="gt-chip" onClick={() => { setActiveGoalId(g.id); setFeedback(null); }} style={{ flexShrink: 0, padding: "8px 14px", borderRadius: 20, border: `1px solid ${g.id === activeGoalId ? C.cyan : C.border}`, background: g.id === activeGoalId ? "rgba(94,234,212,0.1)" : "transparent", color: g.id === activeGoalId ? C.cyan : C.muted, fontSize: 13, fontFamily: FONT_MONO, whiteSpace: "nowrap" }}>{g.name}</div>
            ))}
            <div className="gt-chip" onClick={() => setAddingGoal(true)} style={{ flexShrink: 0, padding: "8px 14px", borderRadius: 20, border: `1px dashed ${C.border}`, color: C.muted, fontSize: 13, fontFamily: FONT_MONO, whiteSpace: "nowrap" }}>{t("addGoal")}</div>
          </div>

          {addingGoal && (
            <div className="gt-card" style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 18, boxShadow: PANEL_SHADOW }}>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 10 }}>{t("newGoalTitle")}</div>
              <input className="gt-input" autoFocus value={goalInput} onChange={(e) => setGoalInput(e.target.value)} placeholder={t("goalPlaceholder")} style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", color: C.text, fontSize: 14, fontFamily: FONT_BODY, marginBottom: 10 }} />
              {goalError && <div style={{ color: C.danger, fontSize: 13, marginBottom: 10, lineHeight: 1.5 }}>{goalError}</div>}
              <Button disabled={!goalInput.trim() || goalValidating} onClick={() => goalInput.trim() && createGoal(goalInput.trim())}>{goalValidating ? "Проверяю…" : t("launch")}</Button>
            </div>
          )}

          {activeGoal && (
            <>
              <div className="gt-core-wrap" style={{ display: "flex", justifyContent: "center", margin: "10px 0 4px" }}><Core level={level} pulse={loading} /></div>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 19, fontWeight: 600, letterSpacing: -0.2 }}>{activeGoal.name}</div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.muted, marginTop: 4 }}>{t("series")} {streak} {streak === 1 ? t("day") : t("days")} · {activeGoal.entries.length} {t("entriesWord")}</div>
              </div>
              <div className="gt-card" style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, padding: 22, boxShadow: PANEL_SHADOW }}>
                {alreadyToday && !feedback ? (
                  <p style={{ color: C.muted, fontSize: 14, textAlign: "center", margin: 0 }}>{t("alreadyToday")}</p>
                ) : (
                  <>
                    <div style={{ fontSize: 13.5, color: C.muted, marginBottom: 10 }}>{t("checkinQ", { g: activeGoal.name })}</div>
                    <textarea className="gt-input" value={checkin} onChange={(e) => setCheckin(e.target.value)} disabled={loading} rows={3} placeholder={t("checkinPlaceholder")} style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, color: C.text, fontSize: 14, fontFamily: FONT_BODY, resize: "vertical", marginBottom: 12 }} />
                    <Button disabled={loading || !checkin.trim()} onClick={submitCheckin}>{loading ? t("analyzing") : t("markDay")}</Button>
                  </>
                )}
                {error && <div style={{ color: C.danger, fontSize: 13, marginTop: 10 }}>{error}</div>}
                {feedback && <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}`, fontSize: 14, lineHeight: 1.55 }}>{feedback}</div>}
              </div>

              <div className="gt-card" style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, marginTop: 18, boxShadow: PANEL_SHADOW }}>
                <div style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 2, color: C.muted, marginBottom: 12 }}>{t("weeklyReport")}</div>
                {activeGoal.entries.length < 5 ? (
                  <div style={{ fontSize: 13, color: C.muted }}>{t("reportNeed", { n: 5 - activeGoal.entries.length })}</div>
                ) : reportLoading ? (
                  <div style={{ fontSize: 13, color: C.muted }}>{t("generatingReport")}</div>
                ) : activeGoal.report ? (
                  <>
                    <div style={{ fontSize: 11, color: C.violet, fontFamily: FONT_MONO, marginBottom: 8 }}>{t("reportDate")} {new Date(activeGoal.report.date).toLocaleDateString("ru-RU")}</div>
                    <div style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 14 }}>{activeGoal.report.text}</div>
                    <Button variant="ghost" onClick={getWeeklyReport}>{t("getReport")}</Button>
                  </>
                ) : (<Button onClick={getWeeklyReport}>{t("getReport")}</Button>)}
              </div>

              {activeGoal.entries.length > 0 && (
                <div style={{ marginTop: 22 }}>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 2, color: C.muted, marginBottom: 10 }}>{t("log")}</div>
                  {[...activeGoal.entries].reverse().slice(0, 6).map((e, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 13, color: C.muted, padding: "8px 0", borderBottom: i < 5 ? `1px solid ${C.border}` : "none" }}>
                      <span style={{ fontFamily: FONT_MONO, fontSize: 11, flexShrink: 0, color: C.cyan }}>{new Date(e.date).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" })}</span>
                      <span style={{ flex: 1, textAlign: "left" }}>{e.text.slice(0, 50)}{e.text.length > 50 ? "…" : ""}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {tab === "profile" && (
        <div className="gt-rise" style={{ maxWidth: 460, width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 26 }}>
            <Avatar name={user?.name} size={54} />
            <div><div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 18 }}>{user?.name}</div>{user?.email && <div style={{ color: C.muted, fontSize: 13 }}>{user.email}</div>}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 30 }}>
            {[[t("profileLevel"), globalStats.maxLevel], [t("profileStreak"), globalStats.maxStreak], [t("profileEntries"), globalStats.totalEntries]].map(([label, val]) => (
              <div key={label} className="gt-card" style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 10px", textAlign: "center", boxShadow: PANEL_SHADOW }}>
                <div style={{ fontFamily: FONT_MONO, fontSize: 22, fontWeight: 700, color: C.cyan }}>{val}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 2, color: C.muted, marginBottom: 10 }}>{t("achievements")}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {ACHIEVEMENT_DEFS.map((d) => {
              const unlocked = unlockedAch.includes(d.id);
              return (
                <div key={d.id} className="gt-card" style={{ background: unlocked ? C.panel : "transparent", border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, opacity: unlocked ? 1 : 0.45, boxShadow: unlocked ? PANEL_SHADOW : "none" }}>
                  <div style={{ marginBottom: 8 }}><Icon name={unlocked ? "medal" : "lock"} color={unlocked ? C.gold : C.muted} /></div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{t(`ach_${d.id}`)}</div>
                  <div style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.4 }}>{unlocked ? t(`ach_${d.id}_d`) : t("locked")}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "settings" && (
        <div className="gt-rise" style={{ maxWidth: 460, width: "100%" }}>
          <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 20, marginBottom: 20 }}>{t("tabSettings")}</h2>
          <div style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 2, color: C.muted, marginBottom: 8 }}>{t("settingsAccount")}</div>
          <div className="gt-card" style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 24, display: "flex", alignItems: "center", gap: 12, boxShadow: PANEL_SHADOW }}>
            <Avatar name={user?.name} size={40} />
            <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600 }}>{user?.name}</div>{user?.email && <div style={{ fontSize: 12, color: C.muted }}>{user.email}</div>}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, padding: "0 2px" }}>
            <span style={{ fontSize: 14 }}>{t("settingsNotif")}</span>
            <div onClick={() => setNotif(!notif)} style={{ width: 42, height: 24, borderRadius: 12, background: notif ? C.cyan : C.border, position: "relative", cursor: "pointer" }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", background: C.bg, position: "absolute", top: 3, left: notif ? 21 : 3, transition: "left 0.2s" }} />
            </div>
          </div>
          <Button variant="ghost" onClick={signOut} style={{ marginBottom: 30 }}>{t("settingsSignOut")}</Button>
          <div style={{ textAlign: "center", color: C.muted, fontSize: 11, fontFamily: FONT_MONO }}>{t("settingsVersion")}</div>
        </div>
      )}

      <TabBar active={tab} setActive={setTab} />
    </div>
  );
}
