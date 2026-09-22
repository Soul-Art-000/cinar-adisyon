import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/components/OrderView.jsx', 'utf8');

code = code.replace(
  "const el = document.getElementById('cat_btn_' + cat);",
  "const el = document.getElementById('cat_btn_' + cat.replace(/\\s+/g, '_'));"
);

code = code.replace(
  "id={`cat_btn_${cat}`}",
  "id={`cat_btn_${cat.replace(/\\s+/g, '_')}`}"
);

fs.writeFileSync('adisyon-app/src/components/OrderView.jsx', code);
console.log("Spaces in ID fixed.");
