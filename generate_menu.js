const raw = `
1,Gıda,Köfte,Köfte Porsiyon,240
2,Gıda,Köfte,Köfte Ekmek-Dürüm,160
3,Gıda,Döner,Cağ Döner (1kg),1600
4,Gıda,Döner,Cağ Döner Porsiyon,240
5,Gıda,Döner,Cağ Döner (2 şiş cağ),280
6,Gıda,Döner,Et Döner (1kg),1750
7,Gıda,Döner,Et Döner Porsiyon,220
8,Gıda,Döner,Et Döner Ekmek-Dürüm,175
9,Gıda,Döner,Tavuk Döner (porsiyon),190
10,Gıda,Döner,Tavuk Döner (kg),1100
11,Gıda,Döner,Tavuk Döner Ekmek-Dürüm,160
12,Gıda,Kebap,Tavuk Şiş Porsiyon,210
13,Gıda,Kebap,Tavuk Şiş Dürüm,200
14,Gıda,Kebap,Adana Şiş Porsiyon,260
15,Gıda,Kebap,Adana Şiş Dürüm,270
16,Gıda,Kebap,Kuzu Şiş,300
17,Gıda,Kebap,Kuzu Pirzola,380
18,Gıda,Kebap,Tavuk Kanat,200
19,Gıda,Kebap,Tavuk Pirzola,220
20,Gıda,Kebap,Kuzu Beyti,380
21,Gıda,Döner,İskender,350
22,Gıda,Pide,Pideli Köfte,300
23,Gıda,Tantuni,Tantuni Tavuk,160
24,Gıda,Tatlı,Baklava Porsiyon,100
25,Gıda,Tatlı,Baklava (1kg),450
26,Gıda,Mantı,Mantı Porsiyon,150
27,Gıda,Mantı,Mantı (1kg),360
28,Gıda,Sarma,Sarma Porsiyon,80
29,Gıda,Sarma,Sarma (1kg),340
30,Gıda,Gözleme,Gözleme,80
31,Gıda,İçli Köfte,İçli Köfte,70
32,Gıda,Çiğköfte,Çiğ Köfte (1kg),350
33,Gıda,Çiğköfte,Çiğ Köfte Porsiyon,100
34,Gıda,Çiğköfte,Çiğ Köfte Beyti Sarma,110
35,Gıda,Çiğköfte,Çiğ Köfte Dürüm,60
36,Gıda,İçecek,Ayran (1 Litre),80
37,Gıda,İçecek,Ayran 250 cc,30
38,Gıda,İçecek,Limonata (1 Litre),80
39,Gıda,İçecek,Limonata 250 cc,35
40,Gıda,İçecek,Osmanlı Şerbeti (1 Litre),80
41,Gıda,İçecek,Osmanlı Şerbeti 250 cc,35
42,Gıda,Pide,Pide Kıymalı,180
43,Gıda,Pide,Pide Kaşarlı,180
44,Gıda,Pide,Pide Kuşbaşı,210
45,Gıda,Pide,Pide Kaşar-Kıyma,190
46,Gıda,Pide,Pide Kaşar-Kuşbaşı,210
47,Gıda,Pide,Pide Sucuklu,210
48,Gıda,Pide,Kümbet Pide,230
49,Gıda,Lahmacun,Lahmacun,90
50,Gıda,Pizza,Pizza Orta (Vejeteryan),180
51,Gıda,Pizza,Pizza Orta (Karışık),230
52,Gıda,Pizza,Pizza Büyük (Vejeteryan),190
53,Gıda,Pizza,Pizza Büyük (Karışık),260
54,Gıda,Fast Food,Kumru,170
55,Gıda,Tavuk Fc,Finger Menü,220
56,Gıda,Tavuk Fc,Special Karışık Menü,240
57,Gıda,Tavuk Fc,Mega Kova Menü,540
58,Gıda,Çorba,Etli Çorba,180
59,Gıda,Çorba,Tavuk Çorba,150
60,Gıda,Çorba,Diğer Çorba,120
`;

const lines = raw.trim().split('\n');
const products = [];
const categories = new Set();

const colors = [
  'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
  'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
  'bg-orange-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-rose-500'
];

const catColorMap = {};
let colorIdx = 0;

lines.forEach(line => {
  const [id, gida, cat, name, price] = line.split(',');
  const category = cat.trim().toUpperCase();
  categories.add(category);
  
  if (!catColorMap[category]) {
    catColorMap[category] = colors[colorIdx % colors.length];
    colorIdx++;
  }
  
  products.push({
    id: "p_" + Date.now() + Math.random().toString(36).substr(2, 5),
    name: name.trim(),
    category: category,
    price: parseInt(price),
    color: catColorMap[category]
  });
});

const config = {
  settings: {
    zones: ["BAHÇE", "SALON", "TERAS"],
    categories: Array.from(categories)
  },
  products: products,
  tables: [],
  orders: [],
  sales: [],
  veresiye: []
};

const fs = require('fs');
fs.writeFileSync('kermes_config.json', JSON.stringify(config, null, 2));
console.log("JSON generated to kermes_config.json");
