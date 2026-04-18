import { useState, useEffect } from "react";
import { useStorage } from "./hooks/useStorage";
import { ALL_MODULES } from "./data/constants";
import ClassList from "./components/ClassList";
import Behavior from "./components/Behavior";
import Points from "./components/Points";
import Homework from "./components/Homework";
import Picker from "./components/Picker";
import ParentMessage from "./components/ParentMessage";
import Contacts from "./components/Contacts";
import Calendar from "./components/Calendar";
import WeeklySummary from "./components/WeeklySummary";
import Settings from "./components/Settings";
import Seat from "./components/Seat";
import HomeWidgets from "./components/HomeWidgets";
import Schedule from "./components/Schedule";
import Onboarding from "./components/Onboarding";
import "./index.css";

export default function App() {
  const [currentModule, setCurrentModule] = useState(null);
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [onboardingMode, setOnboardingMode] = useState(null); // null | "quick" | "detailed"
  const [settings, setSettings] = useStorage("sy_settings", {
    theme: "turuncu",
    className: "3-B",
    moduleOrder: ALL_MODULES.map((m) => m.id),
  });

  useEffect(() => {
    document.body.setAttribute("data-theme", settings.theme);
  }, [settings.theme]);

  useEffect(() => {
    function tick() {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      setTime(`${h}:${m}`);
      const days = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
      const months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
      setDate(`${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const allIds = ALL_MODULES.map((m) => m.id);
    const currentOrder = settings.moduleOrder || [];
    const missing = allIds.filter((id) => !currentOrder.includes(id));
    if (missing.length > 0) {
      const newOrder = [...currentOrder.filter((id) => allIds.includes(id)), ...missing];
      setSettings((prev) => ({ ...prev, moduleOrder: newOrder }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // İlk açılış kontrolü
  useEffect(() => {
    const done = localStorage.getItem("sy_onboarding_done");
    if (!done) {
      setOnboardingMode("quick");
    }
  }, []);

  // ─── PWA Geri Tuşu ───
  // Uygulama ilk açıldığında base state'i push et
  useEffect(() => {
    history.replaceState({ module: null }, "");
  }, []);

  // Modül açılınca history stack'e ekle
  function openModule(id) {
    setCurrentModule(id);
    history.pushState({ module: id }, "");
  }

  // Android geri tuşu / tarayıcı geri → modülü kapat
  useEffect(() => {
    function handlePop(e) {
      const mod = e.state?.module ?? null;
      setCurrentModule(mod);
      // Ana ekrana döndüysek onboarding'i kapatmaya gerek yok,
      // ama açıksa kalsın
    }
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  function closeOnboarding() {
    localStorage.setItem("sy_onboarding_done", "1");
    setOnboardingMode(null);
  }

  // Modül içindeki ← butonu → history.back() ile geri git
  // Bu sayede popstate tetiklenir ve state tutarlı kalır
  function goHome() {
    history.back();
  }

  const orderedModules = (settings.moduleOrder || ALL_MODULES.map((m) => m.id))
    .map((id) => ALL_MODULES.find((m) => m.id === id))
    .filter((m) => m && !(settings.hiddenModules || []).includes(m.id));

  if (currentModule === "list")     return <><ClassList onBack={goHome} />{onboardingMode && <Onboarding mode={onboardingMode} onClose={closeOnboarding} />}</>;
  if (currentModule === "behavior") return <Behavior onBack={goHome} />;
  if (currentModule === "points")   return <Points onBack={goHome} />;
  if (currentModule === "homework") return <Homework onBack={goHome} />;
  if (currentModule === "picker")   return <Picker onBack={goHome} />;
  if (currentModule === "msg")      return <ParentMessage onBack={goHome} />;
  if (currentModule === "contacts") return <Contacts onBack={goHome} />;
  if (currentModule === "calendar") return <Calendar onBack={goHome} />;
  if (currentModule === "week")     return <WeeklySummary onBack={goHome} />;
  if (currentModule === "settings") return <Settings onBack={goHome} onOpenGuide={(mode) => { goHome(); setTimeout(() => setOnboardingMode(mode), 100); }} />;
  if (currentModule === "seat")     return <Seat onBack={goHome} />;
  if (currentModule === "schedule") return <Schedule onBack={goHome} />;

  return (
    <div className="home-bg">

      {/* ─── Onboarding overlay ─── */}
      {onboardingMode && (
        <Onboarding mode={onboardingMode} onClose={closeOnboarding} />
      )}

      {/* ─── Saat & Tarih ─── */}
      <div className="home-clock">
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -60%)",
          width: 200, height: 200,
          borderRadius: "50%",
          background: "radial-gradient(circle, var(--accent-bg) 0%, transparent 70%)",
          pointerEvents: "none",
          filter: "blur(20px)",
          opacity: 0.8,
        }} />
        <div className="time" style={{ fontVariantNumeric: "tabular-nums", position: "relative" }}>{time}</div>
        <div className="date" style={{ position: "relative" }}>{date}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 8, position: "relative" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            background: "var(--accent-bg)", border: "1px solid var(--accent-border)",
            borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 800, color: "var(--accent-soft)",
          }}>
            ⚡ {settings.className}
          </div>
          {settings.teacherName && (
            <div style={{
              display: "inline-flex", alignItems: "center",
              background: "var(--glass)", border: "1px solid var(--glass-border)",
              borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 600, color: "var(--text3)",
            }}>
              {settings.teacherName}
            </div>
          )}
        </div>
      </div>

      {/* ─── Modül Grid ─── */}
      <div className="home-grid">
        {orderedModules.map((m) => (
          <button key={m.id} className="app-icon" onClick={() => openModule(m.id)}>
            <div className="ic" style={{
              background: m.grad,
              boxShadow: `0 4px 20px ${m.grad.match(/#[0-9a-f]{6}/i)?.[0]}44`,
            }}>
              {m.emoji}
            </div>
            <div className="il" style={{ whiteSpace: "pre-line" }}>{m.label}</div>
          </button>
        ))}
      </div>

      {/* ─── Widgets ─── */}
      <HomeWidgets onNavigate={openModule} />

      {/* ─── Footer ─── */}
      <div style={{
        textAlign: "center", marginTop: 16, fontSize: 10, color: "var(--text4)",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      }}>
        <span>⚡ Sınıf Yöneticisi</span>
        {settings.schoolName && (
          <><span style={{ color: "var(--text4)" }}>·</span><span>{settings.schoolName}</span></>
        )}
      </div>

    </div>
  );
}