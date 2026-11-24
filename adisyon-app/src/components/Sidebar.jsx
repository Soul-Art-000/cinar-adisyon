import { Package, Settings, TrendingUp, Book, ScanBarcode, Barcode } from 'lucide-react';

// Menü sırası: KASA → VERESİYE → BARKOD → ÜRÜNLER → CİRO → AYARLAR
export const MENU = [
  { key: 'kasa', label: 'Kasa', Icon: ScanBarcode },
  { key: 'veresiye', label: 'Veresiye', Icon: Book },
  { key: 'barkod', label: 'Barkod', Icon: Barcode },
  { key: 'urunler', label: 'Ürünler', Icon: Package },
  { key: 'ciro', label: 'Ciro', Icon: TrendingUp },
  { key: 'ayarlar', label: 'Ayarlar', Icon: Settings },
];

const Item = ({ item, active, onClick }) => (
  <button onClick={onClick}
    className={`btn-press w-[72px] flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-colors ${active ? 'bg-amber-100 text-amber-900' : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'}`}>
    <item.Icon size={24} strokeWidth={active ? 2.4 : 2} />
    <span className="text-[11px] font-bold">{item.label}</span>
  </button>
);

export default function Sidebar({ view, setView }) {
  const top = MENU.slice(0, 4), bottom = MENU.slice(4);
  return (
    <div className="hidden md:flex w-24 bg-white border-r border-stone-100 flex-col items-center py-5 gap-2 z-50 shrink-0">
      <div className="w-12 h-12 mb-4"><img src="/logo.svg" alt="Çınar Adisyon" className="w-full h-full object-cover" /></div>
      {top.map(m => <Item key={m.key} item={m} active={view === m.key} onClick={() => setView(m.key)} />)}
      <div className="mt-auto flex flex-col gap-2">
        {bottom.map(m => <Item key={m.key} item={m} active={view === m.key} onClick={() => setView(m.key)} />)}
      </div>
    </div>
  );
}
