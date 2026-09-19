import fs from 'fs';
let code = fs.readFileSync('src/components/TablesView.jsx', 'utf8');

code = code.replace(
  `  const [activeZone, setActiveZone] = useState(zones[0]);
  const filtered = tables.filter(t => t.zone === activeZone);`,
  `  const [activeZone, setActiveZone] = useState('');
  const currentZone = (activeZone && zones.includes(activeZone)) ? activeZone : zones[0];
  const filtered = tables.filter(t => t.zone === currentZone);`
);

code = code.replace(
  `            onClick={() => setActiveZone(zone)}
            className={\`relative px-6 py-4 text-sm font-bold uppercase tracking-wide btn-press transition-colors \${activeZone === zone ? 'text-primary' : 'text-gray-500 hover:text-gray-800'}\`}
          >
            {zone}
            {activeZone === zone && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}`,
  `            onClick={() => setActiveZone(zone)}
            className={\`relative px-6 py-4 text-sm font-bold uppercase tracking-wide btn-press transition-colors \${currentZone === zone ? 'text-primary' : 'text-gray-500 hover:text-gray-800'}\`}
          >
            {zone}
            {currentZone === zone && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}`
);

fs.writeFileSync('src/components/TablesView.jsx', code);
