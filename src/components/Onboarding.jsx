// ─── Hızlı Tur (ilk açılış) ─────────────────────────────
const QUICK_STEPS = [
  {
    emoji: "👋",
    title: "Hoş Geldin!",
    desc: "Sınıf Yöneticisi, günlük sınıf takibini kolaylaştırmak için tasarlandı. Birkaç adımda nasıl kullanacağını gösterelim.",
    tip: null,
  },
  {
    emoji: "👥",
    title: "Önce Sınıf Listeni Oluştur",
    desc: "Ana ekranda \"Sınıf Listesi\" modülüne gir. Öğrencilerini tek tek ekle. Tüm modüller bu listeyi kullanır.",
    tip: "💡 Öğrencileri eklemeden diğer modüller çalışmaz.",
  },
  {
    emoji: "📋",
    title: "Davranış Takibi",
    desc: "Her gün öğrencilerin davranışlarını kaydet. Konuşma, ilgisizlik gibi kategoriler var. Kaç kez tekrar ettiğini sayaçla işaretleyebilirsin.",
    tip: "💡 Otomasyon açıksa davranış kaydı otomatik puan düşer.",
  },
  {
    emoji: "📝",
    title: "Ödev Takibi",
    desc: "Gün başında hangi derslerin ödevi olduğunu gir. Sonra her öğrencinin getirip getirmediğini işaretle.",
    tip: "💡 Birden fazla ders eklenebilir — Matematik, Türkçe ayrı ayrı.",
  },
  {
    emoji: "📨",
    title: "Veli Mesajı",
    desc: "Velilere hazır şablonlarla WhatsApp mesajı gönder. Öğrenci seçince davranış ve ödev verisi otomatik dolar. Toplu gönderim de yapabilirsin.",
    tip: "💡 Veli iletişim numaraları \"Veli İletişim\" modülünden girilir.",
  },
  {
    emoji: "🚀",
    title: "Hazırsın!",
    desc: "Ayarlar modülünden temayı değiştirebilir, modülleri gizleyebilir, verilerini yedekleyebilirsin. İyi dersler!",
    tip: "💡 Detaylı kılavuz için Ayarlar → Genel → Kılavuz'a bak.",
  },
];

