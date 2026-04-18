import { useState } from "react";
import { useStorage } from "../hooks/useStorage";
import { EVENT_TYPES } from "../data/constants";
import HelpButton from "./HelpButton";

const HELP = [
  "Bir güne tıklayarak etkinlik ekle.",
  "Etkinlik türleri: Sınav, Ödev, Toplantı, Tatil, Diğer.",
  "Yaklaşan etkinlikler ana ekranda widget olarak görünür.",
  "Birden fazla etkinlik aynı güne eklenebilir.",
  "Etkinliği silmek için kartın yanındaki Sil butonunu kullan.",
];

export default function Calendar({ onBack }) {
  const [events, setEvents] = useStorage("sy_calendar", {});
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [form, setForm] = useState({ title: "", type: "sinav" });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = new Date().toISOString().slice(0, 10);

  function dayKey(d) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  function addEvent() {
    if (!form.title.trim() || !selectedDay) return;
    const key = dayKey(selectedDay);
    const dayEvents = events[key] || [];
    setEvents({ ...events, [key]: [...dayEvents, { ...form, id: Date.now() }] });
    setForm({ title: "", type: "sinav" });
  }

  function removeEvent(key, id) {
    setEvents({ ...events, [key]: events[key].filter((e) => e.id !== id) });
  }

  const selectedKey = selectedDay ? dayKey(selectedDay) : null;
  const selectedEvents = selectedKey ? (events[selectedKey] || []) : [];

  const DAYS = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
  const MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

  return (
    <div className="module-view active">
      <div className="mh">
        <button className="bb" onClick={onBack}>←</button>
        <div className="mt">📅 Takvim</div>
        <HelpButton title="📅 Takvim" items={HELP} />
      </div>
      <div className="mb">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <button className="bs" style={{ background: "var(--surface)", color: "var(--text)" }}
            onClick={() => { setViewDate(new Date(year, month - 1, 1)); setSelectedDay(null); }}>‹</button>
          <span style={{ fontWeight: 800 }}>{MONTHS[month]} {year}</span>
          <button className="bs" style={{ background: "var(--surface)", color: "var(--text)" }}
            onClick={() => { setViewDate(new Date(year, month + 1, 1)); setSelectedDay(null); }}>›</button>
        </div>

        <div className="cal-grid">
          {DAYS.map((d) => <div key={d} className="cal-head">{d}</div>)}
          {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} className="cal-day empty" />)}
          {Array(daysInMonth).fill(null).map((_, i) => {
            const d = i + 1;
            const key = dayKey(d);
            const hasEvent = (events[key] || []).length > 0;
            const isToday = key === todayStr;
            const isSelected = selectedDay === d;
            return (
              <div
                key={d}
                className={`cal-day ${isToday ? "today" : ""} ${hasEvent ? "has-event" : ""}`}
                style={{
                  background: isSelected ? "var(--accent-bg)" : undefined,
                  border: isSelected ? "2px solid var(--accent)" : undefined,
                }}
                onClick={() => setSelectedDay(d)}
              >
                {d}
                {hasEvent && <div style={{ width: 6, height: 6, borderRadius: "50%", background: EVENT_TYPES.find((t) => t.id === (events[key][0]?.type))?.color || "var(--accent)" }} />}
              </div>
            );
          })}
        </div>

        {selectedDay && (
          <div className="card">
            <div style={{ fontWeight: 800, marginBottom: 10 }}>{selectedDay} {MONTHS[month]}</div>

            {selectedEvents.map((e) => {
              const et = EVENT_TYPES.find((t) => t.id === e.type);
              return (
                <div key={e.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: et?.color }}>{et?.label} — {e.title}</span>
                  <button className="bs" style={{ background: "var(--accent2)", color: "#fff" }}
                    onClick={() => removeEvent(selectedKey, e.id)}>Sil</button>
                </div>
              );
            })}

            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <select className="ti" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {EVENT_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <input className="ti" placeholder="Etkinlik adı..." value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && addEvent()} />
              <button className="bp" style={{ width: "auto", padding: "10px 16px", background: "var(--accent)" }}
                onClick={addEvent}>Ekle</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}