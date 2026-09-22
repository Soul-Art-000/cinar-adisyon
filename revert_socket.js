import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/App.jsx', 'utf8');

code = code.replace(
  "import { Cloud, CloudOff, Server } from 'lucide-react';\nimport { io } from 'socket.io-client';\n\nconst socket = io(`http://${window.location.hostname}:3000`);\n",
  "import { Cloud, CloudOff, Server } from 'lucide-react';\n"
);

const socketSyncCode = `
  useEffect(() => {
    socket.on('sync_state', (serverState) => {
      setOrders(serverState.orders);
      setTables(serverState.tables);
    });
    return () => socket.off('sync_state');
  }, []);
`;
code = code.replace(socketSyncCode, "");

fs.writeFileSync('adisyon-app/src/App.jsx', code);
console.log("Reverted Socket.io from App.jsx");
