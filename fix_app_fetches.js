import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/App.jsx', 'utf8');

// Replace all fetch('/api/mutate') with invoke('mutate_db')
code = code.replace(
  "fetch('/api/mutate', { method: 'POST', body: JSON.stringify(mutations) });",
  "invoke('mutate_db', { mutations }).then(fetchDb).catch(console.error);"
);

code = code.replace(
  "fetch('/api/mutate', { method: 'POST', body: JSON.stringify(mutations) });",
  "invoke('mutate_db', { mutations }).then(fetchDb).catch(console.error);"
);

code = code.replace(
  "fetch('/api/mutate', { method: 'POST', body: JSON.stringify([\n      { action: 'updateSettings', collection: 'settings', id: null, data: { zones: zones.filter(x => x !== z) } },\n      { action: 'deleteMany', collection: 'tables', id: null, data: { field: 'zone', value: z } }\n    ]) });",
  "invoke('mutate_db', { mutations: [\n      { action: 'updateSettings', collection: 'settings', id: null, data: { zones: zones.filter(x => x !== z) } },\n      { action: 'deleteMany', collection: 'tables', id: null, data: { field: 'zone', value: z } }\n    ] }).then(fetchDb).catch(console.error);"
);

fs.writeFileSync('adisyon-app/src/App.jsx', code);
console.log("App.jsx fetch to invoke fixed.");
