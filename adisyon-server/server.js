const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// Statik React dosyalarını sunmak (Garsonlar için)
app.use(express.static(path.join(__dirname, '../adisyon-app/dist')));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Geçici hafıza (Veritabanı yerine)
let state = {
  orders: [],
  tables: [
    { id: '1', zone: 'salon', name: 'Masa 1', status: 'empty' },
    { id: '2', zone: 'salon', name: 'Masa 2', status: 'empty' },
    { id: '3', zone: 'bahce', name: 'Bahçe 1', status: 'empty' },
  ]
};

io.on('connection', (socket) => {
  console.log('Yeni cihaz baglandi:', socket.id);
  
  // İlk bağlanan cihaza güncel durumu gönder
  socket.emit('sync_state', state);

  socket.on('add_order', (data) => {
    state.orders.push(data);
    io.emit('sync_state', state); // Kasa dahil herkese güncel durumu gönder
  });

  socket.on('update_table_status', (data) => {
    const table = state.tables.find(t => t.id === data.tableId);
    if (table) {
      table.status = data.status;
      io.emit('sync_state', state);
    }
  });

  socket.on('disconnect', () => {
    console.log('Cihaz ayrildi:', socket.id);
  });
});

const PORT = 3000;
// 0.0.0.0 ile tüm yerel ağa yayını açıyoruz

const os = require('os');
const mdns = require('multicast-dns')();

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

const LOCAL_IP = getLocalIp();

mdns.on('query', function(query) {
  if (query.questions[0] && query.questions[0].name === 'kasa.local') {
    mdns.respond({
      answers: [{
        name: 'kasa.local',
        type: 'A',
        ttl: 300,
        data: LOCAL_IP
      }]
    });
  }
});

console.log('mDNS Aktif! Kasa URL: http://kasa.local:' + PORT);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Yerel Adisyon Sunucusu calisiyor: http://0.0.0.0:${PORT}`);
});
