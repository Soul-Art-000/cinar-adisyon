import fs from 'fs';

const dbPath = "/Users/muhammedsalihbayrak/Library/Application Support/com.cinar.adisyon/database.json";
if (fs.existsSync(dbPath)) {
  let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  // Sadece ürünleri ve ayarları koruyalım, tüm test verilerini silelim
  db.orders = [];
  db.sales = [];
  db.veresiye = [];
  
  // Masaları boşaltalım (Eğer masa varsa siparişlerini silelim)
  db.tables = db.tables.map(t => ({ ...t, status: 'empty', orderId: null }));

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  console.log("Local test verileri temizlendi!");
}

// Aynı zamanda kaynak kodundaki varsayılan (Default) DB'yi de tamamen boş yapalım ki Windows sürümü de tertemiz açılsın.
const libPath = 'adisyon-app/src-tauri/src/lib.rs';
let lib = fs.readFileSync(libPath, 'utf8');
lib = lib.replace(
  /"settings": { "zones": \["BAHÇE", "SALON", "TERAS"\], "categories": \["YİYECEKLER", "İÇECEKLER", "TATLILAR"\] }/g,
  '"settings": { "zones": [], "categories": [] }'
);
fs.writeFileSync(libPath, lib);
console.log("Kaynak kodundaki varsayılan veriler temizlendi.");

