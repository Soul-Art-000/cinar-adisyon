import fs from 'fs';

['SettingsAdmin.jsx', 'ProductsAdmin.jsx', 'CiroView.jsx', 'OrderView.jsx', 'TablesView.jsx', 'Sidebar.jsx'].forEach(file => {
  let path = 'adisyon-app/src/components/' + file;
  if (fs.existsSync(path)) {
    let code = fs.readFileSync(path, 'utf8');
    // Replace overflow-y-auto with overflow-y-auto no-scrollbar
    code = code.replace(/overflow-y-auto(?! no-scrollbar)/g, 'overflow-y-auto no-scrollbar');
    code = code.replace(/overflow-x-auto(?! no-scrollbar)/g, 'overflow-x-auto no-scrollbar');
    fs.writeFileSync(path, code);
  }
});
console.log("no-scrollbar applied to components.");
