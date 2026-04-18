import { useState, useEffect, useRef } from "react";
import { useStorage } from "../hooks/useStorage";
import { migrateLegacy, getTodayKey } from "../utils/helpers";
import HelpButton from "./HelpButton";

const HELP = [
  "🎲 Seç ile sınıftan rastgele bir öğrenci seçilir.",
  "Tekrar Seçme açıkken seçilen öğrenci havuzdan çıkar; hepsi bitince otomatik sıfırlanır.",
  "🔄 Tekrar ile son seçileni geri alıp yeniden çekim yapabilirsin.",
  "Puan Modu'nda seçilen öğrenciye doğru/yanlış puanı eklenebilir.",
  "Ayarlar sekmesinden belirli öğrencileri kalıcı olarak hariç tutabilirsin.",
];

export default function Picker({ onBack }) {
  const [students] = useStorage("sy_students", migrateLegacy(localStorage.getItem("sy_students")));
  const [pointsHistory, setPointsHistory] = useStorage("sy_points", {});
  const [excluded, setExcluded] = useStorage("sy_picker_excluded", []);
  const [avoidRepeat, setAvoidRepeat] = useStorage("sy_picker_norepeat", false);
  const [scoreMode, setScoreMode] = useStorage("sy_picker_score", false);

  const [result, setResult] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [pickedToday, setPickedToday] = useState([]);
  const [lastResult, setLastResult] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeTab, setActiveTab] = useState("pick");
  const intervalRef = useRef(null);

  const todayKey = getTodayKey();

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  function getPool(currentPickedToday = pickedToday) {
    let pool = students.filter((s) => !excluded.includes(s.id));
    if (avoidRepeat) pool = pool.filter((s) => !currentPickedToday.includes(s.id));
    if (pool.length === 0 && avoidRepeat) pool = students.filter((s) => !excluded.includes(s.id));
    return pool;
  }

  function pick(overridePickedToday) {
    const pool = getPool(overridePickedToday);
    if (pool.length === 0) return;
    setSpinning(true);
    setResult(null);
    setShowConfetti(false);
    let count = 0;
    intervalRef.current = setInterval(() => {
      const rand = pool[Math.floor(Math.random() * pool.length)];
      setResult(rand.name);
      count++;
      if (count > 20) {
        clearInterval(intervalRef.current);
        const final = pool[Math.floor(Math.random() * pool.length)];
        setResult(final.name);
        setLastResult(final);
        setPickedToday((prev) => [...prev.filter((id) => id !== final.id), final.id]);
        setSpinning(false);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }
    }, 80);
  }

  function pickAgain() {
    if (!lastResult) return;
    const newPickedToday = pickedToday.filter((id) => id !== lastResult.id);
    setPickedToday(newPickedToday);
    pick(newPickedToday);
  }

  function addPoint(pts) {
    if (!lastResult) return;
    const dayData = pointsHistory[todayKey] || {};
    const entries = dayData[lastResult.name] || [];
    const label = pts > 0 ? "✅ Doğru Cevap" : "❌ Yanlış Cevap";
    setPointsHistory({
      ...pointsHistory,
      [todayKey]: {
        ...dayData,
        [lastResult.name]: [...entries, { label, pts, time: new Date().toISOString() }],
      },
    });
  }

  function toggleExclude(id) {
    setExcluded((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  function resetPickedToday() {
    setPickedToday([]);
  }

  const pool = getPool();
  const pickedStudents = students.filter((s) => pickedToday.includes(s.id));
  const remainingCount = students.filter((s) => !excluded.includes(s.id) && !pickedToday.includes(s.id)).length;

  const tabs = [
    { id: "pick", label: "🎲 Seç" },
    { id: "ayarlar", label: "⚙️ Ayarlar" },
    { id: "tarihce", label: "📋 Bugün" },
  ];

  return (
    <div className="module-view active">
      <div className="mh">
        <button className="bb" onClick={onBack}>←</button>
        <div className="mt">🎲 Rastgele Seçim</div>
        <HelpButton title="🎲 Rastgele Seçim" items={HELP} />
      </div>
      <div className="mb">

        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {tabs.map((t) => (
            <button key={t.id} className="chip"
              style={{
                background: activeTab === t.id ? "var(--accent)" : "var(--surface)",
                color: activeTab === t.id ? "#fff" : "var(--text2)",
                border: "1px solid var(--card-border)",
              }}
              onClick={() => setActiveTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* SEÇİM SEKMESİ */}
        {activeTab === "pick" && (
          <>
            <div
              className={`picker-display ${spinning ? "spinning" : ""} ${result && !spinning ? "result" : ""}`}
              style={{ position: "relative", overflow: "hidden" }}
            >
              {showConfetti && (
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                  {Array(12).fill(null).map((_, i) => (
                    <div key={i} style={{
                      position: "absolute",
                      width: 8, height: 8,
                      borderRadius: "50%",
                      background: ["#ea580c","#4ade80","#38bdf8","#f472b6","#fbbf24","#a78bfa"][i % 6],
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animation: `confetti-fall 1s ease-out forwards`,
                      animationDelay: `${i * 0.05}s`,
                    }} />
                  ))}
                </div>
              )}
              {result || (pool.length === 0 ? "Havuz boş" : "?")}
            </div>

            {avoidRepeat && (
              <div style={{ textAlign: "center", fontSize: 11, color: "var(--text3)", marginBottom: 8 }}>
                Kalan: {remainingCount} öğrenci
              </div>
            )}

            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <button className="bp" style={{ background: "var(--accent)" }} onClick={() => pick()} disabled={spinning}>
                🎲 Seç
              </button>
              {lastResult && !spinning && (
                <button className="bp" style={{ background: "var(--surface)", color: "var(--text)", flex: "none", width: "auto", padding: "13px 16px" }}
                  onClick={pickAgain}>
                  🔄 Tekrar
                </button>
              )}
            </div>

            {scoreMode && lastResult && !spinning && (
              <div className="card" style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 13 }}>
                  {lastResult.name} için puan:
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="bp" style={{ background: "#4ade8022", color: "var(--green)", border: "1px solid var(--green)" }}
                    onClick={() => addPoint(1)}>
                    ✅ +1 Doğru
                  </button>
                  <button className="bp" style={{ background: "#ef444422", color: "var(--red)", border: "1px solid var(--red)" }}
                    onClick={() => addPoint(-1)}>
                    ❌ -1 Yanlış
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* AYARLAR SEKMESİ */}
        {activeTab === "ayarlar" && (
          <>
            <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 700 }}>Tekrar Seçme</div>
                <div style={{ fontSize: 11, color: "var(--text3)" }}>Seçilen öğrenci havuzdan çıkar</div>
              </div>
              <button className="chip"
                style={{ background: avoidRepeat ? "var(--green)" : "var(--surface)", color: avoidRepeat ? "#000" : "var(--text2)", border: "1px solid var(--card-border)" }}
                onClick={() => setAvoidRepeat(!avoidRepeat)}>
                {avoidRepeat ? "Açık" : "Kapalı"}
              </button>
            </div>

            <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ fontWeight: 700 }}>Puan Modu</div>
                <div style={{ fontSize: 11, color: "var(--text3)" }}>Seçim sonrası +1/-1 puan ver</div>
              </div>
              <button className="chip"
                style={{ background: scoreMode ? "var(--green)" : "var(--surface)", color: scoreMode ? "#000" : "var(--text2)", border: "1px solid var(--card-border)" }}
                onClick={() => setScoreMode(!scoreMode)}>
                {scoreMode ? "Açık" : "Kapalı"}
              </button>
            </div>

            <div style={{ fontWeight: 800, marginBottom: 8 }}>Havuzdan Çıkar</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {students.map((s) => (
                <button key={s.id} className="chip"
                  style={{
                    background: excluded.includes(s.id) ? "var(--accent2)" : "var(--surface)",
                    color: excluded.includes(s.id) ? "#fff" : "var(--text2)",
                    border: "1px solid var(--card-border)",
                  }}
                  onClick={() => toggleExclude(s.id)}>
                  {excluded.includes(s.id) ? "🚫 " : ""}{s.name}
                </button>
              ))}
            </div>
          </>
        )}

        {/* TARİHÇE SEKMESİ */}
        {activeTab === "tarihce" && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: "var(--text3)" }}>
                Bugün {pickedToday.length} öğrenci seçildi
              </div>
              {pickedToday.length > 0 && (
                <button className="bs" style={{ background: "var(--surface)", color: "var(--text2)" }}
                  onClick={resetPickedToday}>Sıfırla</button>
              )}
            </div>

            {pickedStudents.length === 0 && (
              <div style={{ fontSize: 12, color: "var(--text3)", textAlign: "center", padding: 20 }}>
                Henüz seçim yapılmadı.
              </div>
            )}

            {pickedStudents.map((s, i) => (
              <div key={s.id} className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700 }}>{i + 1}. {s.name}</span>
                <span style={{ fontSize: 11, color: "var(--text3)" }}>✓ Seçildi</span>
              </div>
            ))}

            {avoidRepeat && remainingCount > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 8 }}>Henüz seçilmeyenler:</div>
                {students.filter((s) => !excluded.includes(s.id) && !pickedToday.includes(s.id)).map((s) => (
                  <div key={s.id} className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 700, color: "var(--text2)" }}>{s.name}</span>
                    <span style={{ fontSize: 11, color: "var(--text3)" }}>Bekliyor</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}