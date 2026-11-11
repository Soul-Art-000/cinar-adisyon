import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/components/Sidebar.jsx', 'utf8');

code = code.replace(
  '<div className="text-white font-bold text-xl mb-4 bg-primary w-12 h-12 flex items-center justify-center rounded-xl shadow-lg">AD</div>',
  '<div className="text-white font-bold text-xl mb-4 w-12 h-12 flex items-center justify-center rounded-xl shadow-lg overflow-hidden"><img src="/favicon.png" alt="Logo" className="w-full h-full object-cover" /></div>'
);

fs.writeFileSync('adisyon-app/src/components/Sidebar.jsx', code);
console.log("Sidebar AD logo replaced with image.");
