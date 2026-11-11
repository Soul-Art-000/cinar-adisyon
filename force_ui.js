import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/components/SettingsAdmin.jsx', 'utf8');
code = code.replace('{localIp && (', '{true && (');
code = code.replace('http://{localIp}:3001', 'http://{localIp || "192.168.1.107"}:3001');
fs.writeFileSync('adisyon-app/src/components/SettingsAdmin.jsx', code);
