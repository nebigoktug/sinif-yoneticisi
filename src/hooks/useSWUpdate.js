import { useState, useEffect } from "react";

export function useSWUpdate() {
  const [waitingSW, setWaitingSW] = useState(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.ready.then((reg) => {
      // Sayfa açıldığında zaten bekleyen SW varsa hemen yakala
      if (reg.waiting) {
        setWaitingSW(reg.waiting);
      }

      reg.addEventListener("updatefound", () => {
        const installing = reg.installing;
        if (!installing) return;
        installing.addEventListener("statechange", () => {
          // Yeni SW kuruldu ve eski SW hâlâ aktifse → kullanıcıya göster
          if (installing.state === "installed" && navigator.serviceWorker.controller) {
            setWaitingSW(installing);
          }
        });
      });
    });

    // SW aktif olunca (skipWaiting sonrası) sayfayı yenile
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }, []);

  function applyUpdate() {
    if (!waitingSW) return;
    waitingSW.postMessage({ type: "SKIP_WAITING" });
    setWaitingSW(null);
  }

  return { updateReady: !!waitingSW, applyUpdate };
}
