import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/components/OrderView.jsx', 'utf8');

// 1. Remove "Adisyon (Fiyatlı)" from the top header
code = code.replace(
  '<button onClick={() => printReceipt(\'customer\')} className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">🖨️ Adisyon (Fiyatlı)</button>',
  ''
);

// 2. Replace the bottom "ÖDE" button with "YAZDIR"
const oldOdeButton = `            <button
              onClick={handlePay}
              disabled={!hasItems || (paymentMethod === 'veresiye' && !selectedCustomerId && !newCustomerName.trim())}
              className="w-full bg-green-500 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3.5 rounded-xl btn-press text-base shadow-md transition-colors"
            >
              ÖDE
            </button>`;

const newYazdirButton = `            <button
              onClick={() => printReceipt('customer')}
              disabled={!hasItems}
              className="w-full bg-blue-500 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3.5 rounded-xl btn-press text-base shadow-md transition-colors flex items-center justify-center gap-2"
            >
              🖨️ YAZDIR (Hesap Fişi)
            </button>`;

code = code.replace(oldOdeButton, newYazdirButton);

fs.writeFileSync('adisyon-app/src/components/OrderView.jsx', code);
console.log("OrderView buttons patched.");
