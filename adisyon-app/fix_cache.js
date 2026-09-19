import fs from 'fs';
let code = fs.readFileSync('server.cjs', 'utf8');

code = code.replace(
  `    res.writeHead(200, { 'Content-Type': 'application/json' });`,
  `    res.writeHead(200, { 
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });`
);
fs.writeFileSync('server.cjs', code);

let app = fs.readFileSync('src/App.jsx', 'utf8');
app = app.replace(
  `const res = await fetch('/api/db');`,
  `const res = await fetch('/api/db?t=' + Date.now());`
);
fs.writeFileSync('src/App.jsx', app);
