import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/components/OrderView.jsx', 'utf8');

// 1. Add new props to component signature
code = code.replace(
  'export default function OrderView({ table, order, products, categories, customers = [], onClose, onAddProduct, onUpdateQty, onPay, onPayAndClose }) {',
  'import { Gift } from "lucide-react";\nexport default function OrderView({ table, order, products, categories, customers = [], onClose, onAddProduct, onUpdateQty, onToggleIkram, onMarkAsSent, onPay, onPayAndClose }) {'
);

// 2. Modify printReceipt to handle Smart Kitchen Ticket and Ikram formatting
const newPrintReceipt = `
  const printReceipt = (type = 'customer') => {
    const printerName = localStorage.getItem('adisyon_printer');
    if (!printerName) return alert("Ayarlardan yazici secilmemis!");

    let receiptText = \`\`;
    
    if (type === 'kitchen') {
      const unsentItems = order.items.filter(i => !i.sentToKitchen);
      if (unsentItems.length === 0) {
        return alert("Mutfaga gonderilecek yeni urun yok!");
      }
      
      receiptText += \`*** MUTFAK SIPARISI ***\\n\\n\`;
      receiptText += \`MASA: \${table.name}\\n\`;
      receiptText += \`TARIH: \${new Date().toLocaleString('tr-TR')}\\n\`;
      receiptText += \`--------------------------------\\n\`;
      
      unsentItems.forEach(item => {
        const p = products.find(x => x.id === item.productId);
        if (p) {
          receiptText += \`\${item.qty}x \${p.name} \${item.ikram ? '(IKRAM)' : ''}\\n\`;
        }
      });
      receiptText += \`--------------------------------\\n\\n\\n\`;
      
      // Print and mark as sent
      invoke('print_receipt', { printerName, receiptText })
        .then(() => onMarkAsSent())
        .catch(console.error);
        
    } else {
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
    }
  };
`;
// Replace the old printReceipt
const startIdx = code.indexOf('const printReceipt = (type = \'customer\') => {');
const endIdx = code.indexOf('const handlePay = () => {');
if (startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + newPrintReceipt + '\n  ' + code.substring(endIdx);
}

// 3. Add Ikram button to UI and apply line-through for ikram items
const itemRowRegex = /<span className="font-semibold text-gray-800">\{p\.name\}<\/span>/;
const newItemRow = `<span className={\`font-semibold \${item.ikram ? 'text-gray-400 line-through' : 'text-gray-800'}\`}>{p.name} {item.ikram && <span className="text-xs text-primary font-bold no-underline ml-2">(İKRAM)</span>}</span>`;
code = code.replace(itemRowRegex, newItemRow);

const itemPriceRegex = /<span className="font-bold text-gray-800">\{\(p\.price \* item\.qty\)\.toLocaleString\('tr-TR'\)\} ₺<\/span>/;
const newItemPrice = `<span className="font-bold text-gray-800">{item.ikram ? '0 ₺' : (p.price * item.qty).toLocaleString('tr-TR') + ' ₺'}</span>`;
code = code.replace(itemPriceRegex, newItemPrice);

// Add the Gift button next to minus/plus
const minusPlusTarget = '<button onClick={() => onUpdateQty(item.productId, item.qty + 1)} className="p-1 rounded-md hover:bg-gray-200 text-gray-600 btn-press"><Plus size={16} /></button>';
const minusPlusReplacement = minusPlusTarget + `\n                  <button onClick={() => onToggleIkram(item.productId)} className={\`p-1 rounded-md ml-2 btn-press \${item.ikram ? 'bg-primary text-white' : 'hover:bg-gray-200 text-gray-600'}\`} title="İkram"><Gift size={16} /></button>`;
code = code.replace(minusPlusTarget, minusPlusReplacement);

fs.writeFileSync('adisyon-app/src/components/OrderView.jsx', code);
console.log("OrderView features patched.");
