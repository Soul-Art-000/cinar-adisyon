import fs from 'fs';

const dbPath = "/Users/muhammedsalihbayrak/Library/Application Support/com.cinar.adisyon/database.json";
if (fs.existsSync(dbPath)) {
  let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  db.products = [];
  db.settings.categories = [];
  
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  console.log("Local menü temizlendi!");
}
