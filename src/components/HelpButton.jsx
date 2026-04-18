import { useState } from "react";
import { createPortal } from "react-dom";

export default function HelpButton({ title, items }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          marginLeft: "auto",
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "var(--surface2)",
          border: "1px solid var(--card-border)",
          color: "var(--text3)",
          fontSize: 13,
          fontWeight: 900,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          cursor: "pointer",
        }}
      >
        ?
      </button>

      {open && createPortal(
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.55)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setOpen(false)}
        >
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--card-border)",
              borderRadius: 20,
              padding: "20px 20px 16px",
              maxWidth: 340,
              width: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontWeight: 900, fontSize: 15, marginBottom: 14, color: "var(--text)" }}>
              {title}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--text2)", lineHeight: 1.5 }}>
                  <span style={{ color: "var(--accent-soft)", fontWeight: 800, flexShrink: 0 }}>•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                marginTop: 16,
                width: "100%",
                padding: "10px",
                borderRadius: 12,
                background: "var(--accent)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
                border: "none",
                cursor: "pointer",
              }}
            >
              Kapat
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
