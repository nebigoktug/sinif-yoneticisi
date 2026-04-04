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
import "./index.css";

export default function App() {
  const [currentModule, setCurrentModule] = useState(null);
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [settings] = useStorage("sy_settings", {
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

  function goHome() { setCurrentModule(null); }

const orderedModules = (settings.moduleOrder || ALL_MODULES.map((m) => m.id))
  .map((id) => ALL_MODULES.find((m) => m.id === id))
  .filter((m) => m && !(settings.hiddenModules || []).includes(m.id));

  if (currentModule === "list") return <ClassList onBack={goHome} />;
  if (currentModule === "behavior") return <Behavior onBack={goHome} />;
  if (currentModule === "points") return <Points onBack={goHome} />;
  if (currentModule === "homework") return <Homework onBack={goHome} />;
  if (currentModule === "picker") return <Picker onBack={goHome} />;
  if (currentModule === "msg") return <ParentMessage onBack={goHome} />;
  if (currentModule === "contacts") return <Contacts onBack={goHome} />;
  if (currentModule === "calendar") return <Calendar onBack={goHome} />;
  if (currentModule === "week") return <WeeklySummary onBack={goHome} />;
  if (currentModule === "settings") return <Settings onBack={goHome} />;
  if (currentModule === "seat") return <Seat onBack={goHome} />;

  return (
    <div className="home-bg">
      <div className="home-clock">
        <div className="time" style={{ fontVariantNumeric: "tabular-nums" }}>{time}</div>
        <div className="date">{date}</div>
        <div style={{ fontSize: 12, fontWeight: 800, color: "var(--accent-soft)", marginTop: 4 }}>
          ⚡ {settings.className}
          {settings.teacherName && (
            <span style={{ color: "var(--text3)", fontWeight: 600, marginLeft: 8 }}>
              {settings.teacherName}
            </span>
          )}
        </div>
      </div>

      <div className="home-grid">
        {orderedModules.map((m) => (
          <button key={m.id} className="app-icon" onClick={() => setCurrentModule(m.id)}>
            <div className="ic" style={{ background: m.grad, boxShadow: `0 4px 20px ${m.grad.match(/#[0-9a-f]{6}/i)?.[0]}22` }}>
              {m.emoji}
            </div>
            <div className="il" style={{ whiteSpace: "pre-line" }}>{m.label}</div>
          </button>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 20, fontSize: 10, color: "var(--text4)" }}>
        ⚡ Sınıf Yöneticisi
        {settings.schoolName && (
          <span style={{ marginLeft: 6 }}>· {settings.schoolName}</span>
        )}
      </div>
    </div>
  );
}