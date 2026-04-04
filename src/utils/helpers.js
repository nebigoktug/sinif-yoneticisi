export function genId() {
  return Math.random().toString(36).slice(2, 9);
}

export function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(d) {
  const dt = new Date(d + "T00:00:00");
  return ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"][dt.getDay()] +
    " " + dt.getDate() + "/" + (dt.getMonth() + 1);
}

export function esc(s) {
  return s.replace(/'/g, "\\'");
}

export function migrateLegacy(raw) {
  if (!raw) return [];
  try {
    const p = JSON.parse(raw);
    if (!p || !Array.isArray(p)) return [];
    if (p.length === 0) return [];
    if (typeof p[0] === "string") return p.map((n) => ({ id: genId(), name: n }));
    if (p[0].id) return p;
  } catch (e) {}
  return [];
}