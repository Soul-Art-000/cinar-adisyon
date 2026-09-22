import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/components/TablesView.jsx', 'utf8');

const stateHooks = `  const [activeZone, setActiveZone] = useState('');
  const currentZone = (activeZone && zones.includes(activeZone)) ? activeZone : zones[0];

  const scrollToZone = (zone) => {
    setActiveZone(zone);
    setTimeout(() => {
      const el = document.getElementById('zone_btn_' + zone.replace(/\\s+/g, '_'));
      if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }, 50);
  };
  
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const onTouchStart = (e) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) {
      const currentIndex = zones.indexOf(currentZone);
      if (currentIndex < zones.length - 1) scrollToZone(zones[currentIndex + 1]);
    } else if (distance < -50) {
      const currentIndex = zones.indexOf(currentZone);
      if (currentIndex > 0) scrollToZone(zones[currentIndex - 1]);
    }
  };`;

code = code.replace(
  "  const [activeZone, setActiveZone] = useState('');\n  const currentZone = (activeZone && zones.includes(activeZone)) ? activeZone : zones[0];",
  stateHooks
);

// Add id and change onClick for the zone buttons
code = code.replace(
  'onClick={() => setActiveZone(zone)}',
  'id={`zone_btn_${zone.replace(/\\s+/g, \'_\')}`} onClick={() => scrollToZone(zone)}'
);

// Add touch events to the tables grid
code = code.replace(
  '<div className="flex-1 p-5 overflow-y-auto no-scrollbar">',
  '<div className="flex-1 p-5 overflow-y-auto no-scrollbar" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>'
);

fs.writeFileSync('adisyon-app/src/components/TablesView.jsx', code);
console.log("Tables swipe logic added.");
