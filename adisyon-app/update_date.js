import fs from 'fs';
let code = fs.readFileSync('src/App.jsx', 'utf8');

code = code.replace(
  "const now = () => new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });",
  "const now = () => new Date().toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });"
);

fs.writeFileSync('src/App.jsx', code);
