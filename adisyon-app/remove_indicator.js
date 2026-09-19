import fs from 'fs';
let code = fs.readFileSync('src/App.jsx', 'utf8');

// Remove indicator
code = code.replace(/<div className="absolute top-4 right-6 z-50 flex items-center gap-2 bg-white[\s\S]*?<\/div>/, '');

fs.writeFileSync('src/App.jsx', code);
