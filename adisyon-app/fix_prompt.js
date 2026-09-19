import fs from 'fs';

let code = fs.readFileSync('src/components/ProductsAdmin.jsx', 'utf8');

const oldPrompt = /\`Aşağıdaki JSON formatına uygun(.*?)Sadece bu JSON array'ini döndür, başka hiçbir yazı ekleme.\`/s;

const newPrompt = `\`Aşağıdaki JSON formatına uygun bir şekilde, bir kafede/lokantada satılabilecek ürün listesi hazırla. "category" alanları öncelikle şunlardan biri olmalı: \${categories.join(', ')}. Eğer ürün bu kategorilerden hiçbirine uymuyorsa, mantıklı yeni bir kategori adı yazabilirsin (Sistem otomatik oluşturacaktır). "color" alanları şunlardan biri olmalı: \${colors.slice(0,8).join(', ')}. "unit" alanı "adet" veya "kg" olmalıdır. Fiyatlar "price" olarak sayı olmalıdır.\\nÖrnek format:\\n[\\n  { "name": "Mercimek Çorbası", "price": 80, "color": "bg-orange-500", "category": "\${categories[0] || 'YİYECEKLER'}", "unit": "adet" },\\n  { "name": "Fıstıklı Baklava", "price": 450, "color": "bg-green-500", "category": "\${categories[1] || 'TATLI'}", "unit": "kg" }\\n]\\nSadece bu JSON array'ini döndür, başka hiçbir yazı ekleme.\``;

code = code.replace(oldPrompt, newPrompt);
fs.writeFileSync('src/components/ProductsAdmin.jsx', code);
