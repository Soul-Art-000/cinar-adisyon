import fs from 'fs';
let libPath = 'adisyon-app/src-tauri/src/lib.rs';
let lib = fs.readFileSync(libPath, 'utf8');

const oldCode = `        if action == "set" {
            cache[collection] = data.clone();
        } else if action == "add" {
            if let Some(arr) = cache[collection].as_array_mut() {
                arr.push(data.clone());
            }
        } else if action == "update" {
            if let Some(arr) = cache[collection].as_array_mut() {
                for item in arr.iter_mut() {
                    if item["id"].as_str().unwrap_or("") == id {
                        if let Some(obj) = item.as_object_mut() {
                            if let Some(new_data) = data.as_object() {
                                for (k, v) in new_data {
                                    obj.insert(k.clone(), v.clone());
                                }
                            }
                        }
                    }
                }
            }
        } else if action == "delete" {
            if let Some(arr) = cache[collection].as_array_mut() {
                arr.retain(|x| x["id"].as_str().unwrap_or("") != id);
            }
        } else if action == "deleteMany" {
            let field = data["field"].as_str().unwrap_or("");
            let value = data["value"].as_str().unwrap_or("");
            if let Some(arr) = cache[collection].as_array_mut() {
                arr.retain(|x| x[field].as_str().unwrap_or("") != value);
            }
        } else if action == "updateSettings" {
            if let Some(obj) = cache["settings"].as_object_mut() {
                if let Some(new_data) = data.as_object() {
                    for (k, v) in new_data {
                        obj.insert(k.clone(), v.clone());
                    }
                }
            }
        }`;

const newCode = `        let obj = match cache.as_object_mut() {
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
        }`;

if(lib.includes(oldCode)) {
  fs.writeFileSync(libPath, lib.replace(oldCode, newCode));
  console.log("Patched lib.rs successfully");
} else {
  console.log("Could not find the target code block");
}
