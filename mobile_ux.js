import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/components/OrderView.jsx', 'utf8');

// 1. Add state
code = code.replace(
  "const [activeCategory",
  "const [mobileTab, setMobileTab] = useState('products');\n  const [activeCategory"
);

// 2. Hide/Show Cart
code = code.replace(
  '<div className="w-full h-[45%] md:h-auto md:w-[360px] shrink-0 bg-white flex flex-col border-b md:border-b-0 md:border-r border-gray-200 shadow-lg z-10">',
  '<div className={`w-full md:w-[360px] shrink-0 bg-white flex-col border-r border-gray-200 shadow-lg z-10 ${mobileTab === \'cart\' ? \'flex h-[100dvh]\' : \'hidden md:flex\'}`}>'
);

// 3. Update Cart Header to add a "Menu" button on mobile
const oldHeader = `<div className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 btn-press">
              <ChevronLeft size={22} />
            </button>
            <div>
              <div className="font-bold text-lg leading-tight">{table.name}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">{table.zone}</div>
            </div>
          </div>
          
        </div>`;
const newHeader = `<div className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="hidden md:block p-1.5 rounded-lg bg-white/10 hover:bg-white/20 btn-press">
              <ChevronLeft size={22} />
            </button>
            {/* MOBİL İÇİN MENÜYE DÖN BUTONU */}
            <button onClick={() => setMobileTab('products')} className="md:hidden p-1.5 rounded-lg bg-white/10 hover:bg-white/20 btn-press">
              <ChevronLeft size={22} />
            </button>
            <div>
              <div className="font-bold text-lg leading-tight">{table.name}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">{table.zone}</div>
            </div>
          </div>
        </div>`;
code = code.replace(oldHeader, newHeader);

// 4. Hide/Show Products Grid
code = code.replace(
  '<div className="flex-1 flex flex-col">',
  '<div className={`flex-1 flex-col ${mobileTab === \'products\' ? \'flex\' : \'hidden md:flex\'}`}>'
);

// 5. Add a Floating "Sepet" Button on the Products side (visible only on mobile)
const oldProductsInner = `<div className="flex-1 overflow-y-auto no-scrollbar p-3 md:p-5">`;
const cartItemsCount = `order?.items?.reduce((acc, i) => acc + i.qty, 0) || 0`;
const newProductsInner = `
        {/* MOBİL İÇİN YÜZEN SEPET BUTONU */}
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
          <button 
            onClick={() => setMobileTab('cart')}
            className="w-full bg-gray-900 text-white shadow-2xl rounded-2xl p-4 flex items-center justify-between btn-press border border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="bg-primary text-white font-bold w-8 h-8 rounded-full flex items-center justify-center">
                {${cartItemsCount}}
              </div>
              <span className="font-bold text-lg">Adisyonu Gör</span>
            </div>
            <span className="font-black text-xl text-primary">{finalTotal} TL</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar p-3 md:p-5 pb-24">`;
code = code.replace(oldProductsInner, newProductsInner);

fs.writeFileSync('adisyon-app/src/components/OrderView.jsx', code);
console.log("Mobile UX overhauled!");
