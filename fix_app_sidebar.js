import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/App.jsx', 'utf8');

code = code.replace(
  '{window.__TAURI__ && <Sidebar view={view} setView={setView} />}',
  '<Sidebar view={view} setView={setView} />'
);

fs.writeFileSync('adisyon-app/src/App.jsx', code);
console.log("App.jsx Sidebar restored.");
