import fs from 'fs';
let code = fs.readFileSync('src/App.jsx', 'utf8');

code = code.replace(
  `  const handleAddPayment = (customerId, amount) => {
    const c = veresiye.find(x => x.id === customerId);
    if (!c) return;
    const log = { id: uid(), type: 'payment', amount, date: now(), createdAt: Date.now() };
    const updated = { ...c, debt: c.debt - amount, logs: [...(c.logs||[]), log] };
    setVeresiye(prev => prev.map(x => x.id === customerId ? updated : x));
    mutate('update', 'veresiye', customerId, updated);
  };`,
  `  const handleAddVeresiyeLog = (customerId, amount, type, note = '') => {
    const c = veresiye.find(x => x.id === customerId);
    if (!c) return;
    const log = { id: uid(), type, amount, date: now(), createdAt: Date.now(), note };
    const newDebt = type === 'payment' ? c.debt - amount : c.debt + amount;
    const updated = { ...c, debt: newDebt, logs: [...(c.logs||[]), log] };
    setVeresiye(prev => prev.map(x => x.id === customerId ? updated : x));
    mutate('update', 'veresiye', customerId, updated);
  };

  const handleDeleteCustomer = (customerId) => {
    setVeresiye(prev => prev.filter(x => x.id !== customerId));
    mutate('delete', 'veresiye', customerId);
  };`
);

code = code.replace(
  `onAddPayment={handleAddPayment}`,
  `onAddLog={handleAddVeresiyeLog} onDeleteCustomer={handleDeleteCustomer}`
);

fs.writeFileSync('src/App.jsx', code);
