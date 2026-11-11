import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/components/SettingsAdmin.jsx', 'utf8');

// add imports
if (!code.includes('useEffect')) {
    code = code.replace("import { useState } from 'react';", "import { useState, useEffect } from 'react';");
}
if (!code.includes('@tauri-apps/api/core')) {
    code = code.replace("import { Plus, Trash2 } from 'lucide-react';", "import { Plus, Trash2, Printer } from 'lucide-react';\nimport { invoke } from '@tauri-apps/api/core';");
}

// add state variables
const stateBlock = `
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
    invoke('print_receipt', { printerName: selectedPrinter, receiptText: "TEST FISI\\n\\nCINAR ADISYON\\nBasariyla Calisiyor.\\n\\n------------------\\n" })
      .then(() => alert("Test fişi gönderildi!"))
      .catch(e => alert("Hata: " + e));
  };
`;

code = code.replace('  const [newCat, setNewCat] = useState(\'\');', '  const [newCat, setNewCat] = useState(\'\');' + stateBlock);

// add UI block
const printerUI = `
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
`;

code = code.replace('      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">', '      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">\n' + printerUI);

fs.writeFileSync('adisyon-app/src/components/SettingsAdmin.jsx', code);
console.log("Settings patched for Printer");
