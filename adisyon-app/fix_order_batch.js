import fs from 'fs';
let code = fs.readFileSync('src/App.jsx', 'utf8');

const oldCode = `        mutate('add', 'orders', null, newOrder);
        
        setTables(ts => {
          const newTs = ts.map(t => t.id === activeTable.id ? { ...t, status: 'occupied', orderId: newOrder.id } : t);
          mutate('update', 'tables', activeTable.id, { status: 'occupied', orderId: newOrder.id });
          return newTs;
        });`;

const newCode = `        setTables(ts => ts.map(t => t.id === activeTable.id ? { ...t, status: 'occupied', orderId: newOrder.id } : t));
        fetch('/api/mutate', { method: 'POST', body: JSON.stringify([
          { action: 'add', collection: 'orders', id: null, data: newOrder },
          { action: 'update', collection: 'tables', id: activeTable.id, data: { status: 'occupied', orderId: newOrder.id } }
        ])});`;

if(code.includes(oldCode)) {
  code = code.replace(oldCode, newCode);
  fs.writeFileSync('src/App.jsx', code);
  console.log("Fixed new order batching");
}

const oldPayAndClose = `    mutate('update', 'orders', currentOrder.id, { status: 'paid' });
    mutate('update', 'tables', activeTable.id, { status: 'empty', orderId: null });`;
    
const newPayAndClose = `    fetch('/api/mutate', { method: 'POST', body: JSON.stringify([
      { action: 'update', collection: 'orders', id: currentOrder.id, data: { status: 'paid' } },
      { action: 'update', collection: 'tables', id: activeTable.id, data: { status: 'empty', orderId: null } }
    ])});`;

if(code.includes(oldPayAndClose)) {
  code = code.replace(oldPayAndClose, newPayAndClose);
  fs.writeFileSync('src/App.jsx', code);
  console.log("Fixed payAndClose batching");
}

