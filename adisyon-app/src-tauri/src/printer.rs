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
                    printers.push(printer.to_string());
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
    
    // ESC/POS raw bytes preparation
    let mut raw_data = Vec::new();
    
    // Initialize printer (ESC @)
    raw_data.extend_from_slice(&[0x1B, 0x40]);
    
    // Convert text to UTF-8 or ASCII (Thermal printers usually use specific codepages, 
    // but for simple text standard bytes often work if Turkish characters are mapped or avoided, 
    // or we just send UTF-8 if the printer supports it)
    
    // Align center for title
    raw_data.extend_from_slice(&[0x1B, 0x61, 0x01]);
    raw_data.extend_from_slice(b"CINAR ADISYON\n\n");
    
    // Align left for body
    raw_data.extend_from_slice(&[0x1B, 0x61, 0x00]);
    raw_data.extend_from_slice(receipt_text.as_bytes());
    raw_data.extend_from_slice(b"\n\n");
    
    // Cut paper (GS V 0)
    raw_data.extend_from_slice(&[0x1D, 0x56, 0x00]);
    
    // Write to temp file
    let temp_dir = std::env::temp_dir();
    let file_path = temp_dir.join("receipt.bin");
    let mut file = File::create(&file_path).map_err(|e| e.to_string())?;
    file.write_all(&raw_data).map_err(|e| e.to_string())?;
    
    // Send to printer
    #[cfg(target_os = "macos")]
    {
        let lpr_cmd = format!("/usr/bin/lpr -P \"{}\" -l \"{}\"", printer_name, file_path.display());
        let status = Command::new("sh")
            .arg("-c")
            .arg(&lpr_cmd)
            .status()
            .map_err(|e| e.to_string())?;
            
        if !status.success() {
            return Err("Yazdırma işlemi başarısız oldu (lpr hatası)".to_string());
        }
    }
    
    #[cfg(target_os = "windows")]
    {
        // For Windows, printing raw bytes usually requires a special tool or sharing the printer 
        // and copying to the UNC path: copy receipt.bin \\localhost\PrinterName
        let status = Command::new("cmd")
            .args(&["/C", "copy", "/B", file_path.to_str().unwrap(), &format!("\\\\localhost\\{}", printer_name)])
            .status()
            .map_err(|e| e.to_string())?;
            
        if !status.success() {
            return Err("Yazdırma işlemi başarısız oldu (Windows Copy hatası)".to_string());
        }
    }

    Ok(())
}
