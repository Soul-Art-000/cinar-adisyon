import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src-tauri/src/printer.rs', 'utf8');

code = code.replace(
  'let status = Command::new("/usr/bin/lpr")\\n            .arg("-P")\\n            .arg(&printer_name)\\n            .arg("-l") // raw mode\\n            .arg(&file_path)\\n            .status()\\n            .map_err(|e| e.to_string())?;',
  \`let lpr_cmd = format!("/usr/bin/lpr -P '{}' -l '{}'", printer_name, file_path.display());
        let status = Command::new("sh")
            .arg("-c")
            .arg(&lpr_cmd)
            .status()
            .map_err(|e| e.to_string())?;\`
);

fs.writeFileSync('adisyon-app/src-tauri/src/printer.rs', code);
console.log("printer.rs lpr command patched to use sh -c");
