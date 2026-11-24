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
// Okuyucu seri yazar + Enter basar (>=4 karakter, hepsi <=120 ms arayla).
//
// Çift okuma koruması (kayan pencere): aynı barkod, bir önceki okumasından
// DUPE_MS geçmeden tekrar gelirse yutulur ve pencere uzar. Böylece:
//  - Enter'ı iki kez yollayan okuyucular (CR+LF) tek sayılır,
//  - ürün okuyucunun önünde tutulurken sürekli/otomatik modda tekrar tekrar
//    okunması da tek sayılır (sabit 1,5 sn penceresi bunu kaçırıyordu).
// Aynı üründen 2 adet için sepette + kullanılır ya da ürün çekilip ~2 sn sonra
// yeniden okutulur.
const DUPE_MS = 2000;
function dedupe(fn) {
  let lastCode = '';
  let lastSeenAt = 0;
  return code => {
    const now = Date.now();
    const dup = code === lastCode && now - lastSeenAt < DUPE_MS;
    lastCode = code;
    lastSeenAt = now;
    if (!dup) fn(code);
  };
}

export function listenBarcode(onScan, enabled = true) {
  if (!enabled) return () => {};
  const emit = dedupe(onScan);
  let buf = '';
  let last = 0;

  const onKey = e => {
    const tag = e.target?.tagName;
    const inField = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

    const now = Date.now();
    if (now - last > 120) buf = ''; // yavaş yazım = yeni barkod
    last = now;

    if (e.key === 'Enter') {
      if (e.repeat) { e.preventDefault(); return; }
      // Alan değeri yalnız barkod alanında (data-barcode-input) kullanılır:
      // orada elle yazılıp Enter'a basılan kod da okutma sayılır, yavaş
      // (Bluetooth) okuyucunun bölünmüş tamponu da alandan tamamlanır.
      // Diğer alanlarda (müşteri adı, arama...) Enter barkod sanılmaz.
      const scanField = inField && e.target.hasAttribute?.('data-barcode-input');
      const fieldVal = scanField ? String(e.target.value ?? '').trim() : '';
      let code = buf.trim();
      if (!code && fieldVal.length >= 4) code = fieldVal;
      else if (code && fieldVal.length >= code.length && fieldVal.includes(code)) code = fieldVal;
      buf = '';
      // Başka bir form alanında hızlı yazılmış metin barkod değildir (gerçek barkod rakamdır)
      if (inField && !scanField && !/^\d{6,}$/.test(code)) return;
      if (code.length >= 4) {
        e.preventDefault();
        emit(code);
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
