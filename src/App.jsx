import { useState } from "react";
import { useStorage } from "./hooks/useStorage";
import { ALL_MODULES } from "./data/constants";
import ClassList from "./components/ClassList";
import Behavior from "./components/Behavior";
import Points from "./components/Points";
import Homework from "./components/Homework";
import "./index.css";

export default function App() {
  const [currentModule, setCurrentModule] = useState(null);
  const [settings] = useStorage("sy_settings", {
    theme: "turuncu",
    className: "3-B",
    moduleOrder: ALL_MODULES.map((m) => m.id),
  });

  // Tema uygula
  document.body.setAttribute("data-theme", settings.theme);

  function goHome() {
    setCurrentModule(null);
  }

  if (currentModule === "list") return <ClassList onBack={goHome} />;
  if (currentModule === "behavior") return <Behavior onBack={goHome} />;
  if (currentModule === "points") return <Points onBack={goHome} />;
  if (currentModule === "homework") return <Homework onBack={goHome} />;
  return (
    <div className="home-bg">
      <div className="home-clock">
        <div className="time">⚡</div>
        <div className="date">Sınıf Yöneticisi</div>
        <div style={{ fontSize: 12, fontWeight: 800, color: "var(--accent-soft)", marginTop: 4 }}>
          {settings.className}
        </div>
      </div>

      <div className="home-grid">
        {ALL_MODULES.map((m) => (
          <button
            key={m.id}
            className="app-icon"
            onClick={() => setCurrentModule(m.id)}
          >
            <div className="ic" style={{ background: m.grad }}>{m.emoji}</div>
            <div className="il">{m.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}