import fs from 'fs';

['SettingsAdmin.jsx', 'ProductsAdmin.jsx', 'CiroView.jsx'].forEach(file => {
  let path = 'adisyon-app/src/components/' + file;
  let code = fs.readFileSync(path, 'utf8');
  code = code.replace('<div className="flex-1 overflow-y-auto', '<div className="h-full overflow-y-auto');
  fs.writeFileSync(path, code);
});

console.log("Scroll fixed in components.");
