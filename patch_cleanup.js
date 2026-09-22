import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/components/OrderView.jsx', 'utf8');
code = code.replace(
  '<button onClick={() => window.print()} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 btn-press">\\n            <Printer size={20} />\\n          </button>',
  ''
);
code = code.replace(
  '<button onClick={() => window.print()} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 btn-press">\n            <Printer size={20} />\n          </button>',
  ''
);
fs.writeFileSync('adisyon-app/src/components/OrderView.jsx', code);
