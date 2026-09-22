import fs from 'fs';

const files = [
  'adisyon-app/src/App.jsx',
  'adisyon-app/src/components/SettingsAdmin.jsx'
];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/window\.__TAURI__/g, '(window.__TAURI_INTERNALS__ !== undefined)');
  fs.writeFileSync(file, code);
  console.log("Patched", file);
});
