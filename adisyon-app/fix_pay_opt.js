import fs from 'fs';
let code = fs.readFileSync('src/App.jsx', 'utf8');

code = code.replace(
  `  const handlePay = paymentInfo => {
    if (!activeTable || !currentOrder) return;
    recordSale(paymentInfo);
    // Yeni boş sipariş aç ve masayı dolu bırak
    const newOrderId = \`order-\${uid()}\`;
    setDoc(doc(db, 'orders', newOrderId), { tableId: activeTable.id, items: [], status: 'open', total: 0, createdAt: serverTimestamp() });
    updateDoc(doc(db, 'tables', activeTable.id), { orderId: newOrderId });
    setActive(null); // Ana menüye dön
  };`,
  `  const handlePay = paymentInfo => {
    if (!activeTable || !currentOrder) return;
    recordSale(paymentInfo);
    // Yeni boş sipariş aç ve masayı dolu bırak
    const newOrderId = \`order-\${uid()}\`;
    
    // Optimistic
    setOrders(prev => [...prev, { id: newOrderId, tableId: activeTable.id, items: [], status: 'open', total: 0 }]);
    setTables(prev => prev.map(t => t.id === activeTable.id ? { ...t, orderId: newOrderId } : t));
    
    setDoc(doc(db, 'orders', newOrderId), { tableId: activeTable.id, items: [], status: 'open', total: 0, createdAt: serverTimestamp() }).catch(console.error);
    updateDoc(doc(db, 'tables', activeTable.id), { orderId: newOrderId }).catch(console.error);
    setActive(null); // Ana menüye dön
  };`
);

code = code.replace(
  `  const handlePayAndClose = paymentInfo => {
    if (!activeTable) return;
    recordSale(paymentInfo);
    updateDoc(doc(db, 'tables', activeTable.id), { status: 'empty', orderId: null });
    setActive(null); // Ana menüye dön
  };`,
  `  const handlePayAndClose = paymentInfo => {
    if (!activeTable) return;
    recordSale(paymentInfo);
    
    // Optimistic
    setTables(prev => prev.map(t => t.id === activeTable.id ? { ...t, status: 'empty', orderId: null } : t));
    
    updateDoc(doc(db, 'tables', activeTable.id), { status: 'empty', orderId: null }).catch(console.error);
    setActive(null); // Ana menüye dön
  };`
);

fs.writeFileSync('src/App.jsx', code);
