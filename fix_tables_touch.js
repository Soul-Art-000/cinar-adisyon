import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/components/TablesView.jsx', 'utf8');

code = code.replace(
  '<div className="flex-1 overflow-y-auto no-scrollbar p-6">',
  '<div className="flex-1 overflow-y-auto no-scrollbar p-6" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>'
);

fs.writeFileSync('adisyon-app/src/components/TablesView.jsx', code);
console.log("Touch events attached to Tables grid.");
