import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/index.css', 'utf8');

code = code.replace(
  '@layer utilities {\n  .no-scrollbar::-webkit-scrollbar {\n    display: none;\n  }\n  .no-scrollbar {\n    -ms-overflow-style: none;\n    scrollbar-width: none;\n  }\n}',
  '.no-scrollbar::-webkit-scrollbar {\n  display: none;\n}\n.no-scrollbar {\n  -ms-overflow-style: none;\n  scrollbar-width: none;\n}'
);

fs.writeFileSync('adisyon-app/src/index.css', code);
console.log("no-scrollbar fixed for Tailwind v4");
