const http = require('http');
const fs = require('fs');
const path = require('path');

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
  sales: [],
  veresiye: []
};

INIT_ZONES.forEach(zone => {
  for(let i=1; i<=8; i++) {
    db.tables.push({ id: zone + '-' + i, name: 'Masa ' + i, zone, status: 'empty', orderId: null });
  }
});

if (fs.existsSync(DB_FILE)) {
  try {
    const loaded = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    db = { ...db, ...loaded };
    if (!db.veresiye) db.veresiye = [];
  } catch(e) {}
}

const saveDb = () => fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

const server = http.createServer((req, res) => {
  // Setup CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  
  // Statik Dosya Sunucusu (Ön Yüzü Sunmak İçin)
  const MIME_TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
  if (!req.url.startsWith('/api')) {
    let filePath = path.join(process.cwd(), 'dist', req.url === '/' ? 'index.html' : req.url);
    if (!fs.existsSync(filePath)) filePath = path.join(process.cwd(), 'dist', 'index.html');
    
    try {
      const ext = path.extname(filePath);
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'text/plain' });
      res.end(fs.readFileSync(filePath));
    } catch(e) {
      res.writeHead(404); res.end('Not found');
    }
    return;
  }

  if (req.url === '/api/db' && req.method === 'GET') {
    res.writeHead(200, { 
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const ip = req.socket.remoteAddress;
    console.log('[' + new Date().toISOString() + '] GET /api/db from ' + ip + ' - sending ' + db.products.length + ' products');
    
    const debugInfo = { ...db, _debug: { serverId: "pc1a9j", dbPath: DB_FILE } };
    res.end(JSON.stringify(debugInfo));


    return;
  }

  if (req.url === '/api/mutate' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        const mutations = Array.isArray(parsed) ? parsed : [parsed];
        
        mutations.forEach(m => {
          const { action, collection, id, data } = m;
          if (action === 'set') {
            db[collection] = data;
          } else if (action === 'add') {
            db[collection].push(data);
          } else if (action === 'update') {
            db[collection] = db[collection].map(item => item.id === id ? { ...item, ...data } : item);
          } else if (action === 'delete') {
            db[collection] = db[collection].filter(item => item.id !== id);
          } else if (action === 'deleteMany') {
            db[collection] = db[collection].filter(item => item[data.field] !== data.value);
          } else if (action === 'updateSettings') {
            db.settings = { ...db.settings, ...data };
          }
        });
        saveDb();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(400);
        res.end('Bad Request');
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(3001, '0.0.0.0', () => {
  console.log('Local backend running on http://0.0.0.0:3001');
});
