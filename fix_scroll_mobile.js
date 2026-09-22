import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/components/OrderView.jsx', 'utf8');

// The main right-side wrapper
code = code.replace(
  'className={`flex-1 flex-col md:flex md:h-full ${mobileTab === \'products\' ? \'flex\' : \'hidden\'}`}',
  'className={`flex-1 min-h-0 flex-col md:flex md:h-full overflow-hidden ${mobileTab === \'products\' ? \'flex\' : \'hidden\'}`}'
);

// The Cart inner content
code = code.replace(
  '<div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">',
  '<div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-3 space-y-2">'
);

// The Products inner content
code = code.replace(
  '<div className="flex-1 overflow-y-auto no-scrollbar p-3 md:p-5 pb-24">',
  '<div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-3 md:p-5 pb-24">'
);

fs.writeFileSync('adisyon-app/src/components/OrderView.jsx', code);
console.log("Mobile scroll fixed.");
