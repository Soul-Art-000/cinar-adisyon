import fs from 'fs';
let code = fs.readFileSync('src/components/OrderView.jsx', 'utf8');

code = code.replace(
  /\{\/\* Firebase Status Indicator \*\/\}[\s\S]*?FİREBASE BAĞLI<\/span>\s*<\/div>/g,
  ''
);

fs.writeFileSync('src/components/OrderView.jsx', code);
