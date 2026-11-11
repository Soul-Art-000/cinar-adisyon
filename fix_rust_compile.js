import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src-tauri/src/lib.rs', 'utf8');

// The file currently has:
// #[tauri::command]
// #[tauri::command]
// fn get_hostname() ...
//
// #[tauri::command]
// fn get_local_ip() ...

code = code.replace('#[tauri::command]\n#[tauri::command]\nfn get_hostname', '#[tauri::command]\nfn get_hostname');

fs.writeFileSync('adisyon-app/src-tauri/src/lib.rs', code);
console.log("Fixed double tauri command macro.");
