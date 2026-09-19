import fs from 'fs';
const code = `import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { Cloud, CloudOff } from 'lucide-react';

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

const INIT_ZONES = ['TERAS', 'BAHÇE', 'SALON', 'VIP'];
const INIT_CATEGORIES = ['YİYECEKLER', 'İÇECEKLER'];
const INIT_PRODUCTS = [
  { id: '1', name: 'Izgara Köfte', price: 250, color: 'bg-orange-500', category: 'YİYECEKLER' },
  { id: '2', name: 'Tavuk Şiş', price: 180, color: 'bg-amber-500', category: 'YİYECEKLER' },
  { id: '3', name: 'Mercimek Çorbası', price: 70, color: 'bg-yellow-500', category: 'YİYECEKLER' },
  { id: '4', name: 'Çoban Salata', price: 90, color: 'bg-green-500', category: 'YİYECEKLER' },
  { id: '5', name: 'Kola', price: 40, color: 'bg-red-700', category: 'İÇECEKLER' },
  { id: '6', name: 'Ayran', price: 30, color: 'bg-slate-500', category: 'İÇECEKLER' },
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
  const [fbError, setFbError] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. Merkezi Firebase Senkronizasyonu
  useEffect(() => {
    let isMounted = true;
    const unsubs = [];
    
    try {
      // SETTINGS (Zones & Categories)
      unsubs.push(onSnapshot(collection(db, 'settings'), (snap) => {
        setIsOnline(true); setFbError('');
        if (snap.empty) {
          // İlk kurulum
          setDoc(doc(db, 'settings', 'global'), { zones: INIT_ZONES, categories: INIT_CATEGORIES }).catch(console.error);
        } else {
          snap.forEach(d => {
            if (d.id === 'global') {
              setZones(d.data().zones || INIT_ZONES);
              setCategories(d.data().categories || INIT_CATEGORIES);
            }
          });
        }
      }, e => setFbError(e.message)));

      // TABLES
      unsubs.push(onSnapshot(collection(db, 'tables'), (snap) => {
        if (snap.empty) {
          // İlk kurulum - varsayılan masalar
          INIT_ZONES.forEach(zone => {
            for(let i=1; i<=8; i++) {
              setDoc(doc(db, 'tables', \`\${zone}-\${i}\`), { name: \`Masa \${i}\`, zone, status: 'empty', orderId: null });
            }
          });
        } else {
          const t = [];
          snap.forEach(d => t.push({ id: d.id, ...d.data() }));
          t.sort((a,b) => parseInt(a.name.split(' ')[1] || 0) - parseInt(b.name.split(' ')[1] || 0));
          setTables(t);
        }
      }, e => setFbError(e.message)));

      // ORDERS
      unsubs.push(onSnapshot(collection(db, 'orders'), (snap) => {
        const o = [];
        snap.forEach(d => o.push({ id: d.id, ...d.data() }));
        setOrders(o);
      }, e => setFbError(e.message)));

      // PRODUCTS
      unsubs.push(onSnapshot(collection(db, 'products'), (snap) => {
        if (snap.empty) {
          INIT_PRODUCTS.forEach(p => setDoc(doc(db, 'products', p.id), p));
        } else {
          const p = [];
          snap.forEach(d => p.push({ id: d.id, ...d.data() }));
          setProducts(p);
        }
      }, e => setFbError(e.message)));

      // SALES (Ciro)
      unsubs.push(onSnapshot(collection(db, 'sales'), (snap) => {
        const s = [];
        snap.forEach(d => s.push({ id: d.id, ...d.data() }));
        s.sort((a,b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
        setSales(s);
        setLoading(false);
      }, e => setFbError(e.message)));

    } catch (e) {
      setFbError(e.message);
      setLoading(false);
    }
    return () => unsubs.forEach(u => u());
  }, []);

  // 2. Aktif Masa ve Sipariş Hesaplamaları
  const activeTable = tables.find(t => t.id === activeTableId) ?? null;
  const currentOrder = orders.find(o => o.id === activeTable?.orderId) ?? null;

  // 3. Masa İşlemleri
  const handleTableClick = table => {
    if (table.status === 'empty') {
      const newOrderId = \`order-\${uid()}\`;
      setDoc(doc(db, 'orders', newOrderId), { tableId: table.id, items: [], status: 'open', total: 0, createdAt: serverTimestamp() });
      updateDoc(doc(db, 'tables', table.id), { status: 'occupied', orderId: newOrderId });
    }
    setActive(table.id);
  };

  // 4. Sipariş İşlemleri
  const handleAddProduct = product => {
    if (!currentOrder) return;
    const items = currentOrder.items.map(i => ({ ...i }));
    const existing = items.find(i => i.productId === product.id);
    if (existing) existing.qty += 1;
    else items.push({ productId: product.id, name: product.name, price: product.price, qty: 1 });
    
    updateDoc(doc(db, 'orders', currentOrder.id), { 
      items, 
      total: items.reduce((s, i) => s + i.price * i.qty, 0) 
    });
  };

  const handleUpdateQty = (productId, newQty) => {
    if (!currentOrder) return;
    const items = currentOrder.items
      .map(i => i.productId === productId ? { ...i, qty: newQty } : i)
      .filter(i => i.qty > 0);
    
    updateDoc(doc(db, 'orders', currentOrder.id), { 
      items, 
      total: items.reduce((s, i) => s + i.price * i.qty, 0) 
    });
  };

  // 5. Ödeme İşlemleri
  const recordSale = (paymentInfo) => {
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
  };

  const handlePay = paymentInfo => {
    if (!activeTable || !currentOrder) return;
    recordSale(paymentInfo);
    const newOrderId = \`order-\${uid()}\`;
    setDoc(doc(db, 'orders', newOrderId), { tableId: activeTable.id, items: [], status: 'open', total: 0, createdAt: serverTimestamp() });
    updateDoc(doc(db, 'tables', activeTable.id), { orderId: newOrderId });
  };

  const handlePayAndClose = paymentInfo => {
    if (!activeTable) return;
    recordSale(paymentInfo);
    updateDoc(doc(db, 'tables', activeTable.id), { status: 'empty', orderId: null });
    setActive(null);
  };

  // 6. Ürün Yönetimi
  const handleAddProductItem = p => setDoc(doc(db, 'products', uid()), p);
  const handleEditProduct = p => updateDoc(doc(db, 'products', p.id), p);
  const handleDeleteProduct = id => deleteDoc(doc(db, 'products', id));

  // 7. Ayarlar (Zone & Category)
  const handleAddZone = name => {
    if (!name || zones.includes(name.toUpperCase())) return;
    const z = name.toUpperCase();
    updateDoc(doc(db, 'settings', 'global'), { zones: [...zones, z] });
    // Yeni bölge için 8 masa oluştur
    for(let i=1; i<=8; i++) {
      setDoc(doc(db, 'tables', \`\${z}-\${i}\`), { name: \`Masa \${i}\`, zone: z, status: 'empty', orderId: null });
    }
  };
  
  const handleDeleteZone = async z => {
    updateDoc(doc(db, 'settings', 'global'), { zones: zones.filter(x => x !== z) });
    // Bu bölgedeki masaları sil
    const q = query(collection(db, 'tables'), where('zone', '==', z));
    const snapshot = await getDocs(q);
    snapshot.forEach(docSnap => deleteDoc(doc(db, 'tables', docSnap.id)));
  };
  
  const handleAddCategory = name => { 
    if (name && !categories.includes(name.toUpperCase())) {
      updateDoc(doc(db, 'settings', 'global'), { categories: [...categories, name.toUpperCase()] });
    }
  };
  
  const handleDeleteCategory = async cat => { 
    updateDoc(doc(db, 'settings', 'global'), { categories: categories.filter(c => c !== cat) });
    // Bu kategorideki ürünleri sil
    const q = query(collection(db, 'products'), where('category', '==', cat));
    const snapshot = await getDocs(q);
    snapshot.forEach(docSnap => deleteDoc(doc(db, 'products', docSnap.id)));
  };

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-gray-50 font-bold text-gray-400">Yükleniyor...</div>;

  // ── Render ───────────────────────────────────────────────────────────
  if (activeTable) {
    return (
      <div className="relative">
        <OrderView table={activeTable} order={currentOrder} products={products} categories={categories} onClose={() => setActive(null)} onAddProduct={handleAddProduct} onUpdateQty={handleUpdateQty} onPay={handlePay} onPayAndClose={handlePayAndClose} />
        {fbError && <div className="absolute bottom-4 left-4 z-50 bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg">Firebase Hatası: {fbError}</div>}
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 relative">
      <div className="absolute top-4 right-6 z-50 flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
        <div className="relative flex h-2.5 w-2.5">
          <span className={\`absolute inline-flex h-full w-full rounded-full opacity-75 \${fbError ? 'bg-red-400 animate-pulse' : 'bg-green-400 animate-ping'}\`}></span>
          <span className={\`relative inline-flex rounded-full h-2.5 w-2.5 \${fbError ? 'bg-red-500' : 'bg-green-500'}\`}></span>
        </div>
        {fbError ? <CloudOff size={14} className="text-red-500" /> : <Cloud size={14} className="text-gray-500" />}
        <span className={\`text-[10px] font-bold tracking-wider \${fbError ? 'text-red-500' : 'text-gray-600'}\`}>
          {fbError ? 'FİREBASE HATA' : 'FİREBASE BAĞLI'}
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
