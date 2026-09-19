import fs from 'fs';
let code = fs.readFileSync('src/components/TablesView.jsx', 'utf8');

code = code.replace(
  `className="card-interactive bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col justify-between h-28 text-left animate-in hover:border-primary/30"`,
  `className="card-interactive bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col justify-between h-28 text-left hover:border-primary/30 transition-all"`
);

code = code.replace(
  `style={{ animationDelay: \`\${i * 20}ms\`, opacity: 0 }}`,
  `style={{ animationDelay: \`\${i * 20}ms\` }}`
);

fs.writeFileSync('src/components/TablesView.jsx', code);
