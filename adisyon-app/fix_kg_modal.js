import fs from 'fs';
let code = fs.readFileSync('src/App.jsx', 'utf8');

// Add state for kg modal
code = code.replace(
  `const [loading, setLoading] = useState(true);`,
  `const [loading, setLoading] = useState(true);\n  const [kgModal, setKgModal] = useState({ open: false, product: null, value: '' });`
);

// Replace prompt logic
const handleAddProductOld = `  const handleAddProduct = product => {
    let qtyToAdd = 1;
    if (product.unit === 'kg') {
      const p = prompt(\`\${product.name} için miktar giriniz (Kg/Gram):\`, "1");
      if (!p) return;
      qtyToAdd = parseFloat(p.replace(',', '.'));
      if (isNaN(qtyToAdd) || qtyToAdd <= 0) return;
    }
    
    if (!activeTable) return;
    
    setOrders(prev => {
      let existingOrder = prev.find(o => o.tableId === activeTable.id && o.status === 'open');
      if (existingOrder) {
        let updatedItems = [...existingOrder.items];
        const existIdx = updatedItems.findIndex(i => i.productId === product.id);
        
        if (existIdx > -1) {
          updatedItems[existIdx] = { ...updatedItems[existIdx], qty: updatedItems[existIdx].qty + qtyToAdd };
        } else {
          updatedItems.push({ productId: product.id, name: product.name, price: product.price, qty: qtyToAdd, unit: product.unit });
        }
        
        const newTotal = updatedItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
        const newOrder = { ...existingOrder, items: updatedItems, total: newTotal };
        mutate('update', 'orders', newOrder.id, { items: updatedItems, total: newTotal });
        return prev.map(o => o.id === newOrder.id ? newOrder : o);
      } else {
        const newOrder = {
          id: 'order-' + uid(),
          tableId: activeTable.id,
          items: [{ productId: product.id, name: product.name, price: product.price, qty: qtyToAdd, unit: product.unit }],
          status: 'open',
          total: product.price * qtyToAdd,
          createdAt: Date.now()
        };
        mutate('add', 'orders', null, newOrder);
        
        setTables(ts => {
          const newTs = ts.map(t => t.id === activeTable.id ? { ...t, status: 'occupied', orderId: newOrder.id } : t);
          const theTable = newTs.find(t => t.id === activeTable.id);
          mutate('update', 'tables', activeTable.id, { status: 'occupied', orderId: newOrder.id });
          return newTs;
        });
        
        return [...prev, newOrder];
      }
    });
  };`;

const handleAddProductNew = `  const executeAddProduct = (product, qtyToAdd) => {
    if (!activeTable) return;
    
    setOrders(prev => {
      let existingOrder = prev.find(o => o.tableId === activeTable.id && o.status === 'open');
      if (existingOrder) {
        let updatedItems = [...existingOrder.items];
        const existIdx = updatedItems.findIndex(i => i.productId === product.id);
        
        if (existIdx > -1) {
          updatedItems[existIdx] = { ...updatedItems[existIdx], qty: updatedItems[existIdx].qty + qtyToAdd };
        } else {
          updatedItems.push({ productId: product.id, name: product.name, price: product.price, qty: qtyToAdd, unit: product.unit });
        }
        
        const newTotal = updatedItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
        const newOrder = { ...existingOrder, items: updatedItems, total: newTotal };
        mutate('update', 'orders', newOrder.id, { items: updatedItems, total: newTotal });
        return prev.map(o => o.id === newOrder.id ? newOrder : o);
      } else {
        const newOrder = {
          id: 'order-' + uid(),
          tableId: activeTable.id,
          items: [{ productId: product.id, name: product.name, price: product.price, qty: qtyToAdd, unit: product.unit }],
          status: 'open',
          total: product.price * qtyToAdd,
          createdAt: Date.now()
        };
        mutate('add', 'orders', null, newOrder);
        
        setTables(ts => {
          const newTs = ts.map(t => t.id === activeTable.id ? { ...t, status: 'occupied', orderId: newOrder.id } : t);
          mutate('update', 'tables', activeTable.id, { status: 'occupied', orderId: newOrder.id });
          return newTs;
        });
        
        return [...prev, newOrder];
      }
    });
  };

  const handleAddProduct = product => {
    if (product.unit === 'kg') {
      setKgModal({ open: true, product, value: '1' });
    } else {
      executeAddProduct(product, 1);
    }
  };

  const submitKgModal = () => {
    const qty = parseFloat(kgModal.value.replace(',', '.'));
    if (!isNaN(qty) && qty > 0) {
      executeAddProduct(kgModal.product, qty);
    }
    setKgModal({ open: false, product: null, value: '' });
  };`;

if(code.includes('const p = prompt')) {
  code = code.replace(handleAddProductOld, handleAddProductNew);
} else {
  console.log("Could not find the prompt logic to replace");
}

const kgModalJsx = `
      {kgModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="bg-primary/10 px-6 py-4 border-b border-primary/20">
              <h2 className="text-xl font-bold text-gray-800">{kgModal.product?.name}</h2>
              <p className="text-sm text-gray-500">Miktar Giriniz (Örn: 1.5, 0.25)</p>
            </div>
            <div className="p-6">
              <input
                type="number"
                step="0.01"
                autoFocus
                className="w-full h-16 text-center text-3xl font-bold bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all mb-4"
                value={kgModal.value}
                onChange={e => setKgModal(prev => ({ ...prev, value: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && submitKgModal()}
              />
              <div className="flex gap-3">
                <button onClick={() => setKgModal({ open: false, product: null, value: '' })} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl btn-press">İPTAL</button>
                <button onClick={submitKgModal} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl btn-press">EKLE</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;

code = code.replace(/    <\/div>\n  \);\n\}/, kgModalJsx);

fs.writeFileSync('src/App.jsx', code);
