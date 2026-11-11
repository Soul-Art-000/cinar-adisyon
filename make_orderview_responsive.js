import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/components/OrderView.jsx', 'utf8');

code = code.replace(
  '<div className="flex h-screen overflow-hidden bg-gray-100 relative">',
  '<div className="flex flex-col md:flex-row h-screen overflow-hidden bg-gray-100 relative">'
);

code = code.replace(
  '<div className="w-[360px] shrink-0 bg-white flex flex-col border-r border-gray-200 shadow-lg z-10">',
  '<div className="w-full h-[45%] md:h-auto md:w-[360px] shrink-0 bg-white flex flex-col border-b md:border-b-0 md:border-r border-gray-200 shadow-lg z-10">'
);

fs.writeFileSync('adisyon-app/src/components/OrderView.jsx', code);
console.log("OrderView made responsive.");
