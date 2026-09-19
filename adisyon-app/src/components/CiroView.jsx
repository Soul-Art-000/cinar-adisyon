import { TrendingUp, Banknote, CreditCard, ShoppingBag } from 'lucide-react';

import { invoke } from "@tauri-apps/api/core";
export default function CiroView({ sales, onEndOfDay }) {
  const nakitTotal = sales.filter(s => s.paymentMethod === 'nakit').reduce((a, s) => a + s.finalTotal, 0);
  const kartTotal  = sales.filter(s => s.paymentMethod === 'kart').reduce((a, s) => a + s.finalTotal, 0);
  const veresiyeTotal = sales.filter(s => s.paymentMethod === 'veresiye').reduce((a, s) => a + s.finalTotal, 0);
  const grandTotal = nakitTotal + kartTotal + veresiyeTotal;

  // Ürün satışlarını topla
  const productMap = {};
  sales.forEach(sale => {
    sale.items.forEach(item => {
      if (!productMap[item.name]) productMap[item.name] = { name: item.name, qty: 0, revenue: 0 };
      productMap[item.name].qty     += item.qty;
      productMap[item.name].revenue += item.price * item.qty;
    });
  });
  const productList = Object.values(productMap).sort((a, b) => b.qty - a.qty);

  
  const handlePrintZReport = () => {
    const printerName = localStorage.getItem('adisyon_printer');
    if (!printerName) {
      onEndOfDay();
      return;
    }
    
    let receiptText = `*** GUN SONU (Z-RAPORU) ***

`;
    receiptText += `TARIH: ${new Date().toLocaleString('tr-TR')}
`;
    receiptText += `--------------------------------
`;
    receiptText += `TOPLAM SATIS:             ${sales.length}
`;
    receiptText += `NAKIT KASA:               ${nakitTotal} TL
`;
    receiptText += `KREDI KARTI:              ${kartTotal} TL
`;
    receiptText += `VERESIYE (ACIK):          ${veresiyeTotal} TL
`;
    receiptText += `--------------------------------
`;
    receiptText += `GENEL TOPLAM Ciro:        ${grandTotal} TL


`;
    
    invoke('print_receipt', { printerName, receiptText })
      .then(() => onEndOfDay())
      .catch(e => {
        console.error(e);
        alert("Yazdirma hatasi: " + e);
        onEndOfDay();
      });
  };

  return (
    <div className="h-full overflow-y-auto no-scrollbar p-6 bg-gray-50">

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <TrendingUp size={26} className="text-primary" /> Ciro Raporu
        </h1>
        <button onClick={handlePrintZReport} className="btn-press bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm">
          Gün Sonu Yap (Kasa Kapat)
        </button>
      </div>


      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Toplam Ciro</div>
          <div className="text-3xl font-bold text-primary">{grandTotal.toLocaleString('tr-TR')} TL</div>
          <div className="text-xs text-gray-500 mt-1">{sales.length} işlem</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
            <Banknote size={14} className="text-green-500" /> Nakit
          </div>
          <div className="text-3xl font-bold text-green-600">{nakitTotal.toLocaleString('tr-TR')} TL</div>
          <div className="text-xs text-gray-500 mt-1">{sales.filter(s => s.paymentMethod === 'nakit').length} işlem</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-blue-100">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
            <CreditCard size={14} className="text-blue-500" /> Kart
          </div>
          <div className="text-3xl font-bold text-blue-600">{kartTotal.toLocaleString('tr-TR')} TL</div>
          <div className="text-xs text-gray-500 mt-1">{sales.filter(s => s.paymentMethod === 'kart').length} işlem</div>
        </div>
      </div>

      {/* Ürün Satışları */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
          <ShoppingBag size={18} className="text-gray-500" />
          <h2 className="font-bold text-gray-700">Ürün Bazında Satışlar</h2>
          <span className="text-xs text-gray-400 ml-auto">Çoktan aza</span>
        </div>

        {productList.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ShoppingBag size={40} className="opacity-20 mx-auto mb-3" />
            <p className="font-medium">Henüz satış yok.</p>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="grid grid-cols-12 px-5 py-2 text-xs font-bold text-gray-400 uppercase tracking-wide bg-gray-50 border-b border-gray-100">
              <div className="col-span-1">#</div>
              <div className="col-span-6">Ürün</div>
              <div className="col-span-2 text-center">Adet</div>
              <div className="col-span-3 text-right">Hasılat</div>
            </div>
            {productList.map((p, i) => (
              <div key={p.name} className={`grid grid-cols-12 px-5 py-3.5 items-center border-b border-gray-50 hover:bg-gray-50 transition-colors ${i === 0 ? 'bg-amber-50' : ''}`}>
                <div className="col-span-1 text-sm font-bold text-gray-400">{i + 1}</div>
                <div className="col-span-6 font-semibold text-gray-800 text-sm">{p.name}</div>
                <div className="col-span-2 text-center">
                  <span className="bg-gray-100 text-gray-700 font-bold text-sm px-2.5 py-1 rounded-lg">{p.qty}</span>
                </div>
                <div className="col-span-3 text-right font-bold text-gray-700 text-sm">{p.revenue.toLocaleString('tr-TR')} TL</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Son İşlemler */}
      {sales.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-700">Son İşlemler</h2>
          </div>
          <div>
            {[...sales].reverse().slice(0, 20).map(sale => (
              <div key={sale.id} className="flex items-center justify-between px-5 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <div>
                  <div className="font-semibold text-gray-800 text-sm">{sale.tableName}</div>
                  <div className="text-xs text-gray-400">{sale.paidAt}</div>
                </div>
                <div className="flex items-center gap-3">
                  {sale.discountAmount > 0 && (
                    <span className="text-xs bg-orange-100 text-orange-600 font-bold px-2 py-0.5 rounded-md">
                      -{sale.discountAmount} TL indirim
                    </span>
                  )}
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${sale.paymentMethod === 'nakit' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {sale.paymentMethod === 'nakit' ? 'NAKİT' : 'KART'}
                  </span>
                  <span className="font-bold text-gray-800">{sale.finalTotal} TL</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
