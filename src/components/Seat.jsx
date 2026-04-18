import { useState, useRef } from "react";
import { useStorage } from "../hooks/useStorage";
import { migrateLegacy } from "../utils/helpers";
import { LAYOUT_PRESETS } from "../data/constants";
import HelpButton from "./HelpButton";

const HELP = [
  "Otomatik ile öğrenciler rastgele yerleştirilir.",
  "İki sıraya sırayla tıklayarak yer değiştir; sürükle-bırak da çalışır.",
  "Kurallar sekmesinde yan yana oturmaması gerekenleri belirt.",
  "⚠️ işareti aktif kural ihlalini gösterir.",
  "Preset veya özel boyutla düzeni değiştirebilirsin (maks. 8×12).",
];

export default function Seat({ onBack }) {
  const [students] = useStorage("sy_students", migrateLegacy(localStorage.getItem("sy_students")));
  const [seatingMap, setSeatingMap] = useStorage("sy_seating", {});
  const [layout, setLayout] = useStorage("sy_layout", { cols: 3, rows: 5 });
  const [separations, setSeparations] = useStorage("sy_separations", []);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [dragSrc, setDragSrc] = useState(null);
  const [activeTab, setActiveTab] = useState("plan");
  const [customCols, setCustomCols] = useState("");
  const [customRows, setCustomRows] = useState("");
  const [sepStudent1, setSepStudent1] = useState("");
  const [sepStudent2, setSepStudent2] = useState("");

  function getSeatKey(col, row, side) {
    return `${col}-${row}-${side}`;
  }

  function getStudentAtSeat(key) {
    return seatingMap[key] || null;
  }

  function handleSeatClick(key) {
    if (dragSrc !== null) return;
    if (selectedSeat === null) {
      setSelectedSeat(key);
    } else {
      if (selectedSeat === key) { setSelectedSeat(null); return; }
      const newMap = { ...seatingMap };
      const a = newMap[selectedSeat];
      const b = newMap[key];
      if (b) newMap[selectedSeat] = b; else delete newMap[selectedSeat];
      if (a) newMap[key] = a; else delete newMap[key];
      setSeatingMap(newMap);
      setSelectedSeat(null);
    }
  }

  function handleDragStart(key) {
    setDragSrc(key);
    setSelectedSeat(null);
  }

  function handleDrop(key) {
    if (dragSrc === null || dragSrc === key) { setDragSrc(null); return; }
    const newMap = { ...seatingMap };
    const a = newMap[dragSrc];
    const b = newMap[key];
    if (b) newMap[dragSrc] = b; else delete newMap[dragSrc];
    if (a) newMap[key] = a; else delete newMap[key];
    setSeatingMap(newMap);
    setDragSrc(null);
  }

  function isViolating(key, studentName) {
    const neighbors = getNeighborKeys(key);
    return neighbors.some((nk) => {
      const neighbor = seatingMap[nk];
      if (!neighbor) return false;
      return separations.some(
        (s) => (s[0] === studentName && s[1] === neighbor) || (s[1] === studentName && s[0] === neighbor)
      );
    });
  }

  function getNeighborKeys(key) {
    const [col, row, side] = key.split("-");
    const c = parseInt(col, 10), r = parseInt(row, 10);
    const otherSide = side === "left" ? "right" : "left";
    const keys = [`${c}-${r}-${otherSide}`];
    if (r > 0) { keys.push(`${c}-${r - 1}-left`); keys.push(`${c}-${r - 1}-right`); }
    if (r < layout.rows - 1) { keys.push(`${c}-${r + 1}-left`); keys.push(`${c}-${r + 1}-right`); }
    return keys;
  }

  function autoAssign() {
    let attempts = 0;
    while (attempts < 50) {
      const shuffled = [...students].sort(() => Math.random() - 0.5);
      const newMap = {};
      const keys = [];
      for (let row = 0; row < layout.rows; row++)
        for (let col = 0; col < layout.cols; col++)
          for (const side of ["left", "right"])
            keys.push(getSeatKey(col, row, side));

      let valid = true;
      for (let i = 0; i < Math.min(shuffled.length, keys.length); i++) {
        newMap[keys[i]] = shuffled[i].name;
      }

      // Kural ihlali kontrolü
      for (const [key, name] of Object.entries(newMap)) {
        const neighbors = getNeighborKeys(key);
        for (const nk of neighbors) {
          const neighbor = newMap[nk];
          if (!neighbor) continue;
          if (separations.some((s) => (s[0] === name && s[1] === neighbor) || (s[1] === name && s[0] === neighbor))) {
            valid = false;
            break;
          }
        }
        if (!valid) break;
      }

      if (valid) { setSeatingMap(newMap); setSelectedSeat(null); return; }
      attempts++;
    }
    // 50 denemede çözüm bulunamazsa kuralsız yerleştir
    const shuffled = [...students].sort(() => Math.random() - 0.5);
    const newMap = {};
    let i = 0;
    for (let row = 0; row < layout.rows; row++)
      for (let col = 0; col < layout.cols; col++)
        for (const side of ["left", "right"])
          if (i < shuffled.length) newMap[getSeatKey(col, row, side)] = shuffled[i++].name;
    setSeatingMap(newMap);
    setSelectedSeat(null);
    alert("Tüm kurallar sağlanamadı, en iyi deneme yerleştirildi.");
  }

  function clearSeats() {
    if (!confirm("Oturma düzenini sıfırla?")) return;
    setSeatingMap({});
    setSelectedSeat(null);
  }

  function applyCustomLayout() {
    const c = parseInt(customCols);
    const r = parseInt(customRows);
    if (!c || !r || c < 1 || c > 8 || r < 1 || r > 12) {
      alert("Sütun: 1-8, Sıra: 1-12 arasında olmalı.");
      return;
    }
    setLayout({ cols: c, rows: r });
    setCustomCols("");
    setCustomRows("");
  }

  function addSeparation() {
    if (!sepStudent1 || !sepStudent2 || sepStudent1 === sepStudent2) return;
    const exists = separations.some(
      (s) => (s[0] === sepStudent1 && s[1] === sepStudent2) || (s[1] === sepStudent1 && s[0] === sepStudent2)
    );
    if (exists) return;
    setSeparations([...separations, [sepStudent1, sepStudent2]]);
    setSepStudent1("");
    setSepStudent2("");
  }

  function removeSeparation(i) {
    setSeparations(separations.filter((_, idx) => idx !== i));
  }

  const unassigned = students.filter((s) => !Object.values(seatingMap).includes(s.name));

  const tabs = [
    { id: "plan", label: "📐 Düzen" },
    { id: "kurallar", label: "🚫 Kurallar" },
  ];

  return (
    <div className="module-view active">
      <div className="mh">
        <button className="bb" onClick={onBack}>←</button>
        <div className="mt">🪑 Oturma Düzeni</div>
        <HelpButton title="🪑 Oturma Düzeni" items={HELP} />
      </div>
      <div className="mb">

        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {tabs.map((t) => (
            <button key={t.id} className="chip"
              style={{
                background: activeTab === t.id ? "var(--accent)" : "var(--surface)",
                color: activeTab === t.id ? "#fff" : "var(--text2)",
                border: "1px solid var(--card-border)",
              }}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* DÜZEN SEKMESİ */}
        {activeTab === "plan" && (
          <>
            {/* Hazır presetler */}
            <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
              {LAYOUT_PRESETS.map((p) => (
                <button key={p.label} className="chip"
                  style={{
                    background: layout.cols === p.cols && layout.rows === p.rows ? "var(--accent)" : "var(--surface)",
                    color: layout.cols === p.cols && layout.rows === p.rows ? "#fff" : "var(--text2)",
                    border: "1px solid var(--card-border)",
                  }}
                  onClick={() => setLayout({ cols: p.cols, rows: p.rows })}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Serbest giriş */}
            <div style={{ display: "flex", gap: 6, marginBottom: 14, alignItems: "center" }}>
              <input className="ti" style={{ width: 60, textAlign: "center" }}
                placeholder="Süt" value={customCols}
                onChange={(e) => setCustomCols(e.target.value.replace(/\D/g, ""))} />
              <span style={{ color: "var(--text3)" }}>×</span>
              <input className="ti" style={{ width: 60, textAlign: "center" }}
                placeholder="Sıra" value={customRows}
                onChange={(e) => setCustomRows(e.target.value.replace(/\D/g, ""))} />
              <button className="bs" style={{ background: "var(--accent)", color: "#fff" }}
                onClick={applyCustomLayout}>Uygula</button>
              <span style={{ fontSize: 11, color: "var(--text3)" }}>
                {layout.cols}×{layout.rows} · {layout.cols * layout.rows * 2} kişilik
              </span>
            </div>

            {/* Aksiyonlar */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <button className="bp" style={{ background: "var(--accent)" }} onClick={autoAssign}>
                🔀 Otomatik
              </button>
              <button className="bp" style={{ background: "var(--surface)", color: "var(--text)" }} onClick={clearSeats}>
                🗑️ Sıfırla
              </button>
            </div>

            {selectedSeat && (
              <div style={{ fontSize: 12, color: "var(--yellow)", marginBottom: 10, textAlign: "center" }}>
                Seçili: <b>{seatingMap[selectedSeat] || "Boş"}</b> — taşımak için başka sıraya tıkla
              </div>
            )}

            {/* Sınıf planı */}
            <div style={{ overflowX: "auto", paddingBottom: 8 }}>
              <div style={{ minWidth: "fit-content" }}>
                <div style={{ textAlign: "center", fontSize: 11, color: "var(--text3)", marginBottom: 8, letterSpacing: 2 }}>
                  — TAHTA —
                </div>
                {Array(layout.rows).fill(null).map((_, row) => (
                  <div key={row} className="desk-row">
                    {Array(layout.cols).fill(null).map((_, col) => {
                      const leftKey = getSeatKey(col, row, "left");
                      const rightKey = getSeatKey(col, row, "right");
                      const leftStudent = getStudentAtSeat(leftKey);
                      const rightStudent = getStudentAtSeat(rightKey);
                      const leftSel = selectedSeat === leftKey;
                      const rightSel = selectedSeat === rightKey;
                      const leftViolates = leftStudent && isViolating(leftKey, leftStudent);
                      const rightViolates = rightStudent && isViolating(rightKey, rightStudent);
                      return (
                        <div key={col} className={`desk-pair ${leftSel || rightSel ? "has-sel" : ""}`}>
                          {[
                            { key: leftKey, student: leftStudent, sel: leftSel, violates: leftViolates, side: "left" },
                            { key: rightKey, student: rightStudent, sel: rightSel, violates: rightViolates, side: "" },
                          ].map(({ key, student, sel, violates, side }) => (
                            <div
                              key={key}
                              className={`seat ${side} ${student ? "occ" : "empty"} ${sel ? "sel" : ""} ${violates ? "bad" : ""}`}
                              draggable={!!student}
                              onDragStart={() => handleDragStart(key)}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={() => handleDrop(key)}
                              onClick={() => handleSeatClick(key)}
                              title={violates ? "⚠️ Kural ihlali!" : ""}
                            >
                              {student || "+"}
                              {violates && <span style={{ fontSize: 7, display: "block", color: "var(--red)" }}>⚠️</span>}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {unassigned.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 8 }}>
                  Yerleştirilmemiş ({unassigned.length}):
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {unassigned.map((s) => (
                    <span key={s.id} className="chip"
                      style={{ background: "var(--surface)", color: "var(--text2)", border: "1px solid var(--card-border)" }}>
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* KURALLAR SEKMESİ */}
        {activeTab === "kurallar" && (
          <>
            <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 12 }}>
              Yan yana oturmaması gereken öğrencileri belirt. Otomatik yerleştirme bu kurallara uymaya çalışır.
            </div>

            <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
              <select className="ti" style={{ flex: 1 }} value={sepStudent1}
                onChange={(e) => setSepStudent1(e.target.value)}>
                <option value="">Öğrenci 1...</option>
                {students.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
              <select className="ti" style={{ flex: 1 }} value={sepStudent2}
                onChange={(e) => setSepStudent2(e.target.value)}>
                <option value="">Öğrenci 2...</option>
                {students.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
              <button className="bs" style={{ background: "var(--accent)", color: "#fff" }}
                onClick={addSeparation}>Ekle</button>
            </div>

            {separations.length === 0 && (
              <div style={{ fontSize: 12, color: "var(--text3)", textAlign: "center", padding: 20 }}>
                Henüz kural yok.
              </div>
            )}

            {separations.map((s, i) => (
              <div key={i} className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700, fontSize: 13 }}>
                  {s[0]} <span style={{ color: "var(--red)" }}>🚫</span> {s[1]}
                </span>
                <button className="bs" style={{ background: "var(--accent2)", color: "#fff" }}
                  onClick={() => removeSeparation(i)}>Sil</button>
              </div>
            ))}
          </>
        )}

      </div>
    </div>
  );
}