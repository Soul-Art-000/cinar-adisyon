import fs from 'fs';

// 1. Rename in tauri.conf.json
let tauriConfPath = 'adisyon-app/src-tauri/tauri.conf.json';
let tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf8'));
tauriConf.productName = "local-adisyon";
tauriConf.identifier = "com.local.adisyon";
fs.writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2));

// 2. Rename in package.json
let pkgPath = 'adisyon-app/package.json';
let pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.name = "local-adisyon";
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

// 3. Rename in index.html
let htmlPath = 'adisyon-app/index.html';
let html = fs.readFileSync(htmlPath, 'utf8');
html = html.replace(/<title>.*?<\/title>/, '<title>Local Adisyon</title>');
fs.writeFileSync(htmlPath, html);

// 4. Rename in App.jsx (Settings Print Test string & maybe Sidebar)
let appPath = 'adisyon-app/src/components/SettingsAdmin.jsx';
let appCode = fs.readFileSync(appPath, 'utf8');
appCode = appCode.replace(/CINAR ADISYON/g, 'LOCAL ADISYON');
fs.writeFileSync(appPath, appCode);

console.log("Renamed to local-adisyon");
