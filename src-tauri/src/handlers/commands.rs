//! Command Handlers Module
//! 
//! This module contains all the Tauri command handlers that interface between
//! the frontend and the backend functionality of CompressorX.

use crate::models::CompressionSettings;
use crate::managers;
use open;
use tauri::Emitter;
use tauri_plugin_dialog::DialogExt;
use std::path::Path;

/// Opens a file picker dialog to select a video file
/// 
/// # Arguments
/// * `window` - The Tauri window instance
/// 
/// # Returns
/// * `Result<Option<String>, String>` - Path to the selected file or None if cancelled
#[tauri::command]
pub async fn select_video_file(window: tauri::Window) -> Result<Option<String>, String> {
    let (tx, rx) = tokio::sync::oneshot::channel();

    window.dialog()
        .file()
        .add_filter("Video Files", &["mp4", "avi", "mkv", "mov", "webm"])
        .pick_file(move |file_path| {
            let _ = tx.send(file_path);
        });

    let file_path = rx.await.map_err(|e| e.to_string())?;
    Ok(file_path.map(|path| path.to_string()))
}

/// Opens a file save dialog to choose where to save the compressed video
/// 
/// # Arguments
/// * `window` - The Tauri window instance
/// * `default_path` - Optional default path for the save dialog
/// 
/// # Returns
/// * `Result<Option<String>, String>` - Path where to save the file or None if cancelled
#[tauri::command]
pub async fn save_video_file(window: tauri::Window, default_path: Option<String>) -> Result<Option<String>, String> {
    let (tx, rx) = tokio::sync::oneshot::channel();

    let mut dialog = window.dialog().file();

    dialog = match default_path {
        Some(path) => dialog.set_file_name(&path),
        None => dialog.set_file_name("compressed.mp4"),
    };

    dialog
        .add_filter("MP4 Video", &["mp4"])
        .save_file(move |file_path| {
            let _ = tx.send(file_path);
        });

    let file_path = rx.await.map_err(|e| e.to_string())?;
    Ok(file_path.map(|path| path.to_string()))
}

/// Compresses a video file with the given settings
/// 
/// # Arguments
/// * `input_path` - Path to the input video file
/// * `output_path` - Path where to save the compressed video
/// * `settings` - Compression settings to apply
/// * `app` - Tauri application handle
/// * `window` - Tauri window instance for progress updates
/// 
/// # Returns
/// * `Result<serde_json::Value, String>` - Compression result or error message
#[tauri::command]
pub async fn compress_video(
    input_path: String,
    output_path: String,
    settings: CompressionSettings,
    app: tauri::AppHandle,
    window: tauri::Window,
) -> Result<serde_json::Value, String> {
    // Create a progress callback
    let progress_callback = move |progress: f32| {
        let _ = window.emit("compression_progress", progress);
    };

    // Compress video with progress updates
    let result = managers::compress_video(
        &app,
        &input_path,
        &output_path,
        &settings,
        progress_callback
    ).map_err(|e| e.to_string())?;
    
    // Return the result
    serde_json::to_value(result).map_err(|e| e.to_string())
}

/// Retrieves metadata information about a video file
/// 
/// # Arguments
/// * `input_path` - Path to the video file
/// * `app` - Tauri application handle
/// 
/// # Returns
/// * `Result<serde_json::Value, String>` - Video metadata or error message
#[tauri::command]
pub async fn get_video_info(
    input_path: String,
    app: tauri::AppHandle
) -> Result<serde_json::Value, String> {
    managers::get_video_info(&app, &input_path)
        .map_err(|e| e.to_string())
}

/// Opens a file using the system's default application
/// 
/// # Arguments
/// * `path` - Path to the file to open
/// 
/// # Returns
/// * `Result<(), String>` - Success or error message
#[tauri::command]
pub async fn open_file(path: String) -> Result<(), String> {
    // Verify file exists before trying to open it
    if !Path::new(&path).exists() {
        return Err("File does not exist".to_string());
    }
    open::that(path).map_err(|e| format!("Failed to open file: {}", e))?;
    Ok(())
} 