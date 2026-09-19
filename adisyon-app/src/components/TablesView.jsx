import { useState } from 'react';

export default function TablesView({ tables, zones, onTableClick }) {
  const [activeZone, setActiveZone] = useState('');
  const currentZone = (activeZone && zones.includes(activeZone)) ? activeZone : zones[0];

  const scrollToZone = (zone) => {
    setActiveZone(zone);
    setTimeout(() => {
      const el = document.getElementById('zone_btn_' + zone.replace(/\s+/g, '_'));
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
  };
  const filtered = tables.filter(t => t.zone === currentZone);

  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
      <div className="bg-white border-b border-gray-200 shrink-0 px-4 flex gap-1 overflow-x-auto no-scrollbar whitespace-nowrap">
        {zones.map(zone => (
          <button
            key={zone}
            id={`zone_btn_${zone.replace(/\s+/g, '_')}`} onClick={() => scrollToZone(zone)}
            className={`relative px-6 py-4 text-sm font-bold uppercase tracking-wide btn-press transition-colors ${currentZone === zone ? 'text-primary' : 'text-gray-500 hover:text-gray-800'}`}
          >
            {zone}
            {currentZone === zone && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
          {filtered.map((table, i) => (
            <button
              key={table.id}
              onClick={() => onTableClick(table)}
              className="card-interactive bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col justify-between h-28 text-left hover:border-primary/30 transition-all"
              style={{ animationDelay: `${i * 20}ms` }}
            >
              <div className="flex justify-between items-start">
                <span className="font-bold text-xl text-gray-800">{table.name}</span>
                <div className={`w-2.5 h-2.5 rounded-full mt-1 ${table.status === 'occupied' ? 'bg-red-500' : 'bg-teal-400'}`} />
              </div>
              <div>
                {table.status === 'occupied'
                  ? <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md">DOLU</span>
                  : <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-md">BOŞ</span>
                }
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