// ─── Detaylı Kılavuz ─────────────────────────────────────
const DETAILED_STEPS = [
  {
    emoji: "👥",
    title: "Sınıf Listesi",
    sections: [
      { label: "Öğrenci Ekle", desc: "Modüle gir, isim yaz, \"Ekle\" butonuna bas. Her öğrenciye otomatik ID atanır." },
      { label: "Düzenle / Sil", desc: "Öğrenci adına tıkla, düzenle veya sil seçenekleri çıkar." },
      { label: "İpucu", desc: "Tüm modüller bu listeyi kullandığı için önce buradan başla." },
    ],
  },
  {
    emoji: "📋",
    title: "Davranış Takibi",
    sections: [
      { label: "Kayıt Ekle", desc: "Öğrenci kartını aç, davranış kategorisinde + butonuna bas. Aynı davranışı birden fazla kez işaretleyebilirsin." },
      { label: "Sayaç", desc: "Her + basışı sayacı artırır. − ile azaltılabilir. Toplam kart üzerinde gösterilir." },
      { label: "Not", desc: "Her öğrenci için serbest metin notu eklenebilir." },
      { label: "İstatistik", desc: "Üstteki şeritte bugün kaç tane her davranıştan olduğu görünür." },
      { label: "Otomasyon", desc: "Ayarlar → Otomasyon'dan \"Davranış → Puan\" açılırsa her kayıtta otomatik -1 puan düşer." },
    ],
  },
  {
    emoji: "⭐",
    title: "Puan & Ödül",
    sections: [
      { label: "Puan Ver", desc: "Öğrenci kartını aç, kategori seç (Derse Katılım, Başarı vb.), puan eklenir." },
      { label: "Puan Geçmişi", desc: "Her öğrencinin tüm puan geçmişi tarih sırasıyla listelenir." },
      { label: "Lider Tablosu", desc: "Ana ekran widget'ında günün lideri görünür." },
    ],
  },
  {
    emoji: "📝",
    title: "Ödev Takibi",
    sections: [
      { label: "Ders Ekle", desc: "Modülün üstünde ders adı yaz, Ekle'ye bas. Bugün için Matematik, Türkçe gibi dersler eklenebilir." },
      { label: "İşaretleme", desc: "Her öğrenci için her ders ayrı ✓ / ✗ butonu var. ✓ = getirdi, ✗ = getirmedi. Tekrar basınca işaret kalkar." },
      { label: "Otomasyon", desc: "Ayarlar → Otomasyon'dan \"Ödev → Davranış\" açılırsa eksik ödev otomatik davranış olarak işaretlenir." },
    ],
  },
  {
    emoji: "🎲",
    title: "Rastgele Seçim",
    sections: [
      { label: "Seçim", desc: "Başlat butonuna bas, rastgele öğrenci seçilir." },
      { label: "Havuzdan Çıkar", desc: "Seçilen öğrenci havuzdan çıkarılabilir, bir daha seçilmez." },
      { label: "Puan Modu", desc: "Seçimle birlikte puan da verilebilir." },
    ],
  },
  {
    emoji: "🪑",
    title: "Oturma Düzeni",
    sections: [
      { label: "Yerleşim", desc: "Sıra ve sütun sayısını ayarla, öğrencileri sürükle-bırak ile oturt." },
      { label: "Ayrılık Kuralı", desc: "İki öğrenciyi yan yana oturtmamak için ayrılık kuralı eklenebilir." },
      { label: "Boyut", desc: "Serbest boyut girişiyle özel düzenler oluşturulabilir." },
    ],
  },
  {
    emoji: "📨",
    title: "Veli Mesajı",
    sections: [
      { label: "Tek Mesaj", desc: "Öğrenci + şablon seç. \"Otomatik Doldur\" ile bugünün davranış ve ödev verisi {detail} alanına gelir. WhatsApp'a gönder." },
      { label: "Toplu Gönderim", desc: "Şablon seç, birden fazla öğrenci işaretle, \"Mesajları Hazırla\" de. Her satırda Gönder butonu var, tıklayınca yeşil ✓ olur." },
      { label: "Ders Programı", desc: "\"Ders Programı\" şablonuyla haftalık programı tüm velilere gönderebilirsin." },
      { label: "Özel Şablon", desc: "Şablonlar sekmesinden kendi mesaj şablonunu oluşturabilirsin. {student} ve {detail} değişken olarak kullanılır." },
      { label: "Geçmiş", desc: "Her gönderim otomatik kaydedilir. Geçmiş sekmesinden takip edilebilir." },
    ],
  },
  {
    emoji: "📅",
    title: "Takvim",
    sections: [
      { label: "Etkinlik Ekle", desc: "Güne tıkla, etkinlik türü seç (Sınav, Proje, Toplantı vb.), başlık gir." },
      { label: "Yaklaşan", desc: "Ana ekran widget'ında 7 gün içindeki etkinlikler görünür." },
    ],
  },
  {
    emoji: "📈",
    title: "Haftalık Özet",
    sections: [
      { label: "Genel Bakış", desc: "Son 7 günün davranış, puan ve ödev istatistikleri özetlenir." },
      { label: "Sıralamalar", desc: "En çok uyarı alan, en yüksek puanlı, en çok ödev eksik öğrenciler listelenir." },
    ],
  },
  {
    emoji: "📚",
    title: "Ders Programı",
    sections: [
      { label: "Program Gir", desc: "Her gün için saat ve ders adını gir. Saatler düzenlenebilir." },
      { label: "Ana Ekran", desc: "Şu anki ders otomatik ana ekranda gösterilir." },
      { label: "Paylaş", desc: "Veli Mesajı → Ders Programı şablonuyla velilere gönderilebilir." },
    ],
  },
  {
    emoji: "⚙️",
    title: "Ayarlar",
    sections: [
      { label: "Genel", desc: "Sınıf adı, öğretmen adı, okul adı buradan girilir." },
      { label: "Tema", desc: "5 koyu + 1 açık tema mevcut." },
      { label: "Modüller", desc: "Modüllerin sırası değiştirilebilir, kullanılmayanlar gizlenebilir." },
      { label: "Otomasyon", desc: "Ödev→Davranış ve Davranış→Puan otomasyonları açılıp kapatılabilir." },
      { label: "Veri", desc: "Tüm veriler JSON olarak dışa aktarılabilir, başka cihaza aktarılabilir veya sıfırlanabilir." },
    ],
  },
];

