import fs from 'fs';
let code = fs.readFileSync('src/App.jsx', 'utf8');

code = code.replace(
  `  const handleAddZone = name => {
    if (!name || zones.includes(name.toUpperCase())) return;
    const z = name.toUpperCase();
    
    setZones(prev => [...prev, z]);
    const newTables = Array.from({ length: 8 }, (_, i) => ({ id: \`\${z}-\${i+1}\`, name: \`Masa \${i+1}\`, zone: z, status: 'empty', orderId: null }));`,
  `  const handleAddZone = (name, count = 8) => {
    if (!name || zones.includes(name.toUpperCase())) return;
    const z = name.toUpperCase();
    
    setZones(prev => [...prev, z]);
    const newTables = Array.from({ length: count }, (_, i) => ({ id: \`\${z}-\${i+1}\`, name: \`Masa \${i+1}\`, zone: z, status: 'empty', orderId: null }));`
);

fs.writeFileSync('src/App.jsx', code);

let settings = fs.readFileSync('src/components/SettingsAdmin.jsx', 'utf8');

if (!settings.includes('newZoneCount')) {
  settings = settings.replace(
    `const [newZone, setNewZone] = useState('');`,
    `const [newZone, setNewZone] = useState('');
  const [newZoneCount, setNewZoneCount] = useState(8);`
  );

  settings = settings.replace(
    `  const handleAdd = () => {
    onAddZone(newZone);
    setNewZone('');
  };`,
    `  const handleAdd = () => {
    onAddZone(newZone, parseInt(newZoneCount) || 8);
    setNewZone('');
    setNewZoneCount(8);
  };`
  );

  settings = settings.replace(
    `            <div className="flex gap-2 mt-4">
              <input 
                type="text" 
                placeholder="Örn: BAHÇE" 
                value={newZone}
                onChange={e => setNewZone(e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
              <button 
                onClick={handleAdd}
                disabled={!newZone}
                className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold btn-press disabled:opacity-50"
              >
                EKLE
              </button>
            </div>`,
    `            <div className="flex gap-2 mt-4">
              <input 
                type="text" 
                placeholder="Örn: BAHÇE" 
                value={newZone}
                onChange={e => setNewZone(e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
              <input 
                type="number"
                min="1"
                max="50"
                placeholder="Masa Sayısı"
                value={newZoneCount}
                onChange={e => setNewZoneCount(e.target.value)}
                className="w-32 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
              <button 
                onClick={handleAdd}
                disabled={!newZone || !newZoneCount}
                className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold btn-press disabled:opacity-50"
              >
                EKLE
              </button>
            </div>`
  );

  fs.writeFileSync('src/components/SettingsAdmin.jsx', settings);
}
