use std::sync::{Arc, Mutex};
use std::path::PathBuf;
use std::fs;
use serde_json::Value;
use tiny_http::{Server, Response, Header, Method};
use rust_embed::RustEmbed;

#[derive(RustEmbed)]
#[folder = "../dist"]
struct Asset;

pub fn start_server(db_path: PathBuf, db_cache: Arc<Mutex<Value>>) {
    std::thread::spawn(move || {
        let server = Server::http("0.0.0.0:3001").unwrap();
        println!("LAN Server started on port 3001");
        
        for mut request in server.incoming_requests() {
            let path = request.url().to_string();
            
            // CORS headers
            let cors_origin = Header::from_bytes(&b"Access-Control-Allow-Origin"[..], &b"*"[..]).unwrap();
            let cors_methods = Header::from_bytes(&b"Access-Control-Allow-Methods"[..], &b"GET, POST, OPTIONS"[..]).unwrap();
            let cors_headers = Header::from_bytes(&b"Access-Control-Allow-Headers"[..], &b"Content-Type"[..]).unwrap();
            
            if request.method() == &Method::Options {
                let response = Response::empty(200)
                    .with_header(cors_origin.clone())
                    .with_header(cors_methods.clone())
                    .with_header(cors_headers.clone());
                let _ = request.respond(response);
                continue;
            }

            if path == "/api/db" {
                let cache = db_cache.lock().unwrap();
                let json = serde_json::to_string(&*cache).unwrap();
                let response = Response::from_string(json)
                    .with_header(Header::from_bytes(&b"Content-Type"[..], &b"application/json"[..]).unwrap())
                    .with_header(cors_origin.clone());
                let _ = request.respond(response);
                
            } else if path == "/api/mutate" {
                let mut content = String::new();
                request.as_reader().read_to_string(&mut content).unwrap_or(0);
                
                if let Ok(mutations_req) = serde_json::from_str::<Value>(&content) {
                    if let Some(mutations) = mutations_req.get("mutations").and_then(|m| m.as_array()) {
                        let mut cache = db_cache.lock().unwrap();
                        for m in mutations {
                            let action = m["action"].as_str().unwrap_or("");
                            let collection = m["collection"].as_str().unwrap_or("");
                            let id = m["id"].as_str().unwrap_or("");
                            let data = m["data"].clone();

                            if action == "set" {
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
                            }
                        }
                        
                        let json_str = serde_json::to_string_pretty(&*cache).unwrap();
                        let _ = fs::write(&db_path, json_str);
                    }
                }
                
                let response = Response::from_string("{\"status\":\"ok\"}")
                    .with_header(Header::from_bytes(&b"Content-Type"[..], &b"application/json"[..]).unwrap())
                    .with_header(cors_origin.clone());
                let _ = request.respond(response);
                
            } else if path == "/api/print" {
                let mut content = String::new();
                request.as_reader().read_to_string(&mut content).unwrap_or(0);
                
                if let Ok(print_req) = serde_json::from_str::<Value>(&content) {
                    let printer_name = print_req["printerName"].as_str().unwrap_or("").to_string();
                    let receipt_text = print_req["receiptText"].as_str().unwrap_or("").to_string();
                    let _ = crate::printer::print_receipt(printer_name, receipt_text);
                }
                
                let response = Response::from_string("{\"status\":\"ok\"}")
                    .with_header(Header::from_bytes(&b"Content-Type"[..], &b"application/json"[..]).unwrap())
                    .with_header(cors_origin.clone());
                let _ = request.respond(response);
                
            } else {
                // Serve static files
                let mut asset_path = path.trim_start_matches('/');
                if asset_path.is_empty() {
                    asset_path = "index.html";
                }
                
                match Asset::get(asset_path) {
                    Some(content) => {
                        let mime = mime_guess::from_path(asset_path).first_or_octet_stream();
                        let response = Response::from_data(content.data.into_owned())
                            .with_header(Header::from_bytes(&b"Content-Type"[..], mime.as_ref().as_bytes()).unwrap())
                            .with_header(cors_origin.clone());
                        let _ = request.respond(response);
                    },
                    None => {
                        // Fallback to index.html for SPA router
                        if let Some(content) = Asset::get("index.html") {
                            let response = Response::from_data(content.data.into_owned())
                                .with_header(Header::from_bytes(&b"Content-Type"[..], &b"text/html"[..]).unwrap())
                                .with_header(cors_origin.clone());
                            let _ = request.respond(response);
                        } else {
                            let response = Response::from_string("404 Not Found").with_status_code(404);
                            let _ = request.respond(response);
                        }
                    }
                }
            }
        }
    });
}
