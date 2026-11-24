import { useState, useEffect, useRef } from 'react';
import { ScanBarcode, Plus, Trash2, Search, Camera, Check, X, ChevronDown, Banknote, CreditCard, BookUser, Minus } from 'lucide-react';
import { lookupBarcode, listenBarcode } from '../barcode.js';

// Kart renkleri: ürün id'sinden sabit bir pastel seçilir (her açılışta aynı renk).
// Sınıflar tam yazılı kalmalı ki Tailwind derlemede bulsun.
const PALETTE = [
  { card: 'bg-rose-100 hover:bg-rose-200', name: 'text-rose-900', price: 'text-rose-700' },
  { card: 'bg-amber-100 hover:bg-amber-200', name: 'text-amber-900', price: 'text-amber-700' },
  { card: 'bg-emerald-100 hover:bg-emerald-200', name: 'text-emerald-900', price: 'text-emerald-700' },
  { card: 'bg-sky-100 hover:bg-sky-200', name: 'text-sky-900', price: 'text-sky-700' },
  { card: 'bg-violet-100 hover:bg-violet-200', name: 'text-violet-900', price: 'text-violet-700' },
  { card: 'bg-lime-100 hover:bg-lime-200', name: 'text-lime-900', price: 'text-lime-700' },
  { card: 'bg-orange-100 hover:bg-orange-200', name: 'text-orange-900', price: 'text-orange-700' },
  { card: 'bg-teal-100 hover:bg-teal-200', name: 'text-teal-900', price: 'text-teal-700' },
];
const tone = id => {
  let h = 0;
  for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
};
const PAY = [
  { key: 'nakit', label: 'Nakit', Icon: Banknote, on: 'bg-emerald-500 text-white border-emerald-500' },
  { key: 'kart', label: 'Kart', Icon: CreditCard, on: 'bg-sky-500 text-white border-sky-500' },
  { key: 'veresiye', label: 'Veresiye', Icon: BookUser, on: 'bg-violet-500 text-white border-violet-500' },
];

