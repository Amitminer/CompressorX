//! Video Processing Manager
//! 
//! This module handles all video-related operations including compression and metadata extraction.
//! It interfaces with FFmpeg to perform the actual video processing tasks.

use std::process::{Command, Stdio};
use std::io::{BufRead, BufReader};
use tauri::{AppHandle, Manager};
use std::path::PathBuf;
use crate::utils::CompressorError;
use crate::utils::Result;
use crate::models::{CompressionSettings, CompressionResult};
use regex::Regex;

#[cfg(windows)]
use std::os::windows::process::CommandExt;

#[cfg(windows)]
const CREATE_NO_WINDOW: u32 = 0x08000000;

/// Locates the FFmpeg binary in the application resources or system PATH
/// 
/// # Arguments
/// * `app` - Tauri application handle
/// 
/// # Returns
/// * `Result<PathBuf>` - Path to the FFmpeg binary
fn get_ffmpeg_path(app: &AppHandle) -> Result<PathBuf> {
    let resource_path = app.app_handle().path().resource_dir()
        .map_err(|e| CompressorError::FileError(format!("Could not find resource directory: {}", e)))?;
    
    let ffmpeg_path = if cfg!(windows) {
        resource_path.join("binaries").join("ffmpeg.exe")
    } else {
        resource_path.join("binaries").join("ffmpeg")
    };

    // First check if the bundled binary exists
    if ffmpeg_path.exists() {
        return Ok(ffmpeg_path);
    }
    
    // If not, try to find FFmpeg in the system PATH
    let system_binary_name = if cfg!(windows) { "ffmpeg.exe" } else { "ffmpeg" };
    
    // Use the 'which' command on Unix or 'where' on Windows to locate the binary
    let output = if cfg!(windows) {
        Command::new("where")
            .arg(system_binary_name)
            .output()
    } else {
        Command::new("which")
            .arg(system_binary_name)
            .output()
    };
    
    match output {
        Ok(output) if output.status.success() => {
            let path_str = String::from_utf8_lossy(&output.stdout);
            let path = PathBuf::from(path_str.trim());
            Ok(path)
        },
        _ => {
            // Just return the binary name and rely on PATH resolution
            Ok(PathBuf::from(system_binary_name))
        }
    }
}

/// Locates the FFprobe binary in the application resources or system PATH
/// 
/// # Arguments
/// * `app` - Tauri application handle
/// 
/// # Returns
/// * `Result<PathBuf>` - Path to the FFprobe binary
fn get_ffprobe_path(app: &AppHandle) -> Result<PathBuf> {
    let resource_path = app.app_handle().path().resource_dir()
        .map_err(|e| CompressorError::FileError(format!("Could not find resource directory: {}", e)))?;
    
    let ffprobe_path = if cfg!(windows) {
        resource_path.join("binaries").join("ffprobe.exe")
    } else {
        resource_path.join("binaries").join("ffprobe")
    };

    // First check if the bundled binary exists
    if ffprobe_path.exists() {
        return Ok(ffprobe_path);
    }
    
    // If not, try to find FFprobe in the system PATH
    let system_binary_name = if cfg!(windows) { "ffprobe.exe" } else { "ffprobe" };
    
    // Use the 'which' command on Unix or 'where' on Windows to locate the binary
    let output = if cfg!(windows) {
        Command::new("where")
            .arg(system_binary_name)
            .output()
    } else {
        Command::new("which")
            .arg(system_binary_name)
            .output()
    };
    
    match output {
        Ok(output) if output.status.success() => {
            let path_str = String::from_utf8_lossy(&output.stdout);
            let path = PathBuf::from(path_str.trim());
            Ok(path)
        },
        _ => {
            // Just return the binary name and rely on PATH resolution
            Ok(PathBuf::from(system_binary_name))
        }
    }
}

