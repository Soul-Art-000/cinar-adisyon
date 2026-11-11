import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/components/CiroView.jsx', 'utf8');
code = code.replace(/\\n/g, '\n');
fs.writeFileSync('adisyon-app/src/components/CiroView.jsx', code);
console.log("Fixed CiroView newline syntax error.");