// KANTİN: barkod okut → fiyat göster → satışa ekle → tahsil et
export default function KasaView({ products, colors, onAddProduct, mutate, customers = [] }) {
  const [code, setCode] = useState('');
  const [item, setItem] = useState(null);
  const [basket, setBasket] = useState([]);
  const [msg, setMsg] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('nakit');
  const [debtorId, setDebtorId] = useState('');
  const [newDebtor, setNewDebtor] = useState('');
  const [lastSale, setLastSale] = useState(null);
  const [manual, setManual] = useState({ name: '', price: '', code: '' });
  const [pickSearch, setPickSearch] = useState('');
  const [showDefine, setShowDefine] = useState(false);
  const inputRef = useRef(null);

  const total = basket.reduce((s, i) => s + Number(i.price) * i.qty, 0);

  // Barkod olmadan elle ürün seçme: kasada barkod alanına yazınca da burada arar
  const pickable = (products || []).filter(p => !pickSearch ||
    p.name.toLowerCase().includes(pickSearch.toLowerCase()) ||
    (p.barcode || '').includes(pickSearch));

  const addProduct = p => {
    addToBasket({ ...p, barcode: p.barcode || p.id });
    setMsg({ type: 'ok', text: `${p.name} eklendi` });
  };

  // Tüm okutmalar tek yoldan gelir (listenBarcode → scan); çift okuma koruması
  // barcode.js'teki kayan pencerede. SORGULA butonu da aynı fonksiyonu çağırır.
  const scan = async c => {
    const raw = (c ?? code).trim();
    if (!raw) return;
    const r = await lookupBarcode(raw);
    if (r.data?.found) {
      addToBasket(r.data.item);
      setMsg({ type: 'ok', text: `${r.data.item.name} eklendi` });
    } else {
      // Sunucu yoksa/404 ise yerelde ara: barcode (string) veya ürün id'si
      const local = (products || []).find(p => String(p.barcode ?? '').trim() === raw)
        || (products || []).find(p => String(p.id) === raw);
      if (local) {
        addToBasket({ ...local, barcode: local.barcode || raw });
        setMsg({ type: 'ok', text: `${local.name} eklendi` });
      } else {
        setMsg({ type: 'err', text: `Barkod tanımsız: ${raw} — aşağıdan tanımlayın` });
        setManual(m => ({ ...m, code: raw }));
        setShowDefine(true);
      }
    }
    setCode('');
    setItem(null);
    inputRef.current?.focus();
  };

  const addToBasket = it => {
    const key = it.barcode || it.id;
    setBasket(prev => {
      const e = prev.find(x => x.code === key);
      if (e) return prev.map(x => x.code === key ? { ...x, qty: x.qty + 1 } : x);
      return [...prev, { id: it.id, code: key, name: it.name, price: Number(it.price), qty: 1 }];
    });
  };

  // Okuyucu her yerde çalışsın (kasa modunda). Dinleyici bir kez kurulur ama her
  // zaman güncel scan'i çağırır (yoksa ilk render'daki boş ürün listesine bakar).
  const scanRef = useRef(scan);
  scanRef.current = scan;
  useEffect(() => listenBarcode(c => scanRef.current(c)), []);

  const changeQty = (code, d) => setBasket(prev =>
    prev.map(x => x.code === code ? { ...x, qty: x.qty + d } : x).filter(x => x.qty > 0));

  const pay = async () => {
    if (!basket.length) return;
    if (paymentMethod === 'veresiye' && !debtorId && !newDebtor.trim()) {
      setMsg({ type: 'err', text: 'Veresiye için müşteri seçin veya ad yazın' });
      return;
    }
    // Sepetin tamamı TEK fiş olarak yazılır (ürün başına ayrı satış açmak ciroyu böler)
    const sale = {
      id: 'sale-' + Date.now().toString(36),
      tableId: 'KANTIN', tableName: 'Kantin (barkod)',
      items: basket.map(i => ({ productId: i.id, barcode: i.code, name: i.name, price: Number(i.price), qty: i.qty })),
      subtotal: total, paymentMethod, discountType: 'amount', discountValue: 0, discountAmount: 0,
      finalTotal: total, paidAt: new Date().toLocaleString('tr-TR'), createdAt: Date.now()
    };
    if (!mutate) return;
    try {
      await mutate('add', 'sales', null, sale);
    } catch (e) {
      setMsg({ type: 'err', text: 'Satış kaydedilemedi: ' + (e?.message || e) });
      return;
    }

    // Veresiye: borcu müşteriye yaz
    if (paymentMethod === 'veresiye') {
      const log = { id: Date.now().toString(), type: 'debt', amount: total, date: new Date().toLocaleString('tr-TR'), createdAt: Date.now(), note: 'Kasa satışı' };
      if (debtorId) {
        const c = customers.find(x => x.id === debtorId);
        if (c) await mutate('update', 'veresiye', debtorId, { debt: (c.debt || 0) + total, logs: [...(c.logs || []), log] });
      } else {
        await mutate('add', 'veresiye', null, {
          id: 'v-' + Date.now().toString(36), name: newDebtor.trim(), phone: '',
          debt: total, logs: [log], createdAt: Date.now()
        });
      }
      setDebtorId(''); setNewDebtor('');
    }

    setLastSale({ items: basket, total, paymentMethod, at: new Date().toLocaleTimeString('tr-TR') });
    setBasket([]);
    setMsg({ type: 'ok', text: `Satış tamamlandı: ${total} TL${paymentMethod === 'veresiye' ? ' (veresiye)' : ''}` });
  };

  const defineBarcode = () => {
    if (!manual.code || !manual.name || !manual.price) return;
    const code = manual.code.trim();
    const name = manual.name.trim();
    const price = Number(manual.price);
    if ((products || []).some(p => String(p.barcode ?? '').trim() === code)) {
      setMsg({ type: 'err', text: `${code} zaten bir ürüne tanımlı — fiyatı Ürünler ekranından değiştirin` });
      return;
    }
    // Ürün listesine de yaz ki "Ürünler" ekranında görünsün, fiyat tek kaynaktan yönetilsin
    if (onAddProduct) {
      onAddProduct({
        id: 'p-' + code, name, price, category: 'BÜFE', color: colors[0],
        unit: 'adet', barcode: code
      });
    } else if (mutate) {
      mutate('add', 'barcodes', null, {
        id: 'bc-' + Date.now().toString(36), code, name, price,
        category: 'KANTİN', color: colors[0], unit: 'adet'
      });
    }
    setMsg({ type: 'ok', text: `${name} ürünlere eklendi ve barkodu tanımlandı` });
    setManual({ name: '', price: '', code: '' });
  };

  // Okutulan barkodu barkodsuz mevcut bir ürüne bağla (yeni ürün açmadan)
  const noBarcode = (products || []).filter(p => !String(p.barcode ?? '').trim());
  const linkBarcode = async pid => {
    const code = manual.code.trim();
    const p = (products || []).find(x => x.id === pid);
    if (!code || !p || !mutate) return;
    if ((products || []).some(x => String(x.barcode ?? '').trim() === code)) {
      setMsg({ type: 'err', text: `${code} zaten bir ürüne tanımlı` });
      return;
    }
    try {
      await mutate('update', 'products', p.id, { barcode: code });
      await mutate('add', 'barcodes', null, {
        id: 'bc-' + p.id, code, name: p.name, price: Number(p.price),
        category: p.category, color: p.color, unit: p.unit || 'adet'
      });
    } catch { return; }
    setMsg({ type: 'ok', text: `${code} → ${p.name} bağlandı` });
    setManual({ name: '', price: '', code: '' });
  };

  const count = basket.reduce((s, i) => s + i.qty, 0);
  const payInfo = PAY.find(p => p.key === paymentMethod);

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-cream">
      {/* SOL: okutma + ürün kartları */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        <div className="px-5 md:px-7 pt-5 pb-3 shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold text-stone-800 tracking-tight">Kasa</h1>
            {lastSale && (
              <div className="text-xs font-semibold text-emerald-800 bg-emerald-100 rounded-full px-3 py-1.5">
                Son satış {lastSale.at} · {lastSale.total} TL
              </div>
            )}
          </div>

          <div className="flex gap-2 bg-white border-2 border-amber-300 focus-within:border-primary rounded-2xl p-1.5 pl-4 items-center shadow-sm">
            <ScanBarcode className="text-amber-500 shrink-0" size={22} />
            <input
              ref={inputRef}
              autoFocus
              value={code}
              data-barcode-input
              onChange={e => setCode(e.target.value)}
              placeholder="Barkod okutun ya da yazıp Enter'a basın"
              className="flex-1 min-w-0 bg-transparent py-2.5 text-lg font-mono outline-none placeholder:font-sans placeholder:text-stone-400"
            />
            <button onClick={() => scan()} className="bg-primary text-white px-4 py-2.5 rounded-xl font-bold btn-press flex items-center gap-1.5">
              <Search size={18} /> Sorgula
            </button>
          </div>

          {msg && (
            <div className={`px-4 py-2.5 rounded-2xl text-sm font-semibold flex items-center justify-between ${msg.type === 'ok' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
              <span>{msg.text}</span>
              <button onClick={() => setMsg(null)} aria-label="Kapat"><X size={16} /></button>
            </div>
          )}

          <input value={pickSearch} onChange={e => setPickSearch(e.target.value)}
            placeholder="Ürün ara…"
            className="w-full md:w-72 bg-white border border-stone-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary" />
        </div>

        {/* Ürün kartları */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 md:px-7 pb-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3">
            {pickable.map(p => {
              const t = tone(p.id);
              const inBasket = basket.find(b => b.id === p.id)?.qty;
              return (
                <button key={p.id} onClick={() => addProduct(p)}
                  className={`relative text-left p-4 rounded-3xl min-h-[104px] flex flex-col justify-between btn-press ${t.card}`}>
                  {inBasket > 0 && (
                    <span className="absolute top-2.5 right-2.5 min-w-6 h-6 px-1.5 rounded-full bg-white text-stone-800 text-xs font-extrabold flex items-center justify-center shadow-sm">{inBasket}</span>
                  )}
                  <div className={`text-sm font-bold leading-snug line-clamp-2 pr-6 ${t.name}`}>{p.name}</div>
                  <div className={`text-xl font-extrabold mt-2 ${t.price}`}>{p.price} TL</div>
                </button>
              );
            })}
            {pickable.length === 0 && <p className="col-span-full text-center text-stone-400 text-sm py-10">Ürün bulunamadı</p>}
          </div>

          {/* Barkod tanımla — kapalı durur, tanımsız barkod okutulunca açılır */}
          <div className="mt-5 bg-white rounded-3xl border border-stone-200 overflow-hidden">
            <button onClick={() => setShowDefine(v => !v)} className="w-full px-5 py-3.5 font-bold text-sm text-stone-700 flex items-center justify-between">
              <span className="flex items-center gap-2"><Plus size={16} className="text-primary" /> Barkod tanımla / ürün ekle</span>
              <ChevronDown size={18} className={`text-stone-400 transition-transform ${showDefine ? 'rotate-180' : ''}`} />
            </button>
            {showDefine && (
              <div className="px-5 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
                  <input value={manual.code} onChange={e => setManual({ ...manual, code: e.target.value })} placeholder="Barkod" className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm font-mono outline-none focus:border-primary" />
                  <input value={manual.name} onChange={e => setManual({ ...manual, name: e.target.value })} placeholder="Ürün adı" className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary" />
                  <input value={manual.price} onChange={e => setManual({ ...manual, price: e.target.value })} type="number" min="0" placeholder="Fiyat (TL)" className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary" />
                  <button onClick={defineBarcode} disabled={!manual.code || !manual.name || !manual.price} className="bg-primary disabled:opacity-40 text-white rounded-xl font-bold py-2.5 btn-press flex items-center justify-center gap-2">
                    <Check size={16} /> Kaydet
                  </button>
                </div>
                <p className="mt-2 text-xs text-stone-400 flex items-center gap-1"><Camera size={12} /> Tanımsız barkod okutulunca kod buraya kendiliğinden yazılır.</p>
                {manual.code && noBarcode.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-stone-100">
                    <div className="text-xs font-bold text-stone-500 mb-2">Ya da bu barkodu barkodsuz bir ürüne bağla:</div>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto no-scrollbar">
                      {noBarcode.map(p => (
                        <button key={p.id} onClick={() => linkBarcode(p.id)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold btn-press ${tone(p.id).card} ${tone(p.id).name}`}>
                          {p.name} · {p.price} TL
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SAĞ: sepet */}
      <div className="w-full md:w-[380px] shrink-0 bg-white md:rounded-l-[2rem] md:my-3 shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_8px_30px_rgba(120,80,20,0.08)] flex flex-col">
        <div className="px-6 pt-3 md:pt-5 pb-2 md:pb-3 flex items-baseline justify-between">
          <span className="text-lg font-extrabold text-stone-800">Sepet</span>
          <span className="text-sm font-semibold text-amber-700">{count} ürün</span>
        </div>
        <div className="md:flex-1 max-h-28 md:max-h-none overflow-y-auto no-scrollbar px-4 space-y-2">
          {basket.length === 0 && (
            <div className="text-center text-stone-400 text-sm py-3 md:py-12">
              <ScanBarcode size={36} className="hidden md:block mx-auto mb-2 text-amber-300" />
              Barkod okutun ya da karta dokunun
            </div>
          )}
          {basket.map(it => {
            const t = tone(it.id);
            return (
              <div key={it.code} className="rounded-2xl p-3 flex items-center gap-3 bg-stone-50">
                <div className={`w-2 self-stretch rounded-full ${t.card.split(' ')[0]}`} />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-stone-800 text-sm truncate">{it.name}</div>
                  <div className="text-xs text-stone-400">{it.price} TL</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => changeQty(it.code, -1)} aria-label="Azalt" className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center btn-press"><Minus size={14} /></button>
                  <span className="w-7 text-center font-extrabold text-stone-800">{it.qty}</span>
                  <button onClick={() => changeQty(it.code, 1)} aria-label="Artır" className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center btn-press"><Plus size={14} /></button>
                </div>
                <span className="w-16 text-right font-extrabold text-stone-800">{it.qty * it.price} TL</span>
              </div>
            );
          })}
        </div>

        <div className="p-3 md:p-4 space-y-2 md:space-y-3 border-t border-stone-100">
          <div className="grid grid-cols-3 gap-2">
            {PAY.map(({ key, label, Icon, on }) => (
              <button key={key} onClick={() => setPaymentMethod(key)}
                className={`py-1.5 md:py-2.5 rounded-2xl text-sm font-bold border-2 btn-press flex md:flex-col justify-center gap-1.5 md:gap-0.5 items-center ${paymentMethod === key ? on : 'border-stone-200 text-stone-500 bg-white'}`}>
                <Icon size={18} /> {label}
              </button>
            ))}
          </div>
          {paymentMethod === 'veresiye' && (
            <div className="space-y-2 bg-violet-50 rounded-2xl p-3">
              <select value={debtorId} onChange={e => setDebtorId(e.target.value)}
                className="w-full border border-violet-200 rounded-xl px-3 py-2 text-sm bg-white outline-none">
                <option value="">Müşteri seçin</option>
                {(customers || []).map(c => <option key={c.id} value={c.id}>{c.name} ({(c.debt || 0)} TL)</option>)}
              </select>
              <input value={newDebtor} onChange={e => setNewDebtor(e.target.value)}
                placeholder="ya da yeni müşteri adı"
                className="w-full border border-violet-200 rounded-xl px-3 py-2 text-sm bg-white outline-none" />
            </div>
          )}
          <div className="flex justify-between items-end px-1">
            <span className="font-bold text-stone-500 text-sm">Toplam</span>
            <span className="font-extrabold text-3xl md:text-4xl text-stone-800 tracking-tight">{total} <span className="text-xl text-stone-400">TL</span></span>
          </div>
          <button onClick={pay} disabled={!basket.length} className="w-full bg-primary disabled:bg-stone-200 disabled:text-stone-400 text-white py-3 md:py-4 rounded-2xl text-lg font-extrabold btn-press">
            Tahsil et{basket.length ? ` · ${payInfo.label}` : ''}
          </button>
          <button onClick={() => setBasket([])} disabled={!basket.length} className="w-full text-rose-500 text-sm font-bold flex items-center justify-center gap-1 disabled:opacity-0">
            <Trash2 size={14} /> Sepeti temizle
          </button>
        </div>
      </div>
    </div>
  );
}
