import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/components/OrderView.jsx', 'utf8');

const kitchenBtn = `            <button
              onClick={() => printReceipt('kitchen')}
              disabled={!hasItems || order.items.every(i => i.sentToKitchen)}
              className="w-full bg-orange-500 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3.5 rounded-xl btn-press text-base shadow-md transition-colors flex items-center justify-center gap-2 mb-2"
            >
              🍳 MUTFAĞA GÖNDER
            </button>
            <button`;

code = code.replace('<button\n              onClick={() => printReceipt(\'customer\')}', kitchenBtn);

fs.writeFileSync('adisyon-app/src/components/OrderView.jsx', code);
console.log("Kitchen button added back.");
