import fs from 'fs';
let code = fs.readFileSync('src/components/VeresiyeView.jsx', 'utf8');

code = code.replace(
  `  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');`,
  `  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerDebt, setNewCustomerDebt] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');`
);

code = code.replace(
  `  const handleAdd = () => {
    if (!newCustomerName.trim()) return;
    onAddCustomer({ name: newCustomerName, phone: newCustomerPhone, debt: 0, logs: [] });
    setNewCustomerName('');
    setNewCustomerPhone('');
  };`,
  `  const handleAdd = () => {
    if (!newCustomerName.trim()) return;
    const initialDebt = parseFloat(newCustomerDebt) || 0;
    const initialLogs = initialDebt > 0 ? [{ id: Date.now().toString(), type: 'debt', amount: initialDebt, date: new Date().toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }), note: 'Başlangıç Borcu' }] : [];
    
    onAddCustomer({ name: newCustomerName, phone: newCustomerPhone, debt: initialDebt, logs: initialLogs, createdAt: Date.now() });
    setNewCustomerName('');
    setNewCustomerPhone('');
    setNewCustomerDebt('');
  };`
);

code = code.replace(
  `            <input 
              type="text" 
              placeholder="Telefon (İsteğe Bağlı)" 
              value={newCustomerPhone}
              onChange={e => setNewCustomerPhone(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
            <button 
              onClick={handleAdd}`,
  `            <input 
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
              onClick={handleAdd}`
);

fs.writeFileSync('src/components/VeresiyeView.jsx', code);
