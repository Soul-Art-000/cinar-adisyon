import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/components/OrderView.jsx', 'utf8');

// Fix Cart Desktop Layout
code = code.replace(
  'className={`w-full md:w-[360px] shrink-0 bg-white flex-col border-r border-gray-200 shadow-lg z-10 ${mobileTab === \'cart\' ? \'flex h-[100dvh]\' : \'hidden md:flex\'}`}',
  'className={`w-full md:w-[360px] md:h-full shrink-0 bg-white flex-col border-r border-gray-200 shadow-lg z-10 md:flex ${mobileTab === \'cart\' ? \'flex h-[100dvh]\' : \'hidden\'}`}'
);

// Fix Products Desktop Layout
code = code.replace(
  'className={`flex-1 flex-col ${mobileTab === \'products\' ? \'flex\' : \'hidden md:flex\'}`}',
  'className={`flex-1 flex-col md:flex md:h-full ${mobileTab === \'products\' ? \'flex\' : \'hidden\'}`}'
);

// Ensure the main container wraps properly
code = code.replace(
  'className="flex flex-col md:flex-row h-[100dvh] overflow-hidden bg-gray-100 relative"',
  'className="flex flex-col md:flex-row h-[100dvh] md:h-screen overflow-hidden bg-gray-100 relative"'
);

fs.writeFileSync('adisyon-app/src/components/OrderView.jsx', code);
console.log("Desktop layout restored.");
