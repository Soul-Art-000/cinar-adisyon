import fs from 'fs';

const dbPath = "/Users/muhammedsalihbayrak/Library/Application Support/com.cinar.adisyon/database.json";
let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// New Categories
const categories = ["ÇORBALAR", "IZGARALAR", "DÜRÜM", "DÖNER", "BURGER & ATIŞTIRMALIK"];
db.settings.categories = categories;

// Define the new products
const newProducts = [
  // ÇORBALAR
  { id: "c1", name: "Salı - Mercimek Çorbası", price: 100, category: "ÇORBALAR", color: "bg-orange-500", unit: "porsiyon" },
  { id: "c2", name: "Çarşamba - Kelle Paça", price: 150, category: "ÇORBALAR", color: "bg-orange-500", unit: "porsiyon" },
  { id: "c3", name: "Perşembe - Tavuk Çorbası", price: 150, category: "ÇORBALAR", color: "bg-orange-500", unit: "porsiyon" },
  { id: "c4", name: "Cuma - Mercimek Çorbası", price: 100, category: "ÇORBALAR", color: "bg-orange-500", unit: "porsiyon" },
  { id: "c5", name: "Cumartesi - Ezogelin", price: 150, category: "ÇORBALAR", color: "bg-orange-500", unit: "porsiyon" },
  { id: "c6", name: "Pazar - Kremalı Mantar", price: 150, category: "ÇORBALAR", color: "bg-orange-500", unit: "porsiyon" },

  // IZGARALAR
  { id: "i1", name: "1 Kişilik Karışık Izgara", price: 650, category: "IZGARALAR", color: "bg-red-600", unit: "porsiyon" },
  { id: "i2", name: "3 Adet Köfte", price: 150, category: "IZGARALAR", color: "bg-red-600", unit: "porsiyon" },
  { id: "i3", name: "1 Kuzu Şiş", price: 180, category: "IZGARALAR", color: "bg-red-600", unit: "adet" },
  { id: "i4", name: "1 Tavuk Şiş", price: 115, category: "IZGARALAR", color: "bg-red-600", unit: "adet" },
  { id: "i5", name: "2 Kanat", price: 80, category: "IZGARALAR", color: "bg-red-600", unit: "adet" },
  { id: "i6", name: "1 Tavuk Pirzola", price: 140, category: "IZGARALAR", color: "bg-red-600", unit: "adet" },
  
  // Resimdeki Izgaralar
  { id: "i7", name: "Köfte Porsiyon (5 Adet)", price: 300, category: "IZGARALAR", color: "bg-red-600", unit: "porsiyon" },
  { id: "i8", name: "Tavuk Şiş Porsiyon (1 şiş)", price: 230, category: "IZGARALAR", color: "bg-red-600", unit: "porsiyon" },
  { id: "i9", name: "Adana Şiş Porsiyon (1 şiş)", price: 300, category: "IZGARALAR", color: "bg-red-600", unit: "porsiyon" },
  { id: "i10", name: "Kuzu Şiş Porsiyon", price: 370, category: "IZGARALAR", color: "bg-red-600", unit: "porsiyon" },
  { id: "i11", name: "Tavuk Kanat (6 Parça)", price: 250, category: "IZGARALAR", color: "bg-red-600", unit: "porsiyon" },
  { id: "i12", name: "Tavuk Pirzola Porsiyon", price: 270, category: "IZGARALAR", color: "bg-red-600", unit: "porsiyon" },

  // DÜRÜM
  { id: "d1", name: "Köfte Ekmek/Dürüm", price: 200, category: "DÜRÜM", color: "bg-yellow-500", unit: "adet" },
  { id: "d2", name: "Tavuk Döner Ekmek/Dürüm", price: 180, category: "DÜRÜM", color: "bg-yellow-500", unit: "adet" },
  { id: "d3", name: "Hatay Usulü", price: 220, category: "DÜRÜM", color: "bg-yellow-500", unit: "adet" },
  { id: "d4", name: "Tavuk Şiş Dürüm (1 şiş)", price: 200, category: "DÜRÜM", color: "bg-yellow-500", unit: "adet" },
  { id: "d5", name: "Adana Şiş Dürüm (1 şiş)", price: 275, category: "DÜRÜM", color: "bg-yellow-500", unit: "adet" },

  // DÖNER
  { id: "do1", name: "Tavuk Döner Porsiyon", price: 220, category: "DÖNER", color: "bg-orange-600", unit: "porsiyon" },
  { id: "do2", name: "Tavuk Döner (1 KG)", price: 1400, category: "DÖNER", color: "bg-orange-600", unit: "kg" },

  // BURGER & ATIŞTIRMALIK
  { id: "b1", name: "Çınar Burger Menü", price: 350, category: "BURGER & ATIŞTIRMALIK", color: "bg-blue-500", unit: "adet" },
  { id: "b2", name: "Patates Kızartması", price: 100, category: "BURGER & ATIŞTIRMALIK", color: "bg-blue-500", unit: "porsiyon" },
  { id: "b3", name: "Soğan Halkası (5 Adet)", price: 60, category: "BURGER & ATIŞTIRMALIK", color: "bg-blue-500", unit: "porsiyon" }
];

db.products = newProducts;
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log("Menü başarıyla güncellendi.");
