import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/components/OrderView.jsx', 'utf8');

// Add shrink-0 to category buttons so they don't get squished
code = code.replace(
  'className={`relative px-6 py-4 text-sm font-bold uppercase tracking-wide btn-press transition-colors ${activeCategory === cat ? \'text-primary\' : \'text-gray-500 hover:text-gray-800\'}`}',
  'className={`shrink-0 relative px-6 py-4 text-sm font-bold uppercase tracking-wide btn-press transition-colors ${activeCategory === cat ? \'text-primary\' : \'text-gray-500 hover:text-gray-800\'}`}'
);

// Reduce gap on mobile
code = code.replace(
  '<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">',
  '<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4 pb-12">'
);

// Reduce padding in products container
code = code.replace(
  '<div className="flex-1 overflow-y-auto no-scrollbar p-5">',
  '<div className="flex-1 overflow-y-auto no-scrollbar p-3 md:p-5">'
);

// Reduce product card text sizes slightly for mobile
code = code.replace(
  '<div className="font-bold text-lg leading-tight mb-2 drop-shadow-sm line-clamp-3">{p.name}</div>',
  '<div className="font-bold text-base md:text-lg leading-tight mb-1 md:mb-2 drop-shadow-sm line-clamp-3">{p.name}</div>'
);
code = code.replace(
  '<div className="font-black text-xl drop-shadow-md">',
  '<div className="font-black text-lg md:text-xl drop-shadow-md">'
);

fs.writeFileSync('adisyon-app/src/components/OrderView.jsx', code);
console.log("OrderView mobile optimized.");
