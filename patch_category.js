import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/components/ProductsAdmin.jsx', 'utf8');

const oldSelect = `<div className="w-48">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Kategori</label>
                    <select value={newCategory} onChange={e=>setNewCategory(e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all bg-white">
                      <option value="" disabled>Kategori Seç</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>`;

const newChips = `<div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Kategori</label>
                    <div className="flex gap-2 flex-wrap">
                      {categories.map(c => (
                        <button key={c} onClick={() => setNewCategory(c)} className={\`px-3 py-1.5 rounded-lg text-sm font-bold border transition-colors \${newCategory === c ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}\`}>{c}</button>
                      ))}
                    </div>
                  </div>`;

code = code.replace(oldSelect, newChips);
fs.writeFileSync('adisyon-app/src/components/ProductsAdmin.jsx', code);
console.log("ProductsAdmin UI patched.");
