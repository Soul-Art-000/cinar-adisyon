import fs from 'fs';
let file = 'adisyon-app/src/components/SettingsAdmin.jsx';
let code = fs.readFileSync(file, 'utf8');

const oldCode = `                const reader = new FileReader();
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
                      if (isTauri()) return await invoke(command, args);
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
                reader.readAsText(file);`;

const newCode = `                try {
                  const text = await file.text();
                  const data = JSON.parse(text);
                  const mutations = Object.keys(data).map(key => ({
                    action: 'set',
                    collection: key,
                    id: null,
                    data: data[key]
                  }));
                  
                  const apiInvoke = async (command, args = {}) => {
                    if (isTauri()) return await invoke(command, args);
                    let url = '/api/' + (command === 'mutate_db' ? 'mutate' : 'db');
                    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(args) });
                    if (!res.ok) throw new Error(await res.text());
                    return await res.json();
                  };
                  
                  await apiInvoke('mutate_db', { mutations });
                  alert("Config dosyası başarıyla yüklendi! Lütfen programı yeniden başlatın.");
                  window.location.reload();
                } catch (err) {
                  alert("HATA Detayı: " + (err.message || err));
                }
                e.target.value = null;`;

code = code.replace(oldCode, newCode);
fs.writeFileSync(file, code);
console.log("Patched SettingsAdmin.jsx to use file.text()");
