import fs from 'fs';
let code = fs.readFileSync('src/App.jsx', 'utf8');

// We need to add lucide-react icons for the indicator
if (!code.includes('import { Cloud, CloudOff }')) {
  code = code.replace(
    'import { useState } from \'react\';',
    'import { useState } from \'react\';\nimport { Cloud, CloudOff } from \'lucide-react\';'
  );
}

// Add the indicator to the main layout
const indicator = `
      {/* Firebase Status Indicator */}
      <div className="absolute top-4 right-6 z-50 flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
        <div className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
        </div>
        <Cloud size={14} className="text-gray-500" />
        <span className="text-[10px] font-bold text-gray-600 tracking-wider">FİREBASE BAĞLI</span>
      </div>
`;

code = code.replace(
  '<Sidebar view={view} setView={setView} />',
  indicator + '\n      <Sidebar view={view} setView={setView} />'
);

fs.writeFileSync('src/App.jsx', code);
