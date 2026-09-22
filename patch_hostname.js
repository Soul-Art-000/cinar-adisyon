import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src-tauri/src/lib.rs', 'utf8');

const getHostnameCmd = `#[tauri::command]
fn get_hostname() -> Result<String, String> {
    Ok(hostname::get()
        .unwrap_or_else(|_| std::ffi::OsString::from("Kasa-PC"))
        .into_string()
        .unwrap_or_else(|_| "Kasa-PC".to_string()))
}`;

code = code.replace(
  'fn get_local_ip() -> Result<String, String> {',
  `${getHostnameCmd}\n\n#[tauri::command]\nfn get_local_ip() -> Result<String, String> {`
);

code = code.replace(
  'get_local_ip]',
  'get_local_ip, get_hostname]'
);

fs.writeFileSync('adisyon-app/src-tauri/src/lib.rs', code);
console.log("lib.rs patched for get_hostname.");
