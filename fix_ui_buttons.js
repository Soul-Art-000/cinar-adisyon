import fs from 'fs';

// 1. Fix CiroView.jsx (Gün Sonu)
let ciroCode = fs.readFileSync('adisyon-app/src/components/CiroView.jsx', 'utf8');
const ciroTarget = '      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">\n        <TrendingUp size={26} className="text-primary" /> Ciro Raporu\n      </h1>';
const ciroReplacement = `
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <TrendingUp size={26} className="text-primary" /> Ciro Raporu
        </h1>
        <button onClick={handlePrintZReport} className="btn-press bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm">
          Gün Sonu Yap (Kasa Kapat)
        </button>
      </div>
`;
if(ciroCode.includes(ciroTarget)) {
    ciroCode = ciroCode.replace(ciroTarget, ciroReplacement);
    fs.writeFileSync('adisyon-app/src/components/CiroView.jsx', ciroCode);
    console.log("CiroView fixed.");
} else {
    console.log("CiroView target not found!");
}

// 2. Fix OrderView.jsx (Ikram)
let orderCode = fs.readFileSync('adisyon-app/src/components/OrderView.jsx', 'utf8');
const orderTarget = '<button onClick={() => onUpdateQty(item.productId, item.qty + 1)} className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center btn-press">\n                      <Plus size={14} />\n                    </button>';
const orderReplacement = orderTarget + `\n                    <button onClick={() => onToggleIkram(item.productId)} className={\`w-7 h-7 rounded-lg flex items-center justify-center btn-press ml-1 \${item.ikram ? 'bg-primary text-white border-primary' : 'bg-gray-100 text-gray-500 border border-gray-200'}\`} title="İkram">\n                      <Gift size={14} />\n                    </button>`;
if(orderCode.includes(orderTarget)) {
    orderCode = orderCode.replace(orderTarget, orderReplacement);
    fs.writeFileSync('adisyon-app/src/components/OrderView.jsx', orderCode);
    console.log("OrderView fixed.");
} else {
    console.log("OrderView target not found!");
}

