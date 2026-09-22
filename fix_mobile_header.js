import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/components/OrderView.jsx', 'utf8');

const productsHeader = `        {/* MOBİL ÖZEL ÜST BİLGİ */}
        <div className="md:hidden bg-gray-800 text-white px-4 py-3 flex items-center gap-3 shrink-0">
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 btn-press">
            <ChevronLeft size={22} />
          </button>
          <div>
            <div className="font-bold text-lg leading-tight">{table.name}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">{table.zone} - Ürün Seçimi</div>
          </div>
        </div>

        <div className="bg-white border-b`;

code = code.replace(
  '<div className="bg-white border-b',
  productsHeader
);

fs.writeFileSync('adisyon-app/src/components/OrderView.jsx', code);
console.log("Mobile header added.");
