import fs from 'fs';
const code = `import { useState, useEffect, useCallback } from 'react';
import { Cloud, CloudOff, Server } from 'lucide-react';

import Sidebar from './components/Sidebar.jsx';
import TablesView from './components/TablesView.jsx';
import OrderView from './components/OrderView.jsx';
import ProductsAdmin from './components/ProductsAdmin.jsx';
import SettingsAdmin from './components/SettingsAdmin.jsx';
import CiroView from './components/CiroView.jsx';

const COLORS = [
  'bg-orange-500','bg-amber-500','bg-yellow-500','bg-green-500',
  'bg-teal-500','bg-cyan-500','bg-blue-500','bg-indigo-500',
  'bg-purple-500','bg-pink-500','bg-rose-500','bg-red-700',
  'bg-slate-500','bg-gray-700',
];

const uid = () => Date.now().toString(36) + Math.random().toString(36).substring(2);
const now = () => new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

export default function App() {
  const [view, setView] = useState('masalar');
  const [zones, setZones] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [sales, setSales] = useState([]);
  
  const [activeTableId, setActive] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Merkezi Local Senkronizasyon (Polling)
  const fetchDb = useCallback(async () => {
    try {
      const res = await fetch('/api/db');
      if (!res.ok) throw new Error('API Hatası');
      const db = await res.json();
      
      setZones(db.settings?.zones || []);
      setCategories(db.settings?.categories || []);
      setProducts(db.products || []);
      
      const t = db.tables || [];
      t.sort((a,b) => parseInt(a.name.split(' ')[1] || 0) - parseInt(b.name.split(' ')[1] || 0));
      setTables(t);
      
      setOrders(db.orders || []);
      
      const s = db.sales || [];
      s.sort((a,b) => a.createdAt - b.createdAt);
      setSales(s);
      
      setIsOnline(true);
    } catch (e) {
      setIsOnline(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDb();
    const interval = setInterval(fetchDb, 2000); // 2 saniyede bir eşitle
    return () => clearInterval(interval);
  }, [fetchDb]);

  const mutate = (action, collection, id, data) => {
    fetch('/api/mutate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, collection, id, data })
    }).catch(console.error);
  };

  const activeTable = tables.find(t => t.id === activeTableId) ?? null;
  const currentOrder = orders.find(o => o.id === activeTable?.orderId) ?? null;

  // 3. Masa İşlemleri
  const handleTableClick = table => setActive(table.id);

  // 4. Sipariş İşlemleri
  const handleAddProduct = product => {
    if (activeTable.status === 'empty') {
      const newOrderId = \`order-\${uid()}\`;
      const items = [{ productId: product.id, name: product.name, price: product.price, qty: 1 }];
      const order = { tableId: activeTable.id, items, status: 'open', total: product.price, createdAt: Date.now() };
      
      // Optimistic
      setOrders(prev => [...prev, { id: newOrderId, ...order }]);
      setTables(prev => prev.map(t => t.id === activeTable.id ? { ...t, status: 'occupied', orderId: newOrderId } : t));
      
      mutate('add', 'orders', null, { id: newOrderId, ...order });
      mutate('update', 'tables', activeTable.id, { status: 'occupied', orderId: newOrderId });
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
    mutate('update', 'orders', currentOrder.id, { items, total });
  };

  const handleUpdateQty = (productId, newQty) => {
    if (!currentOrder) return;
    const items = currentOrder.items
      .map(i => i.productId === productId ? { ...i, qty: newQty } : i)
      .filter(i => i.qty > 0);
    
    const total = items.reduce((s, i) => s + i.price * i.qty, 0);
    setOrders(prev => prev.map(o => o.id === currentOrder.id ? { ...o, items, total } : o));
    mutate('update', 'orders', currentOrder.id, { items, total });
  };

  // 5. Ödeme İşlemleri
  const recordSale = (paymentInfo) => {
    if (!currentOrder || currentOrder.items.length === 0) return;
    const saleId = uid();
    const saleData = {
      tableId: activeTable.id,
      tableName: \`\${activeTable.name} (\${activeTable.zone})\`,
      items: currentOrder.items,
      subtotal: currentOrder.total,
      ...paymentInfo,
      paidAt: now(),
      createdAt: Date.now()
    };
    
    setSales(prev => [...prev, { id: saleId, ...saleData }]);
    setOrders(prev => prev.map(o => o.id === currentOrder.id ? { ...o, status: 'paid' } : o));
    
    mutate('add', 'sales', null, { id: saleId, ...saleData });
    mutate('update', 'orders', currentOrder.id, { status: 'paid' });
  };

  const handlePay = paymentInfo => {
    if (!activeTable || !currentOrder) return;
    recordSale(paymentInfo);
    const newOrderId = \`order-\${uid()}\`;
    
    setOrders(prev => [...prev, { id: newOrderId, tableId: activeTable.id, items: [], status: 'open', total: 0 }]);
    setTables(prev => prev.map(t => t.id === activeTable.id ? { ...t, orderId: newOrderId } : t));
    
    mutate('add', 'orders', null, { id: newOrderId, tableId: activeTable.id, items: [], status: 'open', total: 0, createdAt: Date.now() });
    mutate('update', 'tables', activeTable.id, { orderId: newOrderId });
    setActive(null);
  };

  const handlePayAndClose = paymentInfo => {
    if (!activeTable) return;
    recordSale(paymentInfo);
    
    setTables(prev => prev.map(t => t.id === activeTable.id ? { ...t, status: 'empty', orderId: null } : t));
    mutate('update', 'tables', activeTable.id, { status: 'empty', orderId: null });
    setActive(null);
  };

  // 6. Ürün Yönetimi
  const handleAddProductItem = p => {
    const id = uid();
    setProducts(prev => [...prev, { id, ...p }]);
    mutate('add', 'products', null, { id, ...p });
  };
  const handleEditProduct = p => {
    setProducts(prev => prev.map(x => x.id === p.id ? p : x));
    mutate('update', 'products', p.id, p);
  };
  const handleDeleteProduct = id => {
    setProducts(prev => prev.filter(p => p.id !== id));
    mutate('delete', 'products', id);
  };

  // 7. Ayarlar
  const handleAddZone = name => {
    if (!name || zones.includes(name.toUpperCase())) return;
    const z = name.toUpperCase();
    
    setZones(prev => [...prev, z]);
    const newTables = Array.from({ length: 8 }, (_, i) => ({ id: \`\${z}-\${i+1}\`, name: \`Masa \${i+1}\`, zone: z, status: 'empty', orderId: null }));
    setTables(prev => [...prev, ...newTables]);
    
    mutate('updateSettings', 'settings', null, { zones: [...zones, z] });
    newTables.forEach(t => mutate('add', 'tables', null, t));
  };
  
  const handleDeleteZone = z => {
    setZones(prev => prev.filter(x => x !== z));
    setTables(prev => prev.filter(t => t.zone !== z));
    
    mutate('updateSettings', 'settings', null, { zones: zones.filter(x => x !== z) });
    mutate('deleteMany', 'tables', null, { field: 'zone', value: z });
  };
  
  const handleAddCategory = name => { 
    if (name && !categories.includes(name.toUpperCase())) {
      const c = name.toUpperCase();
      setCategories(prev => [...prev, c]);
      mutate('updateSettings', 'settings', null, { categories: [...categories, c] });
    }
  };
  
  const handleDeleteCategory = cat => { 
    setCategories(prev => prev.filter(c => c !== cat));
    setProducts(prev => prev.filter(p => p.category !== cat));
    
    mutate('updateSettings', 'settings', null, { categories: categories.filter(c => c !== cat) });
    mutate('deleteMany', 'products', null, { field: 'category', value: cat });
  };

  // ── Render ───────────────────────────────────────────────────────────
  if (activeTable) {
    return (
      <div className="relative">
        <OrderView table={activeTable} order={currentOrder} products={products} categories={categories} onClose={() => setActive(null)} onAddProduct={handleAddProduct} onUpdateQty={handleUpdateQty} onPay={handlePay} onPayAndClose={handlePayAndClose} />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 relative">
      <div className="absolute top-4 right-6 z-50 flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
        <div className="relative flex h-2.5 w-2.5">
          <span className={\`absolute inline-flex h-full w-full rounded-full opacity-75 \${!isOnline ? 'bg-orange-400 animate-pulse' : 'bg-green-400 animate-ping'}\`}></span>
          <span className={\`relative inline-flex rounded-full h-2.5 w-2.5 \${!isOnline ? 'bg-orange-500' : 'bg-green-500'}\`}></span>
        </div>
        {!isOnline ? <Server size={14} className="text-orange-500" /> : <Server size={14} className="text-green-500" />}
        <span className={\`text-[10px] font-bold tracking-wider \${!isOnline ? 'text-orange-500' : 'text-gray-600'}\`}>
          {!isOnline ? 'SUNUCUYA BAĞLANILIYOR...' : 'LOCAL SUNUCU BAĞLI'}
        </span>
      </div>

      <Sidebar view={view} setView={setView} />
      {view === 'masalar' && <TablesView tables={tables} zones={zones} onTableClick={handleTableClick} />}
      {view === 'urunler' && <ProductsAdmin products={products} categories={categories} colors={COLORS} onAdd={handleAddProductItem} onEdit={handleEditProduct} onDelete={handleDeleteProduct} />}
      {view === 'ciro'    && <CiroView sales={sales} />}
      {view === 'ayarlar' && <SettingsAdmin zones={zones} categories={categories} onAddZone={handleAddZone} onDeleteZone={handleDeleteZone} onAddCategory={handleAddCategory} onDeleteCategory={handleDeleteCategory} />}
    </div>
  );
}
`;
fs.writeFileSync('src/App.jsx', code);
