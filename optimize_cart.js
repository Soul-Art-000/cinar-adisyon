import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/components/OrderView.jsx', 'utf8');

code = code.replace(
  '<div key={item.productId} className="bg-gray-50 border border-gray-100 rounded-xl p-3">',
  '<div key={item.productId} className="bg-gray-50 border border-gray-100 rounded-xl p-2 md:p-3">'
);

code = code.replace(
  '<div className="flex justify-between items-start mb-2">',
  '<div className="flex justify-between items-start mb-1 md:mb-2">'
);

fs.writeFileSync('adisyon-app/src/components/OrderView.jsx', code);
console.log("Cart items optimized for mobile.");
