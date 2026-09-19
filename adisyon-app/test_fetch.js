const mutations = [{
  action: 'add',
  collection: 'products',
  id: null,
  data: { id: 'fetch-test', name: 'Fetch Test' }
}];

fetch('http://127.0.0.1:3001/api/mutate', {
  method: 'POST',
  body: JSON.stringify(mutations)
}).then(r => r.json()).then(console.log).catch(console.error);
