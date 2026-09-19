import fs from 'fs';
let code = fs.readFileSync('server.cjs', 'utf8');

if (!code.includes('veresiye: []')) {
  code = code.replace(
    'sales: []',
    'sales: [],\n  veresiye: []'
  );
  fs.writeFileSync('server.cjs', code);
}
