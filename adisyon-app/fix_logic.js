import fs from 'fs';
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Change handleTableClick to just setActive
code = code.replace(
  `  const handleTableClick = table => {
    if (table.status === 'empty') {
      const newOrderId = \`order-\${uid()}\`;
      setDoc(doc(db, 'orders', newOrderId), { tableId: table.id, items: [], status: 'open', total: 0, createdAt: serverTimestamp() });
      updateDoc(doc(db, 'tables', table.id), { status: 'occupied', orderId: newOrderId });
    }
    setActive(table.id);
  };`,
  `  const handleTableClick = table => {
    setActive(table.id);
  };`
);

// 2. Change handleAddProduct to create order if empty
code = code.replace(
  `  const handleAddProduct = product => {
    if (!currentOrder) return;
    const items = currentOrder.items.map(i => ({ ...i }));
    const existing = items.find(i => i.productId === product.id);
    if (existing) existing.qty += 1;
    else items.push({ productId: product.id, name: product.name, price: product.price, qty: 1 });
    
    updateDoc(doc(db, 'orders', currentOrder.id), { 
      items, 
      total: items.reduce((s, i) => s + i.price * i.qty, 0) 
    });
  };`,
  `  const handleAddProduct = product => {
    if (activeTable.status === 'empty') {
      const newOrderId = \`order-\${uid()}\`;
      const items = [{ productId: product.id, name: product.name, price: product.price, qty: 1 }];
      setDoc(doc(db, 'orders', newOrderId), { 
        tableId: activeTable.id, items, status: 'open', total: product.price, createdAt: serverTimestamp() 
      });
      updateDoc(doc(db, 'tables', activeTable.id), { status: 'occupied', orderId: newOrderId });
      return;
    }
    
    if (!currentOrder) return;
    const items = currentOrder.items.map(i => ({ ...i }));
    const existing = items.find(i => i.productId === product.id);
    if (existing) existing.qty += 1;
    else items.push({ productId: product.id, name: product.name, price: product.price, qty: 1 });
    
    updateDoc(doc(db, 'orders', currentOrder.id), { 
      items, 
      total: items.reduce((s, i) => s + i.price * i.qty, 0) 
    });
  };`
);

// 3. Update handlePay to empty items and call setActive(null)
code = code.replace(
  `  const handlePay = paymentInfo => {
    if (!activeTable || !currentOrder) return;
    recordSale(paymentInfo);
    const newOrderId = \`order-\${uid()}\`;
    setDoc(doc(db, 'orders', newOrderId), { tableId: activeTable.id, items: [], status: 'open', total: 0, createdAt: serverTimestamp() });
    updateDoc(doc(db, 'tables', activeTable.id), { orderId: newOrderId });
  };`,
  `  const handlePay = paymentInfo => {
    if (!activeTable || !currentOrder) return;
    recordSale(paymentInfo);
    // Yeni boş sipariş aç ve masayı dolu bırak
    const newOrderId = \`order-\${uid()}\`;
    setDoc(doc(db, 'orders', newOrderId), { tableId: activeTable.id, items: [], status: 'open', total: 0, createdAt: serverTimestamp() });
    updateDoc(doc(db, 'tables', activeTable.id), { orderId: newOrderId });
    setActive(null); // Ana menüye dön
  };`
);

// 4. Update handlePayAndClose to ensure it returns to menu (already does, just verify)
code = code.replace(
  `  const handlePayAndClose = paymentInfo => {
    if (!activeTable) return;
    recordSale(paymentInfo);
    updateDoc(doc(db, 'tables', activeTable.id), { status: 'empty', orderId: null });
    setActive(null);
  };`,
  `  const handlePayAndClose = paymentInfo => {
    if (!activeTable) return;
    recordSale(paymentInfo);
    updateDoc(doc(db, 'tables', activeTable.id), { status: 'empty', orderId: null });
    setActive(null); // Ana menüye dön
  };`
);

fs.writeFileSync('src/App.jsx', code);
