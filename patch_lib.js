import fs from 'fs';
let libPath = 'adisyon-app/src-tauri/src/lib.rs';
let lib = fs.readFileSync(libPath, 'utf8');

const oldMutateDb = lib.substring(lib.indexOf('fn mutate_db'), lib.indexOf('std::fs::write(&db_path, serde_json::to_string_pretty(&*cache).unwrap()).unwrap();'));

const newMutateDb = `fn mutate_db(state: tauri::State<AppState>, mutations: Vec<Value>) -> Result<(), String> {
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
        }
    }

    let db_path = state.app_dir.join("database.json");
    `;

lib = lib.replace(oldMutateDb, newMutateDb);
fs.writeFileSync(libPath, lib);
console.log("Patched lib.rs to be panic-free");
