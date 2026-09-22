import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/components/OrderView.jsx', 'utf8');

code = code.replace('🍳 MUTFAĞA GÖNDER', 'MUTFAĞA GÖNDER');
code = code.replace('🖨️ YAZDIR (Hesap Fişi)', 'YAZDIR');

fs.writeFileSync('adisyon-app/src/components/OrderView.jsx', code);
console.log("Buttons cleaned.");
