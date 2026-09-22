import fs from 'fs';
let code = fs.readFileSync('adisyon-app/vite.config.js', 'utf8');

code = code.replace(
  'host: true,',
  'host: true,\n    allowedHosts: true,'
);

fs.writeFileSync('adisyon-app/vite.config.js', code);
console.log("vite.config.js updated.");
