import { useState } from "react";
import { useStorage } from "../hooks/useStorage";
import { migrateLegacy, getTodayKey } from "../utils/helpers";
import { MSG_TEMPLATES } from "../data/constants";

const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];
const DEFAULT_TIMES = ["08:30", "09:20", "10:10", "11:00", "11:50", "12:40", "13:30", "14:20"];

// ─── Yardımcılar ────────────────────────────────────────
function getTotalBehaviorCount(behaviors) {
  if (!behaviors || behaviors.length === 0) return 0;
  if (typeof behaviors[0] === "string") return behaviors.length;
  return behaviors.reduce((sum, b) => sum + (b.count || 0), 0);
}

function buildAutoDetail(studentName, history, homeworkHistory) {
  const todayKey = getTodayKey();
  const behaviors = history[todayKey]?.[studentName]?.behaviors || [];
  const homeworkRec = homeworkHistory[todayKey]?.[studentName];
  const parts = [];

  if (behaviors.length > 0) {
    let behText;
    if (typeof behaviors[0] === "string") {
      const counts = {};
      behaviors.forEach((b) => { counts[b] = (counts[b] || 0) + 1; });
      behText = Object.entries(counts).map(([l, c]) => c > 1 ? `${l} (${c}x)` : l).join(", ");
    } else {
      behText = behaviors.filter(b => b.count > 0).map((b) => b.count > 1 ? `${b.label} (${b.count}x)` : b.label).join(", ");
    }
    if (behText) parts.push(`Bugünkü davranış notları: ${behText}.`);
  }

  if (homeworkRec && typeof homeworkRec === "object") {
    const missing = Object.entries(homeworkRec).filter(([, v]) => v === false).map(([k]) => k);
    if (missing.length > 0) parts.push(`Getirmediği ödevler: ${missing.join(", ")}.`);
  } else if (homeworkRec === false) {
    parts.push("Bugün ödevini getirmedi.");
  }

  return parts.join("\n");
}

function buildScheduleText(schedule, times, className) {
  const lines = [`📚 Haftalık Ders Programı${className ? ` — ${className}` : ""}\n`];
  DAYS.forEach((day) => {
    const dayData = schedule[day] || {};
    const lessons = times.map((time, i) => {
      const lesson = dayData[i];
      if (!lesson) return null;
      return `  ${time || `${i+1}.ders`} ${lesson}`;
    }).filter(Boolean);
    if (lessons.length > 0) {
      lines.push(`${day}:\n${lessons.join("\n")}`);
    }
  });
  return lines.join("\n");
}

function buildMessage(tpl, studentName, detail) {
  return tpl.replace(/{student}/g, studentName).replace(/{detail}/g, detail);
}

const TABS = [
  { id: "tek",    label: "Tek Mesaj" },
  { id: "toplu",  label: "Toplu" },
  { id: "sablon", label: "Şablonlar" },
  { id: "gecmis", label: "Geçmiş" },
];

