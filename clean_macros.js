import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src-tauri/src/lib.rs', 'utf8');

code = code.replace(
  '#[cfg_attr(mobile, tauri::mobile_entry_point)]\n#[tauri::command]\nfn get_hostname',
  '#[tauri::command]\nfn get_hostname'
);

fs.writeFileSync('adisyon-app/src-tauri/src/lib.rs', code);
console.log("Cleaned macros.");
