import { useStorage } from "../hooks/useStorage";
import { migrateLegacy, formatDate } from "../utils/helpers";

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
    return last7.reduce((sum, key) => {
      const rec = history[key]?.[name];
      return sum + (rec?.behaviors?.length || 0);
    }, 0);
  }

  function getPoints(name) {
    return Object.values(pointsHistory).flatMap((d) => d[name] || []).reduce((s, e) => s + e.pts, 0);
  }

  function getMissingHomework(name) {
    return last7.filter((key) => homeworkHistory[key] && homeworkHistory[key][name] === false).length;
  }

  return (
    <div className="module-view active">
      <div className="mh">
        <button className="bb" onClick={onBack}>←</button>
        <div className="mt">📈 Haftalık Özet</div>
      </div>
      <div className="mb">
        <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 12 }}>
          {formatDate(last7[0])} — {formatDate(last7[6])}
        </div>

        {students.map((s) => {
          const beh = getBehaviorCount(s.name);
          const pts = getPoints(s.name);
          const hw = getMissingHomework(s.name);
          return (
            <div key={s.id} className="card">
              <div style={{ fontWeight: 700, marginBottom: 8 }}>{s.name}</div>
              <div style={{ display: "flex", gap: 12, fontSize: 12 }}>
                <span style={{ color: beh > 0 ? "var(--red)" : "var(--green)" }}>
                  📋 {beh} uyarı
                </span>
                <span style={{ color: "var(--yellow)" }}>⭐ {pts} puan</span>
                <span style={{ color: hw > 0 ? "var(--red)" : "var(--green)" }}>
                  📝 {hw} eksik ödev
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}