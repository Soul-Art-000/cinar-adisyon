import { useState, useEffect, useRef } from 'react';
import { ScanBarcode, Search, Trash2, Plus, Tag } from 'lucide-react';
import { lookupBarcode, listenBarcode } from '../barcode.js';

// BARKOD YÖNETİMİ: barkodu okut → ürünle eşleştir → kaydet/çöz
export default function BarcodeAdmin({ barcodes = [], products = [], categories = [], colors = [], mutate }) {
  const [code, setCode] = useState('');
  const [found, setFound] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ code: '', name: '', price: '', category: categories[0] || 'KANTİN' });
  const inputRef = useRef(null);

  // Okuyucu gecikmeli Enter basarsa aynı okutma iki kez gelir (buffer + alan değeri);
  // aynı kodu 1,5 sn içinde ikinci kez işleme alma.
  const lastScan = useRef({ code: '', at: 0 });

  const check = async c => {
    const raw = (c ?? code).trim();
    if (raw && lastScan.current.code === raw && Date.now() - lastScan.current.at < 1500) {
      setCode('');
      return;
    }
    lastScan.current = { code: raw, at: Date.now() };
    if (!raw) return;
    const r = await lookupBarcode(raw);
    setFound(r.data?.found ? r.data.item : null);
    setForm(f => ({ ...f, code: raw, ...(r.data?.found ? { name: r.data.item.name, price: r.data.item.price } : {}) }));
    setCode('');
    inputRef.current?.focus();
  };

  useEffect(() => listenBarcode(check), []);

  const linkExisting = p => setForm({
    code: form.code, name: p.name, price: p.price, category: p.category, productId: p.id
  });

  const save = () => {
    if (!form.code || !form.name || !form.price) return;
    const rec = {
      id: 'bc-' + Date.now().toString(36),
      code: form.code.trim(),
      name: form.name.trim(),
      price: Number(form.price),
      category: form.category || 'KANTİN',
      color: colors[0],
      unit: 'adet'
    };
    mutate('add', 'barcodes', null, rec);
    setForm({ code: '', name: '', price: '', category: form.category });
    setFound(null);
  };

  const list = barcodes.filter(b =>
    !search || b.code.includes(search) || b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50">
      <div className="px-8 py-6 border-b border-gray-200 bg-white shadow-sm shrink-0">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><ScanBarcode className="text-primary" /> Barkod Yönetimi</h1>
        <p className="text-sm text-gray-500 mt-1">Barkod okutun, ürünle eşleştirin. Kasa ve kantin bu kayıtları kullanır.</p>
      </div>

      <div className="h-full overflow-y-auto no-scrollbar p-8 space-y-6">
        {/* Okutma + eşleştirme */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 flex gap-3 border-b border-gray-100">
            <input
              ref={inputRef} autoFocus value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={e => {
                if (e.key !== 'Enter' || e.defaultPrevented) return;
                check();
              }}
              placeholder="Barkod okut / yaz..."
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 font-mono focus:border-primary outline-none"
            />
            <button onClick={() => check()} className="bg-primary text-white px-5 rounded-xl font-bold btn-press flex items-center gap-2"><Search size={18} /> ARA</button>
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Barkod</label>
              <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 font-mono text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Ürün Adı</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Fiyat</label>
              <input type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Kategori</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                {[...new Set([...(categories || []), 'KANTİN'])].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button onClick={save} disabled={!form.code || !form.name || !form.price} className="h-10 bg-primary disabled:opacity-40 text-white rounded-lg font-bold btn-press flex items-center justify-center gap-2">
              <Plus size={16} /> KAYDET
            </button>
          </div>

          {found && (
            <div className="mx-4 mb-4 bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-800">
              Bu barkod zaten tanımlı: <b>{found.name}</b> — {found.price} TL
            </div>
          )}

          {products.length > 0 && (
            <div className="mx-4 mb-4">
              <div className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1"><Tag size={12} /> Mevcut ürüne bağla</div>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto no-scrollbar">
                {products.slice(0, 40).map(p => (
                  <button key={p.id} onClick={() => linkExisting(p)} className="px-3 py-1.5 bg-gray-50 hover:bg-primary hover:text-white border border-gray-200 rounded-lg text-xs font-bold transition-colors">
                    {p.name} · {p.price} TL
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Liste */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/80 flex items-center gap-3">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Barkod veya ürün ara..." className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <span className="text-xs font-bold text-gray-400">{list.length} kayıt</span>
          </div>
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/50 text-xs uppercase text-gray-400 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 font-bold">Barkod</th>
                <th className="px-4 py-3 font-bold">Ürün</th>
                <th className="px-4 py-3 font-bold">Kategori</th>
                <th className="px-4 py-3 font-bold text-right">Fiyat</th>
                <th className="px-4 py-3 font-bold text-right">Sil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {list.map(b => (
                <tr key={b.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-2.5 font-mono text-xs">{b.code}</td>
                  <td className="px-4 py-2.5 font-medium text-gray-800">{b.name}</td>
                  <td className="px-4 py-2.5"><span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-bold">{b.category}</span></td>
                  <td className="px-4 py-2.5 text-right font-bold">{b.price} TL</td>
                  <td className="px-4 py-2.5 text-right">
                    <button onClick={() => confirm('Silinsin mi?') && mutate('delete', 'barcodes', b.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {list.length === 0 && <tr><td colSpan="5" className="px-4 py-10 text-center text-gray-400">Kayıt yok</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
