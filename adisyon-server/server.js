const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Statik React dosyalarını sunmak (Garsonlar için)
app.use(express.static(path.join(__dirname, '../adisyon-app/dist')));

const DB_PATH = path.join(__dirname, 'database.json');

const emptyDb = () => ({
  settings: { zones: [], categories: [] },
  products: [], tables: [], orders: [], sales: [], veresiye: [], barcodes: []
});

// Kalıcı veritabanı. `barcodes`: { id, code, name, price, category, color, unit }
let db = emptyDb();
if (fs.existsSync(DB_PATH)) {
  try { db = { ...emptyDb(), ...JSON.parse(fs.readFileSync(DB_PATH, 'utf8')) }; } catch (e) { console.error('database.json okunamadı:', e.message); }
}

const save = () => {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  io.emit('sync_state', db);
};

const arr = c => (Array.isArray(db[c]) ? db[c] : (db[c] = []));
const uid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const findCode = code => (db.barcodes || []).find(b => b.code === code)
  || (db.products || []).find(p => p.barcode === code)
  || (db.products || []).find(p => p.id === code);

app.get('/api/db', (req, res) => res.json(db));

app.post('/api/mutate', (req, res) => {
  const mutations = req.body?.mutations || [];
  for (const m of mutations) {
    const { action, collection, id, data } = m;
    if (action === 'set') db[collection] = data;
    else if (action === 'add') arr(collection).push(data);
    else if (action === 'update') arr(collection).forEach(x => { if (x.id === id) Object.assign(x, data); });
    else if (action === 'delete') db[collection] = arr(collection).filter(x => x.id !== id);
    else if (action === 'deleteMany') db[collection] = arr(collection).filter(x => x[data.field] !== data.value);
    else if (action === 'updateSettings') Object.assign((db.settings ||= {}), data);
  }
  save();
  res.json({ status: 'ok' });
});

// ── Barkod ────────────────────────────────────────────────────────────
// Okutulan barkodu ürün(ler)e çevir: barcodes listesi + ürünlerin barcode alanı
app.get('/api/barcode/:code', (req, res) => {
  const code = decodeURIComponent(req.params.code).trim();
  const hit = findCode(code);
  if (!hit) return res.status(404).json({ found: false, code });
  res.json({ found: true, code, item: { ...hit, barcode: code } });
});

// Fiyat sorgulama (kantin): sadece özet
app.get('/api/price/:code', (req, res) => {
  const code = decodeURIComponent(req.params.code).trim();
  const hit = findCode(code);
  if (!hit) return res.status(404).json({ found: false, code });
  res.json({ found: true, code, name: hit.name, price: hit.price });
});

// Okutulan barkodu satışa çevir (kantin hızlı satış)
app.post('/api/sell', (req, res) => {
  const { code, qty = 1, paymentMethod = 'nakit' } = req.body || {};
  const hit = findCode(code);
  if (!hit) return res.status(404).json({ found: false, code });
  const total = Number(hit.price) * qty;
  const sale = {
    id: uid('sale-'), tableId: 'KANTIN', tableName: 'Kantin (barkod)',
    items: [{ productId: hit.id, barcode: code, name: hit.name, price: hit.price, qty }],
    subtotal: total, paymentMethod, discountType: 'amount', discountValue: 0, discountAmount: 0,
    finalTotal: total, paidAt: new Date().toLocaleString('tr-TR'), createdAt: Date.now()
  };
  arr('sales').push(sale);
  save();
  res.json({ status: 'ok', sale, name: hit.name, total });
});

// ── Socket: garson/kasa senkronu (eski davranış korunur) ──────────────
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });

io.on('connection', socket => {
  console.log('Yeni cihaz baglandi:', socket.id);
  socket.emit('sync_state', db);
  socket.on('add_order', data => { arr('orders').push(data); save(); });
  socket.on('update_table_status', data => {
    const t = arr('tables').find(x => x.id === data.tableId);
    if (t) { t.status = data.status; save(); }
  });
  socket.on('disconnect', () => console.log('Cihaz ayrildi:', socket.id));
});

const PORT = 3000;
const os = require('os');
const mdns = require('multicast-dns')();

const getLocalIp = () => {
  for (const name of Object.keys(os.networkInterfaces())) {
    for (const iface of os.networkInterfaces()[name]) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return '127.0.0.1';
};
const LOCAL_IP = getLocalIp();

mdns.on('query', query => {
  if (query.questions[0] && query.questions[0].name === 'kasa.local') {
    mdns.respond({ answers: [{ name: 'kasa.local', type: 'A', ttl: 300, data: LOCAL_IP }] });
  }
});

console.log('mDNS Aktif! Kasa URL: http://kasa.local:' + PORT);
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Yerel Adisyon Sunucusu calisiyor: http://0.0.0.0:${PORT} (db: ${DB_PATH})`);
});
