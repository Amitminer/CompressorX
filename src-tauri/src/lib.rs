//! CompressorX Library Module
//! 
//! This module contains the core functionality of the CompressorX application.
//! It handles the initialization of Tauri plugins and command handlers.

mod handlers;
mod managers;
mod models;
mod utils;
use handlers::commands;

/// Initializes and runs the CompressorX application
/// 
/// This function sets up the Tauri application with all necessary plugins
/// and command handlers. It initializes:
/// - Dialog plugin for file operations
/// - Shell plugin for system interactions
/// - Filesystem plugin for file management
/// 
/// # Command Handlers
/// - `select_video_file`: Opens file picker for video selection
/// - `save_video_file`: Saves compressed video to specified location
/// - `compress_video`: Handles video compression process
/// - `get_video_info`: Retrieves video metadata
/// - `open_file`: Opens files in default system application
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            commands::select_video_file,
            commands::save_video_file,
            commands::compress_video,
            commands::get_video_info,
            commands::open_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
