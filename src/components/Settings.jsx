import { useStorage } from "../hooks/useStorage";
import { THEMES, ALL_MODULES } from "../data/constants";

export default function Settings({ onBack }) {
  const [settings, setSettings] = useStorage("sy_settings", {
    theme: "turuncu",
    className: "3-B",
    moduleOrder: ALL_MODULES.map((m) => m.id),
  });

  function setTheme(id) {
    document.body.setAttribute("data-theme", id);
    setSettings({ ...settings, theme: id });
  }

  function setClassName(name) {
    setSettings({ ...settings, className: name });
  }

  return (
    <div className="module-view active">
      <div className="mh">
        <button className="bb" onClick={onBack}>←</button>
        <div className="mt">⚙️ Ayarlar</div>
      </div>
      <div className="mb">
        <div style={{ fontWeight: 800, marginBottom: 10 }}>Sınıf Adı</div>
        <input
          className="ti"
          style={{ width: "100%", marginBottom: 20 }}
          value={settings.className}
          onChange={(e) => setClassName(e.target.value)}
          placeholder="3-B"
        />

        <div style={{ fontWeight: 800, marginBottom: 10 }}>Tema</div>
        {THEMES.map((t) => (
          <div
            key={t.id}
            className={`theme-card ${settings.theme === t.id ? "active" : ""}`}
            style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
            onClick={() => setTheme(t.id)}
          >
            <div className="theme-dots">
              {t.dots.map((c) => <span key={c} style={{ background: c, width: 16, height: 16, borderRadius: "50%", display: "inline-block" }} />)}
            </div>
            <span style={{ fontWeight: 700 }}>{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}