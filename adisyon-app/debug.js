import fs from 'fs';
let code = fs.readFileSync('src/App.jsx', 'utf8');
// add debug info to the UI
code = code.replace(
  '<Sidebar view={view} setView={setView} />',
  '<Sidebar view={view} setView={setView} />\n<div className="absolute top-0 right-0 z-[9999] bg-black text-white p-2 text-xs">Orders: {orders.length}, Tables: {tables.length}, Fallback: {isFallback ? "Yes" : "No"}, Error: {errorMsg}</div>'
);
code = code.replace(
  'onClose={() => setActiveTableId(null)}',
  'onClose={() => setActiveTableId(null)}\n      debugInfo={`tableId: ${activeTableObj.id}, orderId: ${activeTableObj.orderId}, currentOrder: ${currentOrder ? "FOUND" : "NULL"}`}'
);
fs.writeFileSync('src/App.jsx', code);
