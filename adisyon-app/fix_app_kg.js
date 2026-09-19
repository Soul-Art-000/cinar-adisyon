import fs from 'fs';
let code = fs.readFileSync('src/App.jsx', 'utf8');

code = code.replace(
  `  const handleAddProduct = product => {
    if (activeTable.status === 'empty') {
      const newOrderId = \`order-\${uid()}\`;
      const items = [{ productId: product.id, name: product.name, price: product.price, qty: 1 }];`,
  `  const handleAddProduct = product => {
    let qtyToAdd = 1;
    if (product.unit === 'kg') {
      const p = prompt(\`\${product.name} için miktar giriniz (Kg/Gram):\`, "1");
      if (!p) return;
      qtyToAdd = parseFloat(p.replace(',', '.'));
      if (isNaN(qtyToAdd) || qtyToAdd <= 0) return;
    }

    if (activeTable.status === 'empty') {
      const newOrderId = \`order-\${uid()}\`;
      const items = [{ productId: product.id, name: product.name, price: product.price, qty: qtyToAdd }];`
);

code = code.replace(
  `    const existing = items.find(i => i.productId === product.id);
    if (existing) existing.qty += 1;
    else items.push({ productId: product.id, name: product.name, price: product.price, qty: 1 });`,
  `    const existing = items.find(i => i.productId === product.id);
    if (existing && product.unit !== 'kg') existing.qty += 1;
    else if (existing && product.unit === 'kg') existing.qty += qtyToAdd;
    else items.push({ productId: product.id, name: product.name, price: product.price, qty: qtyToAdd });`
);

// Allow fractional step in OrderView
// Need to modify OrderView.jsx to show fractions and allow step="any"

fs.writeFileSync('src/App.jsx', code);
