import { useState } from "react";
import { useStorage } from "../hooks/useStorage";
import { migrateLegacy, getTodayKey } from "../utils/helpers";
import { BEHAVIORS } from "../data/constants";

export default function Behavior({ onBack }) {
  const [students] = useStorage("sy_students", migrateLegacy(localStorage.getItem("sy_students")));
  const [history, setHistory] = useStorage("sy_history", {});
  const [expanded, setExpanded] = useState(null);

  const todayKey = getTodayKey();
  const todayRecords = history[todayKey] || {};

  function getRecord(name) {
    return todayRecords[name] || { behaviors: [], note: "" };
  }

  function toggleBehavior(name, behaviorLabel) {
    const rec = getRecord(name);
    const behaviors = rec.behaviors.includes(behaviorLabel)
      ? rec.behaviors.filter((b) => b !== behaviorLabel)
      : [...rec.behaviors, behaviorLabel];
    const newHistory = {
      ...history,
      [todayKey]: { ...todayRecords, [name]: { ...rec, behaviors } },
    };
    setHistory(newHistory);
  }

  function setNote(name, note) {
    const rec = getRecord(name);
    const newHistory = {
      ...history,
      [todayKey]: { ...todayRecords, [name]: { ...rec, note } },
    };
    setHistory(newHistory);
  }

  const stats = BEHAVIORS.map((b) => ({
    ...b,
    count: students.filter((s) => getRecord(s.name).behaviors.includes(b.label)).length,
  }));

  return (
    <div className="module-view active">
      <div className="mh">
        <button className="bb" onClick={onBack}>←</button>
        <div className="mt">📋 Yaramazlık Takibi</div>
      </div>

      <div style={{ display: "flex", gap: 8, padding: "10px 16px", overflowX: "auto" }}>
        {stats.map((b) => (
          <div key={b.label} style={{ background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 10, padding: "6px 12px", fontSize: 12, fontWeight: 700, color: b.color, whiteSpace: "nowrap" }}>
            {b.emoji} {b.label}: {b.count}
          </div>
        ))}
      </div>

      <div className="mb">
        {students.map((s) => {
          const rec = getRecord(s.name);
          const isExpanded = expanded === s.id;
          const hasBehavior = rec.behaviors.length > 0;
          return (
            <div key={s.id} className="card" style={{ borderColor: hasBehavior ? "var(--accent)" : undefined }}>
              <div className="card-header" onClick={() => setExpanded(isExpanded ? null : s.id)}>
                <span style={{ fontWeight: 700 }}>{s.name}</span>
                <span style={{ fontSize: 12, color: "var(--text3)" }}>
                  {rec.behaviors.length > 0 ? rec.behaviors.join(", ") : "Temiz"} {isExpanded ? "▲" : "▼"}
                </span>
              </div>
              {isExpanded && (
                <div>
                  <div className="beh-grid">
                    {BEHAVIORS.map((b) => (
                      <button
                        key={b.label}
                        className={`beh-btn ${rec.behaviors.includes(b.label) ? "" : "off"}`}
                        style={rec.behaviors.includes(b.label) ? { background: b.color + "22", border: `1px solid ${b.color}`, color: b.color } : {}}
                        onClick={() => toggleBehavior(s.name, b.label)}
                      >
                        {b.emoji} {b.label}
                      </button>
                    ))}
                  </div>
                  <textarea
                    className="ti"
                    style={{ width: "100%", marginTop: 8, resize: "none", minHeight: 60 }}
                    placeholder="Not ekle..."
                    value={rec.note}
                    onChange={(e) => setNote(s.name, e.target.value)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}