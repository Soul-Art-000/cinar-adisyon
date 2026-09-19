import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

const DB_FILE = path.join(process.cwd(), 'database.json');

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

let db = {
  settings: { zones: INIT_ZONES, categories: INIT_CATEGORIES },
  tables: [],
  orders: [],
  products: INIT_PRODUCTS,
  sales: []
};

// Generate default tables if empty
INIT_ZONES.forEach(zone => {
  for(let i=1; i<=8; i++) {
    db.tables.push({ id: \`\${zone}-\${i}\`, name: \`Masa \${i}\`, zone, status: 'empty', orderId: null });
  }
});

// Load DB
if (fs.existsSync(DB_FILE)) {
  try {
    db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch(e) {
    console.error('Error reading DB', e);
  }
}

const saveDb = () => fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

app.get('/api/db', (req, res) => {
  res.json(db);
});

// Mutations can be a single mutation or array of mutations
// Mutation format: { action: 'set'|'add'|'update'|'delete', collection: 'settings'|'tables'|..., id: string, data: any }
app.post('/api/mutate', (req, res) => {
  const mutations = Array.isArray(req.body) ? req.body : [req.body];
  
  mutations.forEach(m => {
    const { action, collection, id, data } = m;
    
    if (action === 'set') {
      db[collection] = data;
    } 
    else if (action === 'add') {
      db[collection].push(data);
    } 
    else if (action === 'update') {
      db[collection] = db[collection].map(item => item.id === id ? { ...item, ...data } : item);
    } 
    else if (action === 'delete') {
      db[collection] = db[collection].filter(item => item.id !== id);
    }
    else if (action === 'deleteMany') {
      db[collection] = db[collection].filter(item => item[data.field] !== data.value);
    }
    else if (action === 'updateSettings') {
      db.settings = { ...db.settings, ...data };
    }
  });

  saveDb();
  res.json({ success: true, db });
});

app.listen(3000, '0.0.0.0', () => {
  console.log('Local Database Server running on http://0.0.0.0:3000');
});
