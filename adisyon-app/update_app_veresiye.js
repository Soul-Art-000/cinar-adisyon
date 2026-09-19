import fs from 'fs';

// 1. Sidebar.jsx
let sidebar = fs.readFileSync('src/components/Sidebar.jsx', 'utf8');
sidebar = sidebar.replace('import { LayoutGrid, Package, Settings, TrendingUp } from \'lucide-react\';', 'import { LayoutGrid, Package, Settings, TrendingUp, Book } from \'lucide-react\';');
sidebar = sidebar.replace(
  '<button onClick={() => setView(\'ciro\')}',
  `<button onClick={() => setView('veresiye')} className={\`btn-press flex flex-col items-center gap-2 w-full py-4 transition-colors \${view === 'veresiye' ? 'text-white bg-white/10 border-l-4 border-primary' : 'text-gray-500 hover:text-gray-300 border-l-4 border-transparent'}\`}>
          <Book size={28} />
          <span className="text-[10px] font-bold tracking-wider">VERESİYE</span>
        </button>
        <button onClick={() => setView('ciro')}`
);
fs.writeFileSync('src/components/Sidebar.jsx', sidebar);

// 2. App.jsx
let app = fs.readFileSync('src/App.jsx', 'utf8');
if (!app.includes('VeresiyeView')) {
  app = app.replace('import CiroView from \'./components/CiroView.jsx\';', 'import CiroView from \'./components/CiroView.jsx\';\nimport VeresiyeView from \'./components/VeresiyeView.jsx\';');
  
  app = app.replace('const [sales, setSales] = useState([]);', 'const [sales, setSales] = useState([]);\n  const [veresiye, setVeresiye] = useState([]);');
  
  app = app.replace('const s = db.sales || [];\n      s.sort((a,b) => a.createdAt - b.createdAt);\n      setSales(s);', 'const s = db.sales || [];\n      s.sort((a,b) => a.createdAt - b.createdAt);\n      setSales(s);\n      setVeresiye(db.veresiye || []);');

  app = app.replace(
    '// 6. Ürün Yönetimi',
    `// Veresiye
  const handleAddCustomer = c => {
    const id = uid();
    setVeresiye(prev => [...prev, { id, ...c }]);
    mutate('add', 'veresiye', null, { id, ...c });
  };
  const handleAddPayment = (customerId, amount) => {
    const c = veresiye.find(x => x.id === customerId);
    if (!c) return;
    const log = { id: uid(), type: 'payment', amount, date: now(), createdAt: Date.now() };
    const updated = { ...c, debt: c.debt - amount, logs: [...(c.logs||[]), log] };
    setVeresiye(prev => prev.map(x => x.id === customerId ? updated : x));
    mutate('update', 'veresiye', customerId, updated);
  };

  // 6. Ürün Yönetimi`
  );

  app = app.replace(
    '{view === \'ciro\'    && <CiroView sales={sales} />}',
    '{view === \'ciro\'    && <CiroView sales={sales} />}\n      {view === \'veresiye\' && <VeresiyeView customers={veresiye} onAddCustomer={handleAddCustomer} onAddPayment={handleAddPayment} />}'
  );
  
  // Expose veresiye to OrderView for selection
  app = app.replace(
    '<OrderView table={activeTable} order={currentOrder} products={products} categories={categories}',
    '<OrderView table={activeTable} order={currentOrder} products={products} categories={categories} customers={veresiye}'
  );
  
  // Make recordSale update veresiye debt if paymentMethod is veresiye
  app = app.replace(
    `    setSales(prev => [...prev, { id: saleId, ...saleData }]);
    setOrders(prev => prev.map(o => o.id === currentOrder.id ? { ...o, status: 'paid' } : o));
    
    mutate('add', 'sales', null, { id: saleId, ...saleData });`,
    `    setSales(prev => [...prev, { id: saleId, ...saleData }]);
    setOrders(prev => prev.map(o => o.id === currentOrder.id ? { ...o, status: 'paid' } : o));
    
    if (paymentInfo.paymentMethod === 'veresiye' && paymentInfo.customerId) {
      const c = veresiye.find(x => x.id === paymentInfo.customerId);
      if (c) {
        const log = { id: uid(), type: 'debt', amount: paymentInfo.finalTotal, date: now(), createdAt: Date.now(), note: saleData.tableName };
        const updated = { ...c, debt: c.debt + paymentInfo.finalTotal, logs: [...(c.logs||[]), log] };
        setVeresiye(prev => prev.map(x => x.id === paymentInfo.customerId ? updated : x));
        mutate('update', 'veresiye', paymentInfo.customerId, updated);
      }
    }
    
    mutate('add', 'sales', null, { id: saleId, ...saleData });`
  );
  
  fs.writeFileSync('src/App.jsx', app);
}

// 3. OrderView.jsx
let order = fs.readFileSync('src/components/OrderView.jsx', 'utf8');
if (!order.includes('VERESİYE')) {
  order = order.replace(
    'export default function OrderView({ table, order, products, categories, onClose, onAddProduct, onUpdateQty, onPay, onPayAndClose }) {',
    'export default function OrderView({ table, order, products, categories, customers = [], onClose, onAddProduct, onUpdateQty, onPay, onPayAndClose }) {'
  );
  
  order = order.replace(
    'const [paymentMethod, setPaymentMethod] = useState(\'nakit\'); // \'nakit\' | \'kart\'',
    'const [paymentMethod, setPaymentMethod] = useState(\'nakit\'); // \'nakit\' | \'kart\' | \'veresiye\'\n  const [selectedCustomerId, setSelectedCustomerId] = useState(\'\');'
  );
  
  order = order.replace(
    'onPay({ paymentMethod, discountType, discountValue: discountNum, discountAmount, finalTotal });',
    'onPay({ paymentMethod, customerId: selectedCustomerId, discountType, discountValue: discountNum, discountAmount, finalTotal });'
  );
  
  order = order.replace(
    'onPayAndClose({ paymentMethod, discountType, discountValue: discountNum, discountAmount, finalTotal });',
    'onPayAndClose({ paymentMethod, customerId: selectedCustomerId, discountType, discountValue: discountNum, discountAmount, finalTotal });'
  );
  
  order = order.replace(
    `                <CreditCard size={16} /> KART
              </button>
            </div>
          </div>`,
    `                <CreditCard size={16} /> KART
              </button>
              <button
                onClick={() => setPaymentMethod('veresiye')}
                className={\`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold btn-press border-2 transition-colors \${paymentMethod === 'veresiye' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}\`}
              >
                <Book size={16} /> VERESİYE
              </button>
            </div>
            
            {paymentMethod === 'veresiye' && (
              <div className="mt-2 animate-in">
                <select 
                  value={selectedCustomerId} 
                  onChange={e => setSelectedCustomerId(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white"
                >
                  <option value="">-- Müşteri Seçin --</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} (Bakiye: {c.debt} TL)</option>)}
                </select>
                {!selectedCustomerId && <div className="text-[10px] text-red-500 mt-1">* Lütfen bir müşteri seçin</div>}
              </div>
            )}
          </div>`
  );
  
  order = order.replace(
    'disabled={!hasItems}',
    'disabled={!hasItems || (paymentMethod === \'veresiye\' && !selectedCustomerId)}'
  );
  order = order.replace(
    'disabled={!hasItems}',
    'disabled={!hasItems || (paymentMethod === \'veresiye\' && !selectedCustomerId)}'
  );

  fs.writeFileSync('src/components/OrderView.jsx', order);
}
