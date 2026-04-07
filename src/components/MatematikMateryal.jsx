import { useState, useEffect } from 'react';

// Sayı Doğrusu Bileşeni
function SayiDogrusu() {
  const [sayi1, setSayi1] = useState('');
  const [sayi2, setSayi2] = useState('');
  const [islem, setIslem] = useState('toplama');
  const [animasyonBasladi, setAnimasyonBasladi] = useState(false);
  const [animasyonBitti, setAnimasyonBitti] = useState(false);

  // Sayı doğrusu 0-20 arası
  const sayilar = Array.from({ length: 21 }, (_, i) => i);

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
    
    // 2 saniye sonra animasyonu bitir
    setTimeout(() => {
      setAnimasyonBitti(true);
    }, 2000);
  };

  // Sıfırla
  const sifirla = () => {
    setSayi1('');
    setSayi2('');
    setAnimasyonBasladi(false);
    setAnimasyonBitti(false);
  };

  const s1 = sayi1 ? parseInt(sayi1) : null;
  const s2 = sayi2 ? parseInt(sayi2) : null;
  const sonuc = s1 !== null && s2 !== null ? (islem === 'toplama' ? s1 + s2 : s1 - s2) : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Kontrol Paneli */}
      <div className="bg-white rounded-3xl shadow-2xl p-8">
        {/* İşlem Seçimi */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => {
              setIslem('toplama');
              setAnimasyonBasladi(false);
              setAnimasyonBitti(false);
            }}
            className={`p-8 rounded-3xl font-black text-3xl transition-all transform hover:scale-105 ${
              islem === 'toplama'
                ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-2xl scale-105'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            ➕ Toplama
          </button>
          <button
            onClick={() => {
              setIslem('cikarma');
              setAnimasyonBasladi(false);
              setAnimasyonBitti(false);
            }}
            className={`p-8 rounded-3xl font-black text-3xl transition-all transform hover:scale-105 ${
              islem === 'cikarma'
                ? 'bg-gradient-to-br from-orange-400 to-red-600 text-white shadow-2xl scale-105'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            ➖ Çıkarma
          </button>
        </div>

        {/* Sayı Girişleri */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-2xl font-black text-gray-700 mb-3">
              {islem === 'toplama' ? '🔵 İlk Sayı' : '🔵 Büyük Sayı'}
            </label>
            <input
              type="number"
              value={sayi1}
              onChange={(e) => {
                setSayi1(e.target.value);
                setAnimasyonBasladi(false);
                setAnimasyonBitti(false);
              }}
              className="w-full p-6 text-4xl font-black text-center border-4 border-blue-300 rounded-3xl focus:border-blue-500 focus:outline-none bg-blue-50"
              placeholder="?"
              min={0}
              max={20}
            />
          </div>
          <div>
            <label className="block text-2xl font-black text-gray-700 mb-3">
              {islem === 'toplama' ? '🟡 Eklenecek' : '🟡 Çıkarılacak'}
            </label>
            <input
              type="number"
              value={sayi2}
              onChange={(e) => {
                setSayi2(e.target.value);
                setAnimasyonBasladi(false);
                setAnimasyonBitti(false);
              }}
              className="w-full p-6 text-4xl font-black text-center border-4 border-yellow-300 rounded-3xl focus:border-yellow-500 focus:outline-none bg-yellow-50"
              placeholder="?"
              min={0}
              max={20}
            />
          </div>
        </div>

        {/* Butonlar */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={baslat}
            disabled={!sayi1 || !sayi2 || animasyonBasladi}
            className="p-8 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-3xl font-black text-3xl shadow-2xl hover:shadow-3xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          >
            🚀 Başla
          </button>
          <button
            onClick={sifirla}
            className="p-8 bg-gradient-to-br from-gray-500 to-gray-700 text-white rounded-3xl font-black text-3xl shadow-2xl hover:shadow-3xl active:scale-95 transition-all transform hover:scale-105"
          >
            🔄 Temizle
          </button>
        </div>

        {/* Sonuç Gösterimi */}
        {animasyonBitti && sonuc !== null && (
          <div className="mt-8 p-8 bg-gradient-to-br from-green-100 to-emerald-200 rounded-3xl border-4 border-green-400 animate-bounce">
            <div className="text-center">
              <div className="text-3xl font-black text-gray-700 mb-3">🎉 Sonuç:</div>
              <div className="text-6xl font-black text-green-700">
                {s1} {islem === 'toplama' ? '+' : '-'} {s2} = {sonuc}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sayı Doğrusu */}
      <div className="bg-white rounded-3xl shadow-2xl p-8">
        <h3 className="text-3xl font-black mb-8 text-gray-800 text-center">📏 Sayı Doğrusu</h3>
        
        <div className="relative py-12">
          {/* Ana çizgi ve sayılar */}
          <div className="relative h-32">
            {/* Yatay çizgi */}
            <div className="absolute top-16 left-0 right-0 h-2 bg-gray-300 rounded-full"></div>
            
            {/* Sayı işaretleri */}
            <div className="relative flex justify-between">
              {sayilar.map((num) => {
                const genislik = 100 / 20; // 20 eşit parça
                const solMesafe = (num / 20) * 100;
                
                return (
                  <div
                    key={num}
                    className="absolute flex flex-col items-center"
                    style={{ left: `${solMesafe}%`, transform: 'translateX(-50%)' }}
                  >
                    {/* Dikey çizgi */}
                    <div className={`w-1 mx-auto rounded-full ${
                      num === 0 || num === 10 || num === 20
                        ? 'h-12 bg-gray-600'
                        : num % 5 === 0
                        ? 'h-8 bg-gray-500'
                        : 'h-6 bg-gray-400'
                    }`}></div>
                    
                    {/* Sayı */}
                    <div className={`text-center mt-2 font-black ${
                      num === 0 || num === 10 || num === 20
                        ? 'text-gray-800 text-2xl'
                        : num % 5 === 0
                        ? 'text-gray-700 text-xl'
                        : 'text-gray-600 text-lg'
                    }`}>
                      {num}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Çubuklar */}
            {s1 !== null && s2 !== null && (
              <div className="absolute top-0 left-0 right-0 h-16">
                {/* Mavi çubuk (ilk sayı) */}
                <div
                  className="absolute top-0 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full shadow-xl transition-all duration-500 flex items-center justify-center"
                  style={{
                    left: '0%',
                    width: `${(s1 / 20) * 100}%`,
                    opacity: animasyonBasladi ? 1 : 0,
                  }}
                >
                  <span className="text-white font-black text-2xl drop-shadow-lg">🔵 {s1}</span>
                </div>

                {/* Sarı çubuk (eklenen/çıkarılan) */}
                {islem === 'toplama' && (
                  <div
                    className="absolute top-0 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full shadow-xl transition-all duration-1000 flex items-center justify-center"
                    style={{
                      left: animasyonBasladi ? `${(s1 / 20) * 100}%` : '0%',
                      width: animasyonBasladi ? `${(s2 / 20) * 100}%` : '0%',
                      opacity: animasyonBasladi ? 1 : 0,
                      transitionDelay: '500ms',
                    }}
                  >
                    <span className="text-white font-black text-2xl drop-shadow-lg">🟡 +{s2}</span>
                  </div>
                )}

                {islem === 'cikarma' && (
                  <div
                    className="absolute top-0 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full shadow-xl transition-all duration-1000 flex items-center justify-center"
                    style={{
                      left: animasyonBasladi ? `${((s1 - s2) / 20) * 100}%` : `${(s1 / 20) * 100}%`,
                      width: animasyonBasladi ? `${(s2 / 20) * 100}%` : '0%',
                      opacity: animasyonBasladi ? 1 : 0,
                      transitionDelay: '500ms',
                    }}
                  >
                    <span className="text-white font-black text-2xl drop-shadow-lg">🟡 -{s2}</span>
                  </div>
                )}

                {/* Yeşil sonuç işareti */}
                {animasyonBitti && sonuc !== null && (
                  <div
                    className="absolute -top-8 transform -translate-x-1/2 animate-bounce"
                    style={{
                      left: `${(sonuc / 20) * 100}%`,
                    }}
                  >
                    <div className="bg-gradient-to-br from-green-400 to-green-600 text-white px-6 py-3 rounded-full text-2xl font-black shadow-2xl">
                      🎯 {sonuc}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Açıklama */}
        {!animasyonBasladi && (
          <div className="text-center mt-8">
            <p className="text-2xl font-bold text-gray-600">
              👆 Yukarıdan sayıları gir ve "Başla" butonuna bas!
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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-6">
      {/* Başlık */}
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-6xl font-black text-center bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 drop-shadow-lg">
          🔢 Matematik Materyalleri
        </h1>
        <p className="text-center text-gray-700 font-bold text-2xl">
          Sayı doğrusu ile toplama ve çıkarma öğren! 🎯
        </p>
      </div>

      {/* Materyal */}
      <div className="max-w-6xl mx-auto">
        <SayiDogrusu />
      </div>
    </div>
  );
}