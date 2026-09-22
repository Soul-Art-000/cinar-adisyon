import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/components/SettingsAdmin.jsx', 'utf8');
code = code.replace("invoke('get_local_ip').then(setLocalIp)", "invoke('get_local_ip').then(ip => { console.log('IP is:', ip); setLocalIp(ip); })");
fs.writeFileSync('adisyon-app/src/components/SettingsAdmin.jsx', code);
