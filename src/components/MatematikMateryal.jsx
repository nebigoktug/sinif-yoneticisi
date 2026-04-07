import { useState } from 'react';

// Sayı Doğrusu Bileşeni
function SayiDogrusu() {
  const [sayi1, setSayi1] = useState('');
  const [sayi2, setSayi2] = useState('');
  const [islem, setIslem] = useState('toplama');
  const [adim, setAdim] = useState(0);
  const [animasyon, setAnimasyon] = useState(false);

  // Sayı doğrusunu çiz
  const min = -20;
  const max = 20;
  const sayilar = [];
  for (let i = min; i <= max; i++) {
    sayilar.push(i);
  }

  // İşlemi başlat
  const baslat = () => {
    if (!sayi1 || !sayi2) return;
    setAdim(0);
    setAnimasyon(true);
  };

  // Animasyonu ilerlet
  const ilerle = () => {
    const s1 = parseInt(sayi1);
    const s2 = parseInt(sayi2);
    const toplamAdim = Math.abs(s2);

    if (adim < toplamAdim) {
      setAdim(adim + 1);
    }
  };

  // Sıfırla
  const sifirla = () => {
    setSayi1('');
    setSayi2('');
    setAdim(0);
    setAnimasyon(false);
  };

  // Mevcut pozisyon hesapla
  const mevcutPozisyon = () => {
    if (!animasyon || !sayi1) return null;
    const s1 = parseInt(sayi1);
    const s2 = parseInt(sayi2);
    
    if (islem === 'toplama') {
      return s2 > 0 ? s1 + adim : s1 - adim;
    } else {
      return s2 > 0 ? s1 - adim : s1 + adim;
    }
  };

  const pozisyon = mevcutPozisyon();
  const s1 = sayi1 ? parseInt(sayi1) : null;
  const s2 = sayi2 ? parseInt(sayi2) : null;
  const sonuc = s1 !== null && s2 !== null ? (islem === 'toplama' ? s1 + s2 : s1 - s2) : null;

  return (
    <div className="flex flex-col gap-4">
      {/* Kontroller */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-800">🎯 İşlem Seç</h3>
        
        {/* İşlem Tipi */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => { setIslem('toplama'); setAdim(0); setAnimasyon(false); }}
            className={`p-4 rounded-xl font-bold text-lg transition-all ${
              islem === 'toplama'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            ➕ Toplama
          </button>
          <button
            onClick={() => { setIslem('cikarma'); setAdim(0); setAnimasyon(false); }}
            className={`p-4 rounded-xl font-bold text-lg transition-all ${
              islem === 'cikarma'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            ➖ Çıkarma
          </button>
        </div>

        {/* Sayı Girişleri */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {islem === 'toplama' ? '1. Toplanan' : 'Eksilen'}
            </label>
            <input
              type="number"
              value={sayi1}
              onChange={(e) => { setSayi1(e.target.value); setAdim(0); setAnimasyon(false); }}
              className="w-full p-4 text-2xl font-bold text-center border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
              placeholder="0"
              min={-20}
              max={20}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {islem === 'toplama' ? '2. Toplanan' : 'Çıkan'}
            </label>
            <input
              type="number"
              value={sayi2}
              onChange={(e) => { setSayi2(e.target.value); setAdim(0); setAnimasyon(false); }}
              className="w-full p-4 text-2xl font-bold text-center border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
              placeholder="0"
              min={-20}
              max={20}
            />
          </div>
        </div>

        {/* Kontrol Butonları */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={baslat}
            disabled={!sayi1 || !sayi2}
            className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🚀 Başla
          </button>
          <button
            onClick={ilerle}
            disabled={!animasyon || adim >= Math.abs(s2 || 0)}
            className="p-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ▶️ İlerle
          </button>
          <button
            onClick={sifirla}
            className="p-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl active:scale-95 transition-all"
          >
            🔄 Sıfırla
          </button>
        </div>

        {/* Sonuç */}
        {sonuc !== null && animasyon && adim >= Math.abs(s2) && (
          <div className="mt-6 p-6 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl border-2 border-green-300">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-700 mb-2">Sonuç:</div>
              <div className="text-4xl font-bold text-green-700">
                {s1} {islem === 'toplama' ? '+' : '-'} {s2} = {sonuc}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sayı Doğrusu */}
      <div className="bg-white rounded-2xl shadow-lg p-6 overflow-x-auto">
        <h3 className="text-xl font-bold mb-6 text-gray-800">📏 Sayı Doğrusu</h3>
        
        <div className="relative" style={{ minWidth: '800px' }}>
          {/* Ana çizgi */}
          <div className="relative h-24 mb-8">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-800"></div>
            
            {/* Sayı işaretleri */}
            {sayilar.map((num) => {
              const pozisyonX = ((num - min) / (max - min)) * 100;
              const baslangic = s1 === num;
              const aktif = pozisyon === num;
              const hedef = animasyon && s1 !== null && s2 !== null && sonuc === num && adim >= Math.abs(s2);
              
              return (
                <div
                  key={num}
                  className="absolute top-0 transform -translate-x-1/2"
                  style={{ left: `${pozisyonX}%` }}
                >
                  {/* Dikey çizgi */}
                  <div className={`w-0.5 mx-auto ${
                    num === 0 ? 'h-16 bg-red-500' : 
                    num % 5 === 0 ? 'h-12 bg-gray-600' : 'h-8 bg-gray-400'
                  }`}></div>
                  
                  {/* Sayı */}
                  <div className={`text-center mt-2 font-bold ${
                    num === 0 ? 'text-red-600 text-lg' :
                    num % 5 === 0 ? 'text-gray-700 text-base' : 'text-gray-500 text-sm'
                  }`}>
                    {num}
                  </div>

                  {/* Başlangıç işareti */}
                  {baslangic && (
                    <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
                      <div className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg">
                        🎯 Başlangıç
                      </div>
                    </div>
                  )}

                  {/* Aktif pozisyon */}
                  {aktif && animasyon && (
                    <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 animate-bounce">
                      <div className="text-4xl">👇</div>
                    </div>
                  )}

                  {/* Hedef işareti */}
                  {hedef && (
                    <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                      <div className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg">
                        🎉 Sonuç
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Hareket oku */}
            {animasyon && s1 !== null && s2 !== null && adim > 0 && (
              <div className="absolute top-0 left-0 right-0 h-full pointer-events-none">
                {Array.from({ length: adim }).map((_, i) => {
                  const baslangicPos = ((s1 - min) / (max - min)) * 100;
                  const yön = (islem === 'toplama' && s2 > 0) || (islem === 'cikarma' && s2 < 0) ? 1 : -1;
                  const pos = baslangicPos + (yön * ((i + 1) / (max - min)) * 100);
                  
                  return (
                    <div
                      key={i}
                      className="absolute top-1/2 transform -translate-y-1/2"
                      style={{ left: `${pos}%` }}
                    >
                      <div className="text-2xl animate-pulse">
                        {yön > 0 ? '→' : '←'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Adım sayacı */}
          {animasyon && s2 !== null && (
            <div className="text-center mt-8">
              <div className="inline-block bg-purple-100 px-6 py-3 rounded-xl border-2 border-purple-300">
                <span className="text-lg font-bold text-purple-700">
                  Adım: {adim} / {Math.abs(s2)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Ana Bileşen
export default function MatematikMateryal() {
  const [aktifMateryal, setAktifMateryal] = useState('sayi-dogrusu');

  const materyaller = [
    { id: 'sayi-dogrusu', emoji: '📏', label: 'Sayı Doğrusu', component: SayiDogrusu },
  ];

  const AktifComponent = materyaller.find(m => m.id === aktifMateryal)?.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      {/* Başlık */}
      <div className="max-w-7xl mx-auto mb-6">
        <h1 className="text-4xl font-black text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          🔢 Matematik Materyalleri
        </h1>
        <p className="text-center text-gray-600 font-medium">
          Eğlenceli matematik öğrenme araçları
        </p>
      </div>

      {/* Materyal Seçimi */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="grid grid-cols-1 gap-3">
          {materyaller.map((m) => (
            <button
              key={m.id}
              onClick={() => setAktifMateryal(m.id)}
              className={`p-6 rounded-2xl font-bold text-xl transition-all shadow-lg ${
                aktifMateryal === m.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-3xl mr-3">{m.emoji}</span>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Aktif Materyal */}
      <div className="max-w-7xl mx-auto">
        {AktifComponent && <AktifComponent />}
      </div>
    </div>
  );
}