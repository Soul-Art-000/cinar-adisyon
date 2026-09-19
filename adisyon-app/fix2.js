import fs from 'fs';
let code = fs.readFileSync('src/App.jsx', 'utf8');

code = code.replace(
  'targetOrder = { id: \`mock-\${activeTableObj.id}\`, items: [], total: 0 };\n            setOrders([...orders, targetOrder]);',
  `targetOrder = { id: \`mock-\${activeTableObj.id}\`, items: [], total: 0 };
            setOrders([...orders, targetOrder]);
            const newTables = [...tables];
            const tIdx = newTables.findIndex(t => t.id === activeTableObj.id);
            if (tIdx > -1) {
              newTables[tIdx].status = 'occupied';
              newTables[tIdx].orderId = targetOrder.id;
              setTables(newTables);
            }`
);

fs.writeFileSync('src/App.jsx', code);
