import { useState } from 'react';
import { Package, Plus, Edit2, Trash2, X, Check, Search, Filter, Scale, UploadCloud, Copy } from 'lucide-react';

export default function ProductsAdmin({ products, categories, colors, onAdd, onAddMultiple, onEdit, onDelete }) {
  const [showBulkModal, setShowBulkModal] = useState(false);
  const bulkPrompt = `Aşağıdaki JSON formatına uygun bir şekilde, bir kafede/lokantada satılabilecek ürün listesi hazırla. "category" alanları öncelikle şunlardan biri olmalı: ${categories.join(', ')}. Eğer ürün bu kategorilerden hiçbirine uymuyorsa, mantıklı yeni bir kategori adı yazabilirsin (Sistem otomatik oluşturacaktır). "color" alanları şunlardan biri olmalı: ${colors.slice(0,8).join(', ')}. "unit" alanı "adet" veya "kg" olmalıdır. Fiyatlar "price" olarak sayı olmalıdır.\nÖrnek format:\n[\n  { "name": "Mercimek Çorbası", "price": 80, "color": "bg-orange-500", "category": "${categories[0] || 'YİYECEKLER'}", "unit": "adet" },\n  { "name": "Fıstıklı Baklava", "price": 450, "color": "bg-green-500", "category": "${categories[1] || 'TATLI'}", "unit": "kg" }\n]\nSadece bu JSON array'ini döndür, başka hiçbir yazı ekleme.`;
  
  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(bulkPrompt);
    alert('Yapay zeka promptu kopyalandı! ChatGPT veya Claude gibi bir yapay zekaya yapıştırıp listeyi ürettirebilirsiniz.');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const arr = JSON.parse(ev.target.result);
        if (!Array.isArray(arr)) throw new Error('Geçersiz format: Bir dizi (array) olmalı');
        const validItems = [];
        arr.forEach(item => {
          if (item.name && item.price && item.category) {
            validItems.push({ 
              name: item.name, 
              price: Number(item.price), 
              category: item.category, 
              color: item.color || colors[0], 
              unit: item.unit === 'kg' ? 'kg' : 'adet' 
            });
          }
        });
        if(validItems.length > 0 && onAddMultiple) {
           onAddMultiple(validItems);
           alert(validItems.length + ' adet ürün başarıyla eklendi!');
           setShowBulkModal(false);
        } else {
           alert('Dosyada geçerli ürün bulunamadı.');
        }
      } catch (err) {
        alert('Dosya okunurken bir hata oluştu: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newColor, setNewColor] = useState(colors[0]);
  const [newCategory, setNewCategory] = useState(categories[0] || '');
  const [newIsKg, setNewIsKg] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editIsKg, setEditIsKg] = useState(false);

  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('ALL');

  const handleAdd = () => {
    if (!newName || !newPrice || !newCategory) return;
    onAdd({ name: newName, price: Number(newPrice), category: newCategory, color: newColor, unit: newIsKg ? 'kg' : 'adet' });
    setNewName(''); setNewPrice(''); setNewIsKg(false);
  };

  const startEdit = (p) => {
    setEditingId(p.id); setEditName(p.name); setEditPrice(p.price); 
    setEditColor(p.color || colors[0]); setEditCategory(p.category); setEditIsKg(p.unit === 'kg');
  };

  const saveEdit = (p) => {
    onEdit({ ...p, name: editName, price: Number(editPrice), color: editColor, category: editCategory, unit: editIsKg ? 'kg' : 'adet' });
    setEditingId(null);
  };

  const filtered = products.filter(p => {
    const matchCat = filterCat === 'ALL' || p.category === filterCat;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50">
      <div className="px-8 py-6 border-b border-gray-200 bg-white shadow-sm shrink-0 flex justify-between items-center z-10">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="text-primary" /> Ürün Yönetimi
          </h1>
          <p className="text-sm text-gray-500 mt-1">Sistemdeki tüm ürünleri ve fiyatları buradan ayarlayabilirsiniz.</p>
        </div>
        <button onClick={() => setShowBulkModal(true)} className="btn-press bg-indigo-50 text-primary border border-primary/20 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm hover:bg-primary hover:text-white transition-colors">
          <UploadCloud size={18} /> TOPLU YÜKLE
        </button>
      </div>

      <div className="h-full overflow-y-auto no-scrollbar p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 font-bold text-gray-700 text-sm uppercase tracking-wider flex items-center gap-2">
            <Plus size={18} className="text-primary" /> Yeni Ürün Ekle
          </div>
          <div className="p-6">
            <div className="flex gap-4">
              <div className="flex-1 space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Ürün Adı</label>
                    <input type="text" placeholder="Örn: Karışık Pizza" value={newName} onChange={e=>setNewName(e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                  </div>
                  <div className="w-32">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Fiyat (TL)</label>
                    <input type="number" min="0" placeholder="0.00" value={newPrice} onChange={e=>setNewPrice(e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Kategori</label>
                    <div className="flex gap-2 flex-wrap">
                      {categories.map(c => (
                        <button key={c} onClick={() => setNewCategory(c)} className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-colors ${newCategory === c ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>{c}</button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Renk (Buton Rengi)</label>
                    <div className="flex gap-2 flex-wrap">
                      {colors.map(c => (
                        <button key={c} onClick={() => setNewColor(c)} className={`w-8 h-8 rounded-full transition-transform btn-press ${c} ${newColor === c ? 'ring-4 ring-primary/30 scale-110' : 'hover:scale-110 opacity-70'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="w-48 self-end mb-1">
                    <label className="flex items-center gap-2 cursor-pointer p-2 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <input type="checkbox" checked={newIsKg} onChange={e => setNewIsKg(e.target.checked)} className="w-4 h-4 text-primary accent-primary" />
                      <span className="text-sm font-bold text-gray-700 flex items-center gap-1"><Scale size={16}/> Kilo ile Satış (Kg)</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="w-32 flex items-end">
                <button onClick={handleAdd} disabled={!newName || !newPrice || !newCategory} className="w-full h-12 bg-primary text-white rounded-xl font-bold btn-press disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm">
                  EKLE
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/80">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Ürün Ara..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white transition-all" />
            </div>
            <div className="relative w-64 flex items-center">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white font-medium text-gray-700 appearance-none transition-all">
                <option value="ALL">Tüm Kategoriler</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/50 text-xs uppercase text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 font-bold">Ürün Adı</th>
                  <th className="px-6 py-3 font-bold">Kategori</th>
                  <th className="px-6 py-3 font-bold">Renk</th>
                  <th className="px-6 py-3 font-bold">Birim</th>
                  <th className="px-6 py-3 font-bold text-right">Fiyat</th>
                  <th className="px-6 py-3 font-bold text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => {
                  const isEditing = editingId === p.id;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3 font-medium text-gray-800">
                        {isEditing ? <input autoFocus type="text" value={editName} onChange={e=>setEditName(e.target.value)} className="border border-gray-300 rounded px-2 py-1 w-full text-sm" /> : p.name}
                      </td>
                      <td className="px-6 py-3">
                        {isEditing ? (
                          <select value={editCategory} onChange={e=>setEditCategory(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm bg-white">
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        ) : <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-bold">{p.category}</span>}
                      </td>
                      <td className="px-6 py-3">
                        {isEditing ? (
                          <select value={editColor} onChange={e=>setEditColor(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm bg-white">
                            {colors.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        ) : <div className={`w-6 h-6 rounded-full ${p.color}`} />}
                      </td>
                      <td className="px-6 py-3">
                        {isEditing ? (
                           <select value={editIsKg ? 'kg' : 'adet'} onChange={e=>setEditIsKg(e.target.value === 'kg')} className="border border-gray-300 rounded px-2 py-1 text-sm bg-white">
                             <option value="adet">Adet</option>
                             <option value="kg">Kg</option>
                           </select>
                        ) : <span className="text-xs font-bold text-gray-500 uppercase">{p.unit === 'kg' ? 'Kilo (Kg)' : 'Adet'}</span>}
                      </td>
                      <td className="px-6 py-3 text-right font-bold text-gray-800">
                        {isEditing ? <input type="number" value={editPrice} onChange={e=>setEditPrice(e.target.value)} className="border border-gray-300 rounded px-2 py-1 w-24 text-right text-sm" /> : `${p.price} TL`}
                      </td>
                      <td className="px-6 py-3 text-right">
                        {isEditing ? (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => saveEdit(p)} className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600"><Check size={16}/></button>
                            <button onClick={() => setEditingId(null)} className="p-1.5 bg-gray-400 text-white rounded hover:bg-gray-500"><X size={16}/></button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => startEdit(p)} className="p-1.5 text-gray-400 hover:text-primary transition-colors"><Edit2 size={16}/></button>
                            <button onClick={() => { if(confirm('Emin misiniz?')) onDelete(p.id) }} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400 text-sm">
                      Arama kriterlerine uygun ürün bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <UploadCloud className="text-primary" size={20} /> Yapay Zeka ile Toplu Ürün Yükleme
              </h2>
              <button onClick={() => setShowBulkModal(false)} className="text-gray-400 hover:text-red-500 transition-colors p-1"><X size={20}/></button>
            </div>
            
            <div className="p-6 overflow-y-auto no-scrollbar flex-1">
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                İleride yüzlerce ürünü tek tek girmek yerine ChatGPT veya Claude'a aşağıdaki <strong>Promptu (Talimatı)</strong> verip sana bir JSON dosyası oluşturmasını isteyebilirsin. Sonra o dosyayı buradan seçip tüm ürünleri tek tıkla sisteme ekleyebilirsin!
              </p>
              
              <div className="bg-gray-800 rounded-xl p-4 relative mb-6 group">
                <button onClick={handleCopyPrompt} className="absolute top-3 right-3 bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg backdrop-blur-md transition-colors flex items-center gap-2 text-xs font-bold">
                  <Copy size={14} /> PROMPTU KOPYALA
                </button>
                <pre className="text-emerald-400 text-xs font-mono whitespace-pre-wrap leading-relaxed pr-32">
                  {bulkPrompt}
                </pre>
              </div>

              <div className="border-2 border-dashed border-primary/30 rounded-2xl p-8 bg-primary/5 text-center flex flex-col items-center justify-center">
                <UploadCloud size={48} className="text-primary mb-3 opacity-80" />
                <h3 className="font-bold text-gray-800 mb-1">Yapay Zekanın Verdiği JSON Dosyasını Yükle</h3>
                <p className="text-sm text-gray-500 mb-4">.json uzantılı dosyayı buraya tıklayarak seçin</p>
                <input type="file" accept=".json" onChange={handleFileUpload} className="block w-full max-w-xs text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer" />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
