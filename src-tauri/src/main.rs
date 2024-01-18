// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use csv::Writer;
use csv::Reader;
use std::fs::OpenOptions;
use std::fs::File;
use tauri::InvokeError;
use std::io::BufReader;
use rodio::{Decoder, OutputStream, source::Source};


// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}


#[tauri::command]
fn play_sound() {
 let (_stream, handle) = rodio::OutputStream::try_default().unwrap(); 
 let sink = rodio::Sink::try_new(&handle).unwrap();

 let file = std::fs::File::open("../../public/rando_pomodoro_sound.mp3").unwrap();
 sink.append(rodio::Decoder::new(BufReader::new(file)).unwrap());

    sink.sleep_until_end();
}

#[tauri::command]
fn recieve_task_list() -> Result<String, InvokeError> {
    let file: File = OpenOptions::new()
        .open("tasks.csv").map_err(|e| InvokeError::from(e.to_string()))?;

    let mut reader = Reader::from_reader(file);
    // read entires from today which are of today
    let mut todays_entries: Vec<String> = Vec::new();
    for result in reader.records() {
        let record = result.map_err(|e| InvokeError::from(e.to_string()))?;
        let day = record.get(4).unwrap_or_default();
        let month = record.get(5).unwrap_or_default();
        let year = record.get(6).unwrap_or_default();
    
        let now = chrono::offset::Local::now();
        let day_now = now.format("%d").to_string();
        let month_now = now.format("%m").to_string();
        let year_now = now.format("%Y").to_string();
    
        if day == &day_now && month == &month_now && year == &year_now {
            todays_entries.push(record.get(0).unwrap_or_default().to_string());
        }
    }

    return Ok(todays_entries.join(",")); 
}
#[tauri::command]
fn receive_task(task: String, timeduration: u32) -> Result<(), InvokeError> {
    let now = chrono::offset::Local::now();

    let time_of_day = now.format("%H:%M:%S").to_string();
    let day = now.format("%d").to_string();
    let day_string = now.format("%A").to_string();
    let month = now.format("%m").to_string();
    let year = now.format("%Y").to_string();

    let file = OpenOptions::new()
        .create(true)
        .write(true)
        .append(true)
        .open("tasks.csv").map_err(|e| InvokeError::from(e.to_string()))?;

    let is_new_file = file.metadata().map_err(|e| InvokeError::from(e.to_string()))?.len() == 0;

    let mut writer = Writer::from_writer(file);

    if is_new_file {
        writer.write_record(&["Task", "Time Duration", "Time of Day", "Day of Week", "Day", "Month", "Year"]).map_err(|e| InvokeError::from(e.to_string()))?;
    }

    writer.write_record(&[&task, &timeduration.to_string(), &time_of_day, &day_string,  &day, &month, &year]).map_err(|e| InvokeError::from(e.to_string()))?;

    writer.flush().map_err(|e| InvokeError::from(e.to_string()))?;

    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, recieve_task_list, receive_task, play_sound])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
