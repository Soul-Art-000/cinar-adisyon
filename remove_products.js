const fs = require('fs');
const path = '/Users/muhammedsalihbayrak/.gemini/antigravity/brain/11b6a358-50c6-4770-b21a-f4958296df53/kermes_tavan_fiyatlar.json';
let data = JSON.parse(fs.readFileSync(path, 'utf8'));

const keywordsToRemove = ['Kumru', 'Finger Menü', 'Special Karışık Menü', 'Mega Kova Menü', 'İskender', 'Pizza'];

const originalLength = data.products.length;

data.products = data.products.filter(p => {
  // If the product name includes any of the keywords, remove it.
  for (let keyword of keywordsToRemove) {
    if (p.name.includes(keyword)) {
      return false; // exclude
    }
  }
  return true; // include
});

const newLength = data.products.length;

// Recompute categories based on remaining products
const newCategories = new Set();
data.products.forEach(p => newCategories.add(p.category));
data.settings.categories = Array.from(newCategories);

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log(`Removed ${originalLength - newLength} products. Categories updated.`);
