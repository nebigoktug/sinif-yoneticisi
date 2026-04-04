import { useState } from "react";
import { useStorage } from "../hooks/useStorage";
import { migrateLegacy, getTodayKey } from "../utils/helpers";
import { POINT_ACTIONS } from "../data/constants";

export default function Points({ onBack }) {
  const [students] = useStorage("sy_students", migrateLegacy(localStorage.getItem("sy_students")));
  const [pointsHistory, setPointsHistory] = useStorage("sy_points", {});
  const [expanded, setExpanded] = useState(null);

  const todayKey = getTodayKey();

  function getPoints(name) {
    const entries = Object.values(pointsHistory).flatMap((day) => day[name] || []);
    return entries.reduce((sum, e) => sum + e.pts, 0);
  }

  function addPoints(name, action) {
    const dayData = pointsHistory[todayKey] || {};
    const studentEntries = dayData[name] || [];
    const newHistory = {
      ...pointsHistory,
      [todayKey]: { ...dayData, [name]: [...studentEntries, { label: action.label, pts: action.pts, time: new Date().toISOString() }] },
    };
    setPointsHistory(newHistory);
  }

  const sorted = [...students].sort((a, b) => getPoints(b.name) - getPoints(a.name));

  return (
    <div className="module-view active">
      <div className="mh">
        <button className="bb" onClick={onBack}>←</button>
        <div className="mt">⭐ Puan & Ödül</div>
      </div>
      <div className="mb">
        {sorted.map((s) => {
          const pts = getPoints(s.name);
          const isExpanded = expanded === s.id;
          return (
            <div key={s.id} className="card">
              <div className="card-header" onClick={() => setExpanded(isExpanded ? null : s.id)}>
                <span style={{ fontWeight: 700 }}>{s.name}</span>
                <span style={{ color: "var(--yellow)", fontWeight: 800 }}>⭐ {pts} {isExpanded ? "▲" : "▼"}</span>
              </div>
              {isExpanded && (
                <div className="beh-grid" style={{ marginTop: 10 }}>
                  {POINT_ACTIONS.map((a) => (
                    <button
                      key={a.label}
                      className="beh-btn"
                      style={{ background: a.color + "22", border: `1px solid ${a.color}`, color: a.color }}
                      onClick={() => addPoints(s.name, a)}
                    >
                      {a.emoji} {a.label} +{a.pts}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}