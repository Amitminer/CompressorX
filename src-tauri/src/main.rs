//! CompressorX - A modern video compression tool
//! 
//! This is the main entry point for the CompressorX application.
//! It initializes the Tauri application and runs the main event loop.

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

/// Main entry point of the application
/// 
/// This function initializes and runs the CompressorX application.
/// It delegates the actual application logic to the library module.
fn main() {
    compressorx_lib::run()
}
