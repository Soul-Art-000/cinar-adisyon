// Barkod okuyucu (klavye emülasyonlu USB/BT okuyucular) + kasa API'si.
// Okuyucular barkodu hızlı yazar ve Enter basar → global keydown tamponu ile yakalanır.

const apiBase = () => {
  const kasaIp = localStorage.getItem('kasaIp');
  return kasaIp && kasaIp.trim() ? `http://${kasaIp.trim()}:3001` : '';
};

const jsonFetch = async (path, opts) => {
  const res = await fetch(apiBase() + path, opts);
  const text = await res.text();
  try { return { ok: res.ok, status: res.status, data: JSON.parse(text) }; }
  catch { return { ok: res.ok, status: res.status, data: text }; }
};

export const lookupBarcode = code => jsonFetch('/api/barcode/' + encodeURIComponent(code));

export const sellBarcode = (code, qty = 1, paymentMethod = 'nakit') =>
  jsonFetch('/api/sell', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, qty, paymentMethod })
  });

// Global okuyucu dinleyicisi. onScan(code) çağrılır. enabled=false iken pasif.
export function listenBarcode(onScan, enabled = true) {
  if (!enabled) return () => {};
  let buf = '';
  let last = 0;

  const onKey = e => {
    // Form alanına yazı yazılıyorsa dokunma
    const tag = e.target?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    const now = Date.now();
    if (now - last > 120) buf = ''; // yavaş yazım = yeni barkod
    last = now;

    if (e.key === 'Enter') {
      const code = buf.trim();
      buf = '';
      if (code.length >= 4) { e.preventDefault(); onScan(code); }
    } else if (e.key.length === 1) {
      buf += e.key;
    }
  };

  window.addEventListener('keydown', onKey);
  return () => window.removeEventListener('keydown', onKey);
}
