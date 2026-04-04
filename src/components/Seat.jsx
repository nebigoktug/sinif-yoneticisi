import { useState } from "react";
import { useStorage } from "../hooks/useStorage";
import { migrateLegacy } from "../utils/helpers";
import { LAYOUT_PRESETS } from "../data/constants";

export default function Seat({ onBack }) {
  const [students] = useStorage("sy_students", migrateLegacy(localStorage.getItem("sy_students")));
  const [seatingMap, setSeatingMap] = useStorage("sy_seating", {});
  const [layout, setLayout] = useStorage("sy_layout", { cols: 3, rows: 5 });
  const [selectedSeat, setSelectedSeat] = useState(null);

  const totalSeats = layout.cols * layout.rows * 2;

  function getSeatKey(col, row, side) {
    return `${col}-${row}-${side}`;
  }

  function getStudentAtSeat(key) {
    return seatingMap[key] || null;
  }

  function handleSeatClick(key) {
    if (selectedSeat === null) {
      setSelectedSeat(key);
    } else {
      if (selectedSeat === key) {
        setSelectedSeat(null);
        return;
      }
      const newMap = { ...seatingMap };
      const a = newMap[selectedSeat];
      const b = newMap[key];
      if (b) newMap[selectedSeat] = b; else delete newMap[selectedSeat];
      if (a) newMap[key] = a; else delete newMap[key];
      setSeatingMap(newMap);
      setSelectedSeat(null);
    }
  }

  function autoAssign() {
    const shuffled = [...students].sort(() => Math.random() - 0.5);
    const newMap = {};
    let i = 0;
    for (let row = 0; row < layout.rows; row++) {
      for (let col = 0; col < layout.cols; col++) {
        for (const side of ["left", "right"]) {
          if (i < shuffled.length) {
            newMap[getSeatKey(col, row, side)] = shuffled[i++].name;
          }
        }
      }
    }
    setSeatingMap(newMap);
    setSelectedSeat(null);
  }

  function clearSeats() {
    if (!confirm("Oturma düzenini sıfırla?")) return;
    setSeatingMap({});
    setSelectedSeat(null);
  }

  const unassigned = students.filter(
    (s) => !Object.values(seatingMap).includes(s.name)
  );

  return (
    <div className="module-view active">
      <div className="mh">
        <button className="bb" onClick={onBack}>←</button>
        <div className="mt">🪑 Oturma Düzeni</div>
      </div>
      <div className="mb">
        <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
          {LAYOUT_PRESETS.map((p) => (
            <button
              key={p.label}
              className="chip"
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

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button className="bp" style={{ background: "var(--accent)" }} onClick={autoAssign}>
            🔀 Otomatik Yerleştir
          </button>
          <button className="bp" style={{ background: "var(--surface)", color: "var(--text)" }} onClick={clearSeats}>
            🗑️ Sıfırla
          </button>
        </div>

        {selectedSeat && (
          <div style={{ fontSize: 12, color: "var(--yellow)", marginBottom: 10, textAlign: "center" }}>
            Seçili: {seatingMap[selectedSeat] || "Boş"} — Taşımak için başka sıraya tıkla
          </div>
        )}

        <div style={{ overflowX: "auto" }}>
          {Array(layout.rows).fill(null).map((_, row) => (
            <div key={row} className="desk-row">
              {Array(layout.cols).fill(null).map((_, col) => {
                const leftKey = getSeatKey(col, row, "left");
                const rightKey = getSeatKey(col, row, "right");
                const leftStudent = getStudentAtSeat(leftKey);
                const rightStudent = getStudentAtSeat(rightKey);
                const leftSel = selectedSeat === leftKey;
                const rightSel = selectedSeat === rightKey;
                return (
                  <div key={col} className={`desk-pair ${leftSel || rightSel ? "has-sel" : ""}`}>
                    <div
                      className={`seat left ${leftStudent ? "occ" : "empty"} ${leftSel ? "sel" : ""}`}
                      onClick={() => handleSeatClick(leftKey)}
                    >
                      {leftStudent || "+"}
                    </div>
                    <div
                      className={`seat ${rightStudent ? "occ" : "empty"} ${rightSel ? "sel" : ""}`}
                      onClick={() => handleSeatClick(rightKey)}
                    >
                      {rightStudent || "+"}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {unassigned.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 8 }}>
              Yerleştirilmemiş ({unassigned.length}):
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {unassigned.map((s) => (
                <span key={s.id} className="chip" style={{ background: "var(--surface)", color: "var(--text2)", border: "1px solid var(--card-border)" }}>
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}