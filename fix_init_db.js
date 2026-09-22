import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src-tauri/src/lib.rs', 'utf8');

// Find init_db function and remove it
const startIdx = code.indexOf('fn init_db(app: &mut tauri::App) -> AppState {');
if (startIdx !== -1) {
    let endIdx = code.indexOf('}', code.indexOf('AppState {', startIdx)) + 1;
    // Wait, let's just use regex or split to delete the function
}

// Easier: just replace Mutex::new(parsed_db) with std::sync::Arc::new(std::sync::Mutex::new(parsed_db)) to satisfy the compiler
code = code.replace(
  'db_cache: Mutex::new(parsed_db),',
  'db_cache: std::sync::Arc::new(std::sync::Mutex::new(parsed_db)),'
);

fs.writeFileSync('adisyon-app/src-tauri/src/lib.rs', code);
console.log("lib.rs init_db patched.");
