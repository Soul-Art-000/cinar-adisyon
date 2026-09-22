import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/components/SettingsAdmin.jsx', 'utf8');

// Find the start of the bad block
const startIdx = code.indexOf('<h1 className="text-2xl font-bold text-gray-800 mb-6">Sistem Ayarları</h1>');
const endIdx = code.indexOf('<div className="grid grid-cols-1 md:grid-cols-2 gap-6">');

const fixedBlock = `<h1 className="text-2xl font-bold text-gray-800 mb-6">Sistem Ayarları</h1>
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 shadow-sm mb-6">
        <h3 className="text-sm font-bold text-blue-800 uppercase mb-2 flex items-center gap-2">📱 Garson Bağlantı Adresi (Hiç Değişmez)</h3>
        <p className="text-gray-600 text-sm mb-4">Garsonların telefonlarından sipariş girmek için aynı WiFi ağına bağlanıp Safari'de aşağıdaki adrese girmeleri yeterlidir:</p>
        <div className="bg-white rounded-lg p-3 border border-blue-100 flex items-center justify-between mb-3">
          <span className="font-mono font-bold text-lg text-blue-600">http://{hostname}:3001</span>
          <button onClick={() => alert('Bu adresi telefonda açtıktan sonra Safari alt menüsünden \\n"Ana Ekrana Ekle"ye basarsanız, normal bir Uygulama gibi kalıcı olarak yüklenir!\\nBöylece garsonlar IP adresi değişse bile uygulamaya hep girebilir.')} className="px-4 py-2 bg-blue-100 text-blue-700 font-bold rounded-lg text-sm hover:bg-blue-200 transition-colors">📱 Nasıl Yüklenir?</button>
        </div>
        <p className="text-xs text-blue-500 font-medium">💡 Modemin IP adresini değiştirmesinden etkilenmez. Hep sabit kalır!</p>
      </div>
      `;

code = code.substring(0, startIdx) + fixedBlock + code.substring(endIdx);
fs.writeFileSync('adisyon-app/src/components/SettingsAdmin.jsx', code);
console.log("Syntax fixed.");
