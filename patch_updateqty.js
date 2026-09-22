import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/App.jsx', 'utf8');

const oldCode = `  const handleUpdateQty = (productId, newQty) => {
    if (!currentOrder) return;
    const items = currentOrder.items
      .map(i => i.productId === productId ? { ...i, qty: newQty } : i)
      .filter(i => i.qty > 0);
    
    const total = items.reduce((s, i) => s + i.price * i.qty, 0);
    setOrders(prev => prev.map(o => o.id === currentOrder.id ? { ...o, items, total } : o));
    mutate('update', 'orders', currentOrder.id, { items, total });
  };`;

const newCode = `  const handleUpdateQty = async (productId, newQty) => {
    if (!currentOrder) return;
    const items = currentOrder.items
      .map(i => i.productId === productId ? { ...i, qty: newQty } : i)
      .filter(i => i.qty > 0);
    
    if (items.length === 0) {
      // Masada ürün kalmadıysa siparişi sil ve masayı boşalt
      setOrders(prev => prev.filter(o => o.id !== currentOrder.id));
      setTables(prev => prev.map(t => t.id === activeTable.id ? { ...t, status: 'empty', orderId: null } : t));
      
      try {
        const mutations = [
          { action: 'delete', collection: 'orders', id: currentOrder.id },
          { action: 'update', collection: 'tables', id: activeTable.id, data: { status: 'empty', orderId: null } }
        ];
        await invoke('mutate_db', { mutations });
        fetchDb();
      } catch(e) { console.error(e); }
      return;
    }

    const total = items.reduce((s, i) => s + i.price * i.qty, 0);
    setOrders(prev => prev.map(o => o.id === currentOrder.id ? { ...o, items, total } : o));
    mutate('update', 'orders', currentOrder.id, { items, total });
  };`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('adisyon-app/src/App.jsx', code);
console.log("handleUpdateQty patched to auto-clear table");
