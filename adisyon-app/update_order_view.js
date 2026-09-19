import fs from 'fs';
let code = fs.readFileSync('src/components/OrderView.jsx', 'utf8');
code = code.replace(
  'export default function OrderView({ table, order, products, categories, onClose, onAddProduct, onUpdateQuantity, onRemoveProduct, onPayment }) {',
  'export default function OrderView({ table, order, products, categories, onClose, onAddProduct, onUpdateQuantity, onRemoveProduct, onPayment, debugInfo }) {'
);
code = code.replace(
  '<h2 className="text-xl font-bold tracking-wide">{table.name}</h2>',
  '<h2 className="text-xl font-bold tracking-wide">{table.name}</h2>\n              {debugInfo && <div className="text-xs text-red-500">{debugInfo}</div>}'
);
fs.writeFileSync('src/components/OrderView.jsx', code);
