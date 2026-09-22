import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/components/SettingsAdmin.jsx', 'utf8');
code = code.replace('192.168.1.107', '192.168.1.136');
fs.writeFileSync('adisyon-app/src/components/SettingsAdmin.jsx', code);
