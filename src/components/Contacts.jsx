import { useState } from "react";
import { useStorage } from "../hooks/useStorage";
import { migrateLegacy } from "../utils/helpers";
import HelpButton from "./HelpButton";

const HELP = [
  "Her öğrencinin veli adı ve telefon numarasını kaydet.",
  "Numarayı 5321234567 formatında gir (başında 0 veya +90 olmadan).",
  "Kayıtlı numaralar Veli Mesajı modülünde WhatsApp için kullanılır.",
  "Düzenlemek için kaydın üzerindeki kalem ikonuna tıkla.",
];

export default function Contacts({ onBack }) {
  const [students] = useStorage("sy_students", migrateLegacy(localStorage.getItem("sy_students")));
  const [contacts, setContacts] = useStorage("sy_contacts", {});
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ parent: "", phone: "" });

  function startEdit(name) {
    setEditing(name);
    setForm(contacts[name] || { parent: "", phone: "" });
  }

  function save() {
    setContacts({ ...contacts, [editing]: form });
    setEditing(null);
  }

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="module-view active">
      <div className="mh">
        <button className="bb" onClick={onBack}>←</button>
        <div className="mt">📱 Veli İletişim</div>
        <HelpButton title="📱 Veli İletişim" items={HELP} />
      </div>
      <div className="mb">
        <input
          className="ti"
          style={{ width: "100%", marginBottom: 10 }}
          placeholder="Ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {filtered.map((s) => {
          const c = contacts[s.name] || {};
          const isEditing = editing === s.name;
          return (
            <div key={s.id} className="card">
              <div className="card-header" onClick={() => !isEditing && startEdit(s.name)}>
                <div>
                  <div style={{ fontWeight: 700 }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>
                    {c.parent || "Veli adı yok"} · {c.phone || "Telefon yok"}
                  </div>
                </div>
                {!isEditing && <span style={{ color: "var(--accent-soft)" }}>✏️</span>}
              </div>

              {isEditing && (
                <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                  <input
                    className="ti"
                    placeholder="Veli adı..."
                    value={form.parent}
                    onChange={(e) => setForm({ ...form, parent: e.target.value })}
                  />
                  <input
                    className="ti"
                    placeholder="Telefon (5xx...)..."
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="bp" style={{ background: "var(--accent)" }} onClick={save}>Kaydet</button>
                    <button className="bp" style={{ background: "var(--surface)" }} onClick={() => setEditing(null)}>İptal</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}