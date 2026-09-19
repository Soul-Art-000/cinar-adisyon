import fs from 'fs';
let code = fs.readFileSync('src/components/ProductsAdmin.jsx', 'utf8');

code = code.replace(
  /className=\{\\`w-8 h-8 rounded-full transition-transform btn-press \\\$\\{c\\} \\\$\\{newColor === c \? 'ring-4 ring-primary\\/30 scale-110' : 'hover:scale-110 opacity-70'\\}\\`\}/,
  'className={`w-8 h-8 rounded-full transition-transform btn-press ${c} ${newColor === c ? \\\'ring-4 ring-primary/30 scale-110\\\' : \\\'hover:scale-110 opacity-70\\\'}`}'
);

fs.writeFileSync('src/components/ProductsAdmin.jsx', code);
