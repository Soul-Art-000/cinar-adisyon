import { useState, useEffect, useRef } from 'react';
import { ScanBarcode, Plus, Trash2, Search, Camera, Check, X, LayoutGrid } from 'lucide-react';
import { lookupBarcode, sellBarcode, listenBarcode } from '../barcode.js';

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

  const scan = async c => {
    const raw = (c ?? code).trim();
    if (!raw) return;
    const r = await lookupBarcode(raw);
    if (r.data?.found) {
      addToBasket(r.data.item);
      setMsg({ type: 'ok', text: `${r.data.item.name} eklendi` });
    } else if (products.some(p => p.barcode === raw)) {
      // ürün listesinde barkod varsa yerelde bul
      addToBasket(products.find(p => p.barcode === raw));
      setMsg({ type: 'ok', text: 'Ürün eklendi' });
    } else {
      setMsg({ type: 'err', text: `Barkod tanımsız: ${raw} — aşağıdan tanımlayın` });
      setManual(m => ({ ...m, code: raw }));
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

  // Okuyucu her yerde çalışsın (kasa modunda)
  useEffect(() => listenBarcode(scan), []);

  const changeQty = (code, d) => setBasket(prev =>
    prev.map(x => x.code === code ? { ...x, qty: x.qty + d } : x).filter(x => x.qty > 0));

  const pay = async () => {
    if (!basket.length) return;
    if (paymentMethod === 'veresiye' && !debtorId && !newDebtor.trim()) {
      setMsg({ type: 'err', text: 'Veresiye için müşteri seçin veya ad yazın' });
      return;
    }
    let online = true;
    for (const it of basket) {
      const r = await sellBarcode(it.code, it.qty, paymentMethod).catch(() => ({ ok: false }));
      if (!r?.ok) online = false;
    }
    const sale = {
      id: 'sale-' + Date.now().toString(36),
      tableId: 'KANTIN', tableName: 'Kantin (barkod)',
      items: basket.map(i => ({ productId: i.id, barcode: i.code, name: i.name, price: i.price, qty: i.qty })),
      subtotal: total, paymentMethod, discountType: 'amount', discountValue: 0, discountAmount: 0,
      finalTotal: total, paidAt: new Date().toLocaleString('tr-TR'), createdAt: Date.now()
    };
    // Sunucu satış ucunu bulamazsa (Tauri sunucusu / barkodsuz ürün) doğrudan sales koleksiyonuna yaz
    if (!online && mutate) await mutate('add', 'sales', null, sale);

    // Veresiye: borcu müşteriye yaz
    if (paymentMethod === 'veresiye' && mutate) {
      const log = { id: Date.now().toString(), type: 'debt', amount: total, date: new Date().toLocaleString('tr-TR'), note: 'Kasa satışı' };
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
    const product = {
      id: 'bc-' + Date.now().toString(36),
      code: manual.code.trim(),
      name: manual.name.trim(),
      price: Number(manual.price),
      category: 'KANTİN',
      color: colors[0],
      unit: 'adet'
    };
    mutate('add', 'barcodes', null, product);
    setMsg({ type: 'ok', text: `${product.name} barkodu tanımlandı` });
    setManual({ name: '', price: '', code: '' });
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-screen overflow-hidden bg-gray-100">
      {/* BARKOD GİRİŞİ */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="bg-gray-800 text-white px-6 py-4 shrink-0">
          <h1 className="text-xl font-bold flex items-center gap-2"><ScanBarcode /> Yazar Kasa — Kantin</h1>
          <p className="text-xs text-gray-400 mt-0.5">Barkod okutun veya kodu yazıp Enter'a basın</p>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex gap-3">
            <input
              ref={inputRef}
              autoFocus
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && scan()}
              placeholder="Barkod no..."
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-lg font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
            <button onClick={() => scan()} className="bg-primary text-white px-5 rounded-xl font-bold btn-press flex items-center gap-2">
              <Search size={18} /> SORGULA
            </button>
          </div>

          {msg && (
            <div className={`px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between ${msg.type === 'ok' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              <span>{msg.text}</span>
              <button onClick={() => setMsg(null)}><X size={16} /></button>
            </div>
          )}

          {/* BARKODSUZ ELLE SEÇİM — ürün ızgarası */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
              <span className="font-bold text-sm text-gray-700 flex items-center gap-2"><LayoutGrid size={16} className="text-primary" /> Elle Ürün Seç</span>
              <input value={pickSearch} onChange={e => setPickSearch(e.target.value)}
                placeholder="Ürün ara..."
                className="w-48 border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary" />
            </div>
            <div className="p-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto no-scrollbar">
              {pickable.map(p => (
                <button key={p.id} onClick={() => addProduct(p)}
                  className="text-left p-2.5 rounded-xl border border-gray-200 hover:border-primary hover:bg-primary/5 btn-press">
                  <div className="text-xs font-bold text-gray-800 leading-tight line-clamp-2">{p.name}</div>
                  <div className="text-sm font-bold text-primary mt-1">{p.price} TL</div>
                  <div className="text-[10px] text-gray-400 font-mono truncate">{p.barcode || 'barkodsuz'}</div>
                </button>
              ))}
              {pickable.length === 0 && <p className="col-span-full text-center text-gray-400 text-sm py-6">Ürün bulunamadı</p>}
            </div>
          </div>

          {/* Barkod tanımla (ürün ekleme) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 font-bold text-sm text-gray-700 flex items-center gap-2">
              <Plus size={16} className="text-primary" /> Barkod Tanımla / Ürün Ekle
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
              <input value={manual.code} onChange={e => setManual({ ...manual, code: e.target.value })} placeholder="Barkod" className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono" />
              <input value={manual.name} onChange={e => setManual({ ...manual, name: e.target.value })} placeholder="Ürün adı" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <input value={manual.price} onChange={e => setManual({ ...manual, price: e.target.value })} type="number" min="0" placeholder="Fiyat" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <button onClick={defineBarcode} disabled={!manual.code || !manual.name || !manual.price} className="bg-primary disabled:opacity-40 text-white rounded-lg font-bold btn-press flex items-center justify-center gap-2">
                <Check size={16} /> KAYDET
              </button>
            </div>
            <p className="px-4 pb-3 text-xs text-gray-400 flex items-center gap-1"><Camera size={12} /> Okutulan tanımsız barkod otomatik olarak bu alana yazılır; sadece ad + fiyat girmeniz yeterli.</p>
          </div>

          {lastSale && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-sm text-green-800">
              <div className="font-bold mb-1">Son satış — {lastSale.at} ({lastSale.paymentMethod})</div>
              {lastSale.items.map(i => <div key={i.code}>{i.qty} × {i.name} = {i.qty * i.price} TL</div>)}
              <div className="font-bold mt-1">Toplam: {lastSale.total} TL</div>
            </div>
          )}
        </div>
      </div>

      {/* SEPET */}
      <div className="w-full md:w-[380px] shrink-0 bg-white border-l border-gray-200 flex flex-col h-full">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 font-bold text-gray-700 flex justify-between">
          <span>SEPET</span>
          <span className="text-gray-400">{basket.reduce((s, i) => s + i.qty, 0)} ürün</span>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
          {basket.length === 0 && <p className="text-center text-gray-400 text-sm py-10">Barkod okutarak başlayın</p>}
          {basket.map(it => (
            <div key={it.code} className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center justify-between">
              <div className="min-w-0">
                <div className="font-semibold text-gray-800 text-sm truncate">{it.name}</div>
                <div className="text-xs text-gray-400 font-mono">{it.code}</div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => changeQty(it.code, -1)} className="w-7 h-7 rounded-lg bg-white border border-gray-200 btn-press">−</button>
                <span className="w-8 text-center font-bold text-primary">{it.qty}</span>
                <button onClick={() => changeQty(it.code, 1)} className="w-7 h-7 rounded-lg bg-white border border-gray-200 btn-press">+</button>
                <span className="w-20 text-right font-bold text-gray-700">{it.qty * it.price} TL</span>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-200 p-4 space-y-3">
          <div className="flex gap-2">
            {['nakit', 'kart', 'veresiye'].map(m => (
              <button key={m} onClick={() => setPaymentMethod(m)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 btn-press ${paymentMethod === m ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-500'}`}>
                {m === 'veresiye' ? 'VERESİYE' : m.toUpperCase()}
              </button>
            ))}
          </div>
          {paymentMethod === 'veresiye' && (
            <div className="space-y-2">
              <select value={debtorId} onChange={e => setDebtorId(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="">— Müşteri seç —</option>
                {(customers || []).map(c => <option key={c.id} value={c.id}>{c.name} ({(c.debt || 0)} TL)</option>)}
              </select>
              <input value={newDebtor} onChange={e => setNewDebtor(e.target.value)}
                placeholder="veya yeni müşteri adı"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-600 text-sm uppercase">Toplam</span>
            <span className="font-bold text-2xl text-primary">{total} TL</span>
          </div>
          <button onClick={pay} disabled={!basket.length} className="w-full bg-gray-800 disabled:bg-gray-200 text-white py-3.5 rounded-xl font-bold btn-press">
            TAHSİL ET
          </button>
          <button onClick={() => setBasket([])} disabled={!basket.length} className="w-full text-red-500 text-sm font-bold flex items-center justify-center gap-1 disabled:opacity-40">
            <Trash2 size={14} /> Sepeti temizle
          </button>
        </div>
      </div>
    </div>
  );
}