// ─── Bileşen ─────────────────────────────────────────────
export default function Onboarding({ mode = "quick", onClose }) {
  const steps = mode === "quick" ? QUICK_STEPS : DETAILED_STEPS;
  const [step, setStep] = useState(0);
  const total = steps.length;
  const current = steps[step];
  const isLast = step === total - 1;

  // Overlay tıklamasını engelle
  function stopProp(e) { e.stopPropagation(); }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px 16px",
        animation: "fadeIn 0.2s ease-out",
      }}
    >
      <div
        onClick={stopProp}
        style={{
          background: "var(--bg2)",
          border: "1px solid var(--card-border)",
          borderRadius: 24,
          width: "100%",
          maxWidth: 420,
          maxHeight: "80vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* ── Header ── */}
        <div style={{
          padding: "20px 20px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)" }}>
            {mode === "quick" ? "🗺️ HIZLI TUR" : "📖 DETAYLI KILAVUZ"} · {step + 1}/{total}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--card-border)",
              borderRadius: 8,
              color: "var(--text3)",
              fontSize: 16,
              width: 28, height: 28,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >×</button>
        </div>

        {/* ── İlerleme çubuğu ── */}
        <div style={{ padding: "10px 20px 0" }}>
          <div style={{
            height: 3, borderRadius: 3,
            background: "var(--surface)",
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${((step + 1) / total) * 100}%`,
              background: "linear-gradient(90deg, var(--accent), var(--accent-soft))",
              borderRadius: 3,
              transition: "width 0.3s ease",
            }} />
          </div>
        </div>

        {/* ── İçerik ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>

          {/* Emoji */}
          <div style={{
            fontSize: 48, textAlign: "center", marginBottom: 12,
            animation: "fadeIn 0.2s ease-out",
          }}>
            {current.emoji}
          </div>

          {/* Başlık */}
          <div style={{
            fontSize: 20, fontWeight: 900, textAlign: "center",
            color: "var(--text)", marginBottom: 12,
          }}>
            {current.title}
          </div>

          {/* Hızlı tur içeriği */}
          {mode === "quick" && (
            <>
              <div style={{
                fontSize: 14, color: "var(--text2)", lineHeight: 1.6,
                textAlign: "center", marginBottom: 12,
              }}>
                {current.desc}
              </div>
              {current.tip && (
                <div style={{
                  background: "var(--accent-bg)",
                  border: "1px solid var(--accent-border)",
                  borderRadius: 12,
                  padding: "10px 14px",
                  fontSize: 12,
                  color: "var(--accent-soft)",
                  fontWeight: 600,
                  lineHeight: 1.5,
                }}>
                  {current.tip}
                </div>
              )}
            </>
          )}

          {/* Detaylı kılavuz içeriği */}
          {mode === "detailed" && (
            <div>
              {current.sections.map((s, i) => (
                <div key={i} style={{
                  marginBottom: 10,
                  background: "var(--card)",
                  border: "1px solid var(--card-border)",
                  borderRadius: 12,
                  padding: "12px 14px",
                }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "var(--accent-soft)", marginBottom: 4 }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.5 }}>
                    {s.desc}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Butonlar ── */}
        <div style={{
          padding: "16px 20px",
          borderTop: "1px solid var(--card-border)",
          display: "flex",
          gap: 8,
        }}>
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              style={{
                padding: "10px 16px", borderRadius: 12,
                background: "var(--surface)", color: "var(--text2)",
                border: "1px solid var(--card-border)",
                fontSize: 13, fontWeight: 700,
              }}
            >
              ← Geri
            </button>
          )}

          <div style={{ flex: 1 }} />

          {!isLast && (
            <button
              onClick={onClose}
              style={{
                padding: "10px 16px", borderRadius: 12,
                background: "transparent", color: "var(--text3)",
                border: "1px solid var(--card-border)",
                fontSize: 13, fontWeight: 600,
              }}
            >
              Atla
            </button>
          )}

          <button
            onClick={() => isLast ? onClose() : setStep(step + 1)}
            style={{
              padding: "10px 20px", borderRadius: 12,
              background: isLast
                ? "linear-gradient(135deg, var(--green), #16a34a)"
                : "linear-gradient(135deg, var(--accent), var(--accent2))",
              color: "#fff",
              border: "none",
              fontSize: 13, fontWeight: 800,
            }}
          >
            {isLast ? "🚀 Başla!" : "İleri →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// useState import'u unutma
import { useState } from "react";
