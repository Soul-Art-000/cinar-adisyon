import fs from 'fs';
let code = fs.readFileSync('src/App.jsx', 'utf8');

// Instead of blocking the whole screen with an error, just show it as a banner
code = code.replace(
  'if (errorMsg) return <div className="p-8 text-red-600 bg-red-50 h-screen font-mono text-sm">{errorMsg}</div>;',
  ''
);

// Add the banner above the Sidebar in the main return
code = code.replace(
  '<Sidebar view={view} setView={setView} />',
  `{errorMsg && <div className="absolute top-0 left-0 w-full bg-red-600 text-white p-3 text-center z-[9999] font-bold shadow-lg">Firebase Hatası (Kuralları düzeltin): {errorMsg}</div>}
      <Sidebar view={view} setView={setView} />`
);

fs.writeFileSync('src/App.jsx', code);
