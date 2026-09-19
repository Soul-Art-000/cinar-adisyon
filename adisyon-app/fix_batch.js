import fs from 'fs';

let code = fs.readFileSync('src/App.jsx', 'utf8');

// Fix handleAddZone
const oldAddZone = `    newTables.forEach(t => mutate('add', 'tables', null, t));`;
const newAddZone = `    const mutations = newTables.map(t => ({ action: 'add', collection: 'tables', id: null, data: t }));
    fetch('/api/mutate', { method: 'POST', body: JSON.stringify(mutations) });`;

if (code.includes(oldAddZone)) {
  code = code.replace(oldAddZone, newAddZone);
}

// Fix mutate function to allow optional batching? No, mutate is just a helper.
// Any other loops?
const oldDeleteZone = `    mutate('updateSettings', 'settings', null, { zones: zones.filter(x => x !== z) });
    mutate('deleteMany', 'tables', null, { field: 'zone', value: z });`;
const newDeleteZone = `    fetch('/api/mutate', { method: 'POST', body: JSON.stringify([
      { action: 'updateSettings', collection: 'settings', id: null, data: { zones: zones.filter(x => x !== z) } },
      { action: 'deleteMany', collection: 'tables', id: null, data: { field: 'zone', value: z } }
    ]) });`;

if (code.includes(oldDeleteZone)) {
  code = code.replace(oldDeleteZone, newDeleteZone);
}

fs.writeFileSync('src/App.jsx', code);
console.log("Fixed batching");
