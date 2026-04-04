import { useStorage } from "../hooks/useStorage";
import { migrateLegacy, getTodayKey, formatDate } from "../utils/helpers";

export default function Homework({ onBack }) {
  const [students] = useStorage("sy_students", migrateLegacy(localStorage.getItem("sy_students")));
  const [homeworkHistory, setHomeworkHistory] = useStorage("sy_homework", {});

  const todayKey = getTodayKey();
  const todayData = homeworkHistory[todayKey] || {};

  const [settings] = useStorage("sy_settings", {});
  const [history, setHistory] = useStorage("sy_history", {});

  function toggle(name) {
    const newToday = { ...todayData, [name]: !todayData[name] };
    setHomeworkHistory({ ...homeworkHistory, [todayKey]: newToday });

    if (settings.homeworkAutoBehavior) {
      const todayRec = history[todayKey] || {};
      const rec = todayRec[name] || { behaviors: [], note: "" };
      const hasPenalty = rec.behaviors.includes("Ödev Eksik");
      const getirdi = !todayData[name];
      let behaviors;
      if (getirdi && hasPenalty) {
        behaviors = rec.behaviors.filter((b) => b !== "Ödev Eksik");
      } else if (!getirdi && !hasPenalty) {
        behaviors = [...rec.behaviors, "Ödev Eksik"];
      } else {
        return;
      }
      setHistory({
        ...history,
        [todayKey]: { ...todayRec, [name]: { ...rec, behaviors } },
      });
    }
  }

  const missing = students.filter((s) => !todayData[s.name]);
  const done = students.filter((s) => todayData[s.name]);

  return (
    <div className="module-view active">
      <div className="mh">
        <button className="bb" onClick={onBack}>←</button>
        <div className="mt">📝 Ödev Takibi</div>
      </div>
      <div className="mb">
        <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 12 }}>
          {formatDate(todayKey)} — Eksik: {missing.length} / Tamamlayan: {done.length}
        </div>

        {students.map((s) => (
          <div key={s.id} className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 700, color: todayData[s.name] ? "var(--green)" : "var(--text)" }}>
              {todayData[s.name] ? "✅" : "❌"} {s.name}
            </span>
            <button
              className="bs"
              style={{ background: todayData[s.name] ? "var(--surface)" : "var(--accent)", color: "#fff" }}
              onClick={() => toggle(s.name)}
            >
              {todayData[s.name] ? "Geri Al" : "Getirdi"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}