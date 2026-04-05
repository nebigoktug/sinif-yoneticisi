export const BEHAVIORS = [
  { emoji: "🗣️", label: "Konuşma", color: "#fb923c" },
  { emoji: "🪑", label: "Yerinde Durmama", color: "#f472b6" },
  { emoji: "📵", label: "İlgisizlik", color: "#a78bfa" },
  { emoji: "👊", label: "Kavga/İtme", color: "#ef4444" },
  { emoji: "😭", label: "Ağlama/Küsme", color: "#38bdf8" },
  { emoji: "📝", label: "Ödev Eksik", color: "#facc15" },
];

export const POINT_ACTIONS = [
  { emoji: "🙋", label: "Derse Katılım", pts: 2, color: "#4ade80" },
  { emoji: "🤝", label: "Yardımseverlik", pts: 3, color: "#38bdf8" },
  { emoji: "📖", label: "Kitap Okuma", pts: 2, color: "#a78bfa" },
  { emoji: "🧹", label: "Sorumluluk", pts: 2, color: "#fbbf24" },
  { emoji: "🏆", label: "Başarı", pts: 5, color: "#f472b6" },
  { emoji: "⭐", label: "Örnek Davranış", pts: 3, color: "#fb923c" },
];

export const MSG_TEMPLATES = [
  { id: "genel", title: "📋 Genel Uyarı", desc: "Haftalık davranış özeti", tpl: "Sayın Veli,\n\n{student} adlı öğrencimizin bu haftaki davranışları hakkında bilgilendirmek istiyorum.\n\n{detail}\n\nBirlikte çalışarak bu durumu düzeltebiliriz.\n\nSaygılarımla,\nSınıf Öğretmeni" },
  { id: "konusma", title: "🗣️ Konuşma", desc: "Konuşma davranışı", tpl: "Sayın Veli,\n\n{student}, ders sırasında sık konuşma eğilimi göstermektedir.\n\n{detail}\n\nEvde de bu konuyu konuşmanızı rica ederim.\n\nSaygılarımla,\nSınıf Öğretmeni" },
  { id: "odev", title: "📝 Ödev Eksik", desc: "Ödev getirmeme", tpl: "Sayın Veli,\n\n{student}, ödevlerini düzenli getirmemektedir.\n\n{detail}\n\nHer akşam çantasını birlikte kontrol etmenizi rica ederim.\n\nSaygılarımla,\nSınıf Öğretmeni" },
  { id: "kavga", title: "👊 Fiziksel Davranış", desc: "Kavga/itme", tpl: "Sayın Veli,\n\n{student} ile ilgili önemli bir konu var.\n\n{detail}\n\nYüz yüze görüşmemiz gerekiyor.\n\nSaygılarımla,\nSınıf Öğretmeni" },
  { id: "olumlu", title: "⭐ Olumlu", desc: "Tebrik", tpl: "Sayın Veli,\n\n{student} ile ilgili güzel bir gelişme var.\n\nSon günlerde kurallara çok daha uyumlu ve katılımı arttı.\n\nEvdeki desteğiniz çok değerli.\n\nSaygılarımla,\nSınıf Öğretmeni" },
];

export const LAYOUT_PRESETS = [
  { label: "3×4", cols: 3, rows: 4 },
  { label: "3×5", cols: 3, rows: 5 },
  { label: "3×7", cols: 3, rows: 7 },
  { label: "4×4", cols: 4, rows: 4 },
  { label: "4×5", cols: 4, rows: 5 },
  { label: "2×6", cols: 2, rows: 6 },
];

export const THEMES = [
  { id: "turuncu", label: "🟠 Turuncu", dots: ["#ea580c", "#dc2626", "#fb923c"] },
  { id: "mavi",    label: "🔵 Mavi",    dots: ["#3b82f6", "#2563eb", "#60a5fa"] },
  { id: "yesil",   label: "🟢 Yeşil",   dots: ["#10b981", "#059669", "#34d399"] },
  { id: "mor",     label: "🟣 Mor",     dots: ["#8b5cf6", "#7c3aed", "#a78bfa"] },
  { id: "pembe",   label: "🩷 Pembe",   dots: ["#ec4899", "#db2777", "#f472b6"] },
  { id: "acik",    label: "☀️ Açık",    dots: ["#ea580c", "#fed7aa", "#fff7ed"] },
];

export const EVENT_TYPES = [
  { id: "sinav",    label: "📝 Sınav",           color: "#ef4444" },
  { id: "proje",    label: "📂 Proje",            color: "#3b82f6" },
  { id: "toplanti", label: "🤝 Veli Toplantısı", color: "#eab308" },
  { id: "etkinlik", label: "🎉 Etkinlik",         color: "#10b981" },
  { id: "not",      label: "📌 Not",              color: "#a78bfa" },
  { id: "tatil",    label: "🏖️ Tatil",           color: "#06b6d4" },
];

export const ALL_MODULES = [
  { id: "behavior", emoji: "📋", label: "Yaramazlık\nTakibi",  grad: "linear-gradient(135deg,#ea580c,#dc2626)" },
  { id: "points",   emoji: "⭐", label: "Puan &\nÖdül",        grad: "linear-gradient(135deg,#eab308,#f97316)" },
  { id: "homework", emoji: "📝", label: "Ödev\nTakibi",        grad: "linear-gradient(135deg,#3b82f6,#6366f1)" },
  { id: "picker",   emoji: "🎲", label: "Rastgele\nSeçim",     grad: "linear-gradient(135deg,#10b981,#14b8a6)" },
  { id: "seat",     emoji: "🪑", label: "Oturma\nDüzeni",      grad: "linear-gradient(135deg,#8b5cf6,#a855f7)" },
  { id: "msg",      emoji: "📨", label: "Veli\nMesajı",        grad: "linear-gradient(135deg,#06b6d4,#0ea5e9)" },
  { id: "calendar", emoji: "📅", label: "Takvim",              grad: "linear-gradient(135deg,#f59e0b,#d97706)" },
  { id: "week",     emoji: "📈", label: "Haftalık\nÖzet",      grad: "linear-gradient(135deg,#f43f5e,#e11d48)" },
  { id: "contacts", emoji: "📱", label: "Veli\nİletişim",      grad: "linear-gradient(135deg,#ec4899,#db2777)" },
  { id: "list",     emoji: "👥", label: "Sınıf\nListesi",      grad: "linear-gradient(135deg,#78716c,#a8a29e)" },
  { id: "schedule", emoji: "📚", label: "Ders\nProgramı",      grad: "linear-gradient(135deg,#0891b2,#0e7490)" },
  { id: "settings", emoji: "⚙️", label: "Ayarlar",             grad: "linear-gradient(135deg,#52525b,#71717a)" },
];