// Barkod okuyucu (klavye emülasyonlu USB/BT okuyucular) + kasa API'si.
// Okuyucular barkodu hızlı yazar ve Enter basar → global keydown tamponu ile yakalanır.

const apiBase = () => {
  const kasaIp = localStorage.getItem('kasaIp');
  if (kasaIp && kasaIp.trim()) return `http://${kasaIp.trim()}:3001`;
  // Tauri içinde sayfa tauri://localhost'tan açılır; LAN sunucusu 3001'de.
  // Göreli '/api/...' isteği hiçbir yere gitmez, bu yüzden açıkça yönlendir.
  if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) return 'http://127.0.0.1:3001';
  return '';
};

const jsonFetch = async (path, opts) => {
  try {
    const res = await fetch(apiBase() + path, opts);
    const text = await res.text();
    try { return { ok: res.ok, status: res.status, data: JSON.parse(text) }; }
    catch { return { ok: res.ok, status: res.status, data: text }; }
  } catch (e) {
    return { ok: false, status: 0, data: null, error: e };
  }
};

export const lookupBarcode = code => jsonFetch('/api/barcode/' + encodeURIComponent(code));

export const sellBarcode = (code, qty = 1, paymentMethod = 'nakit') =>
  jsonFetch('/api/sell', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, qty, paymentMethod })
  });

// Global okuyucu dinleyicisi. onScan(code) çağrılır. enabled=false iken pasif.
// Input odaklıyken de çalışır: okuyucu seri yazar + Enter basar, bu desen
// insan yazımından ayırt edilebilir (>=4 karakter ve hepsi <=120 ms arayla).
export function listenBarcode(onScan, enabled = true) {
  if (!enabled) return () => {};
  let buf = '';
  let last = 0;

  const onKey = e => {
    const tag = e.target?.tagName;
    const inField = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

    const now = Date.now();
    if (now - last > 120) buf = ''; // yavaş yazım = yeni barkod
    last = now;

    if (e.key === 'Enter') {
      const code = buf.trim();
      buf = '';
      // Form alanında kısa yazım insan eliyle Enter'dır; okuyucu >=4 hane basar
      if (code.length >= 4) {
        e.preventDefault();
        onScan(code);
        if (inField) e.target.blur?.();
      } else if (inField) {
        return; // alanın kendi Enter davranışı korunsun
      }
    } else if (e.key.length === 1) {
      buf += e.key;
    }
  };

  window.addEventListener('keydown', onKey, true);
  return () => window.removeEventListener('keydown', onKey, true);
}
