import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/App.jsx', 'utf8');

if (!code.includes("import { io }")) {
  code = code.replace(
    "import { Cloud, CloudOff, Server } from 'lucide-react';",
    "import { Cloud, CloudOff, Server } from 'lucide-react';\nimport { io } from 'socket.io-client';\n\nconst socket = io(`http://${window.location.hostname}:3000`);\n"
  );
  fs.writeFileSync('adisyon-app/src/App.jsx', code);
  console.log("Fixed socket ReferenceError.");
}
