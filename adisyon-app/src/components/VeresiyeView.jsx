import { useState } from 'react';
import { Book, UserPlus, CreditCard, ChevronRight, X, Trash2, PlusCircle } from 'lucide-react';

export default function VeresiyeView({ customers, onAddCustomer, onAddLog, onDeleteCustomer }) {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerDebt, setNewCustomerDebt] = useState('');
  
  const [amountInput, setAmountInput] = useState('');
  const [noteInput, setNoteInput] = useState('');

  const totalDebt = customers.reduce((sum, c) => sum + c.debt, 0);

  const handleAdd = () => {
    if (!newCustomerName.trim()) return;
    const initialDebt = parseFloat(newCustomerDebt) || 0;
    const initialLogs = initialDebt > 0 ? [{ id: Date.now().toString(), type: 'debt', amount: initialDebt, date: new Date().toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }), note: 'Başlangıç Borcu' }] : [];
    
    onAddCustomer({ name: newCustomerName, phone: newCustomerPhone, debt: initialDebt, logs: initialLogs, createdAt: Date.now() });
    setNewCustomerName('');
    setNewCustomerPhone('');
    setNewCustomerDebt('');
  };

  const handleTransaction = (type) => {
    const amt = parseFloat(amountInput);
    if (!amt || amt <= 0 || !selectedCustomer) return;
    onAddLog(selectedCustomer.id, amt, type, noteInput.trim());
    setAmountInput('');
    setNoteInput('');
  };

  const handleDelete = () => {
    if (confirm(`${selectedCustomer.name} adlı müşteriyi ve tüm geçmişini silmek istediğinize emin misiniz?`)) {
      onDeleteCustomer(selectedCustomer.id);
      setSelectedCustomer(null);
    }
  };

  // Re-sync selected customer if mutated
  const current = selectedCustomer ? customers.find(c => c.id === selectedCustomer.id) : null;

  return (
    <div className="flex flex-1 h-screen overflow-hidden bg-gray-50">
      
      {/* Sol: Müşteri Listesi */}
      <div className="w-1/3 flex flex-col border-r border-gray-200 bg-white shadow-sm z-10">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Book className="text-primary" size={24} /> Veresiye Defteri
          </h1>
        </div>

        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Toplam Alacak</div>
          <div className="text-2xl font-bold text-red-500">{totalDebt.toLocaleString('tr-TR')} TL</div>
        </div>

        <div className="p-4 border-b border-gray-100 space-y-2">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Yeni Müşteri Ekle</div>
          <input 
            type="text" 
            placeholder="Müşteri Adı Soyadı" 
            value={newCustomerName}
            onChange={e => setNewCustomerName(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
          />
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Telefon (İsteğe Bağlı)" 
              value={newCustomerPhone}
              onChange={e => setNewCustomerPhone(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
            <input 
              type="number"
              min="0"
              placeholder="Başlangıç Borcu (TL)" 
              value={newCustomerDebt}
              onChange={e => setNewCustomerDebt(e.target.value)}
              className="w-1/3 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
            <button 
              onClick={handleAdd}
              className="bg-primary text-white p-2 rounded-lg btn-press flex items-center justify-center aspect-square shrink-0"
            >
              <UserPlus size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {customers.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-400">Henüz veresiye müşteri yok.</div>
          ) : (
            customers.map(c => (
              <button 
                key={c.id} 
                onClick={() => setSelectedCustomer(c)}
                className={`w-full text-left px-5 py-4 border-b border-gray-50 flex items-center justify-between transition-colors ${current?.id === c.id ? 'bg-primary/5 border-l-4 border-l-primary' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}
              >
                <div>
                  <div className="font-bold text-gray-800">{c.name}</div>
                  {c.phone && <div className="text-xs text-gray-400">{c.phone}</div>}
                </div>
                <div className="text-right">
                  <div className={`font-bold ${c.debt > 0 ? 'text-red-500' : (c.debt < 0 ? 'text-green-500' : 'text-gray-500')}`}>
                    {c.debt > 0 ? '' : (c.debt < 0 ? '+' : '')}{c.debt.toLocaleString('tr-TR')} TL
                  </div>
                  <ChevronRight size={16} className="text-gray-300 ml-auto mt-1" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Sağ: Müşteri Detayı ve Tahsilat */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {!current ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <Book size={64} className="opacity-10 mb-4" />
            <p className="font-medium">Detayları görmek için soldan bir müşteri seçin</p>
          </div>
        ) : (
          <>
            <div className="px-8 py-6 bg-white border-b border-gray-200 shrink-0">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    {current.name}
                    <button onClick={handleDelete} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </h2>
                  {current.phone && <div className="text-sm text-gray-500 mt-1">{current.phone}</div>}
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Güncel Bakiye</div>
                  <div className={`text-3xl font-bold ${current.debt > 0 ? 'text-red-500' : (current.debt < 0 ? 'text-green-500' : 'text-gray-800')}`}>
                    {current.debt > 0 ? '' : (current.debt < 0 ? '+' : '')}{Math.abs(current.debt).toLocaleString('tr-TR')} TL {current.debt < 0 && '(Alacaklı)'}
                  </div>
                </div>
              </div>

              {/* Tahsilat veya Borç Ekle */}
              <div className="mt-6 p-5 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-3">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Manuel İşlem Ekle</div>
                <div className="flex gap-3">
                  <input 
                    type="number" 
                    min="0"
                    placeholder="Tutar (TL)" 
                    value={amountInput}
                    onChange={e => setAmountInput(e.target.value)}
                    className="w-1/3 border border-gray-200 bg-white rounded-lg px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <input 
                    type="text" 
                    placeholder="Açıklama / Not (Opsiyonel)" 
                    value={noteInput}
                    onChange={e => setNoteInput(e.target.value)}
                    className="flex-1 border border-gray-200 bg-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="flex gap-3 mt-1">
                  <button 
                    onClick={() => handleTransaction('payment')}
                    disabled={!amountInput}
                    className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold px-6 py-2.5 rounded-lg btn-press flex items-center justify-center gap-2 transition-colors"
                  >
                    <CreditCard size={18} /> TAHSİLAT AL (BORÇ DÜŞ)
                  </button>
                  <button 
                    onClick={() => handleTransaction('debt')}
                    disabled={!amountInput}
                    className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold px-6 py-2.5 rounded-lg btn-press flex items-center justify-center gap-2 transition-colors"
                  >
                    <PlusCircle size={18} /> EK BORÇ YAZ
                  </button>
                </div>
              </div>
            </div>

            {/* Geçmiş Loglar */}
            <div className="flex-1 overflow-y-auto p-8">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">Hesap Geçmişi</h3>
              <div className="space-y-3">
                {(!current.logs || current.logs.length === 0) ? (
                  <div className="text-sm text-gray-400">Henüz bir işlem yok.</div>
                ) : (
                  [...current.logs].sort((a,b) => b.createdAt - a.createdAt).map(log => (
                    <div key={log.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-gray-800 text-sm">
                          {log.type === 'debt' ? 'Borç Yazıldı' : 'Tahsilat (Ödeme Alındı)'}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">{log.date} {log.note && `- ${log.note}`}</div>
                      </div>
                      <div className={`font-bold ${log.type === 'debt' ? 'text-red-500' : 'text-green-500'}`}>
                        {log.type === 'debt' ? '+' : '-'}{log.amount.toLocaleString('tr-TR')} TL
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
