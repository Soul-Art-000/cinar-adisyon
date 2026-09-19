import { LayoutGrid, Package, Settings, TrendingUp, Book } from 'lucide-react';

export default function Sidebar({ view, setView }) {
  return (
    <div className="hidden md:flex w-24 bg-gray-900 flex-col items-center py-6 gap-8 shadow-xl z-50 shrink-0">
      <div className="text-white font-bold text-xl mb-4 w-12 h-12 flex items-center justify-center rounded-xl shadow-lg overflow-hidden"><img src="/favicon.png" alt="Logo" className="w-full h-full object-cover" /></div>
      
      <button onClick={() => setView('masalar')} className={`btn-press flex flex-col items-center gap-2 w-full py-4 transition-colors ${view === 'masalar' ? 'text-white bg-white/10 border-l-4 border-primary' : 'text-gray-500 hover:text-gray-300 border-l-4 border-transparent'}`}>
        <LayoutGrid size={28} />
        <span className="text-[10px] font-bold tracking-wider">MASALAR</span>
      </button>
      
      <button onClick={() => setView('urunler')} className={`btn-press flex flex-col items-center gap-2 w-full py-4 transition-colors ${view === 'urunler' ? 'text-white bg-white/10 border-l-4 border-primary' : 'text-gray-500 hover:text-gray-300 border-l-4 border-transparent'}`}>
        <Package size={28} />
        <span className="text-[10px] font-bold tracking-wider">ÜRÜNLER</span>
      </button>
      
      <div className="mt-auto w-full flex flex-col gap-0">
        <button onClick={() => setView('veresiye')} className={`btn-press flex flex-col items-center gap-2 w-full py-4 transition-colors ${view === 'veresiye' ? 'text-white bg-white/10 border-l-4 border-primary' : 'text-gray-500 hover:text-gray-300 border-l-4 border-transparent'}`}>
          <Book size={28} />
          <span className="text-[10px] font-bold tracking-wider">VERESİYE</span>
        </button>
        <button onClick={() => setView('ciro')} className={`btn-press flex flex-col items-center gap-2 w-full py-4 transition-colors ${view === 'ciro' ? 'text-white bg-white/10 border-l-4 border-primary' : 'text-gray-500 hover:text-gray-300 border-l-4 border-transparent'}`}>
          <TrendingUp size={28} />
          <span className="text-[10px] font-bold tracking-wider">CİRO</span>
        </button>
        <button onClick={() => setView('ayarlar')} className={`btn-press flex flex-col items-center gap-2 w-full py-4 transition-colors ${view === 'ayarlar' ? 'text-white bg-white/10 border-l-4 border-primary' : 'text-gray-500 hover:text-gray-300 border-l-4 border-transparent'}`}>
          <Settings size={28} />
          <span className="text-[10px] font-bold tracking-wider">AYARLAR</span>
        </button>
      </div>
    </div>
  );
}
