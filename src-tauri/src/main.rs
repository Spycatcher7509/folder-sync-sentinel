
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use notify::{Config, RecommendedWatcher, RecursiveMode, Watcher};
use notify_debouncer_mini::new_debouncer;
use std::path::Path;
use std::sync::{Arc, Mutex};
use std::time::Duration;
use tauri::State;
use tokio::fs;
use tokio::time::sleep;
use walkdir::WalkDir;

struct SyncState {
    is_monitoring: Arc<Mutex<bool>>,
    polling_frequency: Arc<Mutex<u64>>,
    source_folder: Arc<Mutex<String>>,
    destination_folder: Arc<Mutex<String>>,
}

#[tauri::command]
async fn select_folder() -> Result<String, String> {
    Ok("".to_string())
}

#[tauri::command]
async fn sync_folders(
    source: String,
    destination: String,
    state: State<'_, SyncState>,
) -> Result<(), String> {
    // Update the source and destination in state
    {
        let mut source_folder = state.source_folder.lock().unwrap();
        *source_folder = source.clone();
        
        let mut dest_folder = state.destination_folder.lock().unwrap();
        *dest_folder = destination.clone();
    }
    
    sync_files(&source, &destination).await.map_err(|e| e.to_string())
}

async fn sync_files(source: &str, destination: &str) -> Result<(), std::io::Error> {
    let source_path = Path::new(source);
    let destination_path = Path::new(destination);

    if !source_path.exists() {
        return Err(std::io::Error::new(
            std::io::ErrorKind::NotFound,
            "Source folder does not exist",
        ));
    }

    if !destination_path.exists() {
        fs::create_dir_all(destination_path).await?;
    }

    for entry in WalkDir::new(source_path) {
        let entry = entry?;
        let entry_path = entry.path();
        let relative_path = entry_path.strip_prefix(source_path).unwrap();
        let target_path = destination_path.join(relative_path);

        if entry_path.is_dir() {
            if !target_path.exists() {
                fs::create_dir_all(&target_path).await?;
            }
        } else {
            if !target_path.parent().unwrap().exists() {
                fs::create_dir_all(target_path.parent().unwrap()).await?;
            }
            fs::copy(entry_path, &target_path).await?;
        }
    }

    Ok(())
}

#[tauri::command]
async fn start_monitoring(state: State<'_, SyncState>) -> Result<(), String> {
    let mut is_monitoring = state.is_monitoring.lock().unwrap();
    *is_monitoring = true;
    Ok(())
}

#[tauri::command]
async fn stop_monitoring(state: State<'_, SyncState>) -> Result<(), String> {
    let mut is_monitoring = state.is_monitoring.lock().unwrap();
    *is_monitoring = false;
    Ok(())
}

#[tauri::command]
async fn set_polling_frequency(frequency: u64, state: State<'_, SyncState>) -> Result<(), String> {
    let mut polling_frequency = state.polling_frequency.lock().unwrap();
    *polling_frequency = frequency;
    Ok(())
}

fn main() {
    let is_monitoring = Arc::new(Mutex::new(false));
    let polling_frequency = Arc::new(Mutex::new(5));
    let source_folder = Arc::new(Mutex::new(String::new()));
    let destination_folder = Arc::new(Mutex::new(String::new()));
    
    let sync_state = SyncState {
        is_monitoring: is_monitoring.clone(),
        polling_frequency: polling_frequency.clone(),
        source_folder: source_folder.clone(),
        destination_folder: destination_folder.clone(),
    };

    let is_monitoring_clone = is_monitoring.clone();
    let polling_frequency_clone = polling_frequency.clone();
    let source_folder_clone = source_folder.clone();
    let destination_folder_clone = destination_folder.clone();

    std::thread::spawn(move || {
        let rt = tokio::runtime::Runtime::new().unwrap();
        rt.block_on(async {
            loop {
                let is_mon = *is_monitoring_clone.lock().unwrap();
                if is_mon {
                    let freq = *polling_frequency_clone.lock().unwrap();
                    let src = source_folder_clone.lock().unwrap().clone();
                    let dest = destination_folder_clone.lock().unwrap().clone();
                    
                    if !src.is_empty() && !dest.is_empty() {
                        let _ = sync_files(&src, &dest).await;
                    }
                    
                    sleep(Duration::from_secs(freq)).await;
                } else {
                    sleep(Duration::from_secs(1)).await;
                }
            }
        });
    });

    tauri::Builder::default()
        .manage(sync_state)
        .invoke_handler(tauri::generate_handler![
            select_folder,
            sync_folders,
            start_monitoring,
            stop_monitoring,
            set_polling_frequency
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
