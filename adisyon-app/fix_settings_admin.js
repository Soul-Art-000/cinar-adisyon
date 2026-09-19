import fs from 'fs';
let code = fs.readFileSync('src/components/SettingsAdmin.jsx', 'utf8');

code = code.replace(
  `          <div className="flex gap-2">
            <input
              value={newZone}
              onChange={e => setNewZone(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { onAddZone(newZone); setNewZone(''); } }}
              placeholder="Yeni bölge adı..."
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
              onClick={() => { onAddZone(newZone); setNewZone(''); }}
              className="btn-press bg-primary text-white px-4 py-2.5 rounded-xl shadow-sm"
            >
              <Plus size={20} />
            </button>
          </div>`,
  `          <div className="flex gap-2">
            <input
              value={newZone}
              onChange={e => setNewZone(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { onAddZone(newZone, parseInt(newZoneCount)||8); setNewZone(''); } }}
              placeholder="Yeni bölge adı..."
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <input
              type="number"
              min="1"
              max="50"
              value={newZoneCount}
              onChange={e => setNewZoneCount(e.target.value)}
              placeholder="Masa Sayısı"
              className="w-24 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 text-center"
            />
            <button
              onClick={() => { onAddZone(newZone, parseInt(newZoneCount)||8); setNewZone(''); setNewZoneCount(8); }}
              className="btn-press bg-primary text-white px-4 py-2.5 rounded-xl shadow-sm"
            >
              <Plus size={20} />
            </button>
          </div>`
);

fs.writeFileSync('src/components/SettingsAdmin.jsx', code);
