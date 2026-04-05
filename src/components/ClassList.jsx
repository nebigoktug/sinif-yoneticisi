import { useState } from "react";
import { useStorage } from "../hooks/useStorage";
import { genId, migrateLegacy } from "../utils/helpers";

export default function ClassList({ onBack }) {
  const [students, setStudents] = useStorage(
    "sy_students",
    migrateLegacy(localStorage.getItem("sy_students"))
  );
  const [input, setInput] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [preview, setPreview] = useState([]);

  function addStudent() {
    const name = input.trim();
    if (!name) return;
    setStudents([...students, { id: genId(), name }]);
    setInput("");
  }

  function removeStudent(id) {
    if (!confirm("Öğrenciyi sil?")) return;
    setStudents(students.filter((s) => s.id !== id));
  }

  // Toplu metni satırlara böl, temizle, önizle
  function handleBulkChange(text) {
    setBulkText(text);
    const lines = text
      .split("\n")
      .map((l) => l.replace(/^\d+[\.\)]\s*/, "").trim()) // "1. Ad" veya "1) Ad" formatını temizle
      .filter((l) => l.length > 0);
    setPreview(lines);
  }

  function addBulk() {
    if (preview.length === 0) return;
    const existing = students.map((s) => s.name.toLowerCase());
    const newOnes = preview
      .filter((name) => !existing.includes(name.toLowerCase()))
      .map((name) => ({ id: genId(), name }));
    setStudents([...students, ...newOnes]);
    setBulkText("");
    setPreview([]);
    setBulkMode(false);
  }

  return (
    <div className="module-view active">
      <div className="mh">
        <button className="bb" onClick={onBack}>←</button>
        <div className="mt">👥 Sınıf Listesi</div>
      </div>
      <div className="mb">

        {/* ─── Mod geçiş butonları ─── */}
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          <button
            className="chip"
            style={{
              flex: 1,
              background: !bulkMode ? "var(--accent)" : "var(--surface)",
              color: !bulkMode ? "#fff" : "var(--text2)",
              border: "1px solid var(--card-border)",
            }}
            onClick={() => setBulkMode(false)}
          >
            Tek Ekle
          </button>
          <button
            className="chip"
            style={{
              flex: 1,
              background: bulkMode ? "var(--accent)" : "var(--surface)",
              color: bulkMode ? "#fff" : "var(--text2)",
              border: "1px solid var(--card-border)",
            }}
            onClick={() => setBulkMode(true)}
          >
            Liste Halinde Ekle
          </button>
        </div>

        {/* ─── Tek ekleme ─── */}
        {!bulkMode && (
          <div className="card" style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input
              className="ti"
              placeholder="Öğrenci adı..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addStudent()}
            />
            <button
              className="bp"
              style={{ width: "auto", padding: "10px 16px", background: "var(--accent)" }}
              onClick={addStudent}
            >
              Ekle
            </button>
          </div>
        )}

        {/* ─── Toplu ekleme ─── */}
        {bulkMode && (
          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 8 }}>
              Her satıra bir isim yaz. E-Okul'dan kopyalanan "1. Ad Soyad" formatı otomatik temizlenir.
            </div>
            <textarea
              className="ti"
              rows={8}
              placeholder={"Ahmet Yılmaz\nAyşe Kaya\nMehmet Demir\n..."}
              value={bulkText}
              onChange={(e) => handleBulkChange(e.target.value)}
              style={{ width: "100%", resize: "vertical", fontFamily: "inherit" }}
            />

            {/* Önizleme */}
            {preview.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 6 }}>
                  {preview.length} öğrenci eklenecek:
                </div>
                <div style={{
                  background: "var(--surface)",
                  borderRadius: 10,
                  padding: "8px 12px",
                  fontSize: 13,
                  maxHeight: 160,
                  overflowY: "auto",
                  lineHeight: 1.8,
                }}>
                  {preview.map((name, i) => (
                    <div key={i} style={{ color: "var(--text)" }}>
                      <span style={{ color: "var(--text3)", marginRight: 6 }}>{i + 1}.</span>
                      {name}
                    </div>
                  ))}
                </div>
                <button
                  className="bp"
                  style={{ background: "var(--accent)", marginTop: 10 }}
                  onClick={addBulk}
                >
                  ✅ {preview.length} Öğrenciyi Ekle
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── Öğrenci sayısı ─── */}
        <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 8 }}>
          {students.length} öğrenci
        </div>

        {/* ─── Liste ─── */}
        {students.map((s, i) => (
          <div key={s.id} className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 700 }}>
              <span style={{ color: "var(--text3)", marginRight: 8 }}>{i + 1}.</span>
              {s.name}
            </span>
            <button
              className="bs"
              style={{ background: "var(--accent2)", color: "#fff" }}
              onClick={() => removeStudent(s.id)}
            >
              Sil
            </button>
          </div>
        ))}

      </div>
    </div>
  );
}