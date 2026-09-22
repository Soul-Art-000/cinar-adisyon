import fs from 'fs';

let code = fs.readFileSync('adisyon-app/src/components/CiroView.jsx', 'utf8');

code = code.replace('${totalCash}', '${nakitTotal}');
code = code.replace('${totalCard}', '${kartTotal}');

const veresiyeLogic = "const veresiyeTotal = sales.filter(s => s.paymentMethod === 'veresiye').reduce((a, s) => a + s.finalTotal, 0);";
code = code.replace('const grandTotal = nakitTotal + kartTotal;', veresiyeLogic + '\\n  const grandTotal = nakitTotal + kartTotal + veresiyeTotal;');

code = code.replace('${totalVeresiye}', '${veresiyeTotal}');
code = code.replace('${totalRevenue}', '${grandTotal}');

fs.writeFileSync('adisyon-app/src/components/CiroView.jsx', code);
console.log("CiroView variables fixed.");
