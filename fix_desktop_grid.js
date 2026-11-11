import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/components/OrderView.jsx', 'utf8');

code = code.replace(
  '<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4 pb-12">',
  '<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4 pb-12 md:pb-5">'
);

fs.writeFileSync('adisyon-app/src/components/OrderView.jsx', code);
console.log("Desktop grid restored.");
