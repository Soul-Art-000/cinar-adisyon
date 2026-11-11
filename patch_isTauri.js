import fs from 'fs';

const files = [
  'adisyon-app/src/App.jsx',
  'adisyon-app/src/components/SettingsAdmin.jsx'
];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/import \{ invoke \} from '@tauri-apps\/api\/core';/g, "import { invoke, isTauri } from '@tauri-apps/api/core';");
  code = code.replace(/\(window\.__TAURI_INTERNALS__ !== undefined\)/g, "isTauri()");
  fs.writeFileSync(file, code);
  console.log("Patched", file);
});
