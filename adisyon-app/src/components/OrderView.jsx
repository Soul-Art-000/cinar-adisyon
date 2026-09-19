import { invoke } from '@tauri-apps/api/core';
import { useState } from 'react';
import { Cloud, ChevronLeft, Printer, Plus, Minus, X, Package, Percent, Banknote, CreditCard, Book } from 'lucide-react';

import { Gift } from "lucide-react";
export default function OrderView({ table, order, products, categories, customers = [], onClose, onAddProduct, onUpdateQty, onToggleIkram, onMarkAsSent, onPay, onPayAndClose }) {
  const [mobileTab, setMobileTab] = useState('products');
  const [activeCategory, setActiveCategory] = useState(categories[0] ?? '');
  
  // SWIPE LOGIC
  const scrollToCat = (cat) => {
    setActiveCategory(cat);
    setTimeout(() => {
      const el = document.getElementById('cat_btn_' + cat.replace(/\s+/g, '_'));
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
      const currentIndex = categories.indexOf(activeCategory);
      if (currentIndex < categories.length - 1) scrollToCat(categories[currentIndex + 1]);
    } else if (distance < -50) {
      const currentIndex = categories.indexOf(activeCategory);
      if (currentIndex > 0) scrollToCat(categories[currentIndex - 1]);
    }
  };

  const [discountType, setDiscountType] = useState('percent'); // 'percent' | 'amount'
  const [discountValue, setDiscountValue] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('nakit'); // 'nakit' | 'kart' | 'veresiye'
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');

  const subtotal = order?.total ?? 0;
  const discountNum = parseFloat(discountValue) || 0;
  const discountAmount = discountType === 'percent'
    ? Math.round(subtotal * discountNum / 100)
    : Math.min(discountNum, subtotal);
  const finalTotal = subtotal - discountAmount;

  const filteredProducts = products.filter(p => p.category === activeCategory);

  const hasItems = order && order.items.length > 0;

  
  
  
  const printReceipt = (type = 'customer') => {
    const printerName = localStorage.getItem('adisyon_printer');
    if (!printerName) return alert("Ayarlardan yazici secilmemis!");

    let receiptText = ``;
    
    if (type === 'kitchen') {
      const unsentItems = order.items.filter(i => !i.sentToKitchen);
      if (unsentItems.length === 0) {
        return alert("Mutfaga gonderilecek yeni urun yok!");
      }
      
      receiptText += `*** MUTFAK SIPARISI ***\n\n`;
      receiptText += `MASA: ${table.name}\n`;
      receiptText += `TARIH: ${new Date().toLocaleString('tr-TR')}\n`;
      receiptText += `--------------------------------\n`;
      
      unsentItems.forEach(item => {
        const p = products.find(x => x.id === item.productId);
        if (p) {
          receiptText += `${item.qty}x ${p.name} ${item.ikram ? '(IKRAM)' : ''}\n`;
        }
      });
      receiptText += `--------------------------------\n\n\n`;
      
      // Print and mark as sent
      (window.__TAURI__ ? invoke('print_receipt', { printerName, receiptText }) : fetch('/api/print', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ printerName, receiptText }) }))
        .then(() => onMarkAsSent())
        .catch(console.error);
        
    } else {
      receiptText += `CINAR\n\n`;
      receiptText += `MASA: ${table.name}\n`;
      receiptText += `TARIH: ${new Date().toLocaleString('tr-TR')}\n`;
      receiptText += `--------------------------------\n`;
      
      order.items.forEach(item => {
        const p = products.find(x => x.id === item.productId);
        if (p) {
          receiptText += `${item.qty}x ${p.name} ${item.ikram ? '(IKRAM)' : ''}\n`;
        }
      });

      receiptText += `--------------------------------\n\n\n`;
      
      if (window.__TAURI__) {
        invoke('print_receipt', { printerName, receiptText }).catch(console.error);
      } else {
        fetch('/api/print', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ printerName, receiptText }) }).catch(console.error);
      }
    }
  };

  const handlePay = () => {
    onPay({ paymentMethod, customerId: selectedCustomerId, newCustomerName, discountType, discountValue: discountNum, discountAmount, finalTotal });
    setDiscountValue('');
  };

  const handlePayAndClose = () => {
    printReceipt('customer');
    onPayAndClose({ paymentMethod, customerId: selectedCustomerId, newCustomerName, discountType, discountValue: discountNum, discountAmount, finalTotal });
    setDiscountValue('');
  };

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] md:h-screen overflow-hidden bg-gray-100 relative">

      


      {/* SOL: ADİSYON */}
      <div className={`w-full md:w-[360px] md:h-full shrink-0 bg-white flex-col border-r border-gray-200 shadow-lg z-10 md:flex ${mobileTab === 'cart' ? 'flex h-[100dvh]' : 'hidden'}`}>

        {/* Header */}
        <div className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between shrink-0">
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
        </div>

        {/* Sipariş Listesi */}
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-3 space-y-2">
          {!hasItems ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Package size={48} className="opacity-20 mb-3" />
              <p className="font-medium text-sm">Sipariş boş</p>
              <p className="text-xs mt-1">Sağdan ürün seçin</p>
            </div>
          ) : (
            order.items.map(item => (
              <div key={item.productId} className="bg-gray-50 border border-gray-100 rounded-xl p-2 md:p-3">
                <div className="flex justify-between items-start mb-1 md:mb-2">
                  <span className="font-semibold text-gray-800 text-sm leading-tight">{item.name}</span>
                  <span className="font-bold text-gray-700 text-sm ml-2 shrink-0">{item.price * item.qty} TL</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{item.price} TL × adet</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => onUpdateQty(item.productId, item.qty - 1)} className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center btn-press">
                      <Minus size={14} />
                    </button>
                    <span className="w-7 text-center font-bold text-primary text-sm">{item.qty}</span>
                    <button onClick={() => onUpdateQty(item.productId, item.qty + 1)} className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center btn-press">
                      <Plus size={14} />
                    </button>
                    <button onClick={() => onToggleIkram(item.productId)} className={`w-7 h-7 rounded-lg flex items-center justify-center btn-press ml-1 ${item.ikram ? 'bg-primary text-white border-primary' : 'bg-gray-100 text-gray-500 border border-gray-200'}`} title="İkram">
                      <Gift size={14} />
                    </button>
                    <button onClick={() => onUpdateQty(item.productId, 0)} className="w-7 h-7 rounded-lg bg-red-50 text-red-500 border border-red-100 flex items-center justify-center btn-press ml-1">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Ödeme Paneli */}
        <div className="border-t border-gray-200 bg-white shrink-0">

          {/* İndirim */}
          <div className="px-4 pt-4 pb-2 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">İndirim</span>
              {/* Tür Toggle */}
              <div className="flex rounded-lg border border-gray-200 text-xs font-bold bg-white overflow-hidden shrink-0">
                <button
                  onClick={() => { setDiscountType('percent'); setDiscountValue(''); }}
                  className={`px-3 py-1.5 transition-colors ${discountType === 'percent' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  %
                </button>
                <div className="w-px bg-gray-200"></div>
                <button
                  onClick={() => { setDiscountType('amount'); setDiscountValue(''); }}
                  className={`px-3 py-1.5 transition-colors ${discountType === 'amount' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  TL
                </button>
              </div>
              <input
                type="number"
                min="0"
                value={discountValue}
                onChange={e => setDiscountValue(e.target.value)}
                placeholder={discountType === 'percent' ? '0' : '0'}
                className="flex-1 border border-gray-200 bg-white text-gray-800 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 text-right min-w-[60px]"
              />
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-xs text-gray-500">
                <span>İndirim</span>
                <span className="font-bold text-red-500">-{discountAmount} TL</span>
              </div>
            )}
          </div>

          {/* Ödeme Yöntemi */}
          <div className="px-4 py-2">
            <div className="flex gap-2">
              <button
                onClick={() => setPaymentMethod('nakit')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold btn-press border-2 transition-colors ${paymentMethod === 'nakit' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
              >
                <Banknote size={16} /> NAKİT
              </button>
              <button
                onClick={() => setPaymentMethod('kart')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold btn-press border-2 transition-colors ${paymentMethod === 'kart' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
              >
                <CreditCard size={16} /> KART
              </button>
              <button
                onClick={() => setPaymentMethod('veresiye')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold btn-press border-2 transition-colors ${paymentMethod === 'veresiye' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
              >
                <Book size={16} /> VERESİYE
              </button>
            </div>
            
            {paymentMethod === 'veresiye' && (
              <div className="mt-3 flex flex-col gap-2">
                <select 
                  value={selectedCustomerId} 
                  onChange={e => { setSelectedCustomerId(e.target.value); setNewCustomerName(''); }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white"
                >
                  <option value="">-- Kayıtlı Müşteri Seç --</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} (Bakiye: {c.debt} TL)</option>)}
                </select>
                <div className="text-center text-[10px] text-gray-400 font-bold uppercase">VEYA YENİ EKLE</div>
                <input 
                  type="text"
                  placeholder="Yeni Müşteri Adı Soyadı"
                  value={newCustomerName}
                  onChange={e => { setNewCustomerName(e.target.value); setSelectedCustomerId(''); }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white"
                />
              </div>
            )}
          </div>

          {/* Toplam ve Butonlar */}
          <div className="px-4 pb-4 space-y-2">
            <div className="flex justify-between items-center py-2 border-t border-gray-100">
              <span className="font-bold text-gray-700 text-sm uppercase tracking-wide">Toplam</span>
              <div className="text-right">
                {discountAmount > 0 && <div className="text-xs line-through text-gray-400">{subtotal} TL</div>}
                <span className="font-bold text-2xl text-primary">{finalTotal} TL</span>
              </div>
            </div>
                        <button
              onClick={() => printReceipt('kitchen')}
              disabled={!hasItems || order.items.every(i => i.sentToKitchen)}
              className="w-full bg-orange-500 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3.5 rounded-xl btn-press text-base shadow-md transition-colors flex items-center justify-center gap-2 mb-2"
            >
              MUTFAĞA GÖNDER
            </button>
            <button
              disabled={!hasItems}
              className="w-full bg-blue-500 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3.5 rounded-xl btn-press text-base shadow-md transition-colors flex items-center justify-center gap-2"
            >
              YAZDIR
            </button>
            <button
              onClick={handlePayAndClose}
              disabled={!hasItems || (paymentMethod === 'veresiye' && !selectedCustomerId && !newCustomerName.trim())}
              className="w-full bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3.5 rounded-xl btn-press text-base shadow-md transition-colors"
            >
              ÖDE VE MASAYI KAPAT
            </button>
          </div>
        </div>
      </div>

      {/* SAĞ: ÜRÜNLER */}
      <div className={`flex-1 min-h-0 flex-col md:flex md:h-full overflow-hidden ${mobileTab === 'products' ? 'flex' : 'hidden'}`}>
                {/* MOBİL ÖZEL ÜST BİLGİ */}
        <div className="md:hidden bg-gray-800 text-white px-4 py-3 flex items-center gap-3 shrink-0">
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 btn-press">
            <ChevronLeft size={22} />
          </button>
          <div>
            <div className="font-bold text-lg leading-tight">{table.name}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">{table.zone} - Ürün Seçimi</div>
          </div>
        </div>

        <div className="bg-white border-b border-gray-200 shrink-0 px-4 flex gap-1 overflow-x-auto no-scrollbar whitespace-nowrap">
          {categories.map(cat => (
            <button
              key={cat}
              id={`cat_btn_${cat.replace(/\s+/g, '_')}`} onClick={() => scrollToCat(cat)}
              className={`shrink-0 relative px-6 py-4 text-sm font-bold uppercase tracking-wide btn-press transition-colors ${activeCategory === cat ? 'text-primary' : 'text-gray-500 hover:text-gray-800'}`}
            >
              {cat}
              {activeCategory === cat && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
            </button>
          ))}
        </div>

        
        {/* MOBİL İÇİN YÜZEN SEPET BUTONU */}
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
          <button 
            onClick={() => setMobileTab('cart')}
            className="w-full bg-gray-900 text-white shadow-2xl rounded-2xl p-4 flex items-center justify-between btn-press border border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="bg-primary text-white font-bold w-8 h-8 rounded-full flex items-center justify-center">
                {order?.items?.reduce((acc, i) => acc + i.qty, 0) || 0}
              </div>
              <span className="font-bold text-lg">Adisyonu Gör</span>
            </div>
            <span className="font-black text-xl text-primary">{finalTotal} TL</span>
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-3 md:p-5 pb-24" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4 pb-12 md:pb-5">
            {filteredProducts.map((p, i) => (
              <button
                key={p.id}
                onClick={() => onAddProduct(p)}
                className={`card-interactive ${p.color} text-white rounded-2xl p-4 shadow-md flex flex-col justify-between aspect-square text-left`}
                style={{ animationDelay: `${i * 25}ms` }}
              >
                <span className="font-bold text-base leading-tight">{p.name}</span>
                <span className="font-bold bg-black/20 self-start px-3 py-1 rounded-lg text-sm">{p.price} TL</span>
              </button>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
