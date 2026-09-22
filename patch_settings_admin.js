import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/components/SettingsAdmin.jsx', 'utf8');

const importExportCode = `
        {/* YEDEKLEME VE VERİ TRANSFERİ */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 md:col-span-2">
          <h2 className="font-bold text-gray-700 mb-4 text-base uppercase tracking-wide flex items-center gap-2">
            💾 Yedekleme & Veri Transferi (Config)
          </h2>
          <div className="flex gap-4 items-center">
            <button
              onClick={async () => {
                try {
                  const db = window.__TAURI__ ? await invoke('get_db') : await fetch('/api/db', {method: 'POST'}).then(r => r.json());
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
                      if (window.__TAURI__) return await invoke(command, args);
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
`;

code = code.replace(
  "{/* YAZICI AYARLARI */}",
  importExportCode + "\n\n        {/* YAZICI AYARLARI */}"
);

fs.writeFileSync('adisyon-app/src/components/SettingsAdmin.jsx', code);
console.log("SettingsAdmin patched with Export/Import config buttons.");
