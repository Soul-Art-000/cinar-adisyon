mod printer;
mod server;
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::Manager;
use serde_json::Value;

struct AppState {
    db_path: PathBuf,
    db_cache: std::sync::Arc<std::sync::Mutex<Value>>,
}

#[tauri::command]
fn get_db(state: tauri::State<AppState>) -> Result<Value, String> {
    let cache = state.db_cache.lock().unwrap();
    Ok(cache.clone())
}

#[tauri::command]
fn mutate_db(state: tauri::State<AppState>, mutations: Vec<Value>) -> Result<(), String> {
    let mut cache = state.db_cache.lock().unwrap();
    
    for m in mutations {
        let action = m["action"].as_str().unwrap_or("");
        let collection = m["collection"].as_str().unwrap_or("");
        let id = m["id"].as_str().unwrap_or("");
        let data = &m["data"];

        let obj = match cache.as_object_mut() {
            Some(o) => o,
            None => continue,
        };

        if action == "set" {
            obj.insert(collection.to_string(), data.clone());
        } else if action == "add" {
            if let Some(arr) = obj.get_mut(collection).and_then(|v| v.as_array_mut()) {
                arr.push(data.clone());
            }
        } else if action == "update" {
            if let Some(arr) = obj.get_mut(collection).and_then(|v| v.as_array_mut()) {
                for item in arr.iter_mut() {
                    if item["id"].as_str().unwrap_or("") == id {
                        if let (Some(item_obj), Some(new_data)) = (item.as_object_mut(), data.as_object()) {
                            for (k, v) in new_data {
                                item_obj.insert(k.clone(), v.clone());
                            }
                        }
                    }
                }
            }
        } else if action == "delete" {
            if let Some(arr) = obj.get_mut(collection).and_then(|v| v.as_array_mut()) {
                arr.retain(|x| x["id"].as_str().unwrap_or("") != id);
            }
        } else if action == "deleteMany" {
            let field = data["field"].as_str().unwrap_or("");
            let value = data["value"].as_str().unwrap_or("");
            if let Some(arr) = obj.get_mut(collection).and_then(|v| v.as_array_mut()) {
                arr.retain(|x| x[field].as_str().unwrap_or("") != value);
            }
        } else if action == "updateSettings" {
            if let Some(settings_obj) = obj.get_mut("settings").and_then(|v| v.as_object_mut()) {
                if let Some(new_data) = data.as_object() {
                    for (k, v) in new_data {
                        settings_obj.insert(k.clone(), v.clone());
                    }
                }
            }
        }
    }

    let json_str = serde_json::to_string_pretty(&*cache).map_err(|e| e.to_string())?;
    fs::write(&state.db_path, json_str).map_err(|e| e.to_string())?;
    
    Ok(())
}

fn init_db(app: &mut tauri::App) -> AppState {
    let app_dir = app.path().app_data_dir().unwrap();
    fs::create_dir_all(&app_dir).unwrap();
    let db_path = app_dir.join("database.json");

    let db_content = if db_path.exists() {
        fs::read_to_string(&db_path).unwrap_or_else(|_| "{}".to_string())
    } else {
        // Init default DB
        let default_db = r#"{
            "settings": { "zones": ["BAHÇE"], "categories": ["GIDA", "İÇECEKLER"] },
            "tables": [],
            "orders": [],
            "products": [],
            "sales": [],
            "veresiye": []
        }"#;
        fs::write(&db_path, default_db).unwrap();
        default_db.to_string()
    };

    let parsed_db: Value = serde_json::from_str(&db_content).unwrap_or_else(|_| serde_json::json!({}));
    
    AppState {
        db_path,
        db_cache: std::sync::Arc::new(std::sync::Mutex::new(parsed_db)),
    }
}

#[tauri::command]
fn get_hostname() -> Result<String, String> {
    Ok(hostname::get()
        .unwrap_or_else(|_| std::ffi::OsString::from("Kasa-PC"))
        .into_string()
        .unwrap_or_else(|_| "Kasa-PC".to_string()))
}

#[tauri::command]
fn get_local_ip() -> Result<String, String> {
    local_ip_address::local_ip()
        .map(|ip| ip.to_string())
        .map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let app_data_dir = app.path().app_data_dir().unwrap();
            fs::create_dir_all(&app_data_dir).unwrap();
            let db_path = app_data_dir.join("database.json");
            
            let default_db = serde_json::json!({
                "settings": { "zones": [], "categories": [] },
                "products": [], "tables": [], "orders": [], "sales": [], "veresiye": []
            });

            let cache = if db_path.exists() {
                let data = fs::read_to_string(&db_path).unwrap_or_default();
                serde_json::from_str(&data).unwrap_or(default_db)
            } else {
                fs::write(&db_path, serde_json::to_string_pretty(&default_db).unwrap()).unwrap();
                default_db
            };

            let db_cache = std::sync::Arc::new(std::sync::Mutex::new(cache));
            
            // Start LAN Server
            server::start_server(db_path.clone(), db_cache.clone());

            app.manage(AppState { db_path, db_cache });
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_db, mutate_db, printer::get_printers, printer::print_receipt, get_local_ip, get_hostname])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