// ─── Bileşen ─────────────────────────────────────────────
export default function ParentMessage({ onBack }) {
  const [students] = useStorage("sy_students", migrateLegacy(localStorage.getItem("sy_students")));
  const [contacts] = useStorage("sy_contacts", {});
  const [history] = useStorage("sy_history", {});
  const [homeworkHistory] = useStorage("sy_homework", {});
  const [schedule] = useStorage("sy_schedule", {});
  const [times] = useStorage("sy_schedule_times", DEFAULT_TIMES);
  const [settings] = useStorage("sy_settings", {});
  const [customTemplates, setCustomTemplates] = useStorage("sy_msg_templates", []);
  const [msgHistory, setMsgHistory] = useStorage("sy_msg_history", []);

  const [activeTab, setActiveTab] = useState("tek");

  // Ders programı şablonu — dinamik olarak oluştur
  const scheduleTemplate = {
    id: "_schedule",
    title: "📚 Ders Programı",
    desc: "Haftalık ders programını gönder",
    tpl: buildScheduleText(schedule, times, settings.className),
    isSchedule: true,
  };

  const allTemplates = [...MSG_TEMPLATES, scheduleTemplate, ...customTemplates];

  // ── Tek Mesaj ──
  const [tekStudent, setTekStudent] = useState("");
  const [tekTemplate, setTekTemplate] = useState(null);
  const [tekDetail, setTekDetail] = useState("");
  const [tekSent, setTekSent] = useState(false);

  // ── Toplu ──
  const [topluTemplate, setTopluTemplate] = useState(null);
  const [topluSelected, setTopluSelected] = useState([]);
  const [topluReady, setTopluReady] = useState(false);
  const [topluSent, setTopluSent] = useState({});

  // ── Şablon ──
  const [editingTpl, setEditingTpl] = useState(null);
  const [newTpl, setNewTpl] = useState({ title: "", desc: "", tpl: "" });

  // ─── Kayıt ──────────────────────────────────────────
  function recordSend(studentName, templateTitle, message) {
    setMsgHistory([{ id: Date.now(), studentName, templateTitle, message, date: new Date().toISOString() }, ...msgHistory]);
  }

  // ─── TEK MESAJ ──────────────────────────────────────
  function autoFill() {
    if (!tekStudent || !tekTemplate) return;
    if (tekTemplate.isSchedule) return; // program şablonunda detay gerekmez
    setTekDetail(buildAutoDetail(tekStudent, history, homeworkHistory));
  }

  // Ders programı şablonu: öğrencisiz, direkt mesaj olarak göster
  const tekMessage = tekTemplate
    ? tekTemplate.isSchedule
      ? tekTemplate.tpl  // program şablonu: detay/öğrenci gerekmez
      : tekStudent
        ? buildMessage(tekTemplate.tpl, tekStudent, tekDetail)
        : ""
    : "";

  const tekPhone = contacts[tekStudent]?.phone || "";

  function sendTek() {
    const phone = tekTemplate?.isSchedule
      ? "" // program için toplu kullan
      : tekPhone;
    if (!tekMessage) return;
    if (tekTemplate?.isSchedule) {
      // Program şablonunu toplu gönder sekmesine yönlendir
      setTopluTemplate(tekTemplate);
      setActiveTab("toplu");
      return;
    }
    if (!phone) return;
    const url = `https://wa.me/90${phone.replace(/\D/g, "")}?text=${encodeURIComponent(tekMessage)}`;
    window.open(url, "_blank");
    recordSend(tekStudent, tekTemplate.title, tekMessage);
    setTekSent(true);
  }

  // ─── TOPLU ──────────────────────────────────────────
  function toggleTopluStudent(name) {
    setTopluSelected((prev) => prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]);
    setTopluReady(false);
    setTopluSent({});
  }

  function selectAll() {
    setTopluSelected(students.map((s) => s.name));
    setTopluReady(false);
    setTopluSent({});
  }

  function prepareToplu() {
    if (!topluTemplate || topluSelected.length === 0) return;
    setTopluReady(true);
    setTopluSent({});
  }

  function sendTopluOne(studentName) {
    const phone = contacts[studentName]?.phone || "";
    if (!phone) return;
    let message;
    if (topluTemplate.isSchedule) {
      message = topluTemplate.tpl;
    } else {
      const detail = buildAutoDetail(studentName, history, homeworkHistory);
      message = buildMessage(topluTemplate.tpl, studentName, detail);
    }
    const url = `https://wa.me/90${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    recordSend(studentName, topluTemplate.title, message);
    setTopluSent((prev) => ({ ...prev, [studentName]: true }));
  }

  // ─── ŞABLON ─────────────────────────────────────────
  function saveNewTemplate() {
    if (!newTpl.title.trim() || !newTpl.tpl.trim()) return;
    setCustomTemplates([...customTemplates, { ...newTpl, id: `custom_${Date.now()}` }]);
    setNewTpl({ title: "", desc: "", tpl: "" });
  }

  function saveEditTemplate() {
    if (!editingTpl) return;
    setCustomTemplates(customTemplates.map((t) => t.id === editingTpl.id ? editingTpl : t));
    setEditingTpl(null);
  }

  function deleteTemplate(id) {
    if (!confirm("Şablonu sil?")) return;
    setCustomTemplates(customTemplates.filter((t) => t.id !== id));
  }

  // ─── GEÇMİŞ ─────────────────────────────────────────
  function clearHistory() {
    if (!confirm("Geçmişi temizle?")) return;
    setMsgHistory([]);
  }

  function formatDate(iso) {
    const d = new Date(iso);
    return `${d.getDate().toString().padStart(2,"0")}.${(d.getMonth()+1).toString().padStart(2,"0")} ${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`;
  }

  // ─── RENDER ─────────────────────────────────────────
  return (
    <div className="module-view active">
      <div className="mh">
        <button className="bb" onClick={onBack}>←</button>
        <div className="mt">📨 Veli Mesajı</div>
      </div>

      <div style={{ display: "flex", gap: 6, padding: "10px 16px 0", overflowX: "auto" }}>
        {TABS.map((t) => (
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

      <div className="mb" style={{ paddingTop: 12 }}>

        {/* ══ TEK MESAJ ══ */}
        {activeTab === "tek" && (
          <div>
            {/* Ders programı şablonu seçiliyse öğrenci seçmeye gerek yok */}
            {(!tekTemplate || !tekTemplate.isSchedule) && (
              <select className="ti" style={{ width: "100%", marginBottom: 10 }}
                value={tekStudent}
                onChange={(e) => { setTekStudent(e.target.value); setTekSent(false); }}
              >
                <option value="">Öğrenci seç...</option>
                {students.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            )}

            {allTemplates.map((t) => (
              <div key={t.id}
                className={`msg-tpl ${tekTemplate?.id === t.id ? "sel" : ""}`}
                onClick={() => { setTekTemplate(t); setTekSent(false); setTekDetail(""); }}
              >
                <div style={{ fontWeight: 700, fontSize: 13 }}>{t.title}</div>
                <div style={{ fontSize: 11, color: "var(--text3)" }}>{t.desc}</div>
              </div>
            ))}

            {/* Detay — program şablonunda gösterme */}
            {tekTemplate && !tekTemplate.isSchedule && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                  <button className="bs"
                    style={{ background: "var(--accent-bg)", color: "var(--accent-soft)", border: "1px solid var(--accent-border)" }}
                    onClick={autoFill} disabled={!tekStudent}
                  >
                    ⚡ Otomatik Doldur
                  </button>
                  {tekDetail && (
                    <button className="bs"
                      style={{ background: "var(--surface)", color: "var(--text3)", border: "1px solid var(--card-border)" }}
                      onClick={() => setTekDetail("")}
                    >
                      Temizle
                    </button>
                  )}
                </div>
                <textarea className="ti"
                  style={{ width: "100%", resize: "none", minHeight: 60 }}
                  placeholder="Detay ekle veya otomatik doldur..."
                  value={tekDetail}
                  onChange={(e) => { setTekDetail(e.target.value); setTekSent(false); }}
                />
              </div>
            )}

            {/* Önizleme */}
            {tekMessage && (
              <>
                <div className="msg-out" style={{ marginTop: 12 }}>{tekMessage}</div>

                {/* Program şablonu → toplu gönder yönlendirmesi */}
                {tekTemplate?.isSchedule ? (
                  <button className="bp"
                    style={{ background: "var(--accent)", marginTop: 10 }}
                    onClick={sendTek}
                  >
                    👥 Toplu Gönder'e Geç
                  </button>
                ) : (
                  <>
                    {!tekPhone && (
                      <div style={{ fontSize: 11, color: "var(--red)", marginTop: 6 }}>
                        ⚠️ Telefon numarası kayıtlı değil
                      </div>
                    )}
                    <button className="bp"
                      style={{
                        background: tekSent ? "var(--green)" : "#25d366", marginTop: 10,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        opacity: !tekPhone ? 0.4 : 1,
                      }}
                      onClick={sendTek} disabled={!tekPhone}
                    >
                      {tekSent ? "✓ Gönderildi" : "📱 WhatsApp'ta Gönder"}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* ══ TOPLU ══ */}
        {activeTab === "toplu" && (
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 8, color: "var(--text2)" }}>Şablon</div>
            {allTemplates.map((t) => (
              <div key={t.id}
                className={`msg-tpl ${topluTemplate?.id === t.id ? "sel" : ""}`}
                onClick={() => { setTopluTemplate(t); setTopluReady(false); setTopluSent({}); }}
              >
                <div style={{ fontWeight: 700, fontSize: 13 }}>{t.title}</div>
                <div style={{ fontSize: 11, color: "var(--text3)" }}>{t.desc}</div>
              </div>
            ))}

            {/* Program şablonu seçiliyse önizleme */}
            {topluTemplate?.isSchedule && (
              <div className="msg-out" style={{ marginTop: 8, marginBottom: 8 }}>{topluTemplate.tpl}</div>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, marginBottom: 8 }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: "var(--text2)" }}>
                Öğrenciler ({topluSelected.length}/{students.length})
              </div>
              <button className="bs"
                style={{ background: "var(--surface)", color: "var(--text2)", border: "1px solid var(--card-border)" }}
                onClick={selectAll}
              >
                Tümünü Seç
              </button>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
              {students.map((s) => {
                const selected = topluSelected.includes(s.name);
                const hasPhone = !!contacts[s.name]?.phone;
                return (
                  <button key={s.id} onClick={() => toggleTopluStudent(s.name)}
                    style={{
                      padding: "6px 12px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                      background: selected ? "var(--accent-bg)" : "var(--surface2)",
                      border: `1px solid ${selected ? "var(--accent-border)" : "var(--card-border)"}`,
                      color: selected ? "var(--accent-soft)" : hasPhone ? "var(--text2)" : "var(--text4)",
                    }}
                  >
                    {s.name}{!hasPhone && " ⚠️"}
                  </button>
                );
              })}
            </div>

            <button className="bp"
              style={{ background: "var(--accent)", marginBottom: 12 }}
              onClick={prepareToplu}
              disabled={!topluTemplate || topluSelected.length === 0}
            >
              Mesajları Hazırla ({topluSelected.length} kişi)
            </button>

            {topluReady && (
              <div>
                <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 10 }}>
                  {topluTemplate?.isSchedule ? "Ders programı gönderilecek:" : "Detaylar otomatik dolduruldu:"}
                </div>
                {topluSelected.map((name) => {
                  const sent = topluSent[name];
                  const hasPhone = !!contacts[name]?.phone;
                  return (
                    <div key={name} className="card" style={{
                      display: "flex", alignItems: "center", gap: 10,
                      borderColor: sent ? "rgba(74,222,128,0.35)" : undefined,
                      background: sent ? "rgba(74,222,128,0.06)" : undefined,
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                        background: sent ? "rgba(74,222,128,0.2)" : "var(--surface)",
                        border: `1px solid ${sent ? "rgba(74,222,128,0.4)" : "var(--card-border)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: 800,
                        color: sent ? "var(--green)" : "var(--text3)",
                      }}>
                        {sent ? "✓" : name.charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: sent ? "var(--green)" : "var(--text)" }}>{name}</div>
                        {!hasPhone && <div style={{ fontSize: 10, color: "var(--red)" }}>Telefon kayıtlı değil</div>}
                      </div>
                      <button
                        onClick={() => sendTopluOne(name)}
                        disabled={!hasPhone || sent}
                        style={{
                          padding: "6px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                          background: sent ? "rgba(74,222,128,0.2)" : "#25d366",
                          border: `1px solid ${sent ? "rgba(74,222,128,0.4)" : "#25d366"}`,
                          color: sent ? "var(--green)" : "#fff",
                          opacity: !hasPhone ? 0.4 : 1,
                          cursor: sent || !hasPhone ? "default" : "pointer",
                        }}
                      >
                        {sent ? "✓ Gönderildi" : "📱 Gönder"}
                      </button>
                    </div>
                  );
                })}
                <div style={{ marginTop: 12, fontSize: 12, color: "var(--text3)", textAlign: "center" }}>
                  {Object.values(topluSent).filter(Boolean).length} / {topluSelected.length} gönderildi
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ ŞABLONLAR ══ */}
        {activeTab === "sablon" && (
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 8, color: "var(--text2)" }}>Varsayılan Şablonlar</div>
            {[...MSG_TEMPLATES, scheduleTemplate].map((t) => (
              <div key={t.id} className="card" style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 700 }}>{t.title}</div>
                <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{t.desc}</div>
              </div>
            ))}

            <div style={{ fontWeight: 800, fontSize: 13, margin: "16px 0 8px", color: "var(--text2)" }}>Özel Şablonlar</div>
            {customTemplates.length === 0 && (
              <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 12 }}>Henüz özel şablon yok.</div>
            )}
            {customTemplates.map((t) => (
              <div key={t.id} className="card" style={{ marginBottom: 8 }}>
                {editingTpl?.id === t.id ? (
                  <div>
                    <input className="ti" style={{ width: "100%", marginBottom: 6 }} placeholder="Başlık"
                      value={editingTpl.title} onChange={(e) => setEditingTpl({ ...editingTpl, title: e.target.value })} />
                    <input className="ti" style={{ width: "100%", marginBottom: 6 }} placeholder="Açıklama"
                      value={editingTpl.desc} onChange={(e) => setEditingTpl({ ...editingTpl, desc: e.target.value })} />
                    <textarea className="ti" style={{ width: "100%", minHeight: 80, resize: "none", marginBottom: 8 }}
                      placeholder={"Mesaj metni ({student}, {detail})"}
                      value={editingTpl.tpl} onChange={(e) => setEditingTpl({ ...editingTpl, tpl: e.target.value })} />
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="bs" style={{ background: "var(--accent)", color: "#fff" }} onClick={saveEditTemplate}>Kaydet</button>
                      <button className="bs" style={{ background: "var(--surface)", color: "var(--text2)" }} onClick={() => setEditingTpl(null)}>İptal</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{t.title}</div>
                      <div style={{ fontSize: 11, color: "var(--text3)" }}>{t.desc}</div>
                    </div>
                    <button className="bs" style={{ background: "var(--surface)", color: "var(--text2)" }} onClick={() => setEditingTpl(t)}>✏️</button>
                    <button className="bs" style={{ background: "rgba(239,68,68,0.15)", color: "var(--red)" }} onClick={() => deleteTemplate(t.id)}>🗑️</button>
                  </div>
                )}
              </div>
            ))}

            <div className="card" style={{ marginTop: 8 }}>
              <div style={{ fontWeight: 800, fontSize: 12, marginBottom: 10, color: "var(--accent-soft)" }}>+ Yeni Şablon</div>
              <input className="ti" style={{ width: "100%", marginBottom: 6 }}
                placeholder="Başlık (ör. 📞 Arama Notu)" value={newTpl.title}
                onChange={(e) => setNewTpl({ ...newTpl, title: e.target.value })} />
              <input className="ti" style={{ width: "100%", marginBottom: 6 }}
                placeholder="Kısa açıklama" value={newTpl.desc}
                onChange={(e) => setNewTpl({ ...newTpl, desc: e.target.value })} />
              <textarea className="ti" style={{ width: "100%", minHeight: 80, resize: "none", marginBottom: 8 }}
                placeholder={"Mesaj metni.\n{student} = öğrenci adı\n{detail} = detay"}
                value={newTpl.tpl} onChange={(e) => setNewTpl({ ...newTpl, tpl: e.target.value })} />
              <button className="bp" style={{ background: "var(--accent)" }} onClick={saveNewTemplate}>Şablonu Kaydet</button>
            </div>
          </div>
        )}

        {/* ══ GEÇMİŞ ══ */}
        {activeTab === "gecmis" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: "var(--text2)" }}>{msgHistory.length} kayıt</div>
              {msgHistory.length > 0 && (
                <button className="bs"
                  style={{ background: "rgba(239,68,68,0.15)", color: "var(--red)", border: "1px solid rgba(239,68,68,0.3)" }}
                  onClick={clearHistory}
                >Temizle</button>
              )}
            </div>
            {msgHistory.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text3)", fontSize: 13 }}>Henüz gönderim yok</div>
            )}
            {msgHistory.map((entry) => (
              <div key={entry.id} className="card" style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.3)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 800, color: "var(--green)", flexShrink: 0,
                    }}>✓</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{entry.studentName}</div>
                      <div style={{ fontSize: 10, color: "var(--text3)" }}>{entry.templateTitle}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text4)" }}>{formatDate(entry.date)}</div>
                </div>
                <div style={{
                  fontSize: 11, color: "var(--text3)", marginTop: 6,
                  lineHeight: 1.5, borderTop: "1px solid var(--card-border)", paddingTop: 6,
                  whiteSpace: "pre-wrap",
                  display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>
                  {entry.message}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}