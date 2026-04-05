import { useState } from "react";
import { useStorage } from "../hooks/useStorage";
import { migrateLegacy, getTodayKey, formatDate } from "../utils/helpers";

export default function Homework({ onBack }) {
  const [students] = useStorage("sy_students", migrateLegacy(localStorage.getItem("sy_students")));
  const [homeworkHistory, setHomeworkHistory] = useStorage("sy_homework", {});
  const [settings] = useStorage("sy_settings", {});
  const [history, setHistory] = useStorage("sy_history", {});
  const [newSubject, setNewSubject] = useState("");

  const todayKey = getTodayKey();
  const subjectsKey = `_subjects_${todayKey}`;

  // Bugünün dersleri
  const subjects = homeworkHistory[subjectsKey] || [];
  // Bugünün ödev verisi: { [studentName]: { [subject]: bool } }
  const todayData = homeworkHistory[todayKey] || {};

  // Eski format uyumluluğu: { [name]: true/false } → yeni formata geç
  function isMigratedFormat(data) {
    if (!data || Object.keys(data).length === 0) return true;
    const first = Object.values(data)[0];
    return typeof first === "object" && first !== null;
  }

  function getStudentSubjectValue(studentName, subject) {
    const rec = todayData[studentName];
    if (!rec) return null; // işlenmemiş
    if (typeof rec === "boolean") return null; // eski format, ignore
    return rec[subject] ?? null; // null = işlenmemiş, true = getirdi, false = getirmedi
  }

  function addSubject() {
    const s = newSubject.trim();
    if (!s || subjects.includes(s)) return;
    setHomeworkHistory({ ...homeworkHistory, [subjectsKey]: [...subjects, s] });
    setNewSubject("");
  }

  function removeSubject(subject) {
    const newSubjects = subjects.filter((s) => s !== subject);
    // O dersi tüm öğrencilerden sil
    const newToday = { ...todayData };
    Object.keys(newToday).forEach((name) => {
      if (typeof newToday[name] === "object" && newToday[name] !== null) {
        const { [subject]: _, ...rest } = newToday[name];
        newToday[name] = rest;
      }
    });
    setHomeworkHistory({ ...homeworkHistory, [subjectsKey]: newSubjects, [todayKey]: newToday });
  }

  function toggle(studentName, subject, value) {
    // value: true (getirdi) | false (getirmedi) — aynı değere tıklanırsa null'a döner
    const current = getStudentSubjectValue(studentName, subject);
    const newValue = current === value ? null : value;

    const studentRec = typeof todayData[studentName] === "object" && todayData[studentName] !== null
      ? todayData[studentName]
      : {};

    const newStudentRec = newValue === null
      ? (() => { const { [subject]: _, ...rest } = studentRec; return rest; })()
      : { ...studentRec, [subject]: newValue };

    const newToday = { ...todayData, [studentName]: newStudentRec };
    setHomeworkHistory({ ...homeworkHistory, [todayKey]: newToday });

    // Otomasyon: homeworkAutoBehavior
    if (settings.homeworkAutoBehavior) {
      const todayRec = history[todayKey] || {};
      const rec = todayRec[studentName] || { behaviors: [], note: "" };
      const behaviors = normalizeBehaviors(rec.behaviors);

      // Öğrencinin TÜM derslerdeki durumu hesapla
      const allMissing = subjects.some((sub) => {
        const val = sub === subject ? newValue : getStudentSubjectValue(studentName, sub);
        return val === false;
      });

      const existingPenalty = behaviors.find((b) => b.label === "Ödev Eksik");

      if (allMissing && !existingPenalty) {
        setHistory({
          ...history,
          [todayKey]: { ...todayRec, [studentName]: { ...rec, behaviors: [...behaviors, { label: "Ödev Eksik", count: 1 }] } },
        });
      } else if (!allMissing && existingPenalty) {
        setHistory({
          ...history,
          [todayKey]: { ...todayRec, [studentName]: { ...rec, behaviors: behaviors.filter((b) => b.label !== "Ödev Eksik") } },
        });
      }
    }
  }

  function normalizeBehaviors(behaviors) {
    if (!behaviors || behaviors.length === 0) return [];
    if (typeof behaviors[0] === "string") {
      const map = {};
      behaviors.forEach((b) => { map[b] = (map[b] || 0) + 1; });
      return Object.entries(map).map(([label, count]) => ({ label, count }));
    }
    return behaviors;
  }

  // İstatistik hesapla
  function getStudentMissingCount(studentName) {
    return subjects.filter((sub) => getStudentSubjectValue(studentName, sub) === false).length;
  }

  function getStudentDoneCount(studentName) {
    return subjects.filter((sub) => getStudentSubjectValue(studentName, sub) === true).length;
  }

  const totalMissing = students.reduce((sum, s) => sum + getStudentMissingCount(s.name), 0);

  return (
    <div className="module-view active">
      <div className="mh">
        <button className="bb" onClick={onBack}>←</button>
        <div className="mt">📝 Ödev Takibi</div>
      </div>
      <div className="mb">

        <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 12 }}>
          {formatDate(todayKey)} · {subjects.length} ders · {totalMissing} eksik
        </div>

        {/* ─── Ders Ekle ─── */}
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 10, color: "var(--text2)" }}>
            📚 Bugünün Dersleri
          </div>

          {/* Mevcut dersler */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: subjects.length > 0 ? 10 : 0 }}>
            {subjects.map((sub) => (
              <div key={sub} style={{
                display: "flex", alignItems: "center", gap: 4,
                background: "var(--accent-bg)", border: "1px solid var(--accent-border)",
                borderRadius: 8, padding: "4px 10px",
              }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-soft)" }}>{sub}</span>
                <button
                  onClick={() => removeSubject(sub)}
                  style={{ background: "none", color: "var(--text3)", fontSize: 14, lineHeight: 1, padding: "0 2px" }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Yeni ders ekle */}
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="ti"
              placeholder="Ders adı (ör. Matematik)"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSubject()}
              style={{ flex: 1 }}
            />
            <button
              className="bs"
              onClick={addSubject}
              style={{ background: "var(--accent)", color: "#fff", padding: "0 14px" }}
            >
              + Ekle
            </button>
          </div>
        </div>

        {/* ─── Öğrenci Listesi ─── */}
        {subjects.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text3)", fontSize: 13 }}>
            Önce ders ekle
          </div>
        ) : (
          students.map((s) => {
            const missingCount = getStudentMissingCount(s.name);
            const doneCount = getStudentDoneCount(s.name);
            const totalProcessed = missingCount + doneCount;

            return (
              <div key={s.id} className="card" style={{
                borderColor: missingCount > 0 ? "var(--accent)" : doneCount === subjects.length ? "rgba(74,222,128,0.3)" : undefined,
              }}>
                {/* Öğrenci başlık */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: "50%",
                    background: missingCount > 0 ? "var(--accent-bg)" : doneCount === subjects.length ? "rgba(74,222,128,0.15)" : "var(--surface)",
                    border: `1px solid ${missingCount > 0 ? "var(--accent-border)" : doneCount === subjects.length ? "rgba(74,222,128,0.35)" : "var(--card-border)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 800,
                    color: missingCount > 0 ? "var(--accent-soft)" : doneCount === subjects.length ? "var(--green)" : "var(--text3)",
                    flexShrink: 0,
                  }}>
                    {s.name.charAt(0)}
                  </div>
                  <span style={{ fontWeight: 700, flex: 1 }}>{s.name}</span>
                  <span style={{ fontSize: 11, color: "var(--text3)" }}>
                    {totalProcessed === 0 ? "—" : `${doneCount}/${subjects.length}`}
                  </span>
                </div>

                {/* Ders butonları */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {subjects.map((sub) => {
                    const val = getStudentSubjectValue(s.name, sub);
                    return (
                      <div key={sub} style={{
                        borderRadius: 10,
                        border: `1px solid ${val === true ? "rgba(74,222,128,0.4)" : val === false ? "rgba(239,68,68,0.4)" : "var(--card-border)"}`,
                        background: val === true ? "rgba(74,222,128,0.12)" : val === false ? "rgba(239,68,68,0.12)" : "var(--surface2)",
                        padding: "6px 8px",
                        minWidth: 80,
                      }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text3)", marginBottom: 4 }}>{sub}</div>
                        <div style={{ display: "flex", gap: 4 }}>
                          {/* Getirdi */}
                          <button
                            onClick={() => toggle(s.name, sub, true)}
                            style={{
                              flex: 1, borderRadius: 6, fontSize: 11, fontWeight: 700, padding: "3px 0",
                              background: val === true ? "rgba(74,222,128,0.3)" : "var(--surface)",
                              border: `1px solid ${val === true ? "rgba(74,222,128,0.5)" : "var(--card-border)"}`,
                              color: val === true ? "var(--green)" : "var(--text3)",
                            }}
                          >
                            ✓
                          </button>
                          {/* Getirmedi */}
                          <button
                            onClick={() => toggle(s.name, sub, false)}
                            style={{
                              flex: 1, borderRadius: 6, fontSize: 11, fontWeight: 700, padding: "3px 0",
                              background: val === false ? "rgba(239,68,68,0.3)" : "var(--surface)",
                              border: `1px solid ${val === false ? "rgba(239,68,68,0.5)" : "var(--card-border)"}`,
                              color: val === false ? "var(--red)" : "var(--text3)",
                            }}
                          >
                            ✗
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}