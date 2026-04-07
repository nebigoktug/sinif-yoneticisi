import { useState, useEffect } from 'react';

// SVG Sayı Doğrusu Bileşeni
function SayiDogrusuSVG() {
  const [sayi1, setSayi1] = useState('');
  const [sayi2, setSayi2] = useState('');
  const [islem, setIslem] = useState('toplama');
  const [animasyonAdim, setAnimasyonAdim] = useState(0);
  const [animasyonBasladi, setAnimasyonBasladi] = useState(false);
  const [animasyonBitti, setAnimasyonBitti] = useState(false);

  // SVG viewBox boyutları (sabit, responsive olacak)
  const genislik = 1200;
  const yukseklik = 500; // Yüksekliği artırdık (sayılar için alan)
  const solMarjin = 80;
  const sagMarjin = 80;
  const cizgiY = yukseklik / 2.5; // Yukarı kaydırdık
  const cizgiBaslangic = solMarjin;
  const cizgiBitis = genislik - sagMarjin;
  const cizgiUzunluk = cizgiBitis - cizgiBaslangic;

  // Sayı aralığı (0-20)
  const minSayi = 0;
  const maxSayi = 20;
  const sayiAdet = maxSayi - minSayi;

  // Bir sayının x koordinatını hesapla
  const sayiPozisyonu = (sayi) => {
    return cizgiBaslangic + (sayi / sayiAdet) * cizgiUzunluk;
  };

  // Animasyonu başlat
  const baslat = () => {
    if (!sayi1 || !sayi2) return;
    const s1 = parseInt(sayi1);
    const s2 = parseInt(sayi2);
    
    if (s1 < 0 || s1 > 20 || s2 < 0 || s2 > 20) {
      alert('Lütfen 0-20 arası sayılar girin!');
      return;
    }

    const sonuc = islem === 'toplama' ? s1 + s2 : s1 - s2;
    if (sonuc < 0 || sonuc > 20) {
      alert('Sonuç 0-20 aralığında olmalı!');
      return;
    }

    setAnimasyonBasladi(true);
    setAnimasyonBitti(false);
    setAnimasyonAdim(0);
  };

  // Adım adım animasyon
  useEffect(() => {
    if (!animasyonBasladi || !sayi2) return;
    
    const s2 = parseInt(sayi2);
    const interval = setInterval(() => {
      setAnimasyonAdim((prev) => {
        if (prev >= s2) {
          clearInterval(interval);
          setAnimasyonBitti(true);
          return prev;
        }
        return prev + 1;
      });
    }, 600); // Her adım 600ms

    return () => clearInterval(interval);
  }, [animasyonBasladi, sayi2]);

  // Sıfırla
  const sifirla = () => {
    setSayi1('');
    setSayi2('');
    setAnimasyonBasladi(false);
    setAnimasyonBitti(false);
    setAnimasyonAdim(0);
  };

  const s1 = sayi1 ? parseInt(sayi1) : null;
  const s2 = sayi2 ? parseInt(sayi2) : null;
  const sonuc = s1 !== null && s2 !== null ? (islem === 'toplama' ? s1 + s2 : s1 - s2) : null;

  // Yay ok çizme fonksiyonu
  const yayOkCiz = (baslangic, bitis, renk, index) => {
    const x1 = sayiPozisyonu(baslangic);
    const x2 = sayiPozisyonu(bitis);
    const kontrolY = cizgiY - 60; // Yayın yüksekliği
    const ortaX = (x1 + x2) / 2;
    
    // Ok ucu koordinatları
    const okUcuBoyut = 12;
    const yon = x2 > x1 ? 1 : -1;
    
    return (
      <g key={index}>
        {/* Yay çizgisi */}
        <path
          d={`M ${x1} ${cizgiY} Q ${ortaX} ${kontrolY} ${x2} ${cizgiY}`}
          fill="none"
          stroke={renk}
          strokeWidth="6"
          strokeLinecap="round"
          className="animate-pulse"
        />
        {/* Ok ucu */}
        <polygon
          points={`${x2},${cizgiY} ${x2 - yon * okUcuBoyut},${cizgiY - okUcuBoyut} ${x2 - yon * okUcuBoyut},${cizgiY + okUcuBoyut}`}
          fill={renk}
          className="animate-pulse"
        />
        {/* Adım numarası */}
        <text
          x={ortaX}
          y={kontrolY - 15}
          textAnchor="middle"
          className="text-3xl font-black fill-gray-800"
          style={{ filter: 'drop-shadow(1px 1px 3px rgba(255,255,255,0.8))' }}
        >
          {index + 1}
        </text>
      </g>
    );
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Kontrol Paneli - width: 100% */}
      <div className="w-full bg-white rounded-3xl shadow-2xl p-8">
        {/* İşlem Seçimi - width: 100% */}
        <div className="w-full grid grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => {
              setIslem('toplama');
              sifirla();
            }}
            className={`w-full p-10 rounded-3xl font-black text-4xl transition-all transform hover:scale-105 ${
              islem === 'toplama'
                ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-2xl scale-105'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            ➕ Toplama
          </button>
          <button
            onClick={() => {
              setIslem('cikarma');
              sifirla();
            }}
            className={`w-full p-10 rounded-3xl font-black text-4xl transition-all transform hover:scale-105 ${
              islem === 'cikarma'
                ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-2xl scale-105'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            ➖ Çıkarma
          </button>
        </div>

        {/* Sayı Girişleri - width: 100% */}
        <div className="w-full grid grid-cols-2 gap-6 mb-8">
          <div className="w-full">
            <label className="block text-3xl font-black text-gray-700 mb-4">
              {islem === 'toplama' ? '🔵 Başlangıç Sayısı' : '🔵 Büyük Sayı'}
            </label>
            <input
              type="number"
              value={sayi1}
              onChange={(e) => {
                setSayi1(e.target.value);
                setAnimasyonBasladi(false);
                setAnimasyonBitti(false);
                setAnimasyonAdim(0);
              }}
              className="w-full p-8 text-5xl font-black text-center border-6 border-blue-400 rounded-3xl focus:border-blue-600 focus:outline-none bg-blue-50 shadow-lg"
              placeholder="?"
              min={0}
              max={20}
            />
          </div>
          <div className="w-full">
            <label className="block text-3xl font-black text-gray-700 mb-4">
              {islem === 'toplama' ? '🟡 Eklenecek Sayı' : '🟡 Çıkarılacak Sayı'}
            </label>
            <input
              type="number"
              value={sayi2}
              onChange={(e) => {
                setSayi2(e.target.value);
                setAnimasyonBasladi(false);
                setAnimasyonBitti(false);
                setAnimasyonAdim(0);
              }}
              className="w-full p-8 text-5xl font-black text-center border-6 border-yellow-400 rounded-3xl focus:border-yellow-600 focus:outline-none bg-yellow-50 shadow-lg"
              placeholder="?"
              min={0}
              max={20}
            />
          </div>
        </div>

        {/* Butonlar - width: 100% */}
        <div className="w-full grid grid-cols-2 gap-6">
          <button
            onClick={baslat}
            disabled={!sayi1 || !sayi2 || animasyonBasladi}
            className="w-full p-10 bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-3xl font-black text-4xl shadow-2xl hover:shadow-3xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          >
            🚀 Başla
          </button>
          <button
            onClick={sifirla}
            className="w-full p-10 bg-gradient-to-br from-gray-500 to-gray-700 text-white rounded-3xl font-black text-4xl shadow-2xl hover:shadow-3xl active:scale-95 transition-all transform hover:scale-105"
          >
            🔄 Temizle
          </button>
        </div>

        {/* Sonuç Gösterimi - width: 100% */}
        {animasyonBitti && sonuc !== null && (
          <div className="w-full mt-8 p-10 bg-gradient-to-br from-green-100 to-emerald-200 rounded-3xl border-6 border-green-500 animate-bounce">
            <div className="text-center">
              <div className="text-4xl font-black text-gray-700 mb-4">🎉 SONUÇ:</div>
              <div className="text-7xl font-black text-green-700">
                {s1} {islem === 'toplama' ? '+' : '-'} {s2} = {sonuc}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SVG Sayı Doğrusu */}
      <div className="w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl shadow-2xl p-8">
        <h3 className="text-4xl font-black mb-8 text-gray-800 text-center">📏 Sayı Doğrusu</h3>
        
        {/* Responsive SVG container */}
        <div className="w-full">
          <svg 
            viewBox={`0 0 ${genislik} ${yukseklik}`} 
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-auto"
            style={{ maxHeight: '500px' }}
          >
            {/* Ana çizgi */}
            <defs>
              {/* SOL OK - Düzeltildi: sola bakan ok */}
              <marker
                id="okBaslangic"
                markerWidth="20"
                markerHeight="20"
                refX="10"
                refY="10"
                orient="auto"
              >
                <polygon points="20,10 0,0 0,20" fill="#4B5563" />
              </marker>
              {/* SAĞ OK */}
              <marker
                id="okBitis"
                markerWidth="20"
                markerHeight="20"
                refX="10"
                refY="10"
                orient="auto"
              >
                <polygon points="0,0 0,20 20,10" fill="#4B5563" />
              </marker>
            </defs>

            {/* Yatay ana çizgi (ok uçlu) */}
            <line
              x1={cizgiBaslangic - 30}
              y1={cizgiY}
              x2={cizgiBitis + 30}
              y2={cizgiY}
              stroke="#4B5563"
              strokeWidth="4"
              markerStart="url(#okBaslangic)"
              markerEnd="url(#okBitis)"
            />

            {/* Sayı işaretleri */}
            {Array.from({ length: maxSayi + 1 }, (_, i) => i).map((num) => {
              const x = sayiPozisyonu(num);
              const cizgiUzunlugu = num % 5 === 0 ? 30 : 20;
              const yaziBoyutu = num % 5 === 0 ? 'text-4xl' : 'text-3xl';
              const yaziKalinlik = 'font-black';
              
              return (
                <g key={num}>
                  {/* Dikey çizgi */}
                  <line
                    x1={x}
                    y1={cizgiY - cizgiUzunlugu}
                    x2={x}
                    y2={cizgiY + cizgiUzunlugu}
                    stroke="#4B5563"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  {/* Sayı - TÜM SAYILAR BÜYÜK VE NET */}
                  <text
                    x={x}
                    y={cizgiY + cizgiUzunlugu + 50}
                    textAnchor="middle"
                    className={`${yaziBoyutu} ${yaziKalinlik} fill-gray-800`}
                    style={{ 
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      letterSpacing: '0.05em'
                    }}
                  >
                    {num}
                  </text>
                </g>
              );
            })}

            {/* Başlangıç noktası işareti (mavi) */}
            {s1 !== null && (
              <g>
                <circle
                  cx={sayiPozisyonu(s1)}
                  cy={cizgiY}
                  r="20"
                  fill="#3B82F6"
                  className="animate-pulse"
                />
                <text
                  x={sayiPozisyonu(s1)}
                  y={cizgiY - 35}
                  textAnchor="middle"
                  className="text-4xl font-black fill-blue-600"
                  style={{ filter: 'drop-shadow(1px 1px 2px rgba(255,255,255,0.9))' }}
                >
                  🔵 {s1}
                </text>
              </g>
            )}

            {/* Animasyonlu yay oklar */}
            {animasyonBasladi && s1 !== null && s2 !== null && (
              <g>
                {Array.from({ length: animasyonAdim }, (_, i) => {
                  if (islem === 'toplama') {
                    // Toplama: sağa doğru mavi yaylar
                    return yayOkCiz(s1 + i, s1 + i + 1, '#3B82F6', i);
                  } else {
                    // Çıkarma: sola doğru sarı yaylar
                    return yayOkCiz(s1 - i, s1 - i - 1, '#F59E0B', i);
                  }
                })}
              </g>
            )}

            {/* Sonuç noktası (yeşil daire) */}
            {animasyonBitti && sonuc !== null && (
              <g>
                <circle
                  cx={sayiPozisyonu(sonuc)}
                  cy={cizgiY}
                  r="30"
                  fill="#10B981"
                  className="animate-bounce"
                  style={{ filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.8))' }}
                />
                <circle
                  cx={sayiPozisyonu(sonuc)}
                  cy={cizgiY}
                  r="20"
                  fill="#D1FAE5"
                />
                <text
                  x={sayiPozisyonu(sonuc)}
                  y={cizgiY + 8}
                  textAnchor="middle"
                  className="text-3xl font-black fill-green-700"
                >
                  {sonuc}
                </text>
                <text
                  x={sayiPozisyonu(sonuc)}
                  y={cizgiY - 50}
                  textAnchor="middle"
                  className="text-5xl font-black fill-green-600"
                  style={{ filter: 'drop-shadow(1px 1px 2px rgba(255,255,255,0.9))' }}
                >
                  🎯 SONUÇ!
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Açıklama */}
        {!animasyonBasladi && (
          <div className="text-center mt-8">
            <p className="text-3xl font-black text-gray-600">
              👆 Yukarıdan sayıları gir ve "Başla" butonuna bas!
            </p>
            <p className="text-2xl font-bold text-gray-500 mt-4">
              {islem === 'toplama' ? '🔵 Mavi oklar sağa doğru ilerleyecek' : '🟡 Sarı oklar sola doğru gidecek'}
            </p>
          </div>
        )}

        {/* Animasyon sırasında durum */}
        {animasyonBasladi && !animasyonBitti && (
          <div className="text-center mt-8">
            <p className="text-3xl font-black text-purple-600 animate-pulse">
              ⏳ Adım {animasyonAdim} / {s2}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Ana Bileşen
export default function MatematikMateryal() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF9F0' }}>
      <div className="p-6">
        {/* Başlık */}
        <div className="max-w-7xl mx-auto mb-8">
          <h1 className="text-7xl font-black text-center bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 drop-shadow-lg">
            🔢 Matematik Materyalleri
          </h1>
          <p className="text-center text-gray-700 font-black text-3xl">
            Sayı doğrusu ile toplama ve çıkarma öğren! 🎯
          </p>
        </div>

        {/* Materyal */}
        <div className="max-w-7xl mx-auto">
          <SayiDogrusuSVG />
        </div>
      </div>
    </div>
  );
}