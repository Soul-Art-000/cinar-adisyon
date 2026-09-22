import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/components/OrderView.jsx', 'utf8');

if (!code.includes('@tauri-apps/api/core')) {
    code = "import { invoke } from '@tauri-apps/api/core';\n" + code;
}

const printLogic = `
  const printReceiptIfEnabled = () => {
    const printerName = localStorage.getItem('adisyon_printer');
    if (!printerName) return; // Yazıcı seçilmemişse yazdırma

    let receiptText = \`MASA: \${table.name}\\n\`;
    receiptText += \`TARIH: \${new Date().toLocaleString('tr-TR')}\\n\`;
    receiptText += \`--------------------------------\\n\`;
    
    order.items.forEach(item => {
      const p = products.find(x => x.id === item.productId);
      if (p) {
        let line = \`\${p.name}\`;
        if (item.qty > 1) line += \` (x\${item.qty})\`;
        let priceStr = (p.price * item.qty).toString() + " TL";
        // Simple padding for right align
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
    receiptText += \`Bizi tercih ettiginiz icin\\ntesekkur ederiz.\\n\`;

    invoke('print_receipt', { printerName, receiptText }).catch(console.error);
  };
`;

code = code.replace('const handlePay = () => {', printLogic + '\n  const handlePay = () => {');

code = code.replace(
  'onPayAndClose({ paymentMethod', 
  'printReceiptIfEnabled();\n    onPayAndClose({ paymentMethod'
);
// Also print for normal pay? Usually you only print when closing the table.
// code = code.replace('onPay({ paymentMethod', 'printReceiptIfEnabled();\n    onPay({ paymentMethod');

fs.writeFileSync('adisyon-app/src/components/OrderView.jsx', code);
console.log("OrderView patched for printing");