/// Compresses a video file using FFmpeg with the specified settings
/// 
/// # Arguments
/// * `app` - Tauri application handle
/// * `input_path` - Path to the input video file
/// * `output_path` - Path where to save the compressed video
/// * `settings` - Compression settings to apply
/// * `progress_callback` - Callback function to report compression progress
/// 
/// # Returns
/// * `Result<CompressionResult>` - Compression result containing statistics
pub fn compress_video<F>(
    app: &AppHandle,
    input_path: &str,
    output_path: &str,
    settings: &CompressionSettings,
    progress_callback: F
) -> Result<CompressionResult>
where
    F: Fn(f32) + Send + 'static
{
    // Validate settings
    if settings.bitrate == 0 {
        return Err(CompressorError::InvalidInput("Bitrate must be greater than 0".to_string()));
    }
    if settings.buffer_size == 0 {
        return Err(CompressorError::InvalidInput("Buffer size must be greater than 0".to_string()));
    }

    let original_size = std::fs::metadata(input_path)
        .map_err(|e| CompressorError::FileError(format!("Failed to get file metadata: {}", e)))?
        .len();

    // Get video duration first
    let info = get_video_info(app, input_path)?;
    let duration = info["format"]["duration"]
        .as_str()
        .and_then(|d| d.parse::<f64>().ok())
        .unwrap_or(0.0);

    let ffmpeg_path = get_ffmpeg_path(app)?;
    let mut command = Command::new(ffmpeg_path);
    
    // Hide console window on Windows
    #[cfg(windows)]
    command.creation_flags(CREATE_NO_WINDOW);
    
    command
        .arg("-i").arg(input_path)
        .arg("-progress").arg("-")  // Output progress to stdout
        .arg("-stats")
        .arg("-loglevel").arg("info") // Show more detailed progress
        .arg("-stats_period").arg("0.5"); // Update progress every 0.5 seconds

    match settings.resolution.as_str() {
        "720p" => {
            command.args(["-vf", "scale=-2:720"]);
        }
        "480p" => {
            command.args(["-vf", "scale=-2:480"]);
        }
        "360p" => {
            command.args(["-vf", "scale=-2:360"]);
        }
        _ => {}
    }

    command
        .args([
            "-b:v",
            &format!("{}k", settings.bitrate),
            "-bufsize",
            &format!("{}k", settings.buffer_size),
            "-y", // overwrite
        ])
        .arg(output_path)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    let mut child = command
        .spawn()
        .map_err(|e| CompressorError::FFmpegError(format!("Failed to execute FFmpeg: {}", e)))?;

    let stdout = child.stdout.take().unwrap();
    let stderr = child.stderr.take().unwrap();
    
    // Read progress from stdout
    let time_regex = Regex::new(r"out_time_ms=(\d+)|time=(\d+:\d+:\d+.\d+)").unwrap();
    let reader = BufReader::new(stdout);
    let error_reader = BufReader::new(stderr);

    // Spawn a thread to read errors
    std::thread::spawn(move || {
        for line in error_reader.lines() {
            if let Ok(line) = line {
                eprintln!("FFmpeg: {}", line);
            }
        }
    });

    // Spawn a thread to read progress
    let progress_thread = std::thread::spawn(move || {
        let mut last_progress = -1.0;
        for line in reader.lines() {
            if let Ok(line) = line {
                if let Some(cap) = time_regex.captures(&line) {
                    let progress = if let Some(ms) = cap.get(1) {
                        // Parse microseconds format
                        if let Ok(time_ms) = ms.as_str().parse::<f64>() {
                            let current_time = time_ms / 1000000.0; // Convert microseconds to seconds
                            if duration > 0.0 {
                                (current_time / duration * 100.0).min(100.0)
                            } else {
                                0.0
                            }
                        } else {
                            continue;
                        }
                    } else if let Some(timestamp) = cap.get(2) {
                        // Parse HH:MM:SS.ms format
                        let parts: Vec<&str> = timestamp.as_str().split(|c| c == ':' || c == '.').collect();
                        if parts.len() >= 3 {
                            if let (Ok(h), Ok(m), Ok(s)) = (
                                parts[0].parse::<f64>(),
                                parts[1].parse::<f64>(),
                                parts[2].parse::<f64>(),
                            ) {
                                let current_time = h * 3600.0 + m * 60.0 + s;
                                if duration > 0.0 {
                                    (current_time / duration * 100.0).min(100.0)
                                } else {
                                    0.0
                                }
                            } else {
                                continue;
                            }
                        } else {
                            continue;
                        }
                    } else {
                        continue;
                    };

                    // Only send progress update if it's changed by at least 0.5%
                    if (progress - last_progress).abs() >= 0.5 {
                        progress_callback(progress as f32);
                        last_progress = progress;
                    }
                }
            }
        }
    });

    // Wait for the process to complete
    let status = child
        .wait()
        .map_err(|e| CompressorError::FFmpegError(format!("Failed to wait for FFmpeg: {}", e)))?;

    // Wait for progress thread to finish
    if let Err(e) = progress_thread.join() {
        eprintln!("Progress thread panicked: {:?}", e);
    }

    if !status.success() {
        return Ok(CompressionResult {
            success: false,
            output_path: String::new(),
            original_size,
            compressed_size: 0,
            compression_ratio: 0.0,
            error_message: Some("FFmpeg process failed".to_string()),
        });
    }

    let compressed_size = std::fs::metadata(output_path)
        .map_err(|e| CompressorError::FileError(format!("Failed to get output file metadata: {}", e)))?
        .len();

    let compression_ratio = if original_size > 0 {
        (original_size as f64 - compressed_size as f64) / original_size as f64 * 100.0
    } else {
        0.0
    };

    Ok(CompressionResult {
        success: true,
        output_path: output_path.to_string(),
        original_size,
        compressed_size,
        compression_ratio,
        error_message: None,
    })
}

/// Retrieves metadata information about a video file using FFprobe
/// 
/// # Arguments
/// * `app` - Tauri application handle
/// * `input_path` - Path to the video file
/// 
/// # Returns
/// * `Result<serde_json::Value>` - Video metadata in JSON format
pub fn get_video_info(app: &AppHandle, input_path: &str) -> Result<serde_json::Value> {
    let ffprobe_path = get_ffprobe_path(app)?;
    let mut command = Command::new(ffprobe_path);

    // Hide console window on Windows
    #[cfg(windows)]
    command.creation_flags(CREATE_NO_WINDOW);

    let output = command
        .args([
            "-v",
            "quiet",
            "-print_format",
            "json",
            "-show_format",
            "-show_streams",
        ])
        .arg(input_path)
        .output()
        .map_err(|e| CompressorError::FFmpegError(format!("Failed to execute FFprobe: {}", e)))?;

    if !output.status.success() {
        return Err(CompressorError::FFmpegError(format!(
            "FFprobe failed: {}",
            String::from_utf8_lossy(&output.stderr)
        )));
    }

    serde_json::from_slice(&output.stdout)
        .map_err(|e| CompressorError::FFmpegError(format!("Failed to parse FFprobe output: {}", e)))
}