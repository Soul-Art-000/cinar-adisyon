sed -i '' -e 's|let status = Command::new("/usr/bin/lpr")|let lpr_cmd = format!("/usr/bin/lpr -P \\"{}\\" -l \\"{}\\"", printer_name, file_path.display());\
        let status = Command::new("sh")\
            .arg("-c")\
            .arg(\&lpr_cmd)|g' adisyon-app/src-tauri/src/printer.rs
sed -i '' -e '/\.arg("-P")/d' adisyon-app/src-tauri/src/printer.rs
sed -i '' -e '/\.arg(&printer_name)/d' adisyon-app/src-tauri/src/printer.rs
sed -i '' -e '/\.arg("-l")/d' adisyon-app/src-tauri/src/printer.rs
sed -i '' -e '/\.arg(&file_path)/d' adisyon-app/src-tauri/src/printer.rs
