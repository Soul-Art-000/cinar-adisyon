import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/components/OrderView.jsx', 'utf8');

const newPrintLogic = `
  const printReceipt = (type = 'customer') => {
    const printerName = localStorage.getItem('adisyon_printer');
    if (!printerName) return alert("Ayarlardan yazici secilmemis!");

    let receiptText = \`\`;
    
    if (type === 'kitchen') {
      receiptText += \`*** MUTFAK SIPARISI ***\\n\\n\`;
      receiptText += \`MASA: \${table.name}\\n\`;
      receiptText += \`TARIH: \${new Date().toLocaleString('tr-TR')}\\n\`;
      receiptText += \`--------------------------------\\n\`;
      
      order.items.forEach(item => {
        const p = products.find(x => x.id === item.productId);
        if (p) {
          receiptText += \`\${item.qty}x \${p.name}\\n\`;
        }
      });
      receiptText += \`--------------------------------\\n\\n\\n\`;
    } else {
      receiptText += \`CINAR ADISYON\\n\\n\`;
      receiptText += \`MASA: \${table.name}\\n\`;
      receiptText += \`TARIH: \${new Date().toLocaleString('tr-TR')}\\n\`;
      receiptText += \`--------------------------------\\n\`;
      
      order.items.forEach(item => {
        const p = products.find(x => x.id === item.productId);
        if (p) {
          let line = \`\${p.name}\`;
          if (item.qty > 1) line += \` (x\${item.qty})\`;
          let priceStr = (p.price * item.qty).toString() + " TL";
          let spaces = 32 - line.length - priceStr.length;
          if (spaces < 1) spaces = 1;
          receiptText += line + " ".repeat(spaces) + priceStr + "\\n";
        }
      });

      receiptText += \`--------------------------------\\n\`;
      if (discountAmount > 0) {
        receiptText += \`INDIRIM:                  -\${discountAmount} TL\\n\`;
      }
      receiptText += \`TOPLAM:                   \${finalTotal} TL\\n\\n\`;
      receiptText += \`YONTEM: \${paymentMethod === 'veresiye' ? 'VERESIYE' : paymentMethod.toUpperCase()}\\n\`;
      receiptText += \`Bizi tercih ettiginiz icin\\ntesekkur ederiz.\\n\\n\\n\`;
    }

    invoke('print_receipt', { printerName, receiptText }).catch(console.error);
  };
`;

// Replace the old printReceiptIfEnabled logic
const startIdx = code.indexOf('const printReceiptIfEnabled = () => {');
const endIdx = code.indexOf('const handlePay = () => {');

if (startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + newPrintLogic + '\n  ' + code.substring(endIdx);
}

// Modify the handlePayAndClose to call printReceipt('customer')
code = code.replace('printReceiptIfEnabled();', 'printReceipt(\'customer\');');

// Add a "Mutfak Fişi" button to the UI!
// Search for the top bar where the close button is.
const headerTarget = '<div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white shadow-sm z-10">';
const headerReplacement = headerTarget + `
        <div className="flex gap-2 items-center absolute left-1/2 -translate-x-1/2">
          <button onClick={() => printReceipt('kitchen')} className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">🖨️ Mutfak Fişi</button>
          <button onClick={() => printReceipt('customer')} className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">🖨️ Adisyon (Fiyatlı)</button>
        </div>`;

if(code.includes(headerTarget) && !code.includes('Mutfak Fişi')) {
  code = code.replace(headerTarget, headerReplacement);
}

fs.writeFileSync('adisyon-app/src/components/OrderView.jsx', code);
console.log("OrderView patched for custom printing");
