import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/components/OrderView.jsx', 'utf8');

code = code.replace(
  "invoke('print_receipt', { printerName, receiptText }).catch(console.error);",
  `if (window.__TAURI__) {
        invoke('print_receipt', { printerName, receiptText }).catch(console.error);
      } else {
        fetch('/api/print', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ printerName, receiptText }) }).catch(console.error);
      }`
);

code = code.replace(
  "invoke('print_receipt', { printerName, receiptText })",
  `(window.__TAURI__ ? invoke('print_receipt', { printerName, receiptText }) : fetch('/api/print', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ printerName, receiptText }) }))`
);

fs.writeFileSync('adisyon-app/src/components/OrderView.jsx', code);
console.log("OrderView print patched.");
