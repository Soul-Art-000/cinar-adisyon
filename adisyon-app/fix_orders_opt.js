import fs from 'fs';
let code = fs.readFileSync('src/App.jsx', 'utf8');

code = code.replace(
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
  };`,
  `  const handleAddProduct = product => {
    if (activeTable.status === 'empty') {
      const newOrderId = \`order-\${uid()}\`;
      const items = [{ productId: product.id, name: product.name, price: product.price, qty: 1 }];
      
      // Optimistic
      setOrders(prev => [...prev, { id: newOrderId, tableId: activeTable.id, items, status: 'open', total: product.price }]);
      setTables(prev => prev.map(t => t.id === activeTable.id ? { ...t, status: 'occupied', orderId: newOrderId } : t));
      
      setDoc(doc(db, 'orders', newOrderId), { 
        tableId: activeTable.id, items, status: 'open', total: product.price, createdAt: serverTimestamp() 
      }).catch(console.error);
      updateDoc(doc(db, 'tables', activeTable.id), { status: 'occupied', orderId: newOrderId }).catch(console.error);
      return;
    }
    
    if (!currentOrder) return;
    const items = currentOrder.items.map(i => ({ ...i }));
    const existing = items.find(i => i.productId === product.id);
    if (existing) existing.qty += 1;
    else items.push({ productId: product.id, name: product.name, price: product.price, qty: 1 });
    
    const total = items.reduce((s, i) => s + i.price * i.qty, 0);
    // Optimistic
    setOrders(prev => prev.map(o => o.id === currentOrder.id ? { ...o, items, total } : o));
    
    updateDoc(doc(db, 'orders', currentOrder.id), { items, total }).catch(console.error);
  };`
);

code = code.replace(
  `  const handleUpdateQty = (productId, newQty) => {
    if (!currentOrder) return;
    const items = currentOrder.items
      .map(i => i.productId === productId ? { ...i, qty: newQty } : i)
      .filter(i => i.qty > 0);
    
    updateDoc(doc(db, 'orders', currentOrder.id), { 
      items, 
      total: items.reduce((s, i) => s + i.price * i.qty, 0) 
    });
  };`,
  `  const handleUpdateQty = (productId, newQty) => {
    if (!currentOrder) return;
    const items = currentOrder.items
      .map(i => i.productId === productId ? { ...i, qty: newQty } : i)
      .filter(i => i.qty > 0);
    
    const total = items.reduce((s, i) => s + i.price * i.qty, 0);
    // Optimistic
    setOrders(prev => prev.map(o => o.id === currentOrder.id ? { ...o, items, total } : o));
    
    updateDoc(doc(db, 'orders', currentOrder.id), { items, total }).catch(console.error);
  };`
);

code = code.replace(
  `  const recordSale = (paymentInfo) => {
    if (!currentOrder || currentOrder.items.length === 0) return;
    const saleId = uid();
    setDoc(doc(db, 'sales', saleId), {
      tableId: activeTable.id,
      tableName: \`\${activeTable.name} (\${activeTable.zone})\`,
      items: currentOrder.items,
      subtotal: currentOrder.total,
      ...paymentInfo,
      paidAt: now(),
      createdAt: serverTimestamp()
    });
    updateDoc(doc(db, 'orders', currentOrder.id), { status: 'paid' });
  };`,
  `  const recordSale = (paymentInfo) => {
    if (!currentOrder || currentOrder.items.length === 0) return;
    const saleId = uid();
    const saleData = {
      tableId: activeTable.id,
      tableName: \`\${activeTable.name} (\${activeTable.zone})\`,
      items: currentOrder.items,
      subtotal: currentOrder.total,
      ...paymentInfo,
      paidAt: now(),
      createdAt: serverTimestamp()
    };
    
    // Optimistic
    setSales(prev => [...prev, { id: saleId, ...saleData }]);
    setOrders(prev => prev.map(o => o.id === currentOrder.id ? { ...o, status: 'paid' } : o));
    
    setDoc(doc(db, 'sales', saleId), saleData).catch(console.error);
    updateDoc(doc(db, 'orders', currentOrder.id), { status: 'paid' }).catch(console.error);
  };`
);

fs.writeFileSync('src/App.jsx', code);
