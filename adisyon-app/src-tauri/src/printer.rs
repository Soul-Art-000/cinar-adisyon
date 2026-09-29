use std::process::Command;

#[tauri::command]
pub fn get_printers() -> Result<Vec<String>, String> {
    let mut printers = Vec::new();
    
    #[cfg(target_os = "macos")]
    {
        if let Ok(output) = Command::new("/usr/bin/lpstat").arg("-a").output() {
            let out_str = String::from_utf8_lossy(&output.stdout);
            for line in out_str.lines() {
                if let Some(printer) = line.split_whitespace().next() {
                    // lpstat -a format: "ACLAS_PP7_M3, accepting requests since..."
                    // The comma is NOT whitespace, so we must strip it explicitly.
                    let clean = printer.trim_matches(',').trim().to_string();
                    if !clean.is_empty() { printers.push(clean); }
                }
            }
        }
    }
    
    #[cfg(target_os = "windows")]
    {
        if let Ok(output) = Command::new("powershell")
            .args(&["-Command", "Get-Printer | Select-Object -ExpandProperty Name"])
            .output()
        {
            let out_str = String::from_utf8_lossy(&output.stdout);
            for line in out_str.lines() {
                let p = line.trim();
                if !p.is_empty() {
                    printers.push(p.to_string());
                }
            }
        }
    }
    
    Ok(printers)
}

#[tauri::command]
pub fn print_receipt(printer_name: String, receipt_text: String) -> Result<(), String> {
    use std::fs::File;
    use std::io::Write;

    // Debug log — writes to /tmp/adisyon_debug.log so we can see exactly what's happening
    let log_path = "/tmp/adisyon_debug.log";
    let _ = std::fs::write(
        log_path,
        format!("printer_name bytes: {:?}\nprinter_name: '{}'\n", printer_name.as_bytes(), printer_name),
    );

    // ESC/POS raw bytes
    let mut raw_data = Vec::new();
    raw_data.extend_from_slice(&[0x1B, 0x40]);          // ESC @ — init
    raw_data.extend_from_slice(&[0x1B, 0x61, 0x01]);    // center
    raw_data.extend_from_slice(b"CINAR ADISYON\n\n");
    raw_data.extend_from_slice(&[0x1B, 0x61, 0x00]);    // left
    raw_data.extend_from_slice(receipt_text.as_bytes());
    raw_data.extend_from_slice(b"\n\n");
    raw_data.extend_from_slice(&[0x1D, 0x56, 0x00]);    // GS V — cut

    let file_path = std::path::PathBuf::from("/tmp/adisyon_receipt.bin");
    let mut file = File::create(&file_path).map_err(|e| e.to_string())?;
    file.write_all(&raw_data).map_err(|e| e.to_string())?;
    file.flush().map_err(|e| e.to_string())?;
    drop(file);

    #[cfg(target_os = "macos")]
    {
        use std::os::unix::fs::PermissionsExt;
        let _ = std::fs::set_permissions(&file_path, std::fs::Permissions::from_mode(0o666));

        let clean_name = printer_name.trim().trim_matches(',').trim().to_string();

        let output = Command::new("/usr/bin/lpr")
            .arg("-P")
            .arg(&clean_name)
            .arg(&file_path)
            .output()
            .map_err(|e| e.to_string())?;

        // Append result to debug log
        let _ = std::fs::write(
            log_path,
            format!(
                "printer_name bytes: {:?}\nprinter_name: '{}'\nclean_name: '{}'\nstatus: {}\nstdout: {}\nstderr: {}\n",
                printer_name.as_bytes(),
                printer_name,
                clean_name,
                output.status,
                String::from_utf8_lossy(&output.stdout),
                String::from_utf8_lossy(&output.stderr),
            ),
        );

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            let stdout = String::from_utf8_lossy(&output.stdout);
            return Err(format!("LPR Hatası (yazıcı: '{}'): stderr={} stdout={}", clean_name, stderr.trim(), stdout.trim()));
        }
    }

    #[cfg(target_os = "windows")]
    {
        let printer_unc = format!("\\\\localhost\\{}", printer_name.trim());
        let status = Command::new("cmd")
            .args(&["/C", "copy", "/B", file_path.to_str().ok_or("Invalid path")?, &printer_unc])
            .status()
            .map_err(|e| e.to_string())?;
        if !status.success() {
            return Err("Windows yazdırma başarısız oldu".to_string());
        }
    }

    Ok(())
}
