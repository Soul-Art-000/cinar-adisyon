import fs from 'fs';

let code = fs.readFileSync('src/App.jsx', 'utf8');

const oldFunc = `  const handleAddMultipleProducts = (newItems) => {
    const withIds = newItems.map(p => ({ id: uid(), ...p }));
    setProducts(prev => [...prev, ...withIds]);
    const mutations = withIds.map(p => ({ action: 'add', collection: 'products', id: null, data: p }));
    fetch('/api/mutate', { method: 'POST', body: JSON.stringify(mutations) });
  };`;

const newFunc = `  const handleAddMultipleProducts = (newItems) => {
    const newCategories = [];
    newItems.forEach(item => {
      const cat = typeof item.category === 'string' ? item.category.toUpperCase() : 'DİĞER';
      item.category = cat;
      if (!categories.includes(cat) && !newCategories.includes(cat)) {
        newCategories.push(cat);
      }
    });

    if (newCategories.length > 0) {
      const updatedCategories = [...categories, ...newCategories];
      setCategories(updatedCategories);
      mutate('updateSettings', 'settings', null, { categories: updatedCategories });
    }

    const withIds = newItems.map(p => ({ id: uid(), ...p }));
    setProducts(prev => [...prev, ...withIds]);
    const mutations = withIds.map(p => ({ action: 'add', collection: 'products', id: null, data: p }));
    fetch('/api/mutate', { method: 'POST', body: JSON.stringify(mutations) });
  };`;

if (code.includes(oldFunc)) {
  code = code.replace(oldFunc, newFunc);
  fs.writeFileSync('src/App.jsx', code);
  console.log('Fixed handleAddMultipleProducts');
} else {
  console.log('Could not find handleAddMultipleProducts');
}
