import { invoke } from '@tauri-apps/api/core';
import { useState, useEffect, useCallback } from 'react';
import { Cloud, CloudOff, Server } from 'lucide-react';



const apiInvoke = async (command, args = {}) => {
  if (window.__TAURI__) {
    return await invoke(command, args);
  } else {
    let url = '/api/' + (command === 'get_db' ? 'db' : (command === 'mutate_db' ? 'mutate' : 'print'));
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args)
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  }
};

import Sidebar from './components/Sidebar.jsx';

import TablesView from './components/TablesView.jsx';
import OrderView from './components/OrderView.jsx';
import ProductsAdmin from './components/ProductsAdmin.jsx';
import SettingsAdmin from './components/SettingsAdmin.jsx';
import CiroView from './components/CiroView.jsx';
import VeresiyeView from './components/VeresiyeView.jsx';

const COLORS = [
  'bg-orange-500','bg-amber-500','bg-yellow-500','bg-green-500',
  'bg-teal-500','bg-cyan-500','bg-blue-500','bg-indigo-500',
  'bg-purple-500','bg-pink-500','bg-rose-500','bg-red-700',
  'bg-slate-500','bg-gray-700',
];

const uid = () => Date.now().toString(36) + Math.random().toString(36).substring(2);
const now = () => new Date().toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function App() {
  const [view, setView] = useState('masalar');

  
  const [zones, setZones] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [sales, setSales] = useState([]);
  const [veresiye, setVeresiye] = useState([]);
  
  const [activeTableId, setActive] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [kgModal, setKgModal] = useState({ open: false, product: null, value: '' });

  // 1. Merkezi Local Senkronizasyon (Polling)
  const fetchDb = useCallback(async () => {
    try {
      const db = await apiInvoke('get_db');
      setDbError(null);
      if (db._debug) setDebugInfo(db._debug);
      
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
      setVeresiye(db.veresiye || []);
      
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

  const mutate = async (action, collection, id, data) => {
    try {
      await apiInvoke('mutate_db', { mutations: [{ action, collection, id, data }] });
      fetchDb(); // Hızlı senkronizasyon için
    } catch (e) {
      console.error(e);
    }
  };

  const activeTable = tables.find(t => t.id === activeTableId) ?? null;
  const currentOrder = orders.find(o => o.id === activeTable?.orderId) ?? null;

  // 3. Masa İşlemleri
  const handleTableClick = table => setActive(table.id);

  // 4. Sipariş İşlemleri
  const handleAddProduct = product => {
    let qtyToAdd = 1;
    if (product.unit === 'kg') {
      const p = prompt(`${product.name} için miktar giriniz (Kg/Gram):`, "1");
      if (!p) return;
      qtyToAdd = parseFloat(p.replace(',', '.'));
      if (isNaN(qtyToAdd) || qtyToAdd <= 0) return;
    }

    if (activeTable.status === 'empty') {
      const newOrderId = `order-${uid()}`;
      const items = [{ productId: product.id, name: product.name, price: product.price, qty: qtyToAdd }];
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
    if (existing && product.unit !== 'kg') existing.qty += 1;
    else if (existing && product.unit === 'kg') existing.qty += qtyToAdd;
    else items.push({ productId: product.id, name: product.name, price: product.price, qty: qtyToAdd });
    
    const total = items.reduce((s, i) => s + (i.ikram ? 0 : i.price) * i.qty, 0);
    // Optimistic
    setOrders(prev => prev.map(o => o.id === currentOrder.id ? { ...o, items, total } : o));
    mutate('update', 'orders', currentOrder.id, { items, total });
  };

  
  
  
  const handleEndOfDay = async () => {
    if (sales.length === 0) {
      alert("Bugün hiç satış yapılmamış.");
      return;
    }
    
    // Z-Raporu yazdırma işlemi CiroView içinden tetiklenecek, 
    // biz sadece veritabanını sıfırlıyoruz.
    if (!confirm("Gün sonu yapmak ve tüm satışları sıfırlamak istediğinize emin misiniz?")) return;
    
    setSales([]);
    try {
      await apiInvoke('mutate_db', { mutations: [{ action: 'set', collection: 'sales', id: null, data: [] }] });
      alert("Kasa başarıyla kapatıldı ve sıfırlandı.");
    } catch(e) {
      console.error(e);
      alert("Kasa kapatılırken hata oluştu!");
    }
  };

  const handleMarkAsSent = () => {
    if (!currentOrder) return;
    const items = currentOrder.items.map(i => ({ ...i, sentToKitchen: true }));
    setOrders(prev => prev.map(o => o.id === currentOrder.id ? { ...o, items } : o));
    mutate('update', 'orders', currentOrder.id, { items });
  };

  const handleToggleIkram = (productId) => {
    if (!currentOrder) return;
    const items = currentOrder.items.map(i => i.productId === productId ? { ...i, ikram: !i.ikram } : i);
    const total = items.reduce((s, i) => s + (i.ikram ? 0 : i.price) * i.qty, 0);
    setOrders(prev => prev.map(o => o.id === currentOrder.id ? { ...o, items, total } : o));
    mutate('update', 'orders', currentOrder.id, { items, total });
  };

  const handleUpdateQty = async (productId, newQty) => {
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
        await apiInvoke('mutate_db', { mutations });
        fetchDb();
      } catch(e) { console.error(e); }
      return;
    }

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
      tableName: `${activeTable.name} (${activeTable.zone})`,
      items: currentOrder.items,
      subtotal: currentOrder.total,
      ...paymentInfo,
      paidAt: now(),
      createdAt: Date.now()
    };
    
    setSales(prev => [...prev, { id: saleId, ...saleData }]);
    setOrders(prev => prev.map(o => o.id === currentOrder.id ? { ...o, status: 'paid' } : o));
    
    if (paymentInfo.paymentMethod === 'veresiye') {
      let targetCustomerId = paymentInfo.customerId;
      let targetCustomer = veresiye.find(x => x.id === targetCustomerId);
      
      // Yeni Müşteri ekleniyorsa
      if (paymentInfo.newCustomerName) {
        targetCustomerId = uid();
        targetCustomer = { id: targetCustomerId, name: paymentInfo.newCustomerName, phone: '', debt: 0, logs: [], createdAt: Date.now() };
        setVeresiye(prev => [...prev, targetCustomer]);
        mutate('add', 'veresiye', null, targetCustomer);
      }

      if (targetCustomer) {
        const log = { id: uid(), type: 'debt', amount: paymentInfo.finalTotal, date: now(), createdAt: Date.now(), note: saleData.tableName };
        const updated = { ...targetCustomer, debt: targetCustomer.debt + paymentInfo.finalTotal, logs: [...(targetCustomer.logs||[]), log] };
        
        setVeresiye(prev => {
           if (prev.find(x => x.id === targetCustomerId)) {
             return prev.map(x => x.id === targetCustomerId ? updated : x);
           }
           // Just in case the state hasn't flushed the newly added customer yet
           return [...prev.filter(x => x.id !== targetCustomerId), updated];
        });
        
        mutate('update', 'veresiye', targetCustomerId, updated);
      }
    }
    
    mutate('add', 'sales', null, { id: saleId, ...saleData });
    mutate('update', 'orders', currentOrder.id, { status: 'paid' });
  };

  const handlePay = paymentInfo => {
    if (!activeTable || !currentOrder) return;
    recordSale(paymentInfo);
    const newOrderId = `order-${uid()}`;
    
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

  // Veresiye
  const handleAddCustomer = c => {
    const id = uid();
    setVeresiye(prev => [...prev, { id, ...c }]);
    mutate('add', 'veresiye', null, { id, ...c });
  };
  const handleAddVeresiyeLog = (customerId, amount, type, note = '') => {
    const c = veresiye.find(x => x.id === customerId);
    if (!c) return;
    const log = { id: uid(), type, amount, date: now(), createdAt: Date.now(), note };
    const newDebt = type === 'payment' ? c.debt - amount : c.debt + amount;
    const updated = { ...c, debt: newDebt, logs: [...(c.logs||[]), log] };
    setVeresiye(prev => prev.map(x => x.id === customerId ? updated : x));
    mutate('update', 'veresiye', customerId, updated);
  };

  const handleDeleteCustomer = (customerId) => {
    setVeresiye(prev => prev.filter(x => x.id !== customerId));
    mutate('delete', 'veresiye', customerId);
  };

  // 6. Ürün Yönetimi
  const handleAddMultipleProducts = (newItems) => {
    const newCategories = [];
    newItems.forEach(item => {
      const cat = typeof item.category === 'string' ? item.category.toUpperCase() : 'DİĞER';
      item.category = cat;
      if (!categories.includes(cat) && !newCategories.includes(cat)) {
        newCategories.push(cat);
      }
    });

    if (newCategories.length > 0) {
      const updatedCategories = [...categories, ...newCategories];
      setCategories(updatedCategories);
      mutate('updateSettings', 'settings', null, { categories: updatedCategories });
    }

    const withIds = newItems.map(p => ({ id: uid(), ...p }));
    setProducts(prev => [...prev, ...withIds]);
    const mutations = withIds.map(p => ({ action: 'add', collection: 'products', id: null, data: p }));
    apiInvoke('mutate_db', { mutations }).then(fetchDb).catch(console.error);
  };

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
  const handleAddZone = (name, count = 8) => {
    if (!name || zones.includes(name.toUpperCase())) return;
    const z = name.toUpperCase();
    
    setZones(prev => [...prev, z]);
    const newTables = Array.from({ length: count }, (_, i) => ({ id: `${z}-${i+1}`, name: `Masa ${i+1}`, zone: z, status: 'empty', orderId: null }));
    setTables(prev => [...prev, ...newTables]);
    
    mutate('updateSettings', 'settings', null, { zones: [...zones, z] });
    const mutations = newTables.map(t => ({ action: 'add', collection: 'tables', id: null, data: t }));
    apiInvoke('mutate_db', { mutations }).then(fetchDb).catch(console.error);
  };
  
  const handleDeleteZone = z => {
    setZones(prev => prev.filter(x => x !== z));
    setTables(prev => prev.filter(t => t.zone !== z));
    
    apiInvoke('mutate_db', { mutations: [
      { action: 'updateSettings', collection: 'settings', id: null, data: { zones: zones.filter(x => x !== z) } },
      { action: 'deleteMany', collection: 'tables', id: null, data: { field: 'zone', value: z } }
    ] }).then(fetchDb).catch(console.error);
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
        <OrderView table={activeTable} order={currentOrder} products={products} categories={categories} customers={veresiye} onClose={() => setActive(null)} onAddProduct={handleAddProduct} onUpdateQty={handleUpdateQty} onToggleIkram={handleToggleIkram} onMarkAsSent={handleMarkAsSent} onPay={handlePay} onPayAndClose={handlePayAndClose} />
      </div>
    );
  }


  return (
    <div className="flex h-[100dvh] overflow-hidden bg-gray-100 relative">
<Sidebar view={view} setView={setView} />
      <div className="flex-1 overflow-hidden relative">
        {view === 'masalar' && <TablesView tables={tables} zones={zones} onTableClick={handleTableClick} onTableUpdate={t => mutate('update', 'tables', t.id, t)} onOrderCreate={o => { const mutations = [ { action: 'update', collection: 'tables', id: o.tableId, data: { status: 'occupied', orderId: o.id } }, { action: 'add', collection: 'orders', id: o.id, data: o } ]; apiInvoke('mutate_db', { mutations }).then(fetchDb).catch(console.error); }} onTransfer={(tableId, toZone) => mutate('update', 'tables', tableId, { zone: toZone })} />}
        {view === 'urunler' && <ProductsAdmin products={products} categories={categories} colors={COLORS} onAdd={p => mutate('add', 'products', p.id, p)} onAddMultiple={items => { const mutations = items.map(p => ({ action: 'add', collection: 'products', id: p.id || Date.now().toString(36) + Math.random().toString(36).substring(2), data: p })); apiInvoke('mutate_db', { mutations }).then(fetchDb).catch(console.error); }} onEdit={p => mutate('update', 'products', p.id, p)} onDelete={id => mutate('delete', 'products', id)} />}
        {view === 'ayarlar' && <SettingsAdmin zones={zones} categories={categories} onAddZone={handleAddZone} onDeleteZone={handleDeleteZone} onAddCategory={handleAddCategory} onDeleteCategory={handleDeleteCategory} />}
        {view === 'ciro' && <CiroView sales={sales} onEndOfDay={handleEndOfDay} />}
        {view === 'veresiye' && <VeresiyeView customers={veresiye} onAdd={c => mutate('add', 'veresiye', c.id, c)} onUpdate={c => mutate('update', 'veresiye', c.id, c)} />}
      </div>
      {!isOnline && (
        <div className="absolute bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 z-50">
          <CloudOff size={20} /> Çevrimdışı (Hata)
        </div>
      )}
    </div>
  );
}
