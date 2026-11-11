import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/components/SettingsAdmin.jsx', 'utf8');

const ipUI = `      {localIp && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 shadow-sm mb-6">
          <h3 className="text-sm font-bold text-blue-800 uppercase mb-2 flex items-center gap-2">📱 Garson Bağlantı Adresi (Yerel Ağ)</h3>
          <p className="text-gray-600 text-sm mb-4">Garsonların telefonlarından sipariş girmek için aynı WiFi ağına bağlanıp aşağıdaki adrese girmeleri yeterlidir:</p>
          <div className="bg-white rounded-lg p-3 border border-blue-100 flex items-center justify-between">
            <span className="font-mono font-bold text-lg text-blue-600">http://{localIp}:3001</span>
            <button onClick={() => alert('Telefon tarayıcısına bu adresi tam olarak yazın.')} className="px-4 py-2 bg-blue-100 text-blue-700 font-bold rounded-lg text-sm hover:bg-blue-200 transition-colors">Bilgi</button>
          </div>
        </div>
      )}`;

code = code.replace(
  '<div className="grid grid-cols-1 md:grid-cols-2 gap-6">',
  ipUI + '\n      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">'
);

fs.writeFileSync('adisyon-app/src/components/SettingsAdmin.jsx', code);
console.log("Settings IP UI injected successfully.");
