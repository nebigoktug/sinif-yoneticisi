import { useStorage } from "../hooks/useStorage";
import { migrateLegacy, formatDate } from "../utils/helpers";
import { BEHAVIORS } from "../data/constants";
import HelpButton from "./HelpButton";

const HELP = [
  "Son 7 günün davranış, puan ve ödev özetini gösterir.",
  "En çok uyarı alan ve en yüksek puanlı öğrenciler listelenir.",
  "En sık tekrarlanan davranış türü ayrıca vurgulanır.",
  "Sayfanın altında tüm öğrencilerin detaylı istatistiği yer alır.",
];

function getTotalBehaviorCount(behaviors) {
  if (!behaviors || behaviors.length === 0) return 0;
  if (typeof behaviors[0] === "string") return behaviors.length;
  return behaviors.reduce((sum, b) => sum + (b.count || 0), 0);
}

function getBehaviorCountByLabel(behaviors, label) {
  if (!behaviors || behaviors.length === 0) return 0;
  if (typeof behaviors[0] === "string") return behaviors.filter((b) => b === label).length;
  return behaviors.find((b) => b.label === label)?.count || 0;
}

// Yeni format: { [subject]: bool } — eski: true/false
function getMissingHomeworkCount(rec) {
  if (rec === null || rec === undefined) return 0;
  if (typeof rec === "boolean") return rec ? 0 : 1;
  if (typeof rec === "object") return Object.values(rec).filter((v) => v === false).length;
  return 0;
}

export default function WeeklySummary({ onBack }) {
  const [students] = useStorage("sy_students", migrateLegacy(localStorage.getItem("sy_students")));
  const [history] = useStorage("sy_history", {});
  const [pointsHistory] = useStorage("sy_points", {});
  const [homeworkHistory] = useStorage("sy_homework", {});

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().slice(0, 10);
  }).reverse();

  function getBehaviorCount(name) {
    return last7.reduce((sum, key) => sum + getTotalBehaviorCount(history[key]?.[name]?.behaviors), 0);
  }

  function getPoints(name) {
    return last7.reduce((sum, key) => {
      const entries = pointsHistory[key]?.[name] || [];
      return sum + entries.reduce((s, e) => s + (e.pts || 0), 0);
    }, 0);
  }

  function getMissingHomework(name) {
    return last7.reduce((sum, key) => {
      const rec = homeworkHistory[key]?.[name];
      return sum + getMissingHomeworkCount(rec);
    }, 0);
  }

  function getMostCommonBehavior(name) {
    const counts = {};
    last7.forEach((key) => {
      const behaviors = history[key]?.[name]?.behaviors || [];
      if (behaviors.length === 0) return;
      if (typeof behaviors[0] === "string") {
        behaviors.forEach((b) => { counts[b] = (counts[b] || 0) + 1; });
      } else {
        behaviors.forEach((b) => { counts[b.label] = (counts[b.label] || 0) + b.count; });
      }
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? `${sorted[0][0]} (${sorted[0][1]}x)` : null;
  }

  const studentStats = students.map((s) => ({
    ...s,
    beh: getBehaviorCount(s.name),
    pts: getPoints(s.name),
    hw: getMissingHomework(s.name),
    topBeh: getMostCommonBehavior(s.name),
  }));

  const topBehavior = [...studentStats].sort((a, b) => b.beh - a.beh).slice(0, 3);
  const topPoints = [...studentStats].sort((a, b) => b.pts - a.pts).slice(0, 3);
  const topMissing = [...studentStats].sort((a, b) => b.hw - a.hw).filter((s) => s.hw > 0).slice(0, 3);

  const totalBehaviors = studentStats.reduce((s, x) => s + x.beh, 0);
  const totalMissing = studentStats.reduce((s, x) => s + x.hw, 0);

  const behaviorCounts = {};
  BEHAVIORS.forEach((b) => {
    behaviorCounts[b.label] = last7.reduce((sum, key) => {
      return sum + students.reduce((s2, st) => {
        return s2 + getBehaviorCountByLabel(history[key]?.[st.name]?.behaviors, b.label);
      }, 0);
    }, 0);
  });
  const topBehaviorType = Object.entries(behaviorCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="module-view active">
      <div className="mh">
        <button className="bb" onClick={onBack}>←</button>
        <div className="mt">📈 Haftalık Özet</div>
        <HelpButton title="📈 Haftalık Özet" items={HELP} />
      </div>
      <div className="mb">
        <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 16 }}>
          {formatDate(last7[0])} — {formatDate(last7[6])}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: "var(--red)" }}>{totalBehaviors}</div>
            <div style={{ fontSize: 11, color: "var(--text3)" }}>toplam uyarı</div>
          </div>
          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: "var(--yellow)" }}>{totalMissing}</div>
            <div style={{ fontSize: 11, color: "var(--text3)" }}>eksik ödev</div>
          </div>
          {topBehaviorType && topBehaviorType[1] > 0 && (
            <div className="card" style={{ gridColumn: "span 2", textAlign: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-soft)" }}>
                En sık: {topBehaviorType[0]} ({topBehaviorType[1]}x)
              </div>
            </div>
          )}
        </div>

        {topBehavior.some((s) => s.beh > 0) && (
          <div className="card" style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 800, marginBottom: 10, color: "var(--red)" }}>🔴 En Çok Uyarı</div>
            {topBehavior.filter((s) => s.beh > 0).map((s, i) => (
              <div key={s.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontWeight: 700 }}>{i + 1}. {s.name}</span>
                <div style={{ textAlign: "right" }}>
                  <span style={{ color: "var(--red)", fontWeight: 800 }}>{s.beh} uyarı</span>
                  {s.topBeh && <div style={{ fontSize: 10, color: "var(--text3)" }}>{s.topBeh}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {topPoints.some((s) => s.pts > 0) && (
          <div className="card" style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 800, marginBottom: 10, color: "var(--yellow)" }}>⭐ En Yüksek Puan</div>
            {topPoints.filter((s) => s.pts > 0).map((s, i) => (
              <div key={s.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontWeight: 700 }}>{i + 1}. {s.name}</span>
                <span style={{ color: "var(--yellow)", fontWeight: 800 }}>{s.pts} puan</span>
              </div>
            ))}
          </div>
        )}

        {topMissing.length > 0 && (
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 800, marginBottom: 10, color: "var(--blue)" }}>📝 Ödev Takip</div>
            {topMissing.map((s, i) => (
              <div key={s.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontWeight: 700 }}>{i + 1}. {s.name}</span>
                <span style={{ color: "var(--blue)", fontWeight: 800 }}>{s.hw} eksik</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ fontWeight: 800, marginBottom: 8, color: "var(--text2)" }}>Tüm Öğrenciler</div>
        {studentStats.map((s) => (
          <div key={s.id} className="card">
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{s.name}</div>
            <div style={{ display: "flex", gap: 12, fontSize: 12, flexWrap: "wrap" }}>
              <span style={{ color: s.beh > 0 ? "var(--red)" : "var(--green)" }}>📋 {s.beh} uyarı</span>
              <span style={{ color: "var(--yellow)" }}>⭐ {s.pts} puan</span>
              <span style={{ color: s.hw > 0 ? "var(--red)" : "var(--green)" }}>📝 {s.hw} eksik</span>
            </div>
            {s.topBeh && <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>En sık: {s.topBeh}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}