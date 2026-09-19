import fs from 'fs';
let code = fs.readFileSync('src/App.jsx', 'utf8');

// Add dbError state
if (!code.includes('const [dbError, setDbError]')) {
  code = code.replace('const [loading, setLoading] = useState(true);', 'const [loading, setLoading] = useState(true);\n  const [dbError, setDbError] = useState(null);');
}

// Update fetchDb
if (!code.includes('setDbError(null)')) {
  code = code.replace('const db = await res.json();', 'const db = await res.json();\n      setDbError(null);');
  code = code.replace('setLoading(false);\n    } catch (err) {', 'setLoading(false);\n    } catch (err) {\n      setDbError(err.message || "Bağlantı Hatası");');
}

// Display error in UI
const errorUI = `
  if (dbError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200 max-w-md">
          <h2 className="text-xl font-bold mb-2">Veritabanına Bağlanılamıyor</h2>
          <p className="mb-4">{dbError}</p>
          <button onClick={() => window.location.reload()} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">Tekrar Dene</button>
        </div>
      </div>
    );
  }
`;

if (!code.includes('if (dbError)')) {
  code = code.replace('if (loading) {', errorUI + '\n  if (loading) {');
}

fs.writeFileSync('src/App.jsx', code);
console.log("Error UI added");
