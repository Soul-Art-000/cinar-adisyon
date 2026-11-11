import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/App.jsx', 'utf8');

const apiInvokeDefinition = `
const apiInvoke = async (command, args = {}) => {
  if (window.__TAURI__) {
    return await invoke(command, args);
  } else {
    let url = '/api/' + (command === 'get_db' ? 'db' : (command === 'mutate_db' ? 'mutate' : 'print'));
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args)
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  }
};
`;

// Insert after imports
code = code.replace(/import .*?;\n\n/, match => match + apiInvokeDefinition + '\n');

// Replace invoke( with apiInvoke(
code = code.replace(/invoke\('get_db'\)/g, "apiInvoke('get_db')");
code = code.replace(/invoke\('mutate_db'/g, "apiInvoke('mutate_db'");
code = code.replace(/invoke\('print_receipt'/g, "apiInvoke('print_receipt'");

fs.writeFileSync('adisyon-app/src/App.jsx', code);
console.log("App.jsx apiInvoke patched.");
