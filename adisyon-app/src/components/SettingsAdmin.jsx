import { useState, useEffect } from 'react';
import { Plus, Trash2, Printer } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

export default function SettingsAdmin({ zones, categories, onAddZone, onDeleteZone, onAddCategory, onDeleteCategory }) {
  const [localIp, setLocalIp] = useState('');
  const [hostname, setHostname] = useState('...');
  useEffect(() => {
    if ((window.__TAURI_INTERNALS__ !== undefined)) {
      invoke('get_local_ip').then(ip => { console.log('IP is:', ip); setLocalIp(ip); }).catch(console.error);
      invoke('get_hostname').then(setHostname).catch(console.error);
    }
  }, []);
  const [newZone, setNewZone] = useState('');
  const [newZoneCount, setNewZoneCount] = useState(8);
  const [newCat, setNewCat] = useState('');
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState(localStorage.getItem('adisyon_printer') || '');

  useEffect(() => {
    invoke('get_printers').then(setPrinters).catch(console.error);
  }, []);

  const handleSelectPrinter = (p) => {
    setSelectedPrinter(p);
    localStorage.setItem('adisyon_printer', p);
  };
  
  const testPrint = () => {
    if(!selectedPrinter) return alert("Önce yazıcı seçin!");
    invoke('print_receipt', { printerName: selectedPrinter, receiptText: "TEST FISI\n\nLOCAL ADISYON\nBasariyla Calisiyor.\n\n------------------\n" })
      .then(() => alert("Test fişi gönderildi!"))
      .catch(e => alert("Hata: " + e));
  };


  return (
    <div className="h-full overflow-y-auto no-scrollbar p-6 bg-gray-50">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Sistem Ayarları</h1>
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 shadow-sm mb-6">
        <h3 className="text-sm font-bold text-blue-800 uppercase mb-2 flex items-center gap-2">📱 Garson Bağlantı Adresi (Hiç Değişmez)</h3>
        <p className="text-gray-600 text-sm mb-4">Garsonların telefonlarından sipariş girmek için aynı WiFi ağına bağlanıp Safari'de aşağıdaki adrese girmeleri yeterlidir:</p>
        <div className="bg-white rounded-lg p-3 border border-blue-100 flex items-center justify-between mb-3">
          <span className="font-mono font-bold text-lg text-blue-600">http://{hostname}:3001</span>
          <button onClick={() => alert('Bu adresi telefonda açtıktan sonra Safari alt menüsünden \n"Ana Ekrana Ekle"ye basarsanız, normal bir Uygulama gibi kalıcı olarak yüklenir!\nBöylece garsonlar IP adresi değişse bile uygulamaya hep girebilir.')} className="px-4 py-2 bg-blue-100 text-blue-700 font-bold rounded-lg text-sm hover:bg-blue-200 transition-colors">📱 Nasıl Yüklenir?</button>
        </div>
        <p className="text-xs text-blue-500 font-medium">💡 Modemin IP adresini değiştirmesinden etkilenmez. Hep sabit kalır!</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        
        {/* YEDEKLEME VE VERİ TRANSFERİ */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 md:col-span-2">
          <h2 className="font-bold text-gray-700 mb-4 text-base uppercase tracking-wide flex items-center gap-2">
            💾 Yedekleme & Veri Transferi (Config)
          </h2>
          <div className="flex gap-4 items-center">
            <button
              onClick={async () => {
                try {
                  const db = (window.__TAURI_INTERNALS__ !== undefined) ? await invoke('get_db') : await fetch('/api/db', {method: 'POST'}).then(r => r.json());
                  const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'adisyon_config_' + new Date().toISOString().slice(0,10) + '.json';
                  a.click();
                  URL.revokeObjectURL(url);
                } catch(e) { alert("Dışa aktarma hatası: " + e); }
              }}
              className="btn-press bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-sm font-bold flex-1"
            >
              ⬆️ Ayarları ve Menüyü Dışa Aktar
            </button>

            <label className="btn-press bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl shadow-sm font-bold flex-1 text-center cursor-pointer">
              ⬇️ Config Dosyası Yükle (İçe Aktar)
              <input type="file" accept=".json" className="hidden" onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                if (!confirm("DİKKAT: Mevcut menü, ayarlar ve siparişler silinecek ve yüklediğiniz dosyadakiler geçerli olacak. Onaylıyor musunuz?")) {
                  e.target.value = null;
                  return;
                }
                const reader = new FileReader();
                reader.onload = async (evt) => {
                  try {
                    const data = JSON.parse(evt.target.result);
                    const mutations = Object.keys(data).map(key => ({
                      action: 'set',
                      collection: key,
                      id: null,
                      data: data[key]
                    }));
                    
                    const apiInvoke = async (command, args = {}) => {
                      if ((window.__TAURI_INTERNALS__ !== undefined)) return await invoke(command, args);
                      let url = '/api/' + (command === 'mutate_db' ? 'mutate' : 'db');
                      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(args) });
                      if (!res.ok) throw new Error(await res.text());
                      return await res.json();
                    };
                    
                    await apiInvoke('mutate_db', { mutations });
                    alert("Config dosyası başarıyla yüklendi! Lütfen programı yeniden başlatın veya sayfayı yenileyin.");
                    window.location.reload();
                  } catch (err) {
                    alert("Dosya yüklenirken hata oluştu: " + err);
                  }
                  e.target.value = null;
                };
                reader.readAsText(file);
              }} />
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-3">Bu özelliği kullanarak menülerinizi flash belleğe yedekleyebilir veya başka bir bilgisayara birebir aktarabilirsiniz.</p>
        </div>


        {/* YAZICI AYARLARI */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 md:col-span-2">
          <h2 className="font-bold text-gray-700 mb-4 text-base uppercase tracking-wide flex items-center gap-2">
            <Printer size={18} /> Termal Yazıcı (USB)
          </h2>
          <div className="flex gap-4 items-center">
            <select
              value={selectedPrinter}
              onChange={e => handleSelectPrinter(e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 bg-gray-50"
            >
              <option value="">-- Yazıcı Seçin --</option>
              {printers.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <button
              onClick={testPrint}
              disabled={!selectedPrinter}
              className="btn-press bg-black text-white px-6 py-3 rounded-xl shadow-sm disabled:opacity-50"
            >
              Test Fişi Bas
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3">Bilgisayara bağlı (USB) bir yazıcı seçtiğinizde siparişler ödendiğinde otomatik fiş basılacaktır.</p>
        </div>


        {/* MASA BÖLGELERİ */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-700 mb-4 text-base uppercase tracking-wide">Masa Bölgeleri</h2>
          <div className="space-y-2 mb-4">
            {zones.map(z => (
              <div key={z} className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-xl">
                <span className="font-semibold text-gray-800">{z}</span>
                <button onClick={() => onDeleteZone(z)} className="btn-press text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newZone}
              onChange={e => setNewZone(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { onAddZone(newZone, parseInt(newZoneCount)||8); setNewZone(''); } }}
              placeholder="Yeni bölge adı..."
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <input
              type="number"
              min="1"
              max="50"
              value={newZoneCount}
              onChange={e => setNewZoneCount(e.target.value)}
              placeholder="Masa Sayısı"
              className="w-24 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 text-center"
            />
            <button
              onClick={() => { onAddZone(newZone, parseInt(newZoneCount)||8); setNewZone(''); setNewZoneCount(8); }}
              className="btn-press bg-primary text-white px-4 py-2.5 rounded-xl shadow-sm"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* ÜRÜN KATEGORİLERİ */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-700 mb-4 text-base uppercase tracking-wide">Ürün Kategorileri</h2>
          <div className="space-y-2 mb-4">
            {categories.map(c => (
              <div key={c} className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-xl">
                <span className="font-semibold text-gray-800">{c}</span>
                <button onClick={() => onDeleteCategory(c)} className="btn-press text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newCat}
              onChange={e => setNewCat(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { onAddCategory(newCat); setNewCat(''); } }}
              placeholder="Yeni kategori adı..."
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
              onClick={() => { onAddCategory(newCat); setNewCat(''); }}
              className="btn-press bg-primary text-white px-4 py-2.5 rounded-xl shadow-sm"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
