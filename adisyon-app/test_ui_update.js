import fs from 'fs';
let code = fs.readFileSync('src/App.jsx', 'utf8');

// We need state for debugInfo
if (!code.includes('const [debugInfo, setDebugInfo]')) {
  code = code.replace('const [dbError, setDbError] = useState(null);', 'const [dbError, setDbError] = useState(null);\n  const [debugInfo, setDebugInfo] = useState(null);');
}

// Update fetchDb
if (!code.includes('setDebugInfo(db._debug)')) {
  code = code.replace('setDbError(null);', 'setDbError(null);\n      if (db._debug) setDebugInfo(db._debug);');
}

// Update UI
const oldUI = `<span>Ürün Sayısı: {products.length}</span>
        <span>Masa Sayısı: {tables.length}</span>
        <button onClick={() => alert(JSON.stringify({products: products.length, tables: tables.length, zones}))} className="bg-black text-white px-2 rounded">Detay</button>`;
const newUI = `<span>Ürün Sayısı: {products.length}</span>
        <span>Sunucu: {debugInfo ? "Bağlı (" + debugInfo.serverId + ")" : "YOK/ESKİ"}</span>
        <button onClick={() => alert(debugInfo ? "Okuduğu Dosya: " + debugInfo.dbPath : "Dosya bilgisi yok")} className="bg-black text-white px-2 rounded">DB Yolu</button>`;

if (code.includes('Ürün Sayısı: {products.length}')) {
  code = code.replace(oldUI, newUI);
  fs.writeFileSync('src/App.jsx', code);
  console.log("Debug UI updated");
}
