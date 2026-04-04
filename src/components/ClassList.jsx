import { useState } from "react";
import { useStorage } from "../hooks/useStorage";
import { genId, migrateLegacy } from "../utils/helpers";

export default function ClassList({ onBack }) {
  const [students, setStudents] = useStorage(
    "sy_students",
    migrateLegacy(localStorage.getItem("sy_students"))
  );
  const [input, setInput] = useState("");

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

  return (
    <div className="module-view active">
      <div className="mh">
        <button className="bb" onClick={onBack}>←</button>
        <div className="mt">👥 Sınıf Listesi</div>
      </div>
      <div className="mb">
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

        <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 8 }}>
          {students.length} öğrenci
        </div>

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