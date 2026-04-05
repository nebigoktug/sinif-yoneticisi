import { useState } from "react";
import { useStorage } from "../hooks/useStorage";
import { migrateLegacy, getTodayKey } from "../utils/helpers";
import { BEHAVIORS } from "../data/constants";

export default function Behavior({ onBack }) {
  const [students] = useStorage("sy_students", migrateLegacy(localStorage.getItem("sy_students")));
  const [history, setHistory] = useStorage("sy_history", {});
  const [pointsHistory, setPointsHistory] = useStorage("sy_points", {});
  const [settings] = useStorage("sy_settings", {});
  const [expanded, setExpanded] = useState(null);

  const todayKey = getTodayKey();
  const todayRecords = history[todayKey] || {};

  function getRecord(name) {
    return todayRecords[name] || { behaviors: [], note: "" };
  }

  // behaviors artık [{ label, count }] formatında
  // Eski format ([string]) ile geriye dönük uyumluluk
  function getBehaviorCount(rec, label) {
    if (!rec.behaviors || rec.behaviors.length === 0) return 0;
    // Eski format: string array
    if (typeof rec.behaviors[0] === "string") {
      return rec.behaviors.filter((b) => b === label).length;
    }
    // Yeni format: { label, count }
    return rec.behaviors.find((b) => b.label === label)?.count || 0;
  }

  function normalizeBehaviors(behaviors) {
    if (!behaviors || behaviors.length === 0) return [];
    if (typeof behaviors[0] === "string") {
      // Eski formatı yeni formata çevir
      const map = {};
      behaviors.forEach((b) => { map[b] = (map[b] || 0) + 1; });
      return Object.entries(map).map(([label, count]) => ({ label, count }));
    }
    return behaviors;
  }

  function addBehavior(name, behaviorLabel) {
    const rec = getRecord(name);
    const behaviors = normalizeBehaviors(rec.behaviors);
    const existing = behaviors.find((b) => b.label === behaviorLabel);
    const newBehaviors = existing
      ? behaviors.map((b) => b.label === behaviorLabel ? { ...b, count: b.count + 1 } : b)
      : [...behaviors, { label: behaviorLabel, count: 1 }];

    const newHistory = {
      ...history,
      [todayKey]: { ...todayRecords, [name]: { ...rec, behaviors: newBehaviors } },
    };
    setHistory(newHistory);

    if (settings.behaviorAutoPenalty) {
      const dayData = pointsHistory[todayKey] || {};
      const entries = dayData[name] || [];
      const newEntries = [...entries, { label: "Otomatik Ceza", pts: -1, time: new Date().toISOString() }];
      setPointsHistory({ ...pointsHistory, [todayKey]: { ...dayData, [name]: newEntries } });
    }
  }

  function removeBehavior(name, behaviorLabel) {
    const rec = getRecord(name);
    const behaviors = normalizeBehaviors(rec.behaviors);
    const existing = behaviors.find((b) => b.label === behaviorLabel);
    if (!existing || existing.count === 0) return;
    const newBehaviors = existing.count === 1
      ? behaviors.filter((b) => b.label !== behaviorLabel)
      : behaviors.map((b) => b.label === behaviorLabel ? { ...b, count: b.count - 1 } : b);

    const newHistory = {
      ...history,
      [todayKey]: { ...todayRecords, [name]: { ...rec, behaviors: newBehaviors } },
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

  // Üst istatistik: toplam sayı (tüm öğrencilerin toplamı)
  const stats = BEHAVIORS.map((b) => ({
    ...b,
    count: students.reduce((sum, s) => sum + getBehaviorCount(getRecord(s.name), b.label), 0),
  }));

  return (
    <div className="module-view active">
      <div className="mh">
        <button className="bb" onClick={onBack}>←</button>
        <div className="mt">📋 Yaramazlık Takibi</div>
      </div>

      {/* İstatistik çubuğu */}
      <div style={{ display: "flex", gap: 8, padding: "10px 16px", overflowX: "auto" }}>
        {stats.map((b) => (
          <div key={b.label} style={{
            background: b.count > 0 ? b.color + "18" : "var(--card)",
            border: `1px solid ${b.count > 0 ? b.color + "55" : "var(--card-border)"}`,
            borderRadius: 10,
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 700,
            color: b.count > 0 ? b.color : "var(--text3)",
            whiteSpace: "nowrap",
          }}>
            {b.emoji} {b.label}: {b.count}
          </div>
        ))}
      </div>

      <div className="mb">
        {students.map((s) => {
          const rec = getRecord(s.name);
          const behaviors = normalizeBehaviors(rec.behaviors);
          const totalCount = behaviors.reduce((sum, b) => sum + b.count, 0);
          const isExpanded = expanded === s.id;

          // Özet için: "Konuşma ×3, İlgisizlik ×1"
          const summary = behaviors.length > 0
            ? behaviors.map((b) => `${b.label}${b.count > 1 ? ` ×${b.count}` : ""}`).join(", ")
            : "Temiz";

          return (
            <div key={s.id} className="card" style={{
              borderColor: totalCount > 0 ? "var(--accent)" : undefined,
            }}>
              <div className="card-header" onClick={() => setExpanded(isExpanded ? null : s.id)}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {/* Baş harf avatar */}
                  <div style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: totalCount > 0 ? "var(--accent-bg)" : "var(--surface)",
                    border: `1px solid ${totalCount > 0 ? "var(--accent-border)" : "var(--card-border)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 800,
                    color: totalCount > 0 ? "var(--accent-soft)" : "var(--text3)",
                    flexShrink: 0,
                  }}>
                    {s.name.charAt(0)}
                  </div>
                  <span style={{ fontWeight: 700 }}>{s.name}</span>
                  {totalCount > 0 && (
                    <span style={{
                      background: "var(--accent)",
                      color: "#fff",
                      borderRadius: 10,
                      padding: "1px 7px",
                      fontSize: 10,
                      fontWeight: 900,
                    }}>
                      {totalCount}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 11, color: "var(--text3)", maxWidth: 140, textAlign: "right", lineHeight: 1.3 }}>
                  {summary} {isExpanded ? "▲" : "▼"}
                </span>
              </div>

              {isExpanded && (
                <div style={{ marginTop: 10 }}>
                  <div className="beh-grid">
                    {BEHAVIORS.map((b) => {
                      const count = getBehaviorCount(rec, b.label);
                      return (
                        <div key={b.label} style={{
                          borderRadius: 10,
                          border: `1px solid ${count > 0 ? b.color : "var(--card-border)"}`,
                          background: count > 0 ? b.color + "18" : "var(--surface2)",
                          overflow: "hidden",
                        }}>
                          {/* Davranış label + sayaç */}
                          <div style={{
                            padding: "8px 10px 4px",
                            fontSize: 12,
                            fontWeight: 700,
                            color: count > 0 ? b.color : "var(--text3)",
                          }}>
                            {b.emoji} {b.label}
                          </div>
                          {/* +/sayı/- satırı */}
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "4px 8px 8px",
                            gap: 4,
                          }}>
                            <button
                              onClick={() => removeBehavior(s.name, b.label)}
                              disabled={count === 0}
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: 8,
                                background: count > 0 ? b.color + "33" : "var(--surface)",
                                border: `1px solid ${count > 0 ? b.color + "55" : "var(--card-border)"}`,
                                color: count > 0 ? b.color : "var(--text4)",
                                fontSize: 16,
                                fontWeight: 900,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: count > 0 ? "pointer" : "not-allowed",
                              }}
                            >
                              −
                            </button>
                            <span style={{
                              fontSize: 18,
                              fontWeight: 900,
                              color: count > 0 ? b.color : "var(--text4)",
                              minWidth: 24,
                              textAlign: "center",
                            }}>
                              {count}
                            </span>
                            <button
                              onClick={() => addBehavior(s.name, b.label)}
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: 8,
                                background: b.color + "33",
                                border: `1px solid ${b.color + "55"}`,
                                color: b.color,
                                fontSize: 16,
                                fontWeight: 900,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
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