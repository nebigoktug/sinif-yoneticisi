import { useStorage } from "../hooks/useStorage";
import { migrateLegacy, getTodayKey } from "../utils/helpers";

function getTotalBehaviorCount(behaviors) {
  if (!behaviors || behaviors.length === 0) return 0;
  if (typeof behaviors[0] === "string") return behaviors.length;
  return behaviors.reduce((sum, b) => sum + (b.count || 0), 0);
}

// Yeni format: { [subject]: bool } — eksik ders sayısını döner
// Eski format: true/false — 0 veya 1 döner
function getMissingSubjectCount(rec) {
  if (rec === null || rec === undefined) return 0;
  if (typeof rec === "boolean") return rec ? 0 : 1; // eski format
  if (typeof rec === "object") {
    return Object.values(rec).filter((v) => v === false).length;
  }
  return 0;
}

export default function HomeWidgets({ onNavigate }) {
  const [students] = useStorage("sy_students", migrateLegacy(localStorage.getItem("sy_students")));
  const [homeworkHistory] = useStorage("sy_homework", {});
  const [history] = useStorage("sy_history", {});
  const [pointsHistory] = useStorage("sy_points", {});
  const [calendarEvents] = useStorage("sy_calendar", {});

  const todayKey = getTodayKey();
  const subjectsKey = `_subjects_${todayKey}`;
  const todayHomework = homeworkHistory[todayKey] || {};
  const todaySubjects = homeworkHistory[subjectsKey] || [];
  const todayBehavior = history[todayKey] || {};

  // Eksik: herhangi bir dersi getirmemiş öğrenci sayısı
  const missingCount = students.filter((s) => getMissingSubjectCount(todayHomework[s.name]) > 0).length;
  const homeworkDone = todaySubjects.length > 0 && Object.keys(todayHomework).length > 0;

  const totalWarnings = Object.values(todayBehavior).reduce(
    (sum, r) => sum + (r && typeof r === "object" ? getTotalBehaviorCount(r.behaviors) : 0), 0
  );

  function getPoints(name) {
    const entries = pointsHistory[todayKey]?.[name] || [];
    return entries.reduce((s, e) => s + (e.pts || 0), 0);
  }
  const topStudent = [...students].sort((a, b) => getPoints(b.name) - getPoints(a.name))[0];
  const topPoints = topStudent ? getPoints(topStudent.name) : 0;

  const today = new Date();
  const upcoming = [];
  for (let i = 0; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    if (calendarEvents[key]) {
      calendarEvents[key].forEach((e) => upcoming.push({ ...e, date: key, daysLeft: i }));
    }
  }

  if (students.length === 0) return null;

  const missingOk = homeworkDone && missingCount === 0;

  return (
    <div style={{ padding: "0 12px", marginBottom: 12 }}>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
        <button
          onClick={() => onNavigate("homework")}
          style={{
            background: missingCount > 0
              ? "linear-gradient(135deg,rgba(239,68,68,0.18),rgba(239,68,68,0.08))"
              : missingOk
              ? "linear-gradient(135deg,rgba(74,222,128,0.15),rgba(74,222,128,0.06))"
              : "var(--card)",
            border: `1px solid ${missingCount > 0 ? "rgba(239,68,68,0.4)" : missingOk ? "rgba(74,222,128,0.35)" : "var(--card-border)"}`,
            borderRadius: 16, padding: "14px 12px", cursor: "pointer", textAlign: "center",
            backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", transition: "all 0.2s",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text3)", letterSpacing: "0.5px", textTransform: "uppercase" }}>📝 Ödev</div>
          <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1, color: missingCount > 0 ? "var(--red)" : missingOk ? "var(--green)" : "var(--text3)" }}>
            {homeworkDone ? missingCount : "—"}
          </div>
          <div style={{ fontSize: 10, color: "var(--text3)", fontWeight: 600 }}>
            {homeworkDone ? (missingCount > 0 ? "öğrenci eksik" : "tamamlandı") : "işlenmedi"}
          </div>
        </button>

        <button
          onClick={() => onNavigate("behavior")}
          style={{
            background: totalWarnings > 0
              ? "linear-gradient(135deg,rgba(234,88,12,0.18),rgba(234,88,12,0.08))"
              : "linear-gradient(135deg,rgba(74,222,128,0.12),rgba(74,222,128,0.04))",
            border: `1px solid ${totalWarnings > 0 ? "rgba(234,88,12,0.4)" : "rgba(74,222,128,0.3)"}`,
            borderRadius: 16, padding: "14px 12px", cursor: "pointer", textAlign: "center",
            backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", transition: "all 0.2s",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text3)", letterSpacing: "0.5px", textTransform: "uppercase" }}>📋 Uyarı</div>
          <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1, color: totalWarnings > 0 ? "var(--accent-soft)" : "var(--green)" }}>
            {totalWarnings}
          </div>
          <div style={{ fontSize: 10, color: "var(--text3)", fontWeight: 600 }}>
            {totalWarnings > 0 ? "bugün" : "temiz gün"}
          </div>
        </button>
      </div>

      {topStudent && topPoints > 0 && (
        <button
          onClick={() => onNavigate("points")}
          style={{
            width: "100%",
            background: "linear-gradient(135deg,rgba(251,191,36,0.12),rgba(251,191,36,0.04))",
            border: "1px solid rgba(251,191,36,0.25)",
            borderRadius: 16, padding: "12px 16px", cursor: "pointer", marginBottom: 8,
            backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", gap: 10, transition: "all 0.2s",
          }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "linear-gradient(135deg,#fbbf24,#f97316)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 900, color: "#fff", flexShrink: 0,
            boxShadow: "0 2px 8px rgba(251,191,36,0.4)",
          }}>
            {topStudent.name.charAt(0)}
          </div>
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={{ fontSize: 11, color: "var(--text3)", fontWeight: 700 }}>⭐ GÜNÜN LİDERİ</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text)" }}>{topStudent.name}</div>
          </div>
          <div style={{
            background: "linear-gradient(135deg,#fbbf24,#f97316)",
            borderRadius: 10, padding: "4px 10px", fontSize: 13, fontWeight: 900, color: "#fff",
          }}>
            {topPoints} puan
          </div>
        </button>
      )}

      {upcoming.length > 0 && (
        <button
          onClick={() => onNavigate("calendar")}
          style={{
            width: "100%",
            background: "linear-gradient(135deg,rgba(56,189,248,0.10),rgba(56,189,248,0.04))",
            border: "1px solid rgba(56,189,248,0.2)",
            borderRadius: 16, padding: "12px 16px", cursor: "pointer",
            backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
            transition: "all 0.2s", textAlign: "left",
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text3)", letterSpacing: "0.5px", marginBottom: 8 }}>
            📅 YAKLAŞAN ETKİNLİKLER
          </div>
          {upcoming.slice(0, 3).map((e, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: i < Math.min(upcoming.length, 3) - 1 ? 6 : 0,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{e.title}</div>
              <div style={{
                fontSize: 10, fontWeight: 700,
                color: e.daysLeft === 0 ? "var(--red)" : e.daysLeft === 1 ? "var(--yellow)" : "var(--text3)",
                background: e.daysLeft === 0 ? "rgba(239,68,68,0.15)" : e.daysLeft === 1 ? "rgba(251,191,36,0.15)" : "var(--surface2)",
                padding: "2px 8px", borderRadius: 6,
              }}>
                {e.daysLeft === 0 ? "Bugün" : e.daysLeft === 1 ? "Yarın" : `${e.daysLeft} gün`}
              </div>
            </div>
          ))}
        </button>
      )}
    </div>
  );
}