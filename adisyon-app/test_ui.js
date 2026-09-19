import fs from 'fs';
let code = fs.readFileSync('src/App.jsx', 'utf8');

const debugUI = `
      <div className="fixed top-0 left-0 right-0 bg-yellow-400 text-black p-2 text-center font-bold z-[9999] flex justify-center gap-4">
        <span>DEBUG:</span>
        <span>Ürün Sayısı: {products.length}</span>
        <span>Masa Sayısı: {tables.length}</span>
        <button onClick={() => alert(JSON.stringify({products: products.length, tables: tables.length, zones}))} className="bg-black text-white px-2 rounded">Detay</button>
      </div>
`;

if (!code.includes('DEBUG:')) {
  code = code.replace('<Sidebar view={view} setView={setView} />', debugUI + '\n      <Sidebar view={view} setView={setView} />');
  fs.writeFileSync('src/App.jsx', code);
  console.log("Debug UI added");
}
