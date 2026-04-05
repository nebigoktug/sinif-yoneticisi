import { useState } from "react";
import { useStorage } from "../hooks/useStorage";
import { THEMES, ALL_MODULES } from "../data/constants";

export default function Settings({ onBack, onOpenGuide }) {
  const [settings, setSettings] = useStorage("sy_settings", {
    theme: "turuncu",
    className: "3-B",
    teacherName: "",
    schoolName: "",
    moduleOrder: ALL_MODULES.map((m) => m.id),
    hiddenModules: [],
    behaviorAutoPenalty: false,
    homeworkAutoBehavior: false,
  });

  const [activeTab, setActiveTab] = useState("genel");

  function update(key, value) {
    const updated = { ...settings, [key]: value };
    if (key === "theme") document.body.setAttribute("data-theme", value);
    setSettings(updated);
  }

  function toggleHidden(id) {
    if (id === "settings") return;
    const hidden = settings.hiddenModules || [];
    update("hiddenModules", hidden.includes(id) ? hidden.filter((x) => x !== id) : [...hidden, id]);
  }

  function moveModule(id, dir) {
    const order = [...(settings.moduleOrder || ALL_MODULES.map((m) => m.id))];
    const i = order.indexOf(id);
    if (i === -1) return;
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    [order[i], order[j]] = [order[j], order[i]];
    update("moduleOrder", order);
  }

  function exportData() {
    const data = {};
    ["sy_students", "sy_history", "sy_points", "sy_homework", "sy_seating", "sy_layout", "sy_contacts", "sy_calendar", "sy_settings"].forEach((k) => {
      data[k] = localStorage.getItem(k);
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sinif-yoneticisi-yedek-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  }

  function importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        Object.entries(data).forEach(([k, v]) => { if (v) localStorage.setItem(k, v); });
        alert("Veri yüklendi. Sayfa yenilenecek.");
        window.location.reload();
      } catch {
        alert("Geçersiz dosya.");
      }
    };
    reader.readAsText(file);
  }

  function resetAll() {
    if (!confirm("Tüm veriler silinecek. Emin misin?")) return;
    ["sy_students", "sy_history", "sy_points", "sy_homework", "sy_seating", "sy_layout", "sy_contacts", "sy_calendar", "sy_settings"].forEach((k) => localStorage.removeItem(k));
    window.location.reload();
  }

  const tabs = [
    { id: "genel", label: "Genel" },
    { id: "tema", label: "Tema" },
    { id: "moduller", label: "Modüller" },
    { id: "otomasyon", label: "Otomasyon" },
    { id: "veri", label: "Veri" },
    { id: "yasal", label: "Yasal" },
  ];

  return (
    <div className="module-view active">
      <div className="mh">
        <button className="bb" onClick={onBack}>←</button>
        <div className="mt">⚙️ Ayarlar</div>
      </div>
      <div className="mb">

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto" }}>
          {tabs.map((t) => (
            <button key={t.id} className="chip"
              style={{
                background: activeTab === t.id ? "var(--accent)" : "var(--surface)",
                color: activeTab === t.id ? "#fff" : "var(--text2)",
                border: "1px solid var(--card-border)",
                whiteSpace: "nowrap",
              }}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Genel */}
        {activeTab === "genel" && (
          <div>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Sınıf Adı</div>
            <input className="ti" style={{ width: "100%", marginBottom: 14 }}
              value={settings.className} placeholder="3-B"
              onChange={(e) => update("className", e.target.value)} />

            <div style={{ fontWeight: 800, marginBottom: 8 }}>Öğretmen Adı</div>
            <input className="ti" style={{ width: "100%", marginBottom: 14 }}
              value={settings.teacherName || ""} placeholder="Ad Soyad"
              onChange={(e) => update("teacherName", e.target.value)} />

            <div style={{ fontWeight: 800, marginBottom: 8 }}>Okul Adı</div>
            <input className="ti" style={{ width: "100%", marginBottom: 24 }}
              value={settings.schoolName || ""} placeholder="Okul adı"
              onChange={(e) => update("schoolName", e.target.value)} />

            {/* ─── Kılavuz ─── */}
            <div style={{
              background: "var(--card)",
              border: "1px solid var(--card-border)",
              borderRadius: 16,
              padding: "14px",
            }}>
              <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 4, color: "var(--text2)" }}>
                📖 Kullanım Kılavuzu
              </div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 12 }}>
                Uygulamayı nasıl kullanacağını öğrenmek için kılavuzu aç.
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="bp"
                  style={{ background: "var(--accent)", flex: 1, padding: "10px" }}
                  onClick={() => onOpenGuide("quick")}
                >
                  🗺️ Hızlı Tur
                </button>
                <button
                  className="bp"
                  style={{ background: "var(--surface)", color: "var(--text)", border: "1px solid var(--card-border)", flex: 1, padding: "10px" }}
                  onClick={() => onOpenGuide("detailed")}
                >
                  📖 Detaylı
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tema */}
        {activeTab === "tema" && (
          <div>
            {THEMES.map((t) => (
              <div key={t.id}
                className={`theme-card ${settings.theme === t.id ? "active" : ""}`}
                style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
                onClick={() => update("theme", t.id)}
              >
                <div className="theme-dots">
                  {t.dots.map((c) => (
                    <span key={c} style={{ background: c, width: 16, height: 16, borderRadius: "50%", display: "inline-block", border: "2px solid #00000033" }} />
                  ))}
                </div>
                <span style={{ fontWeight: 700 }}>{t.label}</span>
                {settings.theme === t.id && <span style={{ marginLeft: "auto", color: "var(--green)" }}>✓</span>}
              </div>
            ))}
          </div>
        )}

        {/* Modüller */}
        {activeTab === "moduller" && (
          <div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 10 }}>
              Sıralamak için ↑↓, gizlemek için göz ikonuna tıkla.
            </div>
            {(settings.moduleOrder || ALL_MODULES.map((m) => m.id)).map((id, i, arr) => {
              const mod = ALL_MODULES.find((m) => m.id === id);
              if (!mod) return null;
              const hidden = (settings.hiddenModules || []).includes(id);
              return (
                <div key={id} className="card" style={{ display: "flex", alignItems: "center", gap: 10, opacity: hidden ? 0.4 : 1 }}>
                  <div style={{ fontSize: 20 }}>{mod.emoji}</div>
                  <div style={{ flex: 1, fontWeight: 700, fontSize: 13 }}>{mod.label.replace("\n", " ")}</div>
                  <button className="bs" style={{ background: "var(--surface)", color: "var(--text2)" }}
                    onClick={() => moveModule(id, -1)} disabled={i === 0}>↑</button>
                  <button className="bs" style={{ background: "var(--surface)", color: "var(--text2)" }}
                    onClick={() => moveModule(id, 1)} disabled={i === arr.length - 1}>↓</button>
                  {id !== "settings" && (
                    <button className="bs" style={{ background: hidden ? "var(--accent)" : "var(--surface)", color: hidden ? "#fff" : "var(--text2)" }}
                      onClick={() => toggleHidden(id)}>
                      {hidden ? "👁️" : "🚫"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Otomasyon */}
        {activeTab === "otomasyon" && (
          <div>
            <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 700 }}>Ödev → Davranış</div>
                <div style={{ fontSize: 11, color: "var(--text3)" }}>Ödev getirmeyince otomatik "Ödev Eksik" işaretle</div>
              </div>
              <button className="chip"
                style={{ background: settings.homeworkAutoBehavior ? "var(--green)" : "var(--surface)", color: settings.homeworkAutoBehavior ? "#000" : "var(--text2)", border: "1px solid var(--card-border)" }}
                onClick={() => update("homeworkAutoBehavior", !settings.homeworkAutoBehavior)}>
                {settings.homeworkAutoBehavior ? "Açık" : "Kapalı"}
              </button>
            </div>

            <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 700 }}>Davranış → Puan</div>
                <div style={{ fontSize: 11, color: "var(--text3)" }}>Her uyarıda otomatik -1 puan düş</div>
              </div>
              <button className="chip"
                style={{ background: settings.behaviorAutoPenalty ? "var(--green)" : "var(--surface)", color: settings.behaviorAutoPenalty ? "#000" : "var(--text2)", border: "1px solid var(--card-border)" }}
                onClick={() => update("behaviorAutoPenalty", !settings.behaviorAutoPenalty)}>
                {settings.behaviorAutoPenalty ? "Açık" : "Kapalı"}
              </button>
            </div>
          </div>
        )}

        {/* Veri */}
        {activeTab === "veri" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button className="bp" style={{ background: "var(--accent)" }} onClick={exportData}>
              📤 Verileri Dışa Aktar (JSON)
            </button>
            <label className="bp" style={{ background: "var(--blue)", textAlign: "center", cursor: "pointer" }}>
              📥 Verileri İçe Aktar
              <input type="file" accept=".json" style={{ display: "none" }} onChange={importData} />
            </label>
            <button className="bp" style={{ background: "var(--accent2)", marginTop: 20 }} onClick={resetAll}>
              🗑️ Tüm Verileri Sıfırla
            </button>
          </div>
        )}

        {/* Yasal */}
        {activeTab === "yasal" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 4 }}>
              Uygulamayı kullanarak aşağıdaki belgeleri kabul etmiş sayılırsınız.
            </div>

            {[
              { emoji: "🔒", label: "Gizlilik Politikası", href: "/gizlilik-politikasi" },
              { emoji: "📋", label: "KVKK Aydınlatma Metni", href: "/kvkk-aydinlatma" },
              { emoji: "📄", label: "Kullanım Koşulları", href: "/kullanim-kosullari" },
            ].map(({ emoji, label, href }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  textDecoration: "none",
                  color: "var(--text)",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                <span style={{ fontSize: 22 }}>{emoji}</span>
                <span style={{ flex: 1 }}>{label}</span>
                <span style={{ color: "var(--text3)", fontSize: 16 }}>›</span>
              </a>
            ))}

            <div className="card" style={{ marginTop: 8, fontSize: 11, color: "var(--text3)", lineHeight: 1.8 }}>
              <div style={{ fontWeight: 700, marginBottom: 2 }}>⚡ Sınıf Yöneticisi</div>
              <div>© 2026 Nebi Göktuğ Çalışkan</div>
              <div>v1.0 · sinifyoneticisi.com.tr</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}