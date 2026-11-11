const raw = `
1,Gıda,KÖFTE,Köfte Porsiyon,350
2,Gıda,KÖFTE,Köfte Ekmek-Dürüm,250
3,Gıda,DÖNER,Cağ Döner (1kg),2600
4,Gıda,DÖNER,Cağ Döner Porsiyon,350
5,Gıda,DÖNER,Cağ Döner (2 şiş),380
6,Gıda,DÖNER,Et Döner (1kg),2600
7,Gıda,DÖNER,Et Döner Porsiyon,350
8,Gıda,DÖNER,Et Döner Ekmek-Dürüm,250
9,Gıda,DÖNER,Tavuk Döner (porsiyon),250
10,Gıda,DÖNER,Tavuk Döner (kg),1900
11,Gıda,DÖNER,Tavuk Döner Ekmek-Dürüm,220
12,Gıda,KEBAP,Tavuk Şiş Porsiyon,280
13,Gıda,KEBAP,Tavuk Şiş Dürüm,230
14,Gıda,KEBAP,Adana Şiş Porsiyon,350
15,Gıda,KEBAP,Adana Şiş Dürüm,330
16,Gıda,KEBAP,Kuzu Şiş,400
17,Gıda,KEBAP,Kuzu Pirzola,520
18,Gıda,KEBAP,Tavuk Kanat,300
19,Gıda,KEBAP,Tavuk Pirzola,320
20,Gıda,KEBAP,Kuzu Beyti,520
21,Gıda,DÖNER,İskender,500
22,Gıda,PİDE,Pideli Köfte,420
23,Gıda,TANTUNİ,Tantuni Tavuk,220
24,Gıda,TATLI,Baklava Porsiyon,140
25,Gıda,TATLI,Baklava (1kg),700
26,Gıda,MANTI,Mantı Porsiyon,220
27,Gıda,MANTI,Mantı (1kg),500
28,Gıda,SARMA,Sarma Porsiyon,120
29,Gıda,SARMA,Sarma (1kg),500
30,Gıda,GÖZLEME,Gözleme,100
31,Gıda,İÇLİ KÖFTE,İçli Köfte,120
32,Gıda,ÇİĞKÖFTE,Çiğ Köfte (1kg),370
33,Gıda,ÇİĞKÖFTE,Çiğ Köfte Porsiyon,150
34,Gıda,ÇİĞKÖFTE,Çiğ Köfte Beyti Sarma,150
35,Gıda,ÇİĞKÖFTE,Çiğ Köfte Dürüm,120
36,Gıda,İÇECEK,Ayran (1 Litre),100
37,Gıda,İÇECEK,Ayran 250 cc,30
38,Gıda,İÇECEK,Limonata (1 Litre),120
39,Gıda,İÇECEK,Limonata 250 cc,35
40,Gıda,İÇECEK,Osmanlı Şerbeti (1 Litre),120
41,Gıda,İÇECEK,Osmanlı Şerbeti 250 cc,35
42,Gıda,PİDE,Pide Kıymalı,280
43,Gıda,PİDE,Pide Kaşarlı,280
44,Gıda,PİDE,Pide Kuşbaşı,320
45,Gıda,PİDE,Pide Kaşar-Kıyma,300
46,Gıda,PİDE,Pide Kaşar-Kuşbaşı,340
47,Gıda,PİDE,Pide Sucuklu,320
48,Gıda,PİDE,Kümbet Pide,350
49,Gıda,LAHMACUN,Lahmacun,110
50,Gıda,PİZZA,Pizza Orta (Vejeteryan),200
51,Gıda,PİZZA,Pizza Orta (Karışık),250
52,Gıda,PİZZA,Pizza Büyük (Vejeteryan),250
53,Gıda,PİZZA,Pizza Büyük (Karışık),270
54,Gıda,FAST FOOD,Kumru,250
55,Gıda,TAVUK FC,Finger Menü,300
56,Gıda,TAVUK FC,Special Karışık Menü,320
57,Gıda,TAVUK FC,Mega Kova Menü,560
58,Gıda,ÇORBA,Etli Çorba,180
59,Gıda,ÇORBA,Tavuk Çorba,150
60,Gıda,ÇORBA,Diğer Çorba,120
`;

const lines = raw.trim().split('\n');
const products = [];
const categories = new Set();

const catColorMap = {
  "KÖFTE": "bg-red-500",
  "DÖNER": "bg-blue-500",
  "KEBAP": "bg-green-500",
  "PİDE": "bg-yellow-500",
  "TANTUNİ": "bg-purple-500",
  "TATLI": "bg-pink-500",
  "MANTI": "bg-indigo-500",
  "SARMA": "bg-teal-500",
  "GÖZLEME": "bg-orange-500",
  "İÇLİ KÖFTE": "bg-cyan-500",
  "ÇİĞKÖFTE": "bg-emerald-500",
  "İÇECEK": "bg-rose-500",
  "LAHMACUN": "bg-red-500",
  "PİZZA": "bg-blue-500",
  "FAST FOOD": "bg-green-500",
  "TAVUK FC": "bg-yellow-500",
  "ÇORBA": "bg-purple-500"
};

lines.forEach(line => {
  const [id, gida, category, name, price] = line.split(',');
  categories.add(category);
  
  products.push({
    id: "p_" + Date.now() + Math.random().toString(36).substr(2, 5),
    name: name.trim(),
    category: category,
    price: parseInt(price),
    color: catColorMap[category] || "bg-gray-500"
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
fs.writeFileSync('kermes_config_2026.json', JSON.stringify(config, null, 2));
console.log("JSON generated to kermes_config_2026.json");
