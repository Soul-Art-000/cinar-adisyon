import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/App.jsx', 'utf8');

// 1. Update total calculation to respect 'ikram'
code = code.replace(
  'const total = items.reduce((s, i) => s + i.price * i.qty, 0);',
  'const total = items.reduce((s, i) => s + (i.ikram ? 0 : i.price) * i.qty, 0);'
);
// Replace in both handleUpdateQty and maybe handleAddProduct?
// In handleAddProduct, total is just product.price. Let's make it respect ikram? By default ikram is false.
code = code.replace(
  "const order = { tableId: activeTable.id, items, status: 'open', total: product.price, createdAt: Date.now() };",
  "const order = { tableId: activeTable.id, items, status: 'open', total: product.price, createdAt: Date.now() };"
); // No change needed there.

// 2. Add handleToggleIkram function
const toggleIkramFunc = `
  const handleToggleIkram = (productId) => {
    if (!currentOrder) return;
    const items = currentOrder.items.map(i => i.productId === productId ? { ...i, ikram: !i.ikram } : i);
    const total = items.reduce((s, i) => s + (i.ikram ? 0 : i.price) * i.qty, 0);
    setOrders(prev => prev.map(o => o.id === currentOrder.id ? { ...o, items, total } : o));
    mutate('update', 'orders', currentOrder.id, { items, total });
  };
`;
code = code.replace('const handleUpdateQty = async (productId, newQty) => {', toggleIkramFunc + '\n  const handleUpdateQty = async (productId, newQty) => {');

// 3. Add handleMarkAsSent function for kitchen automation
const markAsSentFunc = `
  const handleMarkAsSent = () => {
    if (!currentOrder) return;
    const items = currentOrder.items.map(i => ({ ...i, sentToKitchen: true }));
    setOrders(prev => prev.map(o => o.id === currentOrder.id ? { ...o, items } : o));
    mutate('update', 'orders', currentOrder.id, { items });
  };
`;
code = code.replace('const handleToggleIkram', markAsSentFunc + '\n  const handleToggleIkram');

// 4. Add handleEndOfDay function
const endOfDayFunc = `
  const handleEndOfDay = async () => {
    if (sales.length === 0) {
      alert("Bugün hiç satış yapılmamış.");
      return;
    }
    
    // Z-Raporu yazdırma işlemi CiroView içinden tetiklenecek, 
    // biz sadece veritabanını sıfırlıyoruz.
    if (!confirm("Gün sonu yapmak ve tüm satışları sıfırlamak istediğinize emin misiniz?")) return;
    
    setSales([]);
    try {
      await invoke('mutate_db', { mutations: [{ action: 'set', collection: 'sales', id: null, data: [] }] });
      alert("Kasa başarıyla kapatıldı ve sıfırlandı.");
    } catch(e) {
      console.error(e);
      alert("Kasa kapatılırken hata oluştu!");
    }
  };
`;
code = code.replace('const handleMarkAsSent', endOfDayFunc + '\n  const handleMarkAsSent');


// 5. Pass new props to OrderView and CiroView
code = code.replace(
  '<OrderView table={activeTable} order={currentOrder} products={products} categories={categories} customers={veresiye} onClose={() => setActive(null)} onAddProduct={handleAddProduct} onUpdateQty={handleUpdateQty} onPay={handlePay} onPayAndClose={handlePayAndClose} />',
  '<OrderView table={activeTable} order={currentOrder} products={products} categories={categories} customers={veresiye} onClose={() => setActive(null)} onAddProduct={handleAddProduct} onUpdateQty={handleUpdateQty} onToggleIkram={handleToggleIkram} onMarkAsSent={handleMarkAsSent} onPay={handlePay} onPayAndClose={handlePayAndClose} />'
);

code = code.replace(
  '<CiroView sales={sales} />',
  '<CiroView sales={sales} onEndOfDay={handleEndOfDay} />'
);

fs.writeFileSync('adisyon-app/src/App.jsx', code);
console.log("App.jsx feature patches applied.");
