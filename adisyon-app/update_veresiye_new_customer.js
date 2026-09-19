import fs from 'fs';
let code = fs.readFileSync('src/App.jsx', 'utf8');

code = code.replace(
  `    if (paymentInfo.paymentMethod === 'veresiye' && paymentInfo.customerId) {
      const c = veresiye.find(x => x.id === paymentInfo.customerId);
      if (c) {
        const log = { id: uid(), type: 'debt', amount: paymentInfo.finalTotal, date: now(), createdAt: Date.now(), note: saleData.tableName };
        const updated = { ...c, debt: c.debt + paymentInfo.finalTotal, logs: [...(c.logs||[]), log] };
        setVeresiye(prev => prev.map(x => x.id === paymentInfo.customerId ? updated : x));
        mutate('update', 'veresiye', paymentInfo.customerId, updated);
      }
    }`,
  `    if (paymentInfo.paymentMethod === 'veresiye') {
      let targetCustomerId = paymentInfo.customerId;
      let targetCustomer = veresiye.find(x => x.id === targetCustomerId);
      
      // Yeni Müşteri ekleniyorsa
      if (paymentInfo.newCustomerName) {
        targetCustomerId = uid();
        targetCustomer = { id: targetCustomerId, name: paymentInfo.newCustomerName, phone: '', debt: 0, logs: [], createdAt: Date.now() };
        setVeresiye(prev => [...prev, targetCustomer]);
        mutate('add', 'veresiye', null, targetCustomer);
      }

      if (targetCustomer) {
        const log = { id: uid(), type: 'debt', amount: paymentInfo.finalTotal, date: now(), createdAt: Date.now(), note: saleData.tableName };
        const updated = { ...targetCustomer, debt: targetCustomer.debt + paymentInfo.finalTotal, logs: [...(targetCustomer.logs||[]), log] };
        
        setVeresiye(prev => {
           if (prev.find(x => x.id === targetCustomerId)) {
             return prev.map(x => x.id === targetCustomerId ? updated : x);
           }
           // Just in case the state hasn't flushed the newly added customer yet
           return [...prev.filter(x => x.id !== targetCustomerId), updated];
        });
        
        mutate('update', 'veresiye', targetCustomerId, updated);
      }
    }`
);

fs.writeFileSync('src/App.jsx', code);

// Now update OrderView.jsx
let order = fs.readFileSync('src/components/OrderView.jsx', 'utf8');

if (!order.includes('newCustomerName')) {
  order = order.replace(
    `const [selectedCustomerId, setSelectedCustomerId] = useState('');`,
    `const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');`
  );

  order = order.replace(
    `onPay({ paymentMethod, customerId: selectedCustomerId, discountType, discountValue: discountNum, discountAmount, finalTotal });`,
    `onPay({ paymentMethod, customerId: selectedCustomerId, newCustomerName, discountType, discountValue: discountNum, discountAmount, finalTotal });`
  );

  order = order.replace(
    `onPayAndClose({ paymentMethod, customerId: selectedCustomerId, discountType, discountValue: discountNum, discountAmount, finalTotal });`,
    `onPayAndClose({ paymentMethod, customerId: selectedCustomerId, newCustomerName, discountType, discountValue: discountNum, discountAmount, finalTotal });`
  );

  order = order.replace(
    `disabled={!hasItems || (paymentMethod === 'veresiye' && !selectedCustomerId)}`,
    `disabled={!hasItems || (paymentMethod === 'veresiye' && !selectedCustomerId && !newCustomerName.trim())}`
  );
  order = order.replace(
    `disabled={!hasItems || (paymentMethod === 'veresiye' && !selectedCustomerId)}`,
    `disabled={!hasItems || (paymentMethod === 'veresiye' && !selectedCustomerId && !newCustomerName.trim())}`
  );

  order = order.replace(
    `            {paymentMethod === 'veresiye' && (
              <div className="mt-2 animate-in">
                <select 
                  value={selectedCustomerId} 
                  onChange={e => setSelectedCustomerId(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white"
                >
                  <option value="">-- Müşteri Seçin --</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} (Bakiye: {c.debt} TL)</option>)}
                </select>
                {!selectedCustomerId && <div className="text-[10px] text-red-500 mt-1">* Lütfen bir müşteri seçin</div>}
              </div>
            )}`,
    `            {paymentMethod === 'veresiye' && (
              <div className="mt-3 animate-in flex flex-col gap-2">
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
            )}`
  );
  
  fs.writeFileSync('src/components/OrderView.jsx', order);
}

