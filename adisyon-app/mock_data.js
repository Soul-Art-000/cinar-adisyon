import fs from 'fs';

const db = {
  settings: {
    zones: ["TERAS", "İÇ SALON", "BAHÇE"],
    categories: ["SICAK İÇECEKLER", "SOĞUK İÇECEKLER", "TATLI & PASTA", "ANA YEMEK", "TARTILAN ÜRÜNLER"]
  },
  tables: [
    // TERAS (8)
    ...Array.from({ length: 8 }, (_, i) => ({ id: \`TERAS-\${i+1}\`, name: \`Masa \${i+1}\`, zone: 'TERAS', status: i < 3 ? 'occupied' : 'empty', orderId: i < 3 ? \`order-teras-\${i}\` : null })),
    // İÇ SALON (10)
    ...Array.from({ length: 10 }, (_, i) => ({ id: \`SALON-\${i+1}\`, name: \`Salon \${i+1}\`, zone: 'İÇ SALON', status: i === 4 ? 'occupied' : 'empty', orderId: i === 4 ? 'order-salon-4' : null })),
    // BAHÇE (5)
    ...Array.from({ length: 5 }, (_, i) => ({ id: \`BAHCE-\${i+1}\`, name: \`Kamelya \${i+1}\`, zone: 'BAHÇE', status: 'empty', orderId: null }))
  ],
  orders: [
    {
      id: "order-teras-0",
      tableId: "TERAS-1",
      items: [{ productId: "p1", name: "Çay", price: 20, qty: 3 }, { productId: "p5", name: "Fıstıklı Baklava (Kg)", price: 850, qty: 0.5, unit: 'kg' }],
      status: "open",
      total: 485,
      createdAt: Date.now() - 3600000
    },
    {
      id: "order-teras-1",
      tableId: "TERAS-2",
      items: [{ productId: "p3", name: "Türk Kahvesi", price: 50, qty: 2 }],
      status: "open",
      total: 100,
      createdAt: Date.now() - 1800000
    },
    {
      id: "order-teras-2",
      tableId: "TERAS-3",
      items: [{ productId: "p4", name: "Karışık Izgara", price: 450, qty: 2 }, { productId: "p2", name: "Kola", price: 40, qty: 2 }],
      status: "open",
      total: 980,
      createdAt: Date.now() - 7200000
    },
    {
      id: "order-salon-4",
      tableId: "SALON-5",
      items: [{ productId: "p6", name: "Çekirdek (Kg)", price: 200, qty: 0.25, unit: 'kg' }, { productId: "p1", name: "Çay", price: 20, qty: 1 }],
      status: "open",
      total: 70,
      createdAt: Date.now() - 900000
    }
  ],
  products: [
    { id: "p1", name: "Çay", price: 20, color: "bg-red-500", category: "SICAK İÇECEKLER", unit: "adet" },
    { id: "p3", name: "Türk Kahvesi", price: 50, color: "bg-amber-800", category: "SICAK İÇECEKLER", unit: "adet" },
    { id: "p2", name: "Kola", price: 40, color: "bg-slate-800", category: "SOĞUK İÇECEKLER", unit: "adet" },
    { id: "p7", name: "Limonata", price: 50, color: "bg-yellow-400", category: "SOĞUK İÇECEKLER", unit: "adet" },
    { id: "p4", name: "Karışık Izgara", price: 450, color: "bg-orange-600", category: "ANA YEMEK", unit: "adet" },
    { id: "p8", name: "Tavuk Şiş", price: 220, color: "bg-amber-600", category: "ANA YEMEK", unit: "adet" },
    { id: "p9", name: "Sütlaç", price: 90, color: "bg-blue-300", category: "TATLI & PASTA", unit: "adet" },
    { id: "p5", name: "Fıstıklı Baklava (Kg)", price: 850, color: "bg-green-600", category: "TARTILAN ÜRÜNLER", unit: "kg" },
    { id: "p6", name: "Çekirdek (Kg)", price: 200, color: "bg-stone-500", category: "TARTILAN ÜRÜNLER", unit: "kg" },
    { id: "p10", name: "Kestane (Kg)", price: 400, color: "bg-amber-900", category: "TARTILAN ÜRÜNLER", unit: "kg" }
  ],
  sales: [],
  veresiye: [
    {
      id: "v1",
      name: "Ahmet Yılmaz (Toptancı)",
      phone: "0532 123 45 67",
      debt: 1250,
      createdAt: Date.now() - 86400000 * 5,
      logs: [
        { id: "l1", type: "debt", amount: 1500, date: "10.09.2026 14:30", createdAt: Date.now() - 86400000 * 5, note: "Başlangıç Borcu" },
        { id: "l2", type: "payment", amount: 250, date: "12.09.2026 09:15", createdAt: Date.now() - 86400000 * 3, note: "Nakit bıraktı" }
      ]
    },
    {
      id: "v2",
      name: "Mehmet Usta (Esnaf)",
      phone: "0555 987 65 43",
      debt: -100,
      createdAt: Date.now() - 86400000 * 2,
      logs: [
        { id: "l3", type: "payment", amount: 100, date: "14.09.2026 11:00", createdAt: Date.now() - 86400000 * 1, note: "Fazladan ödeme yaptı (Alacaklı)" }
      ]
    },
    {
      id: "v3",
      name: "Ayşe Teyze",
      phone: "",
      debt: 45,
      createdAt: Date.now(),
      logs: [
        { id: "l4", type: "debt", amount: 45, date: new Date().toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }), createdAt: Date.now(), note: "Çay ve Çekirdek" }
      ]
    }
  ]
};

fs.writeFileSync('database.json', JSON.stringify(db, null, 2));
