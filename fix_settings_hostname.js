import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/components/SettingsAdmin.jsx', 'utf8');

code = code.replace(
  "const [localIp, setLocalIp] = useState('');",
  "const [localIp, setLocalIp] = useState('');\n  const [hostname, setHostname] = useState('...');"
);

code = code.replace(
  "invoke('get_local_ip').then(ip => { console.log('IP is:', ip); setLocalIp(ip); }).catch(console.error);",
  "invoke('get_local_ip').then(ip => { console.log('IP is:', ip); setLocalIp(ip); }).catch(console.error);\n      invoke('get_hostname').then(setHostname).catch(console.error);"
);

fs.writeFileSync('adisyon-app/src/components/SettingsAdmin.jsx', code);
console.log("SettingsAdmin hostname fixed.");
