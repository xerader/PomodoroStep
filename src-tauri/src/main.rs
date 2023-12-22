// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]





// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn receive_task_list(tasklist: Vec<String>) -> String {
    // process the task list here
    format!("Received task list from JS: {:?}", tasklist)
}

#[tauri::command]
fn receive_task(task: String, time_dur: u64) -> Result<String, String> {
    
}


// how to set type as array?

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, receive_task_list, receive_task])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
