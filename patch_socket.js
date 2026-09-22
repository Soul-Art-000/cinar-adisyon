import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/App.jsx', 'utf8');

// Add socket.io import
code = code.replace(
  "import { Settings } from 'lucide-react';",
  "import { Settings } from 'lucide-react';\nimport { io } from 'socket.io-client';\n\nconst socket = io(`http://${window.location.hostname}:3001`);"
);

// Add useEffect for socket syncing
const socketSyncCode = `
  useEffect(() => {
    socket.on('sync_state', (serverState) => {
      setOrders(serverState.orders);
      setTables(serverState.tables);
    });
    return () => socket.off('sync_state');
  }, []);
`;

code = code.replace(
  "const [view, setView] = useState('masalar');",
  "const [view, setView] = useState('masalar');\n" + socketSyncCode
);

// Update adding order to emit via socket
const emitOrderCode = `
    const newOrder = {
      id: Date.now(),
      tableId,
      items: cart,
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    socket.emit('add_order', newOrder);
    setCart([]);
`;
code = code.replace(
  /const newOrder = {[\s\S]*?setOrders\(\[...orders, newOrder\]\);\n\s*setCart\(\[\]\);/,
  emitOrderCode
);

fs.writeFileSync('adisyon-app/src/App.jsx', code);
console.log("App.jsx patched for Socket.io syncing.");
