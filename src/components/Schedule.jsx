import { useState } from "react";
import { useStorage } from "../hooks/useStorage";
import HelpButton from "./HelpButton";

const HELP = [
  "Sütunlar günleri, satırlar ders saatlerini gösterir.",
  "Hücreye tıkla, ders adını yaz, Enter veya dışarı tıkla ile kaydet.",
  "Ders saatlerini üstteki saat alanlarından düzenleyebilirsin.",
  "Ders programını Veli Mesajı modülünden velilere gönderebilirsin.",
];

const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];
const DEFAULT_TIMES = ["08:30", "09:20", "10:10", "11:00", "11:50", "12:40", "13:30", "14:20"];

export default function Schedule({ onBack }) {
  const [schedule, setSchedule] = useStorage("sy_schedule", {});
  const [times, setTimes] = useStorage("sy_schedule_times", DEFAULT_TIMES);
  const [activeDay, setActiveDay] = useState("Pazartesi");
  function setLesson(day, period, value) {
    const dayData = schedule[day] || {};
    setSchedule({ ...schedule, [day]: { ...dayData, [period]: value } });
  }

  function updateTime(i, value) {
    const newTimes = [...times];
    newTimes[i] = value;
    setTimes(newTimes);
  }

  function addPeriod() {
    setTimes([...times, ""]);
  }

  function removePeriod(i) {
    if (!confirm("Bu dersi sil?")) return;
    setTimes(times.filter((_, idx) => idx !== i));
    const newSchedule = {};
    DAYS.forEach((day) => {
      const dayData = { ...(schedule[day] || {}) };
      delete dayData[i];
      const reindexed = {};
      Object.entries(dayData).forEach(([k, v]) => {
        const ki = parseInt(k);
        if (ki < i) reindexed[ki] = v;
        else if (ki > i) reindexed[ki - 1] = v;
      });
      newSchedule[day] = reindexed;
    });
    setSchedule(newSchedule);
  }

  return (
    <div className="module-view active">
      <div className="mh">
        <button className="bb" onClick={onBack}>←</button>
        <div className="mt">📚 Ders Programı</div>
        <HelpButton title="📚 Ders Programı" items={HELP} />
      </div>
      <div className="mb">

        {/* Gün seçici */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto" }}>
          {DAYS.map((d) => (
            <button key={d} className="chip"
              style={{
                background: activeDay === d ? "var(--accent)" : "var(--surface)",
                color: activeDay === d ? "#fff" : "var(--text2)",
                border: "1px solid var(--card-border)",
                whiteSpace: "nowrap",
              }}
              onClick={() => setActiveDay(d)}>
              {d.slice(0, 3)}
            </button>
          ))}
        </div>

        {/* Ders listesi */}
        {times.map((time, i) => (
          <div key={i} className="card" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <input
              type="time"
              className="ti"
              style={{ width: 76, padding: "4px 6px", fontSize: 12, fontWeight: 700, color: "var(--accent-soft)", flexShrink: 0 }}
              value={time}
              onChange={(e) => updateTime(i, e.target.value)}
            />
            <div style={{ fontSize: 11, color: "var(--text3)", minWidth: 20 }}>{i + 1}.</div>
            <input
              className="ti"
              style={{ flex: 1 }}
              placeholder="Ders adı..."
              value={schedule[activeDay]?.[i] || ""}
              onChange={(e) => setLesson(activeDay, i, e.target.value)}
            />
            <button className="bs" style={{ background: "var(--accent2)", color: "#fff" }}
              onClick={() => removePeriod(i)}>✕</button>
          </div>
        ))}

        <button className="bp" style={{ background: "var(--surface)", color: "var(--text)", marginTop: 8 }}
          onClick={addPeriod}>
          + Ders Ekle
        </button>

      </div>
    </div>
  );
}