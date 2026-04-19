import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { animate } from "animejs";

export default function UpdateToast({ onUpdate, onDismiss }) {
  const toastRef = useRef(null);

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      animate(toastRef.current, {
        translateY: ["80px", "0px"],
        opacity: [0, 1],
        duration: 380,
        ease: "outQuart",
      });
    }));
  }, []);

  function handleDismiss() {
    animate(toastRef.current, {
      translateY: "80px",
      opacity: 0,
      duration: 280,
      ease: "inQuart",
      onComplete: onDismiss,
    });
  }

  function handleUpdate() {
    animate(toastRef.current, {
      translateY: "80px",
      opacity: 0,
      duration: 280,
      ease: "inQuart",
      onComplete: onUpdate,
    });
  }

  return createPortal(
    <div
      ref={toastRef}
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%) translateY(80px)",
        opacity: 0,
        willChange: "transform, opacity",
        background: "var(--card)",
        border: "1px solid var(--card-border)",
        borderRadius: 18,
        boxShadow: "0 8px 32px rgba(0,0,0,0.22)",
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        zIndex: 10000,
        maxWidth: "calc(100vw - 32px)",
        width: 340,
      }}
    >
      <span style={{ fontSize: 22, flexShrink: 0 }}>🆕</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 13, color: "var(--text)", marginBottom: 2 }}>
          Yeni güncelleme var
        </div>
        <div style={{ fontSize: 11, color: "var(--text3)" }}>
          Uygulamayı yenilemek ister misiniz?
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <button
          onClick={handleDismiss}
          style={{
            padding: "7px 12px",
            borderRadius: 10,
            background: "var(--surface)",
            border: "1px solid var(--card-border)",
            color: "var(--text3)",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Sonra
        </button>
        <button
          onClick={handleUpdate}
          style={{
            padding: "7px 12px",
            borderRadius: 10,
            background: "var(--accent)",
            border: "none",
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Yenile
        </button>
      </div>
    </div>,
    document.body
  );
}
