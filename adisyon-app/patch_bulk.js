import fs from 'fs';

// 1. App.jsx patching
let app = fs.readFileSync('src/App.jsx', 'utf8');

const handleAddMultipleProducts = `  const handleAddMultipleProducts = (newItems) => {
    const withIds = newItems.map(p => ({ id: uid(), ...p }));
    setProducts(prev => [...prev, ...withIds]);
    const mutations = withIds.map(p => ({ action: 'add', collection: 'products', id: null, data: p }));
    fetch('/api/mutate', { method: 'POST', body: JSON.stringify(mutations) });
  };`;

app = app.replace(
  `  const handleAddProductItem = p => {`,
  `${handleAddMultipleProducts}\n\n  const handleAddProductItem = p => {`
);

app = app.replace(
  `<ProductsAdmin products={products} categories={categories} colors={COLORS} onAdd={handleAddProductItem} onEdit={handleEditProduct} onDelete={handleDeleteProduct} />`,
  `<ProductsAdmin products={products} categories={categories} colors={COLORS} onAdd={handleAddProductItem} onAddMultiple={handleAddMultipleProducts} onEdit={handleEditProduct} onDelete={handleDeleteProduct} />`
);

fs.writeFileSync('src/App.jsx', app);


// 2. ProductsAdmin.jsx rewriting
let prod = fs.readFileSync('src/components/ProductsAdmin.jsx', 'utf8');

if(!prod.includes('UploadCloud')) {
  prod = prod.replace(
    `import { Package, Plus, Edit2, Trash2, X, Check, Search, Filter, Scale } from 'lucide-react';`,
    `import { Package, Plus, Edit2, Trash2, X, Check, Search, Filter, Scale, UploadCloud, Copy } from 'lucide-react';`
  );
}

prod = prod.replace(
  `export default function ProductsAdmin({ products, categories, colors, onAdd, onEdit, onDelete }) {`,
  `export default function ProductsAdmin({ products, categories, colors, onAdd, onAddMultiple, onEdit, onDelete }) {
  const [showBulkModal, setShowBulkModal] = useState(false);
  const bulkPrompt = \`Aşağıdaki JSON formatına uygun bir şekilde, bir kafede/lokantada satılabilecek ürün listesi hazırla. "category" alanları şunlardan biri olmalı: \${categories.join(', ')}. "color" alanları şunlardan biri olmalı: \${colors.slice(0,8).join(', ')}. "unit" alanı "adet" veya "kg" olmalıdır. Fiyatlar "price" olarak sayı olmalıdır.\\nÖrnek format:\\n[\\n  { "name": "Mercimek Çorbası", "price": 80, "color": "bg-orange-500", "category": "\${categories[0] || 'YİYECEKLER'}", "unit": "adet" },\\n  { "name": "Fıstıklı Baklava", "price": 450, "color": "bg-green-500", "category": "\${categories[1] || 'TATLI'}", "unit": "kg" }\\n]\\nSadece bu JSON array'ini döndür, başka hiçbir yazı ekleme.\`;
  
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
`
);

const headerEnd = `        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="text-primary" /> Ürün Yönetimi
          </h1>
          <p className="text-sm text-gray-500 mt-1">Sistemdeki tüm ürünleri ve fiyatları buradan ayarlayabilirsiniz.</p>
        </div>`;

const newHeader = `        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="text-primary" /> Ürün Yönetimi
          </h1>
          <p className="text-sm text-gray-500 mt-1">Sistemdeki tüm ürünleri ve fiyatları buradan ayarlayabilirsiniz.</p>
        </div>
        <button onClick={() => setShowBulkModal(true)} className="btn-press bg-indigo-50 text-primary border border-primary/20 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm hover:bg-primary hover:text-white transition-colors">
          <UploadCloud size={18} /> TOPLU YÜKLE
        </button>`;

prod = prod.replace(headerEnd, newHeader);

const bulkModalHtml = `
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <UploadCloud className="text-primary" size={20} /> Yapay Zeka ile Toplu Ürün Yükleme
              </h2>
              <button onClick={() => setShowBulkModal(false)} className="text-gray-400 hover:text-red-500 transition-colors p-1"><X size={20}/></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
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
`;

prod = prod.replace(/    <\/div>\n  \);\n\}/, bulkModalHtml + '\n    </div>\n  );\n}');

fs.writeFileSync('src/components/ProductsAdmin.jsx', prod);

