import fs from 'fs';
let code = fs.readFileSync('src/components/OrderView.jsx', 'utf8');

// Force bg-white on input and fix the toggle layout
code = code.replace(
  /<div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs font-bold">[\s\S]*?<\/div>\s*<input[\s\S]*?\/>/,
  `<div className="flex rounded-lg border border-gray-200 text-xs font-bold bg-white overflow-hidden shrink-0">
                <button
                  onClick={() => { setDiscountType('percent'); setDiscountValue(''); }}
                  className={\`px-3 py-1.5 transition-colors \${discountType === 'percent' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-50'}\`}
                >
                  %
                </button>
                <div className="w-px bg-gray-200"></div>
                <button
                  onClick={() => { setDiscountType('amount'); setDiscountValue(''); }}
                  className={\`px-3 py-1.5 transition-colors \${discountType === 'amount' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-50'}\`}
                >
                  TL
                </button>
              </div>
              <input
                type="number"
                min="0"
                value={discountValue}
                onChange={e => setDiscountValue(e.target.value)}
                placeholder={discountType === 'percent' ? '0' : '0'}
                className="flex-1 border border-gray-200 bg-white text-gray-800 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 text-right min-w-[60px]"
              />`
);

fs.writeFileSync('src/components/OrderView.jsx', code);
