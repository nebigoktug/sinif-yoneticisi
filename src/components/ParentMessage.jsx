import { useState } from "react";
import { useStorage } from "../hooks/useStorage";
import { migrateLegacy } from "../utils/helpers";
import { MSG_TEMPLATES } from "../data/constants";

export default function ParentMessage({ onBack }) {
  const [students] = useStorage("sy_students", migrateLegacy(localStorage.getItem("sy_students")));
  const [contacts] = useStorage("sy_contacts", {});
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [detail, setDetail] = useState("");

  function buildMessage() {
    if (!selectedStudent || !selectedTemplate) return "";
    return selectedTemplate.tpl
      .replace(/{student}/g, selectedStudent)
      .replace(/{detail}/g, detail);
  }

  const message = buildMessage();
  const phone = contacts[selectedStudent]?.phone || "";

  function sendWhatsapp() {
    if (!phone || !message) return;
    const url = `https://wa.me/90${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  }

  return (
    <div className="module-view active">
      <div className="mh">
        <button className="bb" onClick={onBack}>←</button>
        <div className="mt">📨 Veli Mesajı</div>
      </div>
      <div className="mb">
        <select
          className="ti"
          style={{ width: "100%", marginBottom: 10 }}
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
        >
          <option value="">Öğrenci seç...</option>
          {students.map((s) => (
            <option key={s.id} value={s.name}>{s.name}</option>
          ))}
        </select>

        {MSG_TEMPLATES.map((t) => (
          <div
            key={t.id}
            className={`msg-tpl ${selectedTemplate?.id === t.id ? "sel" : ""}`}
            onClick={() => setSelectedTemplate(t)}
          >
            <div style={{ fontWeight: 700, fontSize: 13 }}>{t.title}</div>
            <div style={{ fontSize: 11, color: "var(--text3)" }}>{t.desc}</div>
          </div>
        ))}

        {selectedTemplate && (
          <textarea
            className="ti"
            style={{ width: "100%", marginTop: 8, resize: "none", minHeight: 60 }}
            placeholder="Detay ekle (opsiyonel)..."
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
          />
        )}

        {message && (
          <>
            <div className="msg-out">{message}</div>
            <button
              className="bp"
              style={{ background: "#25d366", marginTop: 10 }}
              onClick={sendWhatsapp}
            >
              📱 WhatsApp'ta Gönder
            </button>
          </>
        )}
      </div>
    </div>
  );
}