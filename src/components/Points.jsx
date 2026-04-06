import { useState } from "react";
import { useStorage } from "../hooks/useStorage";
import { migrateLegacy, getTodayKey } from "../utils/helpers";
import { POINT_ACTIONS } from "../data/constants";

// Points (Puan & Ödül) bileşeni:
// - Öğrencilere davranışlarına göre puan ekleme sistemi
// - Her öğrencinin toplam puanını gösterir
// - Öğrenciye tıklandığında puan ekleme butonları açılır
// - Puanlar günlük olarak localStorage'da saklanır
// - Pozitif davranışları ödüllendirmek için kullanılır
export default function Points({ onBack }) {
  const [students] = useStorage("sy_students", migrateLegacy(localStorage.getItem("sy_students")));
  const [pointsHistory, setPointsHistory] = useStorage("sy_points", {});
  const [expanded, setExpanded] = useState(null);

  const todayKey = getTodayKey();

  // Öğrencinin tüm zamanlar toplamı puanını hesaplar
  function getPoints(name) {
    const entries = Object.values(pointsHistory).flatMap((day) => day[name] || []);
    return entries.reduce((sum, e) => sum + e.pts, 0);
  }

  // Öğrencinin toplam işlem sayısını hesaplar
  function getActionCount(name) {
    const entries = Object.values(pointsHistory).flatMap((day) => day[name] || []);
    return entries.length;
  }

  // Öğrenciye yeni puan ekler (bugünün tarihine kaydeder)
  function addPoints(name, action) {
    const dayData = pointsHistory[todayKey] || {};
    const studentEntries = dayData[name] || [];
    const newHistory = {
      ...pointsHistory,
      [todayKey]: { ...dayData, [name]: [...studentEntries, { label: action.label, pts: action.pts, time: new Date().toISOString() }] },
    };
    setPointsHistory(newHistory);
  }

  // Sıra numarasına göre medal emoji döndür
  function getMedalEmoji(rank) {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `${rank}.`;
  }

  // Öğrencileri gelişmiş sıralama ile sırala:
  // 1. Önce puana göre (en yüksekten en düşüğe)
  // 2. Aynı puanlılar alfabetik sıraya göre
  const sorted = [...students].sort((a, b) => {
    const ptsA = getPoints(a.name);
    const ptsB = getPoints(b.name);
    
    if (ptsB !== ptsA) {
      return ptsB - ptsA; // Puan farkı varsa, yüksek puan önce
    }
    
    // Puan eşitse alfabetik sırala
    return a.name.localeCompare(b.name, 'tr');
  });

  return (
    <div className="module-view active">
      <div className="mh">
        <button className="bb" onClick={onBack}>←</button>
        <div className="mt">⭐ Puan & Ödül</div>
      </div>
      <div className="mb">
        {sorted.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 30, color: "#94a3b8" }}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>⭐</div>
            <div>Henüz öğrenci eklenmemiş</div>
          </div>
        ) : (
          sorted.map((s, index) => {
            const pts = getPoints(s.name);
            const actionCount = getActionCount(s.name);
            const isExpanded = expanded === s.id;
            const rank = index + 1;
            const medalEmoji = getMedalEmoji(rank);
            
            return (
              <div key={s.id} className="card" style={{
                border: rank <= 3 ? `2px solid ${rank === 1 ? '#fbbf24' : rank === 2 ? '#94a3b8' : '#cd7f32'}` : undefined,
                boxShadow: rank <= 3 ? `0 4px 12px ${rank === 1 ? '#fbbf2422' : rank === 2 ? '#94a3b822' : '#cd7f3222'}` : undefined
              }}>
                <div className="card-header" onClick={() => setExpanded(isExpanded ? null : s.id)} style={{
                  cursor: 'pointer',
                  userSelect: 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ 
                      fontSize: rank <= 3 ? 24 : 18,
                      fontWeight: 800,
                      minWidth: rank <= 3 ? 40 : 30,
                      textAlign: 'center'
                    }}>
                      {medalEmoji}
                    </span>
                    <span style={{ fontWeight: 700 }}>{s.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                      <span style={{ 
                        color: pts > 0 ? "var(--yellow)" : "#94a3b8", 
                        fontWeight: 800,
                        fontSize: rank <= 3 ? 20 : 16
                      }}>
                        ⭐ {pts}
                      </span>
                      {actionCount > 0 && (
                        <span style={{ 
                          color: '#94a3b8',
                          fontSize: 11,
                          fontWeight: 500
                        }}>
                          ({actionCount} eylem)
                        </span>
                      )}
                    </div>
                    <span style={{ color: '#94a3b8', fontSize: 18 }}>
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </div>
                </div>
                {isExpanded && (
                  <div className="beh-grid" style={{ marginTop: 10 }}>
                    {POINT_ACTIONS.map((a) => (
                      <button
                        key={a.label}
                        className="beh-btn"
                        style={{ background: a.color + "22", border: `1px solid ${a.color}`, color: a.color }}
                        onClick={() => addPoints(s.name, a)}
                      >
                        {a.emoji} {a.label} +{a.pts}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
