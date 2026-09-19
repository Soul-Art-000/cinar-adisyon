const mutations = [{
  action: 'add',
  collection: 'products',
  id: null,
  data: { id: 'proxy-test', name: 'Proxy Test' }
}];

fetch('http://127.0.0.1:5173/api/mutate', {
  method: 'POST',
  body: JSON.stringify(mutations)
}).then(r => r.json()).then(console.log).catch(console.error);
