import fs from 'fs';
let code = fs.readFileSync('src/App.jsx', 'utf8');

// Fix the handleAddProduct to gracefully handle null currentOrder by creating it if missing
code = code.replace(
  'if (!currentOrder) return;',
  `
      let targetOrder = currentOrder;
      if (!targetOrder) {
         if (isFallback) {
            targetOrder = { id: \`mock-\${activeTableObj.id}\`, items: [], total: 0 };
            setOrders([...orders, targetOrder]);
         } else {
            const orderRef = await addDoc(collection(db, 'orders'), {
              tableId: activeTableObj.id, items: [], status: 'open', total: 0, createdAt: serverTimestamp()
            });
            await updateDoc(doc(db, 'tables', activeTableObj.id), { status: 'occupied', orderId: orderRef.id });
            targetOrder = { id: orderRef.id, items: [], total: 0 };
         }
      }
  `
);
// replace all currentOrder.items with targetOrder.items inside handleAddProduct
code = code.replace(/currentOrder\.items/g, 'targetOrder.items');
code = code.replace(/currentOrder\.id/g, 'targetOrder.id');

fs.writeFileSync('src/App.jsx', code);
