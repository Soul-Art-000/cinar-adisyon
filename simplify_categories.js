const fs = require('fs');

const path = '/Users/muhammedsalihbayrak/.gemini/antigravity/brain/11b6a358-50c6-4770-b21a-f4958296df53/kermes_tavan_fiyatlar.json';
let data = JSON.parse(fs.readFileSync(path, 'utf8'));

const categoryMap = {
  "KÖFTE": "IZGARA & KEBAP",
  "KEBAP": "IZGARA & KEBAP",
  "DÖNER": "DÖNER & TANTUNİ",
  "TANTUNİ": "DÖNER & TANTUNİ",
  "PİDE": "FIRIN & PİDE",
  "LAHMACUN": "FIRIN & PİDE",
  "PİZZA": "FIRIN & PİDE",
  "FAST FOOD": "FAST FOOD",
  "TAVUK FC": "FAST FOOD",
  "ÇİĞKÖFTE": "ÇİĞKÖFTE",
  "MANTI": "YÖRESEL & APARATİF",
  "SARMA": "YÖRESEL & APARATİF",
  "GÖZLEME": "YÖRESEL & APARATİF",
  "İÇLİ KÖFTE": "YÖRESEL & APARATİF",
  "ÇORBA": "ÇORBALAR",
  "TATLI": "TATLILAR",
  "İÇECEK": "İÇECEKLER"
};

const colorMap = {
  "IZGARA & KEBAP": "bg-red-600",
  "DÖNER & TANTUNİ": "bg-orange-500",
  "FIRIN & PİDE": "bg-yellow-600",
  "FAST FOOD": "bg-yellow-400",
  "ÇİĞKÖFTE": "bg-emerald-500",
  "YÖRESEL & APARATİF": "bg-green-600",
  "ÇORBALAR": "bg-teal-500",
  "TATLILAR": "bg-pink-500",
  "İÇECEKLER": "bg-blue-500"
};

const newCategories = new Set();

data.products.forEach(p => {
  const newCat = categoryMap[p.category] || p.category;
  p.category = newCat;
  p.color = colorMap[newCat] || "bg-gray-500";
  newCategories.add(newCat);
});

data.settings.categories = Array.from(newCategories);

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log("Categories simplified successfully.");
