import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/App.jsx', 'utf8');

// Add invoke import
code = "import { invoke } from '@tauri-apps/api/core';\n" + code;

// Replace fetchDb
const oldFetchDb = `const res = await fetch('/api/db?t=' + Date.now());
      if (!res.ok) throw new Error('API Hatası');
      const db = await res.json();`;
const newFetchDb = `const db = await invoke('get_db');`;
code = code.replace(oldFetchDb, newFetchDb);

// Replace mutate
const oldMutate = `const mutate = (action, collection, id, data) => {
    fetch('/api/mutate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, collection, id, data })
    }).catch(console.error);
  };`;
const newMutate = `const mutate = async (action, collection, id, data) => {
    try {
      await invoke('mutate_db', { mutations: [{ action, collection, id, data }] });
      fetchDb(); // Hızlı senkronizasyon için
    } catch (e) {
      console.error(e);
    }
  };`;
code = code.replace(oldMutate, newMutate);

// We need to also patch the batch mutations in handleAddZone etc.
// In handleAddZone: 
// fetch('/api/mutate', { ... body: JSON.stringify([...mutations]) })
// Let's just use a regex or string replace for fetch('/api/mutate'
const oldBatch = `fetch('/api/mutate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mutations)
    }).catch(console.error);`;
const newBatch = `invoke('mutate_db', { mutations }).then(fetchDb).catch(console.error);`;
code = code.replace(oldBatch, newBatch); // For handleAddZone
code = code.replace(oldBatch, newBatch); // For handleDeleteZone
code = code.replace(oldBatch, newBatch); // For createOrder
code = code.replace(oldBatch, newBatch); // For handlePayAndClose

fs.writeFileSync('adisyon-app/src/App.jsx', code);
console.log("App.jsx updated for Tauri");
