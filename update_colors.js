import fs from 'fs';

const dbPath = "/Users/muhammedsalihbayrak/Library/Application Support/com.cinar.adisyon/database.json";
let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const colorPals = {
  "ÇORBALAR": ['bg-yellow-500', 'bg-amber-500', 'bg-orange-500'],
  "IZGARALAR": ['bg-red-700', 'bg-rose-500', 'bg-pink-500', 'bg-purple-500'],
  "DÜRÜM": ['bg-green-500', 'bg-teal-500'],
  "DÖNER": ['bg-indigo-500', 'bg-slate-500'],
  "BURGER & ATIŞTIRMALIK": ['bg-blue-500', 'bg-cyan-500']
};

let counts = {};
db.products.forEach(p => {
  if (!counts[p.category]) counts[p.category] = 0;
  const pal = colorPals[p.category] || ['bg-gray-700'];
  p.color = pal[counts[p.category] % pal.length];
  counts[p.category]++;
});

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log("Colors updated.");
