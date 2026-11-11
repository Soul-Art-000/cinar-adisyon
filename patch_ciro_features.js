import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/components/CiroView.jsx', 'utf8');

// 1. Add new prop
code = code.replace(
  'export default function CiroView({ sales }) {',
  'import { invoke } from "@tauri-apps/api/core";\nexport default function CiroView({ sales, onEndOfDay }) {'
);

// 2. Add Gün Sonu logic
const endOfDayLogic = `
  const handlePrintZReport = () => {
    const printerName = localStorage.getItem('adisyon_printer');
    if (!printerName) {
      onEndOfDay();
      return;
    }
    
    let receiptText = \`*** GUN SONU (Z-RAPORU) ***\\n\\n\`;
    receiptText += \`TARIH: \${new Date().toLocaleString('tr-TR')}\\n\`;
    receiptText += \`--------------------------------\\n\`;
    receiptText += \`TOPLAM SATIS:             \${sales.length}\\n\`;
    receiptText += \`NAKIT KASA:               \${totalCash} TL\\n\`;
    receiptText += \`KREDI KARTI:              \${totalCard} TL\\n\`;
    receiptText += \`VERESIYE (ACIK):          \${totalVeresiye} TL\\n\`;
    receiptText += \`--------------------------------\\n\`;
    receiptText += \`GENEL TOPLAM Ciro:        \${totalRevenue} TL\\n\\n\\n\`;
    
    invoke('print_receipt', { printerName, receiptText })
      .then(() => onEndOfDay())
      .catch(e => {
        console.error(e);
        alert("Yazdirma hatasi: " + e);
        onEndOfDay();
      });
  };
`;
const idx = code.indexOf('return (');
code = code.substring(0, idx) + endOfDayLogic + '\n  ' + code.substring(idx);

// 3. Add Gün Sonu Button to UI
const buttonTarget = '<h1 className="text-2xl font-bold text-gray-800 mb-6">Ciro & Satış Raporu</h1>';
const buttonReplacement = `
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Ciro & Satış Raporu</h1>
        <button onClick={handlePrintZReport} className="btn-press bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm">
          Gün Sonu Yap (Kasa Kapat)
        </button>
      </div>
`;
code = code.replace(buttonTarget, buttonReplacement);

fs.writeFileSync('adisyon-app/src/components/CiroView.jsx', code);
console.log("CiroView features patched.");
