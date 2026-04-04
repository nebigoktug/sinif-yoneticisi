import { useStorage } from "../hooks/useStorage";
import { migrateLegacy, getTodayKey } from "../utils/helpers";

export default function HomeWidgets({ onNavigate }) {
  const [students] = useStorage("sy_students", migrateLegacy(localStorage.getItem("sy_students")));
  const [homeworkHistory] = useStorage("sy_homework", {});
  const [history] = useStorage("sy_history", {});
  const [pointsHistory] = useStorage("sy_points", {});
  const [calendarEvents] = useStorage("sy_calendar", {});

  const todayKey = getTodayKey();
  const todayHomework = homeworkHistory[todayKey] || {};
  const todayBehavior = history[todayKey] || {};

  // Ödev
  const missingCount = students.filter((s) => todayHomework[s.name] === false).length;
  const homeworkDone = students.length > 0 && Object.keys(todayHomework).length > 0;

  // Davranış
  const totalWarnings = Object.values(todayBehavior).reduce((sum, r) => sum + (r.behaviors?.length || 0), 0);

  // En yüksek puanlı
  function getPoints(name) {
    return Object.values(pointsHistory).flatMap((d) => d[name] || []).reduce((s, e) => s + e.pts, 0);
  }
  const topStudent = [...students].sort((a, b) => getPoints(b.name) - getPoints(a.name))[0];
  const topPoints = topStudent ? getPoints(topStudent.name) : 0;

  // Yaklaşan etkinlikler
  const today = new Date();
  const upcoming = [];
  for (let i = 0; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    if (calendarEvents[key]) {
      calendarEvents[key].forEach((e) => {
        upcoming.push({ ...e, date: key, daysLeft: i });
      });
    }
  }

  if (students.length === 0) return null;

  return (
    <div style={{ padding: "0 16px", marginBottom: 8 }}>

      {/* Ödev + Davranış */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
        <div
          className="card"
          style={{ textAlign: "center", cursor: "pointer", borderColor: missingCount > 0 ? "var(--red)" : "var(--green)" }}
          onClick={() => onNavigate("homework")}
        >
          <div style={{ fontSize: 22, fontWeight: 900, color: missingCount > 0 ? "var(--red)" : "var(--green)" }}>
            {homeworkDone ? missingCount : "—"}
          </div>
          <div style={{ fontSize: 10, color: "var(--text3)" }}>eksik ödev</div>
        </div>

        <div
          className="card"
          style={{ textAlign: "center", cursor: "pointer", borderColor: totalWarnings > 0 ? "var(--accent)" : "var(--card-border)" }}
          onClick={() => onNavigate("behavior")}
        >
          <div style={{ fontSize: 22, fontWeight: 900, color: totalWarnings > 0 ? "var(--accent-soft)" : "var(--green)" }}>
            {totalWarnings}
          </div>
          <div style={{ fontSize: 10, color: "var(--text3)" }}>bugün uyarı</div>
        </div>
      </div>

      {/* En yüksek puanlı */}
      {topStudent && topPoints > 0 && (
        <div
          className="card"
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, cursor: "pointer" }}
          onClick={() => onNavigate("points")}
        >
          <div style={{ fontSize: 12, color: "var(--text3)" }}>⭐ Lider</div>
          <div style={{ fontWeight: 800, fontSize: 13 }}>{topStudent.name}</div>
          <div style={{ fontWeight: 900, color: "var(--yellow)" }}>{topPoints} puan</div>
        </div>
      )}

      {/* Yaklaşan etkinlikler */}
      {upcoming.length > 0 && (
        <div
          className="card"
          style={{ cursor: "pointer" }}
          onClick={() => onNavigate("calendar")}
        >
          <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 6 }}>📅 Yaklaşan</div>
          {upcoming.slice(0, 3).map((e, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
              <span style={{ fontWeight: 700 }}>{e.title}</span>
              <span style={{ color: "var(--text3)" }}>
                {e.daysLeft === 0 ? "Bugün" : e.daysLeft === 1 ? "Yarın" : `${e.daysLeft} gün`}
              </span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}