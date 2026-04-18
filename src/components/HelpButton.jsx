import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { animate, stagger, spring } from "animejs";

export default function HelpButton({ title, items }) {
  const [visible, setVisible] = useState(false);
  const overlayRef = useRef(null);
  const cardRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (!visible) return;
    requestAnimationFrame(() => {
      animate(overlayRef.current, {
        opacity: [0, 1],
        duration: 260,
        ease: "linear",
      });
      animate(cardRef.current, {
        translateY: ["64px", "0px"],
        opacity: [0, 1],
        ease: spring({ stiffness: 80, damping: 10, mass: 1 }),
      });
      if (listRef.current?.children.length) {
        animate([...listRef.current.children], {
          opacity: [0, 1],
          translateY: ["10px", "0px"],
          delay: stagger(65, { start: 260 }),
          duration: 300,
          ease: "outQuart",
        });
      }
    });
  }, [visible]);

  function close() {
    animate(cardRef.current, {
      translateY: "-22px",
      opacity: 0,
      duration: 210,
      ease: "inQuart",
    });
    animate(overlayRef.current, {
      opacity: 0,
      duration: 230,
      ease: "linear",
      onComplete: () => setVisible(false),
    });
  }

  return (
    <>
      <button
        onClick={() => setVisible(true)}
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

      {visible && createPortal(
        <div
          ref={overlayRef}
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.55)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            opacity: 0,
          }}
          onClick={close}
        >
          <div
            ref={cardRef}
            style={{
              background: "var(--card)",
              border: "1px solid var(--card-border)",
              borderRadius: 20,
              padding: "20px 20px 16px",
              maxWidth: 340,
              width: "100%",
              opacity: 0,
              transform: "translateY(64px)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontWeight: 900, fontSize: 15, marginBottom: 14, color: "var(--text)" }}>
              {title}
            </div>

            <div ref={listRef} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map((item, i) => (
                <div
                  key={i}
                  style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--text2)", lineHeight: 1.5, opacity: 0 }}
                >
                  <span style={{ color: "var(--accent-soft)", fontWeight: 800, flexShrink: 0 }}>•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <button
              onClick={close}
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
