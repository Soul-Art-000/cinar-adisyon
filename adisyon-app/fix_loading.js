import fs from 'fs';
let code = fs.readFileSync('src/App.jsx', 'utf8');

// Remove the loading state block
code = code.replace(
  '  const [loading, setLoading] = useState(true);',
  ''
);

// Remove the setLoading(false) calls
code = code.replace(
  '        setLoading(false);\n      }, e => setFbError(e.message)));',
  '      }, e => setFbError(e.message)));'
);
code = code.replace(
  '      setLoading(false);\n    }\n    return () => unsubs.forEach(u => u());',
  '    }\n    return () => unsubs.forEach(u => u());'
);

// Remove the loading render screen
code = code.replace(
  '  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-gray-50 font-bold text-gray-400">Yükleniyor...</div>;',
  ''
);

fs.writeFileSync('src/App.jsx', code);
