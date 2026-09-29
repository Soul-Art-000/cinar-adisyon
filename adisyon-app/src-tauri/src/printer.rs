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
                if !p.is_empty() { printers.push(p.to_string()); }
            }
        }
    }

    Ok(printers)
}

#[tauri::command]
pub fn print_receipt(printer_name: String, receipt_text: String) -> Result<(), String> {
    use std::fs::File;
    use std::io::Write;

    // Build ESC/POS byte stream
    let mut raw_data = Vec::new();
    raw_data.extend_from_slice(&[0x1B, 0x40]);       // ESC @ — reset printer
    raw_data.extend_from_slice(receipt_text.as_bytes());
    raw_data.extend_from_slice(b"\n\n");
    raw_data.extend_from_slice(&[0x1D, 0x56, 0x00]); // GS V — full cut

    #[cfg(target_os = "macos")]
    {
        let file_path = std::path::PathBuf::from("/tmp/adisyon_receipt.bin");
        let mut file = File::create(&file_path).map_err(|e| e.to_string())?;
        file.write_all(&raw_data).map_err(|e| e.to_string())?;
        file.flush().map_err(|e| e.to_string())?;
        drop(file);

        // Make world-readable so the CUPS daemon (different user) can read it
        use std::os::unix::fs::PermissionsExt;
        let _ = std::fs::set_permissions(&file_path, std::fs::Permissions::from_mode(0o666));

        let clean_name = printer_name.trim().trim_matches(',').trim().to_string();

        let output = Command::new("/usr/bin/lpr")
            .arg("-P").arg(&clean_name)
            .arg(&file_path)
            .output()
            .map_err(|e| e.to_string())?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(format!("LPR Hatasi: {}", stderr.trim()));
        }
    }

    #[cfg(target_os = "windows")]
    {
        // Write raw bytes to Windows temp dir
        let file_path = std::path::PathBuf::from("C:\\Windows\\Temp\\adisyon_receipt.bin");
        let mut file = File::create(&file_path).map_err(|e| e.to_string())?;
        file.write_all(&raw_data).map_err(|e| e.to_string())?;
        file.flush().map_err(|e| e.to_string())?;
        drop(file);

        let clean_name = printer_name.trim().replace('"', "");
        let file_path_str = file_path.to_str().ok_or("Invalid path")?;

        // Use PowerShell + Win32 OpenPrinter to send raw ESC/POS bytes over USB
        let ps_script = format!(
            r#"Add-Type -TypeDefinition @"
using System;using System.Runtime.InteropServices;
public class RP{{
  [StructLayout(LayoutKind.Sequential,CharSet=CharSet.Unicode)]
  public struct DI{{public int cb;public string dn;public string of;public string dt;}}
  [DllImport("winspool.drv",CharSet=CharSet.Unicode)]public static extern bool OpenPrinter(string n,out IntPtr h,IntPtr d);
  [DllImport("winspool.drv")]public static extern bool ClosePrinter(IntPtr h);
  [DllImport("winspool.drv",CharSet=CharSet.Unicode)]public static extern int StartDocPrinter(IntPtr h,int l,ref DI di);
  [DllImport("winspool.drv")]public static extern bool EndDocPrinter(IntPtr h);
  [DllImport("winspool.drv")]public static extern bool StartPagePrinter(IntPtr h);
  [DllImport("winspool.drv")]public static extern bool EndPagePrinter(IntPtr h);
  [DllImport("winspool.drv")]public static extern bool WritePrinter(IntPtr h,IntPtr buf,int cb,out int wr);
}}
"@ 2>$null
$bytes=[System.IO.File]::ReadAllBytes("{fp}")
$h=[IntPtr]::Zero
[RP]::OpenPrinter("{pn}",[ref]$h,[IntPtr]::Zero)|Out-Null
$di=New-Object RP+DI;$di.cb=16;$di.dn="Receipt";$di.dt="RAW"
[RP]::StartDocPrinter($h,1,[ref]$di)|Out-Null
[RP]::StartPagePrinter($h)|Out-Null
$ptr=[System.Runtime.InteropServices.Marshal]::AllocHGlobal($bytes.Length)
[System.Runtime.InteropServices.Marshal]::Copy($bytes,0,$ptr,$bytes.Length)
$wr=0;[RP]::WritePrinter($h,$ptr,$bytes.Length,[ref]$wr)|Out-Null
[System.Runtime.InteropServices.Marshal]::FreeHGlobal($ptr)
[RP]::EndPagePrinter($h)|Out-Null
[RP]::EndDocPrinter($h)|Out-Null
[RP]::ClosePrinter($h)|Out-Null
"#,
            fp = file_path_str,
            pn = clean_name,
        );

        let ps_path = "C:\\Windows\\Temp\\adisyon_print.ps1";
        std::fs::write(ps_path, ps_script).map_err(|e| e.to_string())?;

        let output = Command::new("powershell")
            .args(&["-ExecutionPolicy", "Bypass", "-File", ps_path])
            .output()
            .map_err(|e| e.to_string())?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(format!("Windows yazici hatasi: {}", stderr.trim()));
        }
    }

    Ok(())
}
