import fs from 'fs';
let pkg = JSON.parse(fs.readFileSync('adisyon-app/package.json', 'utf8'));

if(!pkg.scripts) pkg.scripts = {};
pkg.scripts.tauri = "tauri";

fs.writeFileSync('adisyon-app/package.json', JSON.stringify(pkg, null, 2));
console.log("Added tauri script to package.json");
