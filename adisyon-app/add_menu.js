const products = [
  { action: 'add', collection: 'products', id: null, data: { id: 'p-1k', name: '1 Kişilik Karışık Izgara', price: 650, category: 'IZGARALAR', color: 'bg-red-600', unit: 'adet' } },
  { action: 'add', collection: 'products', id: null, data: { id: 'p-adp', name: 'Adana Porsiyon', price: 380, category: 'IZGARALAR', color: 'bg-orange-600', unit: 'adet' } },
  { action: 'add', collection: 'products', id: null, data: { id: 'p-kuzup', name: 'Kuzu Pirzola', price: 550, category: 'IZGARALAR', color: 'bg-red-700', unit: 'adet' } },
  { action: 'add', collection: 'products', id: null, data: { id: 'p-kuzus', name: 'Kuzu Şiş', price: 420, category: 'IZGARALAR', color: 'bg-red-500', unit: 'adet' } },
  { action: 'add', collection: 'products', id: null, data: { id: 'p-koftep', name: 'Köfte Porsiyon', price: 320, category: 'IZGARALAR', color: 'bg-orange-500', unit: 'adet' } },
  { action: 'add', collection: 'products', id: null, data: { id: 'p-tavukp', name: 'Tavuk Pirzola', price: 280, category: 'IZGARALAR', color: 'bg-amber-600', unit: 'adet' } },
  { action: 'add', collection: 'products', id: null, data: { id: 'p-tavuks', name: 'Tavuk Şiş', price: 260, category: 'IZGARALAR', color: 'bg-amber-500', unit: 'adet' } },
  { action: 'add', collection: 'products', id: null, data: { id: 'p-tavukk', name: 'Tavuk Kanat', price: 270, category: 'IZGARALAR', color: 'bg-amber-700', unit: 'adet' } },

  { action: 'add', collection: 'products', id: null, data: { id: 'p-tavukb', name: 'Tavuklu Bowl', price: 250, category: 'BOWL', color: 'bg-lime-600', unit: 'adet' } },
  { action: 'add', collection: 'products', id: null, data: { id: 'p-falafelb', name: 'Falafel Bowl', price: 220, category: 'BOWL', color: 'bg-green-600', unit: 'adet' } },

  { action: 'add', collection: 'products', id: null, data: { id: 'p-hatayd', name: 'Hatay Usulü Tavuk Döner', price: 160, category: 'DÜRÜMLER & EKMEK ARASI', color: 'bg-yellow-600', unit: 'adet' } },
  { action: 'add', collection: 'products', id: null, data: { id: 'p-adanad', name: 'Adana Dürüm', price: 200, category: 'DÜRÜMLER & EKMEK ARASI', color: 'bg-orange-600', unit: 'adet' } },
  { action: 'add', collection: 'products', id: null, data: { id: 'p-koftee', name: 'Köfte Ekmek', price: 180, category: 'DÜRÜMLER & EKMEK ARASI', color: 'bg-yellow-700', unit: 'adet' } },

  { action: 'add', collection: 'products', id: null, data: { id: 'p-burgerm', name: 'Burger Menü', price: 300, category: 'BURGER', color: 'bg-stone-600', unit: 'adet' } },

  { action: 'add', collection: 'products', id: null, data: { id: 'p-cigkofted', name: 'Çiğ Köfte Dürüm', price: 80, category: 'APERATİFLER', color: 'bg-red-800', unit: 'adet' } },
  { action: 'add', collection: 'products', id: null, data: { id: 'p-cigkoftep', name: 'Çiğ Köfte Porsiyon', price: 120, category: 'APERATİFLER', color: 'bg-red-900', unit: 'adet' } },

  { action: 'add', collection: 'products', id: null, data: { id: 'p-baklava', name: 'Baklava', price: 150, category: 'TATLILAR', color: 'bg-emerald-500', unit: 'adet' } },
  { action: 'add', collection: 'products', id: null, data: { id: 'p-magnolya', name: 'Magnolya', price: 120, category: 'TATLILAR', color: 'bg-pink-500', unit: 'adet' } },
  { action: 'add', collection: 'products', id: null, data: { id: 'p-sutlac', name: 'Fırın Sütlaç', price: 90, category: 'TATLILAR', color: 'bg-blue-300', unit: 'adet' } },

  { action: 'add', collection: 'products', id: null, data: { id: 'p-osmanli', name: 'Osmanlı Şerbeti', price: 60, category: 'İÇECEKLER', color: 'bg-fuchsia-700', unit: 'adet' } },
  { action: 'add', collection: 'products', id: null, data: { id: 'p-ayran', name: 'Yayık Ayran', price: 40, category: 'İÇECEKLER', color: 'bg-slate-300', unit: 'adet' } },
  { action: 'add', collection: 'products', id: null, data: { id: 'p-gazoz', name: 'Gazoz (Niğde/Zafer)', price: 40, category: 'İÇECEKLER', color: 'bg-cyan-300', unit: 'adet' } },
  { action: 'add', collection: 'products', id: null, data: { id: 'p-kola', name: 'Kola / Fanta', price: 50, category: 'İÇECEKLER', color: 'bg-stone-800', unit: 'adet' } },
  { action: 'add', collection: 'products', id: null, data: { id: 'p-su', name: 'Su', price: 15, category: 'İÇECEKLER', color: 'bg-blue-200', unit: 'adet' } },
  { action: 'add', collection: 'products', id: null, data: { id: 'p-cay', name: 'Çay', price: 20, category: 'İÇECEKLER', color: 'bg-red-600', unit: 'adet' } },
];

const categories = [
  "IZGARALAR", "BOWL", "DÜRÜMLER & EKMEK ARASI", "BURGER", "APERATİFLER", "TATLILAR", "İÇECEKLER"
];

// Combine mutations
const allMutations = [
  ...products
];

fetch('http://127.0.0.1:3001/api/mutate', {
  method: 'POST',
  body: JSON.stringify(allMutations)
}).then(r => r.json()).then(res => {
  console.log("Products added", res);
  
  // Now add categories to settings
  fetch('http://127.0.0.1:3001/api/db').then(r => r.json()).then(db => {
    let currentCats = db.settings?.categories || [];
    let updatedCats = [...new Set([...currentCats, ...categories])];
    
    // Check if BAHÇE exists
    let currentZones = db.settings?.zones || [];
    let newZones = [...currentZones];
    let newMutations = [];
    
    if (!newZones.includes("BAHÇE")) {
      newZones.push("BAHÇE");
      
      // Add tables for BAHÇE
      for (let i = 1; i <= 10; i++) {
        newMutations.push({
          action: 'add',
          collection: 'tables',
          id: null,
          data: { id: `BAHÇE-${i}`, name: `Masa ${i}`, zone: 'BAHÇE', status: 'empty', orderId: null }
        });
      }
    }
    
    newMutations.push({
      action: 'updateSettings',
      collection: 'settings',
      id: null,
      data: { categories: updatedCats, zones: newZones }
    });
    
    fetch('http://127.0.0.1:3001/api/mutate', {
      method: 'POST',
      body: JSON.stringify(newMutations)
    }).then(r => r.json()).then(finalRes => {
      console.log("Settings and Zone updated", finalRes);
    });
  });
}).catch(console.error);
