import { useState } from "react";
import { useStorage } from "../hooks/useStorage";
import { migrateLegacy } from "../utils/helpers";

export default function Picker({ onBack }) {
  const [students] = useStorage("sy_students", migrateLegacy(localStorage.getItem("sy_students")));
  const [excluded, setExcluded] = useState([]);
  const [result, setResult] = useState(null);
  const [spinning, setSpinning] = useState(false);

  function toggleExclude(id) {
    setExcluded((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  function pick() {
    const pool = students.filter((s) => !excluded.includes(s.id));
    if (pool.length === 0) return;
    setSpinning(true);
    setResult(null);
    let count = 0;
    const interval = setInterval(() => {
      setResult(pool[Math.floor(Math.random() * pool.length)].name);
      count++;
      if (count > 15) {
        clearInterval(interval);
        setSpinning(false);
        setResult(pool[Math.floor(Math.random() * pool.length)].name);
      }
    }, 80);
  }

  return (
    <div className="module-view active">
      <div className="mh">
        <button className="bb" onClick={onBack}>←</button>
        <div className="mt">🎲 Rastgele Seçim</div>
      </div>
      <div className="mb">
        <div className={`picker-display ${spinning ? "spinning" : ""} ${result && !spinning ? "result" : ""}`}>
          {result || "?"}
        </div>

        <button className="bp" style={{ background: "var(--accent)", marginBottom: 16 }} onClick={pick}>
          🎲 Seç
        </button>

        <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 8 }}>
          Hariç tut ({excluded.length} seçili):
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {students.map((s) => (
            <button
              key={s.id}
              className="chip"
              style={{
                background: excluded.includes(s.id) ? "var(--accent2)" : "var(--surface)",
                color: excluded.includes(s.id) ? "#fff" : "var(--text2)",
                border: "1px solid var(--card-border)",
              }}
              onClick={() => toggleExclude(s.id)}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}