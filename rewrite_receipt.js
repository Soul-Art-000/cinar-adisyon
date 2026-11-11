import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/components/OrderView.jsx', 'utf8');

const oldElseBlock = `    } else {
      receiptText += \`CINAR ADISYON\\n\\n\`;
      receiptText += \`MASA: \${table.name}\\n\`;
      receiptText += \`TARIH: \${new Date().toLocaleString('tr-TR')}\\n\`;
      receiptText += \`--------------------------------\\n\`;
      
      order.items.forEach(item => {
        const p = products.find(x => x.id === item.productId);
        if (p) {
          let line = \`\${p.name} \${item.ikram ? '(IKRAM)' : ''}\`;
          if (item.qty > 1) line += \` (x\${item.qty})\`;
          let priceStr = item.ikram ? "0 TL" : (p.price * item.qty).toString() + " TL";
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
      
      invoke('print_receipt', { printerName, receiptText }).catch(console.error);
    }`;

const newElseBlock = `    } else {
      receiptText += \`CINAR\\n\\n\`;
      receiptText += \`MASA: \${table.name}\\n\`;
      receiptText += \`TARIH: \${new Date().toLocaleString('tr-TR')}\\n\`;
      receiptText += \`--------------------------------\\n\`;
      
      order.items.forEach(item => {
        const p = products.find(x => x.id === item.productId);
        if (p) {
          receiptText += \`\${item.qty}x \${p.name} \${item.ikram ? '(IKRAM)' : ''}\\n\`;
        }
      });

      receiptText += \`--------------------------------\\n\\n\\n\`;
      
      invoke('print_receipt', { printerName, receiptText }).catch(console.error);
    }`;

code = code.replace(oldElseBlock, newElseBlock);

fs.writeFileSync('adisyon-app/src/components/OrderView.jsx', code);
console.log("Customer receipt format patched.");
